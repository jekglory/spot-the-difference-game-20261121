// Shared constants for the Spot the Difference game: field geometry, scoring,
// palette, level list and the localStorage key for the best score.

// The play field is a fixed 1280x720 logical canvas. A 64px header sits on top;
// below it two 608x624 picture panels sit side by side.
export const FIELD = {
  width: 1280,
  height: 720,
  headerHeight: 64,
  panelWidth: 608,
  panelHeight: 624,
  panelY: 76,
  leftX: 16,
  rightX: 656,
  gap: 32,
};

// Panel-local hit radius (px) for a difference. Generous on purpose: the hunt
// is about looking, not pixel-perfect clicking.
export const HIT_RADIUS = 30;

// Scoring rules.
export const SCORE = {
  find: 100,
  miss: -10,
  missTime: -5,
  hint: -50,
  timeBonusPerSecond: 5,
  hintsPerLevel: 3,
};

export const BEST_KEY = 'spot-the-difference-best-score';

export const FONT = {
  title: 'bold 26px Georgia, serif',
  header: 'bold 18px Georgia, serif',
  counter: 'bold 20px Georgia, serif',
  timer: 'bold 24px "Courier New", monospace',
  toast: 'bold 22px Georgia, serif',
  overlayTitle: 'bold 44px Georgia, serif',
  overlayBody: '20px Georgia, serif',
  button: 'bold 16px Georgia, serif',
  badge: 'bold 15px Georgia, serif',
};

// Warm, hand-painted palette shared by every scene.
export const PALETTE = {
  headerBg: '#2b2118',
  headerText: '#ffe9b8',
  headerAccent: '#ffb347',
  panelBorder: '#3a2c1c',
  panelShadow: 'rgba(0,0,0,0.35)',
  marker: '#e33b2f',
  markerBadge: '#e33b2f',
  markerText: '#ffffff',
  hintRing: '#ffd23f',
  missCross: '#ff3b30',
  toastFind: '#2f9e44',
  toastMiss: '#d6336c',
  overlay: 'rgba(20, 14, 8, 0.62)',
  overlayTitle: '#ffe9b8',
  overlayBody: '#f5ead2',
  buttonBg: '#ffb347',
  buttonText: '#2b2118',
  buttonDisabled: '#8a7a63',
  timerLow: '#ff5a4e',
};

// The three levels, in order. Each level names its scene painter (in scenes.js),
// its time limit in seconds and its differences (in differences.js).
export const LEVELS = [
  { id: 'garden', name: 'Sunny Garden', timeLimit: 150, scene: 'garden' },
  { id: 'harbor', name: 'Harbor at Dusk', timeLimit: 180, scene: 'harbor' },
  { id: 'market', name: 'Lantern Night Market', timeLimit: 210, scene: 'market' },
];
