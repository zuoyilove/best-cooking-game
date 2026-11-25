// Sizzle & Serve — staged screenshot states for ?shot=start|play|end.
// The game renders these states with its own code (same renderer, same
// kitchen); they exist so the maker's screenshots show the game at its best:
// a kitchen and an order board, ingredients on the counter, one dish
// mid-assembly, a timer and a plate ready to serve.

import { RECIPES, TIMING } from './config.js';
import { newShift, startShift } from './state.js';

// Deterministic little RNG so a shot looks the same every time it is taken.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shotState(shot) {
  const rng = mulberry32(20261125);
  const state = newShift(rng);
  if (shot === 'start') {
    state.phase = 'title';
    state.orders = [
      { id: 1, recipe: RECIPES[0], bornAt: 0, expiresAt: 45, tint: 0 },
      { id: 2, recipe: RECIPES[3], bornAt: 0, expiresAt: 45, tint: 1 },
    ];
    state.timeLeft = TIMING.daySeconds;
    return state;
  }
  startShift(state);
  if (shot === 'play') {
    // Mid-shift: three orders on the board, the plate half-built for the
    // selected order, a finished dish on the pass, timer still running.
    state.time = 63;
    state.timeLeft = TIMING.daySeconds - 63;
    state.coins = 46;
    state.served = 3;
    state.combo = 2;
    state.bestCombo = 3;
    state.orders = [
      { id: 4, recipe: RECIPES[0], bornAt: 40, expiresAt: 40 + TIMING.orderLifetime, tint: 0 },
      { id: 5, recipe: RECIPES[1], bornAt: 50, expiresAt: 50 + TIMING.orderLifetime, tint: 1 },
      { id: 6, recipe: RECIPES[4], bornAt: 58, expiresAt: 58 + TIMING.orderLifetime, tint: 2 },
    ];
    state.selected = 0;
    state.plate = ['bun', 'patty', 'lettuce']; // classic burger, one tomato short
    state.readyPlate = { items: [...RECIPES[1].items], at: 60 };
    state.lastServedName = RECIPES[1].name;
    state.message = '芝士融心已上菜！+18 金币（连击 x2）';
    state.messageAt = 61;
    return state;
  }
  if (shot === 'end') {
    state.phase = 'over';
    state.time = TIMING.daySeconds;
    state.timeLeft = 0;
    state.coins = 128;
    state.served = 9;
    state.bestCombo = 4;
    state.strikes = 1;
    state.message = '打烊啦！今天辛苦了';
    state.messageAt = TIMING.daySeconds;
    state.orders = [
      { id: 9, recipe: RECIPES[2], bornAt: 120, expiresAt: 165, tint: 0 },
    ];
    state.plate = ['bun', 'patty'];
    return state;
  }
  return state;
}
