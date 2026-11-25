// Sizzle & Serve — tiny synthesized sound effects (WebAudio, no audio files).
// Everything is generated at run time, so the game ships zero media assets.

let ctx = null;

function ac() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

function blip(freq, dur, type = 'sine', gain = 0.08, when = 0) {
  const a = ac();
  if (!a) return;
  if (a.state === 'suspended') void a.resume();
  const t = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g);
  g.connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function sfx(name) {
  if (name === 'pick') blip(660, 0.09, 'triangle', 0.07);
  else if (name === 'serve') { blip(523, 0.1, 'sine', 0.09); blip(784, 0.16, 'sine', 0.09, 0.09); }
  else if (name === 'bad') blip(180, 0.22, 'sawtooth', 0.05);
  else if (name === 'tick') blip(880, 0.05, 'square', 0.03);
  else if (name === 'start') { blip(392, 0.1, 'sine', 0.08); blip(523, 0.1, 'sine', 0.08, 0.1); blip(659, 0.18, 'sine', 0.08, 0.2); }
}
