// Sizzle & Serve — game state: orders, the assembly plate, scoring, the shift clock.
// Pure logic, no drawing and no DOM: main.js drives it, render.js draws it.

import { INGREDIENTS, RECIPES, TIMING } from './config.js';

let orderSeq = 0;

function pickRecipe(rng) {
  return RECIPES[Math.floor(rng() * RECIPES.length)];
}

function makeOrder(rng, now) {
  orderSeq += 1;
  const recipe = pickRecipe(rng);
  return {
    id: orderSeq,
    recipe,
    bornAt: now,
    expiresAt: now + TIMING.orderLifetime,
    // A small seeded wobble so two tickets never look identical.
    tint: Math.floor(rng() * 3),
  };
}

// Multiset equality: same ingredients, same counts, any order.
export function sameDish(a, b) {
  if (a.length !== b.length) return false;
  const count = new Map();
  for (const x of a) count.set(x, (count.get(x) ?? 0) + 1);
  for (const x of b) {
    const n = count.get(x) ?? 0;
    if (n === 0) return false;
    count.set(x, n - 1);
  }
  return true;
}

export function newShift(rng) {
  return {
    phase: 'title', // title | playing | over
    rng,
    time: 0,
    timeLeft: TIMING.daySeconds,
    coins: 0,
    served: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    selected: 0,
    plate: [], // ingredient ids stacked on the assembly plate
    readyPlate: null, // a finished dish waiting on the pass shelf
    nextSpawnAt: TIMING.firstOrderAt,
    message: '',
    messageAt: -99,
    shakeAt: -99,
    flash: null,
    lastServedName: '',
  };
}

export function startShift(state) {
  state.phase = 'playing';
  state.time = 0;
  state.timeLeft = TIMING.daySeconds;
  state.coins = 0;
  state.served = 0;
  state.strikes = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.orders = [makeOrder(state.rng, 0)];
  state.selected = 0;
  state.plate = [];
  state.readyPlate = null;
  state.nextSpawnAt = TIMING.firstOrderAt + TIMING.spawnEveryStart;
  state.message = '开张啦！按 1-6 取食材，空格上菜';
  state.messageAt = 0;
}

function spawnRate(state) {
  // Orders arrive faster as the shift goes on: 20s apart at open, 11s at close.
  const p = 1 - state.timeLeft / TIMING.daySeconds;
  return TIMING.spawnEveryStart + (TIMING.spawnEveryEnd - TIMING.spawnEveryStart) * p;
}

export function addIngredient(state, id) {
  if (state.phase !== 'playing') return false;
  if (state.plate.length >= 6) return false;
  state.plate.push(id);
  return true;
}

export function clearPlate(state) {
  if (state.phase !== 'playing') return;
  state.plate = [];
}

export function selectOrder(state, index) {
  if (state.phase !== 'playing') return;
  if (index >= 0 && index < state.orders.length) state.selected = index;
}

// Serve the plate against the selected order. Returns 'served' | 'mismatch' | 'empty' | 'no-order'.
export function servePlate(state) {
  if (state.phase !== 'playing') return 'idle';
  if (state.plate.length === 0) return 'empty';
  const order = state.orders[state.selected];
  if (!order) return 'no-order';
  if (!sameDish(state.plate, order.recipe.items)) {
    state.combo = 0;
    state.shakeAt = state.time;
    state.message = '不对！这单要的是 ' + order.recipe.name + '，再看看订单板';
    state.messageAt = state.time;
    return 'mismatch';
  }
  const secondsLeft = Math.max(0, order.expiresAt - state.time);
  const bonus = Math.round(secondsLeft * 0.2);
  const comboPay = state.combo * TIMING.comboStep;
  const earned = order.recipe.pay + bonus + comboPay;
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.lastServedName = order.recipe.name;
  state.readyPlate = { items: [...order.recipe.items], at: state.time };
  state.plate = [];
  state.orders.splice(state.selected, 1);
  if (state.selected >= state.orders.length) state.selected = Math.max(0, state.orders.length - 1);
  state.flash = { kind: 'good', at: state.time };
  state.message = `上菜！${order.recipe.name} +${earned} 金币` + (state.combo > 1 ? `（连击 x${state.combo}）` : '');
  state.messageAt = state.time;
  return 'served';
}

export function tick(state, dt) {
  if (state.phase !== 'playing') return;
  state.time += dt;
  state.timeLeft = Math.max(0, TIMING.daySeconds - state.time);

  // Expired orders cost a strike.
  for (let i = state.orders.length - 1; i >= 0; i--) {
    if (state.time >= state.orders[i].expiresAt) {
      const lost = state.orders[i];
      state.orders.splice(i, 1);
      state.strikes += 1;
      state.combo = 0;
      state.message = `超时！${lost.recipe.name} 的客人走了（失误 ${state.strikes}/${TIMING.maxStrikes}）`;
      state.messageAt = state.time;
      state.flash = { kind: 'bad', at: state.time };
      if (state.selected >= state.orders.length) state.selected = Math.max(0, state.orders.length - 1);
    }
  }

  // Spawn the next order on schedule, up to the board's capacity.
  if (state.time >= state.nextSpawnAt && state.orders.length < TIMING.maxOrders) {
    state.orders.push(makeOrder(state.rng, state.time));
    state.nextSpawnAt = state.time + spawnRate(state);
  } else if (state.time >= state.nextSpawnAt) {
    state.nextSpawnAt = state.time + 4;
  }

  if (state.readyPlate && state.time - state.readyPlate.at > 6) state.readyPlate = null;

  if (state.strikes >= TIMING.maxStrikes || state.timeLeft <= 0) {
    state.phase = 'over';
    state.message = state.strikes >= TIMING.maxStrikes ? '失误太多，打烊了…' : '打烊啦！今天辛苦了';
    state.messageAt = state.time;
  }
}

export function ingredientLabel(id) {
  return INGREDIENTS.find((i) => i.id === id)?.label ?? id;
}
