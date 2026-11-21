// Drawing: the header, the two picture panels, found markers, the hint ring,
// the miss cross, toasts and the full-screen overlays (title, pause,
// level-done, time-up, win). All canvas 2D, no images, no network.

import { FIELD, FONT, PALETTE, SCORE } from './config.js';
import { LEVELS } from './config.js';
import { drawScene } from './scenes.js';
import { levelDiffs, remainingCount, formatTime, diffOf } from './world.js';

// Header button geometry, shared with input.js so clicks land on the same
// rectangles that are drawn here.
export const BUTTONS = {
  hint: { x: 960, y: 12, w: 92, h: 40 },
  sound: { x: 1062, y: 12, w: 62, h: 40 },
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// --- header ----------------------------------------------------------------

export function drawHeader(ctx, state) {
  ctx.fillStyle = PALETTE.headerBg;
  ctx.fillRect(0, 0, FIELD.width, FIELD.headerHeight);
  ctx.fillStyle = PALETTE.headerAccent;
  ctx.fillRect(0, FIELD.headerHeight - 3, FIELD.width, 3);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.headerAccent;
  ctx.font = FONT.title;
  ctx.fillText('Spot the Difference', 16, 32);

  const level = LEVELS[state.levelIndex];
  ctx.fillStyle = PALETTE.headerText;
  ctx.font = FONT.header;
  ctx.fillText(`Level ${state.levelIndex + 1}: ${level.name}`, 290, 32);

  // Counter: found so far and how many remain.
  const total = levelDiffs(state).length;
  ctx.font = FONT.counter;
  ctx.fillStyle = PALETTE.headerText;
  ctx.fillText(`Found ${state.found.size} / ${total}  ·  ${remainingCount(state)} to go`, 600, 32);

  // Timer, blinking red under 30 seconds.
  const low = state.timeLeft < 30 && state.screen === 'playing';
  const blink = low && Math.floor(state.elapsed * 2) % 2 === 0;
  ctx.font = FONT.timer;
  ctx.fillStyle = blink ? PALETTE.timerLow : PALETTE.headerText;
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(state.timeLeft), 940, 32);
  ctx.textAlign = 'left';

  // Score, right-aligned past the buttons.
  ctx.font = FONT.header;
  ctx.fillStyle = PALETTE.headerText;
  ctx.textAlign = 'right';
  ctx.fillText(`Score ${state.score}`, 1272, 20);
  ctx.font = '14px Georgia, serif';
  ctx.fillStyle = '#cbb98f';
  ctx.fillText(`Best ${state.best}`, 1272, 44);
  ctx.textAlign = 'left';

  // Hint button: "Hint (n)", greyed out when none are left.
  const hb = BUTTONS.hint;
  ctx.fillStyle = state.hintsLeft > 0 ? PALETTE.buttonBg : PALETTE.buttonDisabled;
  roundRect(ctx, hb.x, hb.y, hb.w, hb.h, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.buttonText;
  ctx.font = FONT.button;
  ctx.textAlign = 'center';
  ctx.fillText(`Hint (${state.hintsLeft})`, hb.x + hb.w / 2, hb.y + hb.h / 2 + 1);

  // Sound button.
  const sb = BUTTONS.sound;
  ctx.fillStyle = PALETTE.buttonBg;
  roundRect(ctx, sb.x, sb.y, sb.w, sb.h, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.buttonText;
  ctx.fillText(state.muted ? 'Mut' : 'Snd', sb.x + sb.w / 2, sb.y + sb.h / 2 + 1);
  ctx.textAlign = 'left';
}

// --- panels ----------------------------------------------------------------

// Draw both pictures: the original on the left, the changed one on the right.
export function drawPanels(ctx, state) {
  const diffs = levelDiffs(state);
  const changed = new Set(diffs.map((d) => d.id));
  drawPanel(ctx, state, FIELD.leftX, new Set());
  drawPanel(ctx, state, FIELD.rightX, changed);
}

function drawPanel(ctx, state, x, changed) {
  ctx.save();
  ctx.shadowColor = PALETTE.panelShadow;
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, FIELD.panelY, FIELD.panelWidth, FIELD.panelHeight);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, FIELD.panelY, FIELD.panelWidth, FIELD.panelHeight);
  ctx.clip();
  ctx.translate(x, FIELD.panelY);
  drawScene(ctx, LEVELS[state.levelIndex].scene, changed);
  ctx.restore();
  ctx.strokeStyle = PALETTE.panelBorder;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, FIELD.panelY, FIELD.panelWidth, FIELD.panelHeight);
  // "Original" / "Changed" labels.
  ctx.fillStyle = 'rgba(43, 33, 24, 0.85)';
  ctx.fillRect(x + 8, FIELD.panelY + 8, 96, 26);
  ctx.fillStyle = '#ffe9b8';
  ctx.font = FONT.button;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(x === FIELD.leftX ? 'Original' : 'Changed', x + 16, FIELD.panelY + 22);
}

// --- markers, hint ring, miss cross, toast ---------------------------------

// Red circle + order-number badge on BOTH panels for every found difference.
export function drawMarkers(ctx, state) {
  const diffs = levelDiffs(state);
  let order = 0;
  for (const d of diffs) {
    if (!state.found.has(d.id)) continue;
    order += 1;
    for (const px of [FIELD.leftX, FIELD.rightX]) {
      const cx = px + d.x;
      const cy = FIELD.panelY + d.y;
      ctx.strokeStyle = PALETTE.marker;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r, 0, Math.PI * 2);
      ctx.stroke();
      // Number badge at the top-right of the ring.
      const bx = cx + d.r * 0.7;
      const by = cy - d.r * 0.7;
      ctx.fillStyle = PALETTE.markerBadge;
      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.markerText;
      ctx.font = FONT.badge;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(order), bx, by + 1);
      ctx.textAlign = 'left';
    }
  }
}

// Pulsing yellow ring around the hinted difference, on both panels.
export function drawHintRing(ctx, state) {
  if (!state.hint) return;
  const d = diffOf(state, state.hint.diffId);
  if (!d) return;
  const pulse = 1 + 0.12 * Math.sin(state.elapsed * 6);
  for (const px of [FIELD.leftX, FIELD.rightX]) {
    ctx.strokeStyle = PALETTE.hintRing;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(px + d.x, FIELD.panelY + d.y, d.r * pulse + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// A red cross where the player clicked wrong, fading with its remaining time.
export function drawMiss(ctx, state) {
  if (!state.miss) return;
  const m = state.miss;
  const px = (m.panel === 'left' ? FIELD.leftX : FIELD.rightX) + m.x;
  const py = FIELD.panelY + m.y;
  ctx.strokeStyle = PALETTE.missCross;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(px - 14, py - 14);
  ctx.lineTo(px + 14, py + 14);
  ctx.moveTo(px + 14, py - 14);
  ctx.lineTo(px - 14, py + 14);
  ctx.stroke();
}

// Short message under the header, e.g. "Found: Apple on the tree +100".
export function drawToast(ctx, state) {
  if (!state.toast) return;
  const colors = { find: PALETTE.toastFind, miss: PALETTE.toastMiss, hint: '#8a6d1f' };
  ctx.font = FONT.toast;
  const w = ctx.measureText(state.toast.text).width + 32;
  const x = (FIELD.width - w) / 2;
  ctx.fillStyle = 'rgba(20, 14, 8, 0.78)';
  roundRect(ctx, x, 72, w, 40, 10);
  ctx.fill();
  ctx.fillStyle = colors[state.toast.kind] || PALETTE.headerText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.toast.text, FIELD.width / 2, 93);
  ctx.textAlign = 'left';
}

// --- overlays ---------------------------------------------------------------

function overlay(ctx, title, lines, hint) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.overlayTitle;
  ctx.font = FONT.overlayTitle;
  ctx.fillText(title, FIELD.width / 2, 250);
  ctx.fillStyle = PALETTE.overlayBody;
  ctx.font = FONT.overlayBody;
  let y = 320;
  for (const line of lines) {
    ctx.fillText(line, FIELD.width / 2, y);
    y += 32;
  }
  ctx.fillStyle = PALETTE.headerAccent;
  ctx.font = FONT.button;
  ctx.fillText(hint, FIELD.width / 2, y + 24);
  ctx.textAlign = 'left';
}

export function drawOverlay(ctx, state) {
  if (state.screen === 'title') {
    overlay(ctx, 'Spot the Difference', [
      'Two pictures, side by side. Only one is the original.',
      'Find every difference — click it on either picture.',
      '3 levels · 29 differences · hints cost 50 points, misses cost 10',
      `Best score: ${state.best}`,
    ], 'Press Space or click to start  ·  H hint  ·  P pause  ·  M mute');
  } else if (state.screen === 'paused') {
    overlay(ctx, 'Paused', [
      `Level ${state.levelIndex + 1}: ${LEVELS[state.levelIndex].name}`,
      `Found ${state.found.size} of ${levelDiffs(state).length}  ·  Score ${state.score}`,
    ], 'Press P or Esc to resume  ·  R to restart the level');
  } else if (state.screen === 'levelDone') {
    const next = state.levelIndex + 1 < LEVELS.length
      ? `Next: Level ${state.levelIndex + 2} — ${LEVELS[state.levelIndex + 1].name}`
      : 'That was the last level!';
    overlay(ctx, 'Level Complete!', [
      `All ${levelDiffs(state).length} differences found in ${LEVELS[state.levelIndex].name}.`,
      `Time bonus: +${state.levelBonus}  ·  Score ${state.score}`,
      next,
    ], 'Press Space to continue');
  } else if (state.screen === 'timeUp') {
    overlay(ctx, 'Time Up!', [
      `You found ${state.found.size} of ${levelDiffs(state).length} differences.`,
      `Score ${state.score}  ·  Best ${state.best}`,
    ], 'Press R to retry the level  ·  Space for the title screen');
  } else if (state.screen === 'win') {
    overlay(ctx, 'You Found Them All!', [
      `All 29 differences across 3 levels.`,
      `Final score: ${state.score}  ·  Best ${state.best}`,
    ], 'Press Space to play again');
  }
}

// --- frame ------------------------------------------------------------------

// Draw one whole frame: header, panels, markers, effects, toast, overlay.
export function render(ctx, state) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = '#1c150e';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  drawHeader(ctx, state);
  drawPanels(ctx, state);
  drawMarkers(ctx, state);
  drawHintRing(ctx, state);
  drawMiss(ctx, state);
  drawToast(ctx, state);
  if (state.screen !== 'playing') drawOverlay(ctx, state);
}
