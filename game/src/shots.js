// Screenshot staging: ?shot=start|play|mid|end (with &seed=1) puts the game
// in a fixed, readable state for the screenshots, then sets
// window.__shotReady after two paints so the screenshot tool knows the frame
// is settled. Staged states never run the clock: the timer is frozen at the
// value the shot needs.
//
//   start — title screen over level 1, nothing found yet.
//   play  — level 1 playing, first 4 of 7 found (score 400, timer 01:47).
//   mid   — level 2 playing, first 6 of 10 found (score 600, timer 01:12).
//   end   — win screen, all 12 of level 3 found (score 3330, timer 00:43).

import { SCREENS, startLevel } from './world.js';
import { LEVEL_DIFFS } from './differences.js';

export const SHOT_NAMES = ['start', 'play', 'mid', 'end'];

export function shotFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    return SHOT_NAMES.includes(shot) ? shot : null;
  } catch {
    return null;
  }
}

// Put `state` in the staged state for one shot name. Returns true when a
// shot was staged, false when the URL names no shot (normal play).
export function stageShot(state, shot) {
  if (!shot) return false;
  if (shot === 'start') {
    startLevel(state, 0);
    state.screen = SCREENS.TITLE;
    state.score = 0;
    state.timeLeft = 150;
    state.elapsed = 0;
  } else if (shot === 'play') {
    startLevel(state, 0);
    const diffs = LEVEL_DIFFS[0];
    for (let i = 0; i < 4; i++) state.found.add(diffs[i].id);
    state.score = 400;
    state.timeLeft = 107;
    state.elapsed = 43;
  } else if (shot === 'mid') {
    startLevel(state, 1);
    const diffs = LEVEL_DIFFS[1];
    for (let i = 0; i < 6; i++) state.found.add(diffs[i].id);
    state.score = 600;
    state.timeLeft = 72;
    state.elapsed = 108;
  } else if (shot === 'end') {
    startLevel(state, 2);
    const diffs = LEVEL_DIFFS[2];
    for (const d of diffs) state.found.add(d.id);
    state.score = 3330;
    state.timeLeft = 43;
    state.elapsed = 167;
    state.screen = SCREENS.WIN;
  }
  // A staged shot is frozen: the main loop must not tick the timer.
  state.staged = true;
  return true;
}
