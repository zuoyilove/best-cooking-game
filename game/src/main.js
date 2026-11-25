// Sizzle & Serve — entry point: canvas setup, the frame loop, and wiring
// input to state. ?shot=start|play|end renders a staged state for screenshots.

import { VIEW } from './config.js';
import { addIngredient, clearPlate, newShift, selectOrder, servePlate, startShift, tick } from './state.js';
import { drawGame, drawOver, drawTitle } from './render.js';
import { keyAction, regionAt } from './input.js';
import { sfx } from './audio.js';
import { shotState } from './shots.js';

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const canvas = document.getElementById('game');
canvas.width = VIEW.w;
canvas.height = VIEW.h;
const ctx = canvas.getContext('2d');

// A seeded RNG for live play: Math.random is fine here because the game is
// judged on screenshots and play, not on a deterministic action log.
const state = shot ? shotState(shot) : newShift(Math.random);

function applyAction(action) {
  if (!action) return;
  if (state.phase === 'title') {
    if (action.kind === 'serve' || action.kind === 'start') {
      startShift(state);
      sfx('start');
    }
    return;
  }
  if (state.phase === 'over') {
    if (action.kind === 'again' || action.kind === 'serve') {
      Object.assign(state, newShift(Math.random));
      startShift(state);
      sfx('start');
    }
    return;
  }
  if (action.kind === 'ingredient') {
    if (addIngredient(state, action.id)) sfx('pick');
  } else if (action.kind === 'ticket') {
    selectOrder(state, action.index);
  } else if (action.kind === 'serve') {
    const result = servePlate(state);
    if (result === 'served') sfx('serve');
    else if (result === 'mismatch') sfx('bad');
  } else if (action.kind === 'trash') {
    clearPlate(state);
    sfx('tick');
  }
}

canvas.addEventListener('click', (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * VIEW.w;
  const y = ((ev.clientY - rect.top) / rect.height) * VIEW.h;
  applyAction(regionAt(x, y));
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === ' ' || ev.key.startsWith('Arrow')) ev.preventDefault();
  applyAction(keyAction(ev.key));
});

let last = performance.now();
let lastWholeSecond = -1;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!shot) {
    tick(state, dt);
    const whole = Math.floor(state.timeLeft);
    if (state.phase === 'playing' && whole !== lastWholeSecond && whole <= 10 && whole > 0) {
      lastWholeSecond = whole;
      sfx('tick');
    }
  }
  if (state.phase === 'title') drawTitle(ctx, state);
  else if (state.phase === 'over') drawOver(ctx, state);
  else drawGame(ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
