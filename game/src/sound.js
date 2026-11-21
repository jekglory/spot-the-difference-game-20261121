// Sound effects, synthesised with WebAudio — no audio files, no network.
// Four short sounds: a chime on a find, a buzz on a miss, a fanfare when a
// level is cleared, and an arpeggio on the win screen. Everything is guarded:
// a browser without audio, or a muted game, simply plays nothing.

// Lazily created on the first user gesture (browsers block audio before one).
let audioCtx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ctx() {
  if (muted) return null;
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

// One oscillator blip: frequency, start delay, length, waveform and volume.
function blip(freq, delay, length, type, volume) {
  const ac = ctx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(volume, ac.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + delay + length);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + length + 0.05);
  } catch {
    // A failed blip is never worth breaking the game over.
  }
}

// Two-note chime when a difference is found.
export function playFind() {
  blip(880, 0, 0.16, 'sine', 0.18);
  blip(1318, 0.09, 0.22, 'sine', 0.16);
}

// Low buzz when a click misses.
export function playMiss() {
  blip(160, 0, 0.18, 'sawtooth', 0.08);
}

// Rising fanfare when a level is cleared.
export function playLevelDone() {
  blip(523, 0, 0.14, 'triangle', 0.18);
  blip(659, 0.12, 0.14, 'triangle', 0.18);
  blip(784, 0.24, 0.14, 'triangle', 0.18);
  blip(1046, 0.36, 0.3, 'triangle', 0.2);
}

// A longer arpeggio for the win screen.
export function playWin() {
  const notes = [523, 659, 784, 1046, 784, 1046, 1318];
  notes.forEach((n, i) => blip(n, i * 0.11, 0.2, 'triangle', 0.16));
}
