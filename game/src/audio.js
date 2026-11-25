// Tiny WebAudio synth: every sound is a few oscillator blips, no audio files.
// The context is created on the first user gesture; headless runs never hear it.
let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ensure() {
  if (muted) return null;
  try {
    if (!context) context = new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function tone(freq, dur, type, vol, when = 0, slideTo = 0) {
  const audio = ensure();
  if (!audio) return;
  try {
    const start = audio.currentTime + when;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(vol, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  } catch {
    // A browser without audio still plays the game.
  }
}

export const sfx = {
  pickup() { tone(520, 0.08, 'sine', 0.12, 0, 760); },
  place() { tone(340, 0.07, 'triangle', 0.12); },
  chop() { tone(180, 0.05, 'square', 0.08); tone(180, 0.05, 'square', 0.08, 0.09); },
  sizzle() { tone(1200, 0.25, 'sawtooth', 0.03, 0, 700); },
  ready() { tone(880, 0.1, 'sine', 0.12); tone(1174, 0.14, 'sine', 0.12, 0.09); },
  serve() { tone(659, 0.1, 'sine', 0.14); tone(784, 0.1, 'sine', 0.14, 0.09); tone(1046, 0.18, 'sine', 0.14, 0.18); },
  error() { tone(160, 0.16, 'square', 0.09, 0, 110); },
  lost() { tone(392, 0.15, 'sine', 0.12, 0, 262); tone(311, 0.2, 'sine', 0.12, 0.14, 233); },
  tick() { tone(980, 0.05, 'sine', 0.07); },
  over() { tone(523, 0.15, 'sine', 0.13); tone(659, 0.15, 'sine', 0.13, 0.14); tone(784, 0.3, 'sine', 0.13, 0.28); },
};
