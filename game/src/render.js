// Sizzle & Serve — all canvas drawing: the kitchen, order board, counter,
// assembly plate, timer and buttons. Drawn shapes only, no image files.

import { INGREDIENTS, INGREDIENT_BY_ID, PALETTE, TIMING, VIEW } from './config.js';

function rr(ctx, x, y, w, h, r) {
 ctx.beginPath();
 ctx.moveTo(x + r, y);
 ctx.arcTo(x + w, y, x + w, y + h, r);
 ctx.arcTo(x + w, y + h, x, y + h, r);
 ctx.arcTo(x, y + h, x, y, r);
 ctx.arcTo(x, y, x + w, y, r);
 ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = 'bold', align = 'left') {
 ctx.fillStyle = color;
 ctx.font = `${weight} ${size}px "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif`;
 ctx.textAlign = align;
 ctx.textBaseline = 'middle';
 ctx.fillText(s, x, y);
}

// One ingredient drawn at (cx, cy) with radius-ish size s.
export function drawIngredient(ctx, id, cx, cy, s) {
 const ing = INGREDIENT_BY_ID[id];
 if (!ing) return;
 ctx.save();
 ctx.translate(cx, cy);
 ctx.lineWidth = Math.max(2, s * 0.08);
 ctx.strokeStyle = ing.accent;
 ctx.fillStyle = ing.color;
 if (id === 'bun') {
  ctx.beginPath();
  ctx.arc(0, s * 0.15, s, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f7cf8a';
  for (const [dx, dy] of [[-0.4, -0.35], [0, -0.55], [0.4, -0.35]]) {
   ctx.beginPath();
   ctx.ellipse(dx * s, dy * s, s * 0.09, s * 0.05, 0, 0, Math.PI * 2);
   ctx.fill();
  }
  rr(ctx, -s, s * 0.15, s * 2, s * 0.35, s * 0.12);
  ctx.fillStyle = '#d98f3d';
  ctx.fill();
  ctx.stroke();
 } else if (id === 'patty') {
  rr(ctx, -s, -s * 0.4, s * 2, s * 0.8, s * 0.4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (const [dx, dy] of [[-0.5, 0], [0.1, -0.15], [0.55, 0.1]]) {
   ctx.beginPath();
   ctx.arc(dx * s, dy * s, s * 0.08, 0, Math.PI * 2);
   ctx.fill();
  }
 } else if (id === 'cheese') {
  ctx.beginPath();
  ctx.moveTo(-s, s * 0.5);
  ctx.lineTo(s, s * 0.5);
  ctx.lineTo(0, -s * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ing.accent;
  for (const [dx, dy] of [[-0.3, 0.15], [0.25, 0.25]]) {
   ctx.beginPath();
   ctx.arc(dx * s, dy * s, s * 0.1, 0, Math.PI * 2);
   ctx.fill();
  }
 } else if (id === 'lettuce') {
  ctx.beginPath();
  for (let i = 0; i <= 8; i++) {
   const a = (i / 8) * Math.PI * 2;
   const r = s * (i % 2 === 0 ? 1 : 0.72);
   const px = Math.cos(a) * r;
   const py = Math.sin(a) * r * 0.8;
   if (i === 0) ctx.moveTo(px, py);
   else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#3d7d44';
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, 0);
  ctx.lineTo(s * 0.6, 0);
  ctx.stroke();
 } else if (id === 'tomato') {
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f4846a';
  ctx.beginPath();
  ctx.arc(-s * 0.25, -s * 0.2, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ing.accent;
  ctx.beginPath();
  ctx.arc(0, -s * 0.75, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
 } else if (id === 'sauce') {
  ctx.beginPath();
  ctx.moveTo(-s, -s * 0.4);
  ctx.bezierCurveTo(-s * 0.5, s * 0.6, 0, -s * 0.6, s * 0.5, s * 0.4);
  ctx.bezierCurveTo(s * 0.2, s * 0.7, -s * 0.3, s * 0.5, -s, s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.1, s * 0.55, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
 }
 ctx.restore();
}

function drawPlate(ctx, x, y, w, items, label) {
 // White plate ellipse with the stacked dish on top.
 ctx.fillStyle = 'rgba(0,0,0,0.15)';
 ctx.beginPath();
 ctx.ellipse(x + w / 2, y + 78, w * 0.48, 12, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.fillStyle = PALETTE.plate;
 ctx.strokeStyle = '#cbb89a';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.ellipse(x + w / 2, y + 70, w * 0.46, 16, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 const cx = x + w / 2;
 let stackY = y + 66;
 const layerH = 13;
 for (let i = items.length - 1; i >= 0; i--) {
  stackY -= layerH;
  const id = items[i];
  if (id === 'bun' && i === items.length - 1) {
   ctx.fillStyle = INGREDIENT_BY_ID.bun.color;
   ctx.beginPath();
   ctx.arc(cx, stackY + 6, 52, Math.PI, 0);
   ctx.closePath();
   ctx.fill();
  } else {
   ctx.fillStyle = INGREDIENT_BY_ID[id].color;
   rr(ctx, cx - 52, stackY, 104, layerH, 6);
   ctx.fill();
  }
 }
 if (items.length === 0) {
  text(ctx, '空盘子 · 点食材开始组装', cx, y + 30, 15, PALETTE.muted, 'normal', 'center');
 }
 if (label) text(ctx, label, cx, y + 108, 15, PALETTE.ink, 'bold', 'center');
}

function drawTicket(ctx, order, x, y, w, h, selected, now) {
 const left = Math.max(0, order.expiresAt - now);
 const frac = left / TIMING.orderLifetime;
 ctx.save();
 if (selected) {
  ctx.shadowColor = 'rgba(255,170,0,0.7)';
  ctx.shadowBlur = 14;
 }
 ctx.fillStyle = PALETTE.board;
 ctx.strokeStyle = selected ? '#e8a020' : PALETTE.boardEdge;
 ctx.lineWidth = selected ? 3 : 2;
 rr(ctx, x, y, w, h, 10);
 ctx.fill();
 ctx.stroke();
 ctx.restore();
 text(ctx, `#${order.id} ${order.recipe.name}`, x + 12, y + 20, 17, PALETTE.ink);
 text(ctx, order.recipe.en, x + 12, y + 42, 12, PALETTE.muted, 'normal');
 text(ctx, `${order.recipe.pay} 金币`, x + w - 12, y + 20, 15, '#b8860b', 'bold', 'right');
 let ix = x + 16;
 for (const id of order.recipe.items) {
  drawIngredient(ctx, id, ix + 16, y + 74, 15);
  ix += 38;
 }
 // Per-order countdown bar.
 ctx.fillStyle = '#e8dcc8';
 rr(ctx, x + 12, y + h - 20, w - 24, 9, 4);
 ctx.fill();
 ctx.fillStyle = frac > 0.5 ? '#4d9b57' : frac > 0.25 ? '#e8a020' : '#c62828';
 rr(ctx, x + 12, y + h - 20, (w - 24) * frac, 9, 4);
 ctx.fill();
 text(ctx, `${Math.ceil(left)}s`, x + w - 12, y + h - 32, 12, frac > 0.25 ? PALETTE.muted : '#c62828', 'bold', 'right');
}

export function drawGame(ctx, state) {
 const { w, h } = VIEW;
 // Wall + floor.
 ctx.fillStyle = PALETTE.wall;
 ctx.fillRect(0, 0, w, h);
 ctx.fillStyle = PALETTE.wallTrim;
 ctx.fillRect(0, 64, w, 10);
 ctx.fillStyle = PALETTE.floor;
 ctx.fillRect(0, 640, w, h - 640);
 ctx.fillStyle = PALETTE.floorDark;
 for (let x = 0; x < w; x += 80) ctx.fillRect(x, 700, 40, h - 700);
 // Window with a street view, for kitchen warmth.
 ctx.fillStyle = '#bfe3f0';
 rr(ctx, 1060, 92, 190, 120, 8);
 ctx.fill();
 ctx.strokeStyle = '#7a4a21';
 ctx.lineWidth = 4;
 ctx.stroke();
 ctx.fillStyle = '#f7c948';
 ctx.beginPath();
 ctx.arc(1130, 140, 22, 0, Math.PI * 2);
 ctx.fill();
 ctx.fillStyle = '#7dc383';
 ctx.beginPath();
 ctx.moveTo(1060, 212);
 ctx.lineTo(1120, 160);
 ctx.lineTo(1180, 212);
 ctx.closePath();
 ctx.fill();
 text(ctx, '深夜食堂', 1155, 232, 13, PALETTE.muted, 'normal', 'center');

 // Header bar.
 ctx.fillStyle = '#3a2413';
 ctx.fillRect(0, 0, w, 64);
 text(ctx, ' SIZZLE & SERVE · 深夜食堂', 20, 33, 24, '#ffe9b8');
 const mins = Math.floor(state.timeLeft / 60);
 const secs = Math.floor(state.timeLeft % 60);
 const urgent = state.timeLeft <= 30 && state.phase === 'playing';
 text(ctx, `时间 ${mins}:${String(secs).padStart(2, '0')}`, 640, 33, 30, urgent ? '#ff8a80' : '#ffffff', 'bold', 'center');
 text(ctx, ` ${state.coins} 金币`, 980, 33, 22, '#f7c948', 'bold', 'center');
 text(ctx, `已上 ${state.served} 单`, 1100, 33, 18, '#ffffff', 'normal', 'center');
 text(ctx, `失误 ${state.strikes}/${TIMING.maxStrikes}`, 1210, 33, 18, state.strikes ? '#ff8a80' : '#cfd8dc', 'normal', 'right');
 if (state.combo > 1) text(ctx, `连击 x${state.combo}`, 830, 33, 18, '#ffb74d', 'bold', 'center');

 // Order board.
 text(ctx, ' 订单板 ORDER BOARD', 24, 100, 19, PALETTE.ink);
 text(ctx, '点一张单子选中它，再组装上菜', 24, 124, 13, PALETTE.muted, 'normal');
 const ticketW = 300;
 const ticketH = 108;
 for (let i = 0; i < TIMING.maxOrders; i++) {
  const y = 138 + i * (ticketH + 12);
  const order = state.orders[i];
  if (order) drawTicket(ctx, order, 20, y, ticketW, ticketH, i === state.selected, state.time);
  else {
   ctx.fillStyle = 'rgba(255,255,255,0.45)';
   ctx.strokeStyle = '#cbb89a';
   ctx.setLineDash([6, 6]);
   rr(ctx, 20, y, ticketW, ticketH, 10);
   ctx.fill();
   ctx.stroke();
   ctx.setLineDash([]);
   text(ctx, '等新单…', 170, y + ticketH / 2, 15, PALETTE.muted, 'normal', 'center');
  }
 }

 // Stove + grill decoration under the board.
 ctx.fillStyle = '#5d4037';
 rr(ctx, 20, 500, 300, 126, 10);
 ctx.fill();
 ctx.fillStyle = '#3e2723';
 for (const bx of [70, 170, 270]) {
  ctx.beginPath();
  ctx.arc(bx, 545, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.arc(bx, 545, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
 }
 text(ctx, ' 灶台 · 火候正好', 170, 606, 14, '#ffe9b8', 'normal', 'center');

 // Pass shelf (top right): a finished dish waiting to be picked up.
 text(ctx, ' 出菜口 PASS', 700, 100, 19, PALETTE.ink);
 ctx.fillStyle = PALETTE.pass;
 rr(ctx, 690, 112, 340, 150, 10);
 ctx.fill();
 ctx.strokeStyle = '#9db08a';
 ctx.lineWidth = 2;
 ctx.stroke();
 if (state.readyPlate) {
  drawPlate(ctx, 700, 128, 320, state.readyPlate.items, ` ${state.lastServedName} · 已上菜！`);
 } else {
  text(ctx, '上菜后成品会摆在这里', 860, 190, 15, PALETTE.muted, 'normal', 'center');
 }

 // Assembly area: the plate being built right now.
 text(ctx, ' 组装台 · 正在做的菜', 700, 300, 19, PALETTE.ink);
 ctx.fillStyle = 'rgba(255,255,255,0.55)';
 rr(ctx, 690, 312, 340, 190, 10);
 ctx.fill();
 drawPlate(ctx, 700, 330, 320, state.plate, state.plate.length ? `已放 ${state.plate.length} 层` : '');
 const sel = state.orders[state.selected];
 if (sel) {
  text(ctx, `目标：${sel.recipe.name}（${sel.recipe.items.length} 层）`, 860, 486, 14, PALETTE.ink, 'normal', 'center');
 }

 // Serve / trash buttons.
 ctx.fillStyle = '#2e7d32';
 rr(ctx, 1050, 330, 210, 64, 12);
 ctx.fill();
 text(ctx, '上菜 SERVE ⏎', 1155, 362, 22, '#ffffff', 'bold', 'center');
 ctx.fillStyle = '#8d6e63';
 rr(ctx, 1050, 406, 210, 64, 12);
 ctx.fill();
 text(ctx, '倒掉 TRASH', 1155, 438, 22, '#ffffff', 'bold', 'center');
 text(ctx, '键盘 1-6 取食材 · 空格上菜', 1155, 500, 14, PALETTE.muted, 'normal', 'center');
 text(ctx, '鼠标点食材 / 点单子 / 点按钮', 1155, 524, 14, PALETTE.muted, 'normal', 'center');

 // Counter with ingredient bins.
 ctx.fillStyle = PALETTE.counter;
 ctx.fillRect(0, 640, w, 160);
 ctx.fillStyle = PALETTE.counterTop;
 ctx.fillRect(0, 640, w, 18);
 text(ctx, ' 台面食材 · 点一下放进盘子', 20, 676, 16, '#ffe9b8');
 const binW = 196;
 INGREDIENTS.forEach((ing, i) => {
  const x = 20 + i * (binW + 10);
  const y = 690;
  ctx.fillStyle = '#fff8e7';
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 2;
  rr(ctx, x, y, binW, 92, 10);
  ctx.fill();
  ctx.stroke();
  drawIngredient(ctx, ing.id, x + 34, y + 46, 24);
  text(ctx, ing.label, x + 68, y + 34, 17, PALETTE.ink);
  text(ctx, `[${ing.key}]`, x + 68, y + 62, 14, PALETTE.muted, 'normal');
 });

 // Message toast.
 if (state.message && state.time - state.messageAt < 4) {
  ctx.fillStyle = 'rgba(58,36,19,0.88)';
  const msg = state.message;
  ctx.font = 'bold 16px "Noto Sans CJK SC", sans-serif';
  const mw = ctx.measureText(msg).width + 36;
  rr(ctx, (w - mw) / 2, 560, mw, 36, 18);
  ctx.fill();
  text(ctx, msg, w / 2, 579, 16, '#ffe9b8', 'bold', 'center');
 }

 // Flash on serve / expiry.
 if (state.flash && state.time - state.flash.at < 0.5) {
  ctx.fillStyle = state.flash.kind === 'good' ? 'rgba(46,125,50,0.18)' : 'rgba(198,40,40,0.18)';
  ctx.fillRect(0, 0, w, h);
 }
}

export function drawTitle(ctx, state) {
 drawGame(ctx, state);
 ctx.fillStyle = 'rgba(30,18,8,0.55)';
 ctx.fillRect(0, 0, VIEW.w, VIEW.h);
 ctx.fillStyle = '#fff8e7';
 rr(ctx, 340, 190, 600, 380, 18);
 ctx.fill();
 ctx.strokeStyle = '#e8a020';
 ctx.lineWidth = 3;
 ctx.stroke();
 text(ctx, ' SIZZLE & SERVE', 640, 250, 44, PALETTE.ink, 'bold', 'center');
 text(ctx, '深夜食堂 · 烹饪小馆', 640, 300, 26, '#b8860b', 'bold', 'center');
 text(ctx, '客人点单 → 台面取食材 → 组装上菜', 640, 352, 18, PALETTE.ink, 'normal', 'center');
 text(ctx, '在计时器走完前多赚金币，别让订单超时！', 640, 382, 18, PALETTE.ink, 'normal', 'center');
 text(ctx, '鼠标点食材 / 键盘 1-6 取食材 · 空格上菜', 640, 414, 16, PALETTE.muted, 'normal', 'center');
 ctx.fillStyle = '#2e7d32';
 rr(ctx, 490, 450, 300, 64, 12);
 ctx.fill();
 text(ctx, '开始营业', 640, 482, 24, '#ffffff', 'bold', 'center');
 text(ctx, '点这里或按 Enter 开始', 640, 540, 14, PALETTE.muted, 'normal', 'center');
}

export function drawOver(ctx, state) {
 drawGame(ctx, state);
 ctx.fillStyle = 'rgba(30,18,8,0.55)';
 ctx.fillRect(0, 0, VIEW.w, VIEW.h);
 ctx.fillStyle = '#fff8e7';
 rr(ctx, 380, 200, 520, 360, 18);
 ctx.fill();
 ctx.strokeStyle = '#e8a020';
 ctx.lineWidth = 3;
 ctx.stroke();
 text(ctx, ' 打烊啦', 640, 258, 40, PALETTE.ink, 'bold', 'center');
 text(ctx, state.message, 640, 306, 18, PALETTE.muted, 'normal', 'center');
 text(ctx, ` 金币 ${state.coins}`, 640, 362, 26, '#b8860b', 'bold', 'center');
 text(ctx, `已上 ${state.served} 单 · 最佳连击 x${state.bestCombo}`, 640, 402, 18, PALETTE.ink, 'normal', 'center');
 const verdict = state.coins >= 120 ? '金牌主厨！今晚的食堂属于你。' : state.coins >= 60 ? '熟练帮厨，再练练就能当主厨。' : '学徒第一天，别灰心，明天再来。';
 text(ctx, verdict, 640, 436, 18, PALETTE.ink, 'normal', 'center');
 ctx.fillStyle = '#2e7d32';
 rr(ctx, 490, 470, 300, 60, 12);
 ctx.fill();
 text(ctx, '再来一局 (R)', 640, 500, 22, '#ffffff', 'bold', 'center');
}
