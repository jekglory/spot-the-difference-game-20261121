// Game state and rules: levels, timer, scoring, hints, clicks and screens.
// This file owns the rules; render.js owns the drawing and input.js owns the
// events. Nothing here touches the canvas.

import { LEVELS, SCORE, FIELD, BEST_KEY } from './config.js';
import { LEVEL_DIFFS, diffById } from './differences.js';

// Screens the game can be on.
export const SCREENS = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_DONE: 'levelDone',
  TIME_UP: 'timeUp',
  WIN: 'win',
};

// Fresh state for a whole run (used by the title screen and by restart).
export function freshState() {
  return {
    screen: SCREENS.TITLE,
    levelIndex: 0,
    score: 0,
    best: readBest(),
    found: new Set(),
    hintsLeft: SCORE.hintsPerLevel,
    timeLeft: LEVELS[0].timeLimit,
    elapsed: 0,
    hint: null, // { diffId, until } while a hint ring is showing
    miss: null, // { x, y, panel, until } while a miss cross is showing
    toast: null, // { text, kind, until }
    levelBonus: 0,
    totalFound: 0,
    muted: false,
  };
}

export function readBest() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const n = raw === null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveBest(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Storage may be unavailable (private mode); the game plays on regardless.
  }
}

// The differences of the current level.
export function levelDiffs(state) {
  return LEVEL_DIFFS[state.levelIndex];
}

export function levelConfig(state) {
  return LEVELS[state.levelIndex];
}

export function remainingCount(state) {
  return levelDiffs(state).length - state.found.size;
}

// Start (or restart) a level: fresh finds, full timer, fresh hints.
export function startLevel(state, levelIndex) {
  state.levelIndex = levelIndex;
  state.found = new Set();
  state.hintsLeft = SCORE.hintsPerLevel;
  state.timeLeft = LEVELS[levelIndex].timeLimit;
  state.elapsed = 0;
  state.hint = null;
  state.miss = null;
  state.toast = null;
  state.levelBonus = 0;
  state.screen = SCREENS.PLAYING;
}

// Start a whole new run from level 1.
export function startRun(state) {
  state.score = 0;
  state.totalFound = 0;
  startLevel(state, 0);
}

// Advance the clock. Called with the seconds since the last frame; only the
// playing screen ticks. Returns true when the timer just ran out.
export function tick(state, dt) {
  if (state.screen !== SCREENS.PLAYING) return false;
  state.elapsed += dt;
  state.timeLeft -= dt;
  const now = state.elapsed;
  if (state.hint && now >= state.hint.until) state.hint = null;
  if (state.miss && now >= state.miss.until) state.miss = null;
  if (state.toast && now >= state.toast.until) state.toast = null;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = SCREENS.TIME_UP;
    return true;
  }
  return false;
}

// Handle a click at canvas coordinates (x, y). Returns 'found', 'miss',
// 'hint', 'button' or 'none' so the caller knows which sound to play.
// `panel` is 'left' | 'right' | null (header or outside the panels).
export function clickAt(state, x, y, panel) {
  if (state.screen !== SCREENS.PLAYING) return 'none';
  if (!panel) return 'none';
  // Convert to panel-local coordinates.
  const px = panel === 'left' ? x - FIELD.leftX : x - FIELD.rightX;
  const py = y - FIELD.panelY;
  const diffs = levelDiffs(state);
  for (const d of diffs) {
    if (state.found.has(d.id)) continue;
    const dx = px - d.x;
    const dy = py - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      state.found.add(d.id);
      state.totalFound += 1;
      state.score += SCORE.find;
      state.toast = { text: `Found: ${d.label}  +${SCORE.find}`, kind: 'find', until: state.elapsed + 1.6 };
      if (state.found.size === diffs.length) {
        // Level cleared: time bonus, then the level-done screen.
        const bonus = Math.floor(state.timeLeft) * SCORE.timeBonusPerSecond;
        state.levelBonus = bonus;
        state.score += bonus;
        if (state.score > state.best) {
          state.best = state.score;
          saveBest(state.score);
        }
        state.screen = SCREENS.LEVEL_DONE;
      }
      return 'found';
    }
  }
  // A miss costs points and time.
  state.score = Math.max(0, state.score + SCORE.miss);
  state.timeLeft = Math.max(0, state.timeLeft + SCORE.missTime);
  state.miss = { x: px, y: py, panel, until: state.elapsed + 0.7 };
  state.toast = { text: `Miss! ${SCORE.miss} pts, ${SCORE.missTime}s`, kind: 'miss', until: state.elapsed + 1.2 };
  return 'miss';
}

// Spend a hint: ring one unfound difference for 2.2 seconds. Returns the
// difference it rings, or null when no hint is left or none is unfound.
export function useHint(state) {
  if (state.screen !== SCREENS.PLAYING) return null;
  if (state.hintsLeft <= 0) return null;
  const unfound = levelDiffs(state).filter((d) => !state.found.has(d.id));
  if (unfound.length === 0) return null;
  const pick = unfound[Math.floor(state.elapsed * 7919) % unfound.length];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score + SCORE.hint);
  state.hint = { diffId: pick.id, until: state.elapsed + 2.2 };
  state.toast = { text: `Hint: look near "${pick.label}"  ${SCORE.hint} pts`, kind: 'hint', until: state.elapsed + 1.6 };
  return pick;
}

// Move on from the level-done screen: next level, or the win screen.
export function advanceLevel(state) {
  if (state.screen !== SCREENS.LEVEL_DONE) return;
  if (state.levelIndex + 1 < LEVELS.length) {
    startLevel(state, state.levelIndex + 1);
  } else {
    state.screen = SCREENS.WIN;
    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.score);
    }
  }
}

// Format seconds as mm:ss for the header timer.
export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Which difference a diff id belongs to, for the hint ring and markers.
export function diffOf(state, id) {
  return diffById(levelDiffs(state), id);
}
