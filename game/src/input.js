// Pointer and keyboard input. Mouse clicks land on header buttons, on a
// picture panel, or on an overlay; keys drive the screens. This file only
// translates events into world calls — the game rules live in world.js.
//
// Action flags the main loop reads each frame (input.js sets them, main.js
// clears them): ACTION_START, ACTION_ADVANCE, ACTION_PAUSE, ACTION_RESTART,
// ACTION_HINT, ACTION_MUTE, ACTION_LEVEL_1/2/3.

import { FIELD } from './config.js';
import { SCREENS, clickAt, useHint, startRun, startLevel, advanceLevel } from './world.js';
import { BUTTONS } from './render.js';

export const ACTION_START = 'start';
export const ACTION_ADVANCE = 'advance';
export const ACTION_PAUSE = 'pause';
export const ACTION_RESTART = 'restart';
export const ACTION_HINT = 'hint';
export const ACTION_MUTE = 'mute';
export const ACTION_LEVEL = 'level'; // carries a level index in `data`

// The set of actions queued since the last frame.
export function freshActions() {
  return [];
}

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Which panel (if any) a canvas point is in: 'left', 'right' or null.
export function panelAt(x, y) {
  if (y < FIELD.panelY || y > FIELD.panelY + FIELD.panelHeight) return null;
  if (x >= FIELD.leftX && x <= FIELD.leftX + FIELD.panelWidth) return 'left';
  if (x >= FIELD.rightX && x <= FIELD.rightX + FIELD.panelWidth) return 'right';
  return null;
}

// Wire the canvas and the keyboard. `onAction` receives (action, data);
// `onClick` receives ('found' | 'miss' | 'none') for sounds.
export function bindInput(canvas, state, onAction, onClick) {
  function handlePointer(x, y) {
    // Header buttons first.
    if (inside(x, y, BUTTONS.hint)) {
      const picked = useHint(state);
      onAction(ACTION_HINT, picked);
      return;
    }
    if (inside(x, y, BUTTONS.sound)) {
      onAction(ACTION_MUTE, null);
      return;
    }
    const screen = state.screen;
    if (screen === SCREENS.TITLE) {
      startRun(state);
      onAction(ACTION_START, null);
      return;
    }
    if (screen === SCREENS.PAUSED) {
      state.screen = SCREENS.PLAYING;
      onAction(ACTION_PAUSE, null);
      return;
    }
    if (screen === SCREENS.LEVEL_DONE) {
      advanceLevel(state);
      onAction(ACTION_ADVANCE, null);
      return;
    }
    if (screen === SCREENS.TIME_UP) {
      startLevel(state, state.levelIndex);
      onAction(ACTION_RESTART, null);
      return;
    }
    if (screen === SCREENS.WIN) {
      startRun(state);
      onAction(ACTION_START, null);
      return;
    }
    // Playing: a click on a panel is a hunt click.
    const panel = panelAt(x, y);
    const result = clickAt(state, x, y, panel);
    onClick(result);
  }

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    handlePointer((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
  });

  window.addEventListener('keydown', (e) => {
    const key = e.key;
    const screen = state.screen;
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      if (screen === SCREENS.TITLE || screen === SCREENS.WIN) {
        startRun(state);
        onAction(ACTION_START, null);
      } else if (screen === SCREENS.LEVEL_DONE) {
        advanceLevel(state);
        onAction(ACTION_ADVANCE, null);
      } else if (screen === SCREENS.TIME_UP) {
        startLevel(state, state.levelIndex);
        onAction(ACTION_RESTART, null);
      }
      return;
    }
    if (key === 'h' || key === 'H') {
      const picked = useHint(state);
      onAction(ACTION_HINT, picked);
      return;
    }
    if (key === 'p' || key === 'P' || key === 'Escape') {
      if (screen === SCREENS.PLAYING) {
        state.screen = SCREENS.PAUSED;
        onAction(ACTION_PAUSE, null);
      } else if (screen === SCREENS.PAUSED) {
        state.screen = SCREENS.PLAYING;
        onAction(ACTION_PAUSE, null);
      }
      return;
    }
    if (key === 'r' || key === 'R') {
      if (screen === SCREENS.PLAYING || screen === SCREENS.PAUSED || screen === SCREENS.TIME_UP) {
        startLevel(state, state.levelIndex);
        onAction(ACTION_RESTART, null);
      }
      return;
    }
    if (key === 'm' || key === 'M') {
      onAction(ACTION_MUTE, null);
      return;
    }
    if (key === '1' || key === '2' || key === '3') {
      const idx = Number(key) - 1;
      if (screen === SCREENS.PLAYING || screen === SCREENS.PAUSED) {
        startLevel(state, idx);
        onAction(ACTION_LEVEL, idx);
      }
    }
  });
}
