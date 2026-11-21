// The differences for every level. Each entry names one spot that differs
// between the left (original) and right (changed) pictures.
//
// Coordinates are panel-local: x in 0..608, y in 0..624, with r the hit radius
// used by world.clickAt. `label` is the short name the toast shows when the
// player finds it. The scene painters in scenes.js read `changed` — the set of
// ids whose change applies to the right panel — so a difference only ever
// alters the right picture.

// Level 1 — Sunny Garden: 7 differences, 150 seconds.
export const GARDEN_DIFFS = [
  { id: 'apple', x: 470, y: 250, r: 26, label: 'Apple on the tree' },
  { id: 'flower', x: 104, y: 548, r: 24, label: 'Red flower turns yellow' },
  { id: 'duck', x: 300, y: 462, r: 28, label: 'Duck on the pond' },
  { id: 'window', x: 186, y: 340, r: 26, label: 'Cottage window goes dark' },
  { id: 'tail', x: 520, y: 430, r: 24, label: 'Cat tail drops' },
  { id: 'cloud', x: 420, y: 80, r: 30, label: 'Extra cloud in the sky' },
  { id: 'kitebow', x: 150, y: 240, r: 24, label: 'Kite loses a bow' },
];

// Level 2 — Harbor at Dusk: 10 differences, 180 seconds. Note the fish must
// sit in open water above the dock (y < 500) or the dock covers it.
export const HARBOR_DIFFS = [
  { id: 'lamp', x: 90, y: 130, r: 26, label: 'Lighthouse beam goes out' },
  { id: 'flag', x: 355, y: 160, r: 24, label: 'Flag turns green' },
  { id: 'gull', x: 470, y: 110, r: 24, label: 'Gull flies away' },
  { id: 'fish', x: 250, y: 460, r: 26, label: 'Fish jumps in the water' },
  { id: 'crate', x: 520, y: 520, r: 26, label: 'Top crate vanishes' },
  { id: 'lantern', x: 150, y: 380, r: 24, label: 'Dock lantern goes dark' },
  { id: 'moon', x: 520, y: 70, r: 26, label: 'Moon rises' },
  { id: 'anchor', x: 420, y: 540, r: 26, label: 'Anchor disappears' },
  { id: 'rope', x: 90, y: 540, r: 26, label: 'Coiled rope is gone' },
  { id: 'stripe', x: 356, y: 283, r: 24, label: 'Sail stripe turns blue' },
];

// Level 3 — Lantern Night Market: 12 differences, 210 seconds.
export const MARKET_DIFFS = [
  { id: 'redlantern', x: 140, y: 150, r: 24, label: 'Red lantern turns blue' },
  { id: 'star', x: 500, y: 60, r: 22, label: 'Bright star fades out' },
  { id: 'sign', x: 300, y: 210, r: 24, label: 'Sign mark turns square' },
  { id: 'jar', x: 180, y: 470, r: 24, label: 'Pickle jar is gone' },
  { id: 'steam', x: 420, y: 340, r: 26, label: 'Steamer stops steaming' },
  { id: 'ear', x: 522, y: 392, r: 22, label: 'Cat ear folds down' },
  { id: 'awning', x: 159, y: 315, r: 26, label: 'Awning stripe is gone' },
  { id: 'coin', x: 240, y: 520, r: 22, label: 'A coin appears' },
  { id: 'dumpling', x: 470, y: 500, r: 24, label: 'Extra dumpling on the plate' },
  { id: 'bulb', x: 76, y: 138, r: 22, label: 'A string bulb goes dark' },
  { id: 'moon2', x: 90, y: 70, r: 24, label: 'Moon slips away' },
  { id: 'cat2', x: 380, y: 560, r: 24, label: 'A second cat appears' },
];

// The full level table: config.js owns the names and time limits, this file
// owns the difference lists. Order matches LEVELS in config.js.
export const LEVEL_DIFFS = [GARDEN_DIFFS, HARBOR_DIFFS, MARKET_DIFFS];

// Look a difference up by id inside one level's list.
export function diffById(diffs, id) {
  for (const d of diffs) if (d.id === id) return d;
  return null;
}
