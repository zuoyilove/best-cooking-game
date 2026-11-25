// Sizzle & Serve — static configuration: ingredients, recipes, timing, palette.
// Nothing here is loaded from the network; every value is baked into the game.

export const VIEW = { w: 1280, h: 800 };

// Six ingredients the player picks from the counter. `key` is the keyboard shortcut,
// `color`/`accent` are what the renderer draws, `label` is shown on the bin.
export const INGREDIENTS = [
  { id: 'bun',     key: '1', label: '面包 Bun',     color: '#e8a54b', accent: '#c97f2a', price: 2 },
  { id: 'patty',   key: '2', label: '肉饼 Patty',   color: '#8a5a2b', accent: '#5f3c17', price: 4 },
  { id: 'cheese',  key: '3', label: '芝士 Cheese',  color: '#f7c948', accent: '#d9a400', price: 3 },
  { id: 'lettuce', key: '4', label: '生菜 Lettuce', color: '#7dc383', accent: '#4d9b57', price: 2 },
  { id: 'tomato',  key: '5', label: '番茄 Tomato',  color: '#e4572e', accent: '#b23a1d', price: 2 },
  { id: 'sauce',   key: '6', label: '酱料 Sauce',   color: '#f2e394', accent: '#d9b64a', price: 1 },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// Five house recipes. An order lists ingredient ids in the order the kitchen
// likes them stacked, but the plate accepts them in any order: only the
// multiset has to match, so the player plans the route, not the sequence.
export const RECIPES = [
  { id: 'classic', name: '经典汉堡', en: 'Classic Burger', items: ['bun', 'patty', 'lettuce', 'tomato'], pay: 12 },
  { id: 'melt',    name: '芝士融心', en: 'Cheese Melt',    items: ['bun', 'patty', 'cheese', 'cheese'],  pay: 14 },
  { id: 'garden',  name: '田园鲜蔬', en: 'Garden Fresh',   items: ['bun', 'lettuce', 'tomato', 'lettuce'], pay: 12 },
  { id: 'double',  name: '双层肉塔', en: 'Double Stack',   items: ['bun', 'patty', 'patty', 'cheese'],   pay: 18 },
  { id: 'deluxe',  name: '酱香豪华', en: 'Saucy Deluxe',   items: ['bun', 'patty', 'sauce', 'tomato'],   pay: 16 },
];

// Timing: a shift lasts DAY_SECONDS; orders arrive faster and expire sooner
// as the shift wears on, so pressure grows without adding new chores.
export const TIMING = {
  daySeconds: 150,
  orderLifetime: 45,
  firstOrderAt: 1,
  spawnEveryStart: 20,
  spawnEveryEnd: 11,
  maxOrders: 3,
  maxStrikes: 3,
  serveBonusPerSecondLeft: 1,
  comboStep: 2,
};

export const PALETTE = {
  wall: '#f6e3c5',
  wallTrim: '#e8c99a',
  floor: '#c98f5f',
  floorDark: '#b57a4c',
  counter: '#8d5a33',
  counterTop: '#a9743f',
  board: '#fff8e7',
  boardEdge: '#7a4a21',
  plate: '#fdfdfd',
  ink: '#3a2413',
  muted: '#8a6a4a',
  good: '#2e7d32',
  bad: '#c62828',
  gold: '#f7c948',
  pass: '#dfe9d8',
};
