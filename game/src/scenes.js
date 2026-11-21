// Scene painters: three original pictures, drawn with the canvas 2D API.
// Each painter draws one panel (608x624, panel-local coordinates) and takes
// `changed`, the set of difference ids whose change applies to this panel.
// The left panel is always painted with an empty set (the original); the
// right panel with the full set (the changed picture). Everything is fixed
// geometry — no Math.random — so both panels agree everywhere except the
// differences themselves.

import { mulberry32 } from './random.js';

// --- tiny drawing helpers -------------------------------------------------

function disc(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function strokeLine(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// A five-pointed star, used for the night-market sky.
function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, s) {
  ellipse(ctx, x, y, 34 * s, 16 * s, '#ffffff');
  ellipse(ctx, x - 22 * s, y + 6 * s, 22 * s, 12 * s, '#ffffff');
  ellipse(ctx, x + 24 * s, y + 6 * s, 24 * s, 13 * s, '#ffffff');
}

// --- Level 1: Sunny Garden ------------------------------------------------
// Sky, sun, kite, cottage, tree with an apple, pond with a duck, fence, a cat
// and a flower bed. The grass covers y 400..624 so no bare band shows.
export function drawGarden(ctx, changed) {
  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 400);
  sky.addColorStop(0, '#8ecdf5');
  sky.addColorStop(1, '#e6f6ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 608, 400);
  // Sun with rays.
  ctx.save();
  ctx.translate(90, 80);
  ctx.strokeStyle = '#ffcf3f';
  ctx.lineWidth = 4;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    strokeLine(ctx, Math.cos(a) * 48, Math.sin(a) * 48, Math.cos(a) * 60, Math.sin(a) * 60, '#ffcf3f', 4);
  }
  ctx.restore();
  disc(ctx, 90, 80, 42, '#ffd94d');
  disc(ctx, 90, 80, 34, '#ffe98a');
  // Clouds; the extra one at (420, 80) is a difference.
  cloud(ctx, 270, 70, 1);
  cloud(ctx, 540, 130, 0.8);
  if (changed.has('cloud')) cloud(ctx, 420, 80, 0.9);
  // Kite: diamond, string and tail bows (3 normally, 2 when changed).
  poly(ctx, [[150, 190], [178, 240], [150, 290], [122, 240]], '#e85d75');
  poly(ctx, [[150, 190], [178, 240], [150, 240], [150, 190]], '#f4a259');
  strokeLine(ctx, 150, 290, 150, 340, '#5b4a3a', 2);
  const bows = changed.has('kitebow') ? 2 : 3;
  for (let i = 0; i < bows; i++) {
    const y = 302 + i * 14;
    poly(ctx, [[150, y - 5], [158, y], [150, y + 5], [142, y]], '#ffd23f');
  }
  // Grass: covers y 400..624.
  const grass = ctx.createLinearGradient(0, 400, 0, 624);
  grass.addColorStop(0, '#7ec850');
  grass.addColorStop(1, '#4f9e33');
  ctx.fillStyle = grass;
  ctx.fillRect(0, 400, 608, 224);
  // Grass tufts.
  ctx.strokeStyle = '#3d7d28';
  ctx.lineWidth = 2;
  for (const [gx, gy] of [[40, 560], [120, 600], [220, 570], [380, 600], [470, 580], [560, 610], [60, 430], [560, 440]]) {
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx - 4, gy - 10);
    ctx.moveTo(gx + 4, gy);
    ctx.lineTo(gx + 8, gy - 10);
    ctx.stroke();
  }
  // Cottage: walls, roof, door, and the window that lights or darkens.
  rect(ctx, 140, 330, 120, 100, '#f7d9a0');
  poly(ctx, [[130, 332], [200, 282], [270, 332]], '#c96f4a');
  rect(ctx, 188, 380, 26, 50, '#8a5a2b');
  disc(ctx, 208, 408, 3, '#ffd94d');
  rect(ctx, 160, 322, 52, 40, '#fff3d6');
  rect(ctx, 164, 326, 44, 32, changed.has('window') ? '#4a3b2c' : '#ffd94d');
  strokeLine(ctx, 186, 326, 186, 358, '#8a5a2b', 3);
  strokeLine(ctx, 164, 342, 208, 342, '#8a5a2b', 3);
  // Tree: trunk and three canopy blobs; the apple hangs at (470, 250).
  rect(ctx, 462, 330, 18, 100, '#7a4a21');
  disc(ctx, 440, 300, 42, '#4f9e33');
  disc(ctx, 500, 295, 46, '#5fb53f');
  disc(ctx, 470, 255, 44, '#6cc24a');
  if (!changed.has('apple')) {
    disc(ctx, 470, 250, 11, '#e33b2f');
    disc(ctx, 466, 246, 3, '#ff8a7a');
  }
  // Pond with a duck that may swim away.
  ellipse(ctx, 300, 462, 62, 26, '#5db7e8');
  ellipse(ctx, 300, 458, 52, 20, '#7cc8ef');
  if (!changed.has('duck')) {
    ellipse(ctx, 300, 458, 14, 10, '#ffffff');
    disc(ctx, 312, 448, 8, '#ffffff');
    poly(ctx, [[319, 448], [326, 451], [319, 453]], '#ff9f1c');
    disc(ctx, 314, 446, 2, '#222222');
  }
  // Fence along the garden.
  ctx.fillStyle = '#b98a4e';
  for (let x = 20; x < 600; x += 48) ctx.fillRect(x, 500, 10, 34);
  rect(ctx, 10, 508, 588, 6, '#a87a42');
  rect(ctx, 10, 524, 588, 6, '#a87a42');
  // Cat sitting by the fence; its tail points up, or drops when changed.
  ellipse(ctx, 520, 448, 20, 24, '#f2a541');
  disc(ctx, 520, 412, 14, '#f2a541');
  poly(ctx, [[510, 400], [514, 384], [520, 398]], '#f2a541');
  poly(ctx, [[530, 400], [526, 384], [520, 398]], '#f2a541');
  ctx.strokeStyle = '#f2a541';
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (changed.has('tail')) {
    ctx.moveTo(540, 452);
    ctx.quadraticCurveTo(556, 462, 548, 474);
  } else {
    ctx.moveTo(540, 452);
    ctx.quadraticCurveTo(556, 436, 544, 420);
  }
  ctx.stroke();
  disc(ctx, 516, 410, 2, '#222222');
  disc(ctx, 525, 410, 2, '#222222');
  // Flower bed: rows of small blooms; one at (104, 548) changes colour.
  for (let i = 0; i < 9; i++) {
    const fx = 60 + i * 58;
    const fy = 548 + (i % 2) * 26;
    strokeLine(ctx, fx, fy, fx, fy + 14, '#2f7d2a', 3);
    const petal = fx === 104 && fy === 548 && changed.has('flower') ? '#ffd23f' : '#e85d75';
    disc(ctx, fx, fy, 8, petal);
    disc(ctx, fx, fy, 3, '#fff3d6');
  }
}

// --- Level 2: Harbor at Dusk ----------------------------------------------
// Sunset sky, sea, lighthouse, sailboat, dock, crates, lantern, anchor and
// rope. The jumping fish stays in open water above the dock (y < 500).
export function drawHarbor(ctx, changed) {
  // Sunset sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 380);
  sky.addColorStop(0, '#3b2a63');
  sky.addColorStop(0.55, '#c65a7a');
  sky.addColorStop(1, '#ff9a5c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 608, 380);
  // Moon rises only in the changed picture.
  if (changed.has('moon')) {
    disc(ctx, 520, 70, 26, '#fdf6d8');
    disc(ctx, 512, 64, 6, '#e8dcb0');
    disc(ctx, 528, 78, 4, '#e8dcb0');
  }
  // Gull that may fly away.
  if (!changed.has('gull')) {
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(458, 110);
    ctx.quadraticCurveTo(466, 100, 474, 110);
    ctx.quadraticCurveTo(482, 100, 490, 110);
    ctx.stroke();
  }
  // Sea.
  const sea = ctx.createLinearGradient(0, 380, 0, 624);
  sea.addColorStop(0, '#2e5f8a');
  sea.addColorStop(1, '#16324e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 380, 608, 244);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  for (const [wx, wy, wl] of [[60, 420, 70], [200, 450, 90], [420, 430, 80], [120, 480, 60], [480, 470, 70]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 6, wx + wl, wy);
    ctx.stroke();
  }
  // Lighthouse: striped tower and the lamp that may go out.
  rect(ctx, 60, 180, 60, 200, '#f5ead2');
  rect(ctx, 60, 220, 60, 26, '#d94f3d');
  rect(ctx, 60, 290, 60, 26, '#d94f3d');
  rect(ctx, 52, 140, 76, 42, '#8a5a2b');
  rect(ctx, 70, 118, 40, 24, '#ffd94d');
  if (!changed.has('lamp')) {
    ctx.fillStyle = 'rgba(255, 217, 77, 0.35)';
    poly(ctx, [[110, 130], [300, 100], [300, 165]], 'rgba(255, 217, 77, 0.35)');
  }
  rect(ctx, 52, 108, 76, 10, '#5b4a3a');
  // Sailboat: hull, mast, sail with its stripe, and the flag on top.
  poly(ctx, [[300, 340], [420, 340], [400, 368], [320, 368]], '#7a4a21');
  rect(ctx, 356, 160, 6, 182, '#5b4a3a');
  poly(ctx, [[362, 176], [362, 330], [420, 330]], '#fff3d6');
  rect(ctx, 362, 276, 58, 14, changed.has('stripe') ? '#3f6fd8' : '#d94f3d');
  poly(ctx, [[362, 160], [392, 168], [362, 176]], changed.has('flag') ? '#3fae5a' : '#d94f3d');
  // The fish jumps in open water, above the dock.
  if (changed.has('fish')) {
    ctx.fillStyle = '#9fd8ef';
    ctx.beginPath();
    ctx.moveTo(228, 460);
    ctx.quadraticCurveTo(250, 438, 272, 460);
    ctx.quadraticCurveTo(250, 472, 228, 460);
    ctx.fill();
    poly(ctx, [[272, 460], [284, 452], [284, 468]], '#9fd8ef');
    disc(ctx, 238, 456, 2, '#16324e');
  }
  // Dock planks.
  rect(ctx, 30, 500, 548, 62, '#8a6a42');
  ctx.strokeStyle = '#6b4e2e';
  ctx.lineWidth = 2;
  for (let x = 70; x < 578; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 500);
    ctx.lineTo(x, 562);
    ctx.stroke();
  }
  rect(ctx, 30, 500, 548, 6, '#a87a42');
  // Lantern post: the lantern glows, or goes dark.
  rect(ctx, 146, 380, 8, 122, '#5b4a3a');
  rect(ctx, 138, 366, 24, 18, '#2b2118');
  rect(ctx, 142, 370, 16, 10, changed.has('lantern') ? '#ffd94d' : '#4a3b2c');
  if (!changed.has('lantern')) {
    ctx.fillStyle = 'rgba(255, 217, 77, 0.25)';
    ctx.beginPath();
    ctx.arc(150, 380, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  // Crates: two stacked, the top one may vanish.
  rect(ctx, 496, 520, 56, 40, '#b98a4e');
  strokeLine(ctx, 496, 520, 552, 560, '#8a6a42', 3);
  strokeLine(ctx, 552, 520, 496, 560, '#8a6a42', 3);
  if (!changed.has('crate')) {
    rect(ctx, 504, 482, 40, 38, '#c99a58');
    strokeLine(ctx, 504, 482, 544, 520, '#8a6a42', 3);
    strokeLine(ctx, 544, 482, 504, 520, '#8a6a42', 3);
  }
  // Anchor resting on the dock, or gone.
  if (!changed.has('anchor')) {
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(420, 540, 14, 0.3, Math.PI - 0.3);
    ctx.moveTo(420, 526);
    ctx.lineTo(420, 556);
    ctx.moveTo(408, 532);
    ctx.lineTo(432, 532);
    ctx.stroke();
  }
  // Coiled rope on the dock, or gone.
  if (!changed.has('rope')) {
    ctx.strokeStyle = '#d8b25c';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(90, 540, 16, 0, Math.PI * 2);
    ctx.arc(90, 540, 9, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// --- Level 3: Lantern Night Market ----------------------------------------
// Night sky and stars, string lights, paper lanterns, a signboard, two
// stalls (pickle jars and a dumpling steamer) and two cats.
export function drawMarket(ctx, changed) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#0e1330');
  sky.addColorStop(1, '#2a2a55');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 608, 300);
  // Fixed stars from a seeded generator, so both panels match exactly.
  const rand = mulberry32(20261121);
  for (let i = 0; i < 42; i++) {
    const sx = 20 + rand() * 568;
    const sy = 16 + rand() * 220;
    const sr = 1 + rand() * 1.6;
    disc(ctx, sx, sy, sr, 'rgba(255,255,255,0.85)');
  }
  // The bright star that may fade out, and the moon that may slip away.
  if (!changed.has('star')) star(ctx, 500, 60, 10, '#fff3b0');
  if (!changed.has('moon2')) {
    disc(ctx, 90, 70, 24, '#fdf6d8');
    disc(ctx, 82, 64, 5, '#e8dcb0');
    disc(ctx, 98, 76, 4, '#e8dcb0');
  }
  // String lights sagging across the top; one bulb may go dark.
  ctx.strokeStyle = '#1c1c28';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 108);
  ctx.quadraticCurveTo(304, 158, 608, 108);
  ctx.stroke();
  const bulbColors = ['#ffd23f', '#ff6b6b', '#7cc8ef', '#9dff8a', '#ffb347'];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const bx = 24 + t * 560;
    const by = 108 + Math.sin(t * Math.PI) * 26 + 8;
    strokeLine(ctx, bx, by - 8, bx, by, '#1c1c28', 2);
    const dark = changed.has('bulb') && Math.abs(bx - 76) < 24;
    disc(ctx, bx, by + 4, 7, dark ? '#3a3a48' : bulbColors[i % bulbColors.length]);
  }
  // Paper lantern: red, or blue when changed.
  const lanternColor = changed.has('redlantern') ? '#4f7fd8' : '#e33b2f';
  ctx.fillStyle = 'rgba(255, 120, 90, 0.18)';
  ctx.beginPath();
  ctx.arc(140, 150, 46, 0, Math.PI * 2);
  ctx.fill();
  ellipse(ctx, 140, 150, 26, 34, lanternColor);
  rect(ctx, 132, 112, 16, 8, '#ffb347');
  rect(ctx, 132, 180, 16, 8, '#ffb347');
  ctx.strokeStyle = '#7a1f16';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 118);
  ctx.lineTo(140, 182);
  ctx.stroke();
  // Signboard with a middle mark: circle, or square when changed.
  rect(ctx, 250, 178, 110, 56, '#5b3a1e');
  rect(ctx, 258, 186, 94, 40, '#f5ead2');
  ctx.fillStyle = '#8a2f23';
  if (changed.has('sign')) {
    ctx.fillRect(288, 198, 24, 24);
  } else {
    ctx.beginPath();
    ctx.arc(300, 210, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#8a2f23';
  ctx.fillRect(264, 202, 14, 16);
  ctx.fillRect(326, 202, 14, 16);
  // Stall awnings; one stripe may be gone.
  for (const [ax, aw] of [[110, 150], [350, 190]]) {
    for (let i = 0; i < 5; i++) {
      const stripe = i % 2 === 0 ? '#e33b2f' : '#fff3d6';
      if (changed.has('awning') && ax === 110 && i === 1) continue;
      rect(ctx, ax + i * (aw / 5), 300, aw / 5, 26, stripe);
    }
  }
  // Street ground.
  rect(ctx, 0, 560, 608, 64, '#241d16');
  rect(ctx, 0, 560, 608, 4, '#3a2f24');
  // Left stall: pickle jars on the counter; one jar may be gone.
  rect(ctx, 120, 470, 140, 90, '#6b4a26');
  rect(ctx, 112, 460, 156, 12, '#8a6a42');
  for (const [jx, jc] of [[140, '#7cc86a'], [210, '#e8a54b']]) {
    ellipse(ctx, jx, 448, 16, 20, jc);
    rect(ctx, jx - 10, 424, 20, 8, '#5b4a3a');
  }
  if (!changed.has('jar')) {
    ellipse(ctx, 180, 448, 16, 20, '#d86a8a');
    rect(ctx, 170, 424, 20, 8, '#5b4a3a');
  }
  // Right stall: dumpling steamer with rising steam, or none.
  rect(ctx, 360, 470, 180, 90, '#6b4a26');
  rect(ctx, 352, 460, 196, 12, '#8a6a42');
  ellipse(ctx, 420, 448, 34, 12, '#8a8a8a');
  rect(ctx, 392, 436, 56, 12, '#b0b0b0');
  if (!changed.has('steam')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 3;
    for (const [sx, sy] of [[404, 420], [420, 412], [436, 420]]) {
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + 6, sy - 14, sx - 2, sy - 26);
      ctx.stroke();
    }
  }
  // Plate of dumplings; an extra one appears when changed.
  ellipse(ctx, 470, 500, 34, 10, '#fff3d6');
  for (const [dx, dy] of [[452, 496], [470, 492], [488, 496]]) {
    ellipse(ctx, dx, dy, 9, 6, '#f5ead2');
  }
  if (changed.has('dumpling')) ellipse(ctx, 470, 506, 9, 6, '#f5ead2');
  // A coin that appears on the counter.
  if (changed.has('coin')) {
    disc(ctx, 240, 520, 10, '#ffd23f');
    disc(ctx, 240, 520, 6, '#ffdf6b');
  }
  // Cat by the right stall; one ear folds when changed.
  ellipse(ctx, 522, 402, 18, 16, '#3a3a48');
  disc(ctx, 522, 384, 12, '#3a3a48');
  poly(ctx, [[512, 374], [516, 360], [522, 372]], '#3a3a48');
  if (changed.has('ear')) {
    poly(ctx, [[532, 374], [538, 366], [534, 380]], '#3a3a48');
  } else {
    poly(ctx, [[532, 374], [528, 360], [522, 372]], '#3a3a48');
  }
  disc(ctx, 518, 382, 2, '#ffd23f');
  disc(ctx, 527, 382, 2, '#ffd23f');
  // A second cat appears on the street when changed.
  if (changed.has('cat2')) {
    ellipse(ctx, 380, 566, 18, 12, '#f2a541');
    disc(ctx, 380, 550, 11, '#f2a541');
    poly(ctx, [[371, 542], [375, 530], [380, 540]], '#f2a541');
    poly(ctx, [[389, 542], [385, 530], [380, 540]], '#f2a541');
  }
}

// Paint one level's scene by name. `changed` is the set of difference ids
// that apply to this panel (empty for the original, full for the changed one).
export function drawScene(ctx, scene, changed) {
  if (scene === 'garden') drawGarden(ctx, changed);
  else if (scene === 'harbor') drawHarbor(ctx, changed);
  else drawMarket(ctx, changed);
}
