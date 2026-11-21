// Entry point: the game loop, the screen state and the two handles the
// screenshot tool and the play-test use — window.__spotState() and
// window.__shotReady. Wires world (rules), render (drawing), input (events)
// and sound (effects) together and nothing else.

import { FIELD } from './config.js';
import { freshState, tick, SCREENS, levelDiffs } from './world.js';
import { render } from './render.js';
import { bindInput, ACTION_MUTE, ACTION_START } from './input.js';
import { setMuted, playFind, playMiss, playLevelDone, playWin } from './sound.js';
import { shotFromUrl, stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = FIELD.width;
canvas.height = FIELD.height;

const ctx = canvas.getContext('2d');
const state = freshState();

// A staged screenshot (?shot=...) is frozen: no timer, no input side
// effects, and __shotReady flips after two paints.
const staged = stageShot(state, shotFromUrl());

// Read-only handle for the play-test: the screen, level, counter, score,
// hints and timer, as plain values.
window.__spotState = function spotState() {
  return {
    screen: state.screen,
    level: state.levelIndex + 1,
    found: state.found.size,
    total: levelDiffs(state).length,
    score: state.score,
    hints: state.hintsLeft,
    timeLeft: Math.round(state.timeLeft),
    muted: state.muted,
  };
};
window.__shotReady = false;

// Sounds for the actions input reports.
function onAction(action) {
  if (action === ACTION_MUTE) {
    state.muted = !state.muted;
    setMuted(state.muted);
  }
  if (action === ACTION_START) playFind();
}

// Sounds for hunt clicks; the level-done and win fanfares ride on the screen
// change, watched in the loop below.
function onClick(result) {
  if (result === 'found') playFind();
  else if (result === 'miss') playMiss();
}

bindInput(canvas, state, onAction, onClick);

// The main loop: advance the clock, play the screen-change fanfares once,
// then draw. requestAnimationFrame keeps the frame rate at the display's.
let last = performance.now();
let paints = 0;
let lastScreen = state.screen;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!staged) {
    const ranOut = tick(state, dt);
    if (ranOut) playMiss();
    if (state.screen !== lastScreen) {
      if (state.screen === SCREENS.LEVEL_DONE) playLevelDone();
      else if (state.screen === SCREENS.WIN) playWin();
      lastScreen = state.screen;
    }
  }
  render(ctx, state);
  paints += 1;
  if (staged && paints >= 2) window.__shotReady = true;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
