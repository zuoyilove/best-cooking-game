// Sizzle & Serve — mouse + keyboard input: hit-testing the bins, tickets,
// serve/trash buttons and the title / game-over panels.

import { INGREDIENTS, TIMING } from './config.js';

// Clickable regions, rebuilt by main.js every frame from the same layout
// constants render.js uses, so clicks always land where the drawing is.
export function hitRegions() {
  const bins = INGREDIENTS.map((ing, i) => ({
    kind: 'ingredient', id: ing.id, x: 20 + i * 206, y: 690, w: 196, h: 92,
  }));
  const tickets = Array.from({ length: TIMING.maxOrders }, (_, i) => ({
    kind: 'ticket', index: i, x: 20, y: 138 + i * 120, w: 300, h: 108,
  }));
  return [
    ...bins,
    ...tickets,
    { kind: 'serve', x: 1050, y: 330, w: 210, h: 64 },
    { kind: 'trash', x: 1050, y: 406, w: 210, h: 64 },
    { kind: 'start', x: 490, y: 450, w: 300, h: 64 },
    { kind: 'again', x: 490, y: 470, w: 300, h: 60 },
  ];
}

function inside(r, x, y) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function regionAt(x, y) {
  for (const r of hitRegions()) if (inside(r, x, y)) return r;
  return null;
}

// Keyboard: 1-6 ingredients, Space/Enter serve, Backspace/X trash,
// Q/W/E select an order ticket, R restart after game over.
export function keyAction(key) {
  const ing = INGREDIENTS.find((i) => i.key === key);
  if (ing) return { kind: 'ingredient', id: ing.id };
  if (key === ' ' || key === 'Enter') return { kind: 'serve' };
  if (key === 'Backspace' || key === 'x' || key === 'X') return { kind: 'trash' };
  if (key === 'q' || key === 'Q') return { kind: 'ticket', index: 0 };
  if (key === 'w' || key === 'W') return { kind: 'ticket', index: 1 };
  if (key === 'e' || key === 'E') return { kind: 'ticket', index: 2 };
  if (key === 'r' || key === 'R') return { kind: 'again' };
  return null;
}
