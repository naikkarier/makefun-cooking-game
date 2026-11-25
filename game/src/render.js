// Dapur Kilat drawing: every pixel is canvas shapes, no images, no fonts from
// the network. The kitchen, the food, the chef and the tickets are all drawn
// here, so the screenshots are honest renders of the game's own code.
import {
  BEST_KEY, FLOOR, HEARTS, INGREDIENTS, RECIPES, SHIFT_SECONDS, STATIONS, VIEW,
} from './config.js';
import { recipeForPlate } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const CREAM = '#fff8ec';
const INK = '#2b2d42';
const WOOD = '#8b5a2b';
const WOOD_DARK = '#6d4420';
const TERRA = '#c96f4a';
const TEAL = '#2a9d8f';
const GOLD = '#e9c46a';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

// One ingredient, drawn as a little badge: a coloured disc with the food on it.
export function drawIngredient(ctx, id, x, y, size) {
  const def = INGREDIENTS[id];
  const r = size / 2;
  circle(ctx, x, y, r);
  ctx.fillStyle = def.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = def.edge;
  ctx.stroke();
  ctx.save();
  ctx.translate(x, y);
  const s = size / 28;
  ctx.lineWidth = 2 * s;
  ctx.strokeStyle = def.edge;
  if (id === 'nasi') {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.arc(0, 2 * s, 7 * s, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d9cfa8';
    ctx.beginPath();
    ctx.moveTo(-4 * s, 0); ctx.lineTo(-2 * s, -3 * s);
    ctx.moveTo(1 * s, -1 * s); ctx.lineTo(3 * s, -4 * s);
    ctx.stroke();
  } else if (id === 'mie') {
    ctx.strokeStyle = '#c98f1b';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-8 * s, i * 4 * s);
      ctx.bezierCurveTo(-4 * s, i * 4 * s - 4 * s, 0, i * 4 * s + 4 * s, 4 * s, i * 4 * s);
      ctx.bezierCurveTo(6 * s, i * 4 * s - 2 * s, 7 * s, i * 4 * s + 2 * s, 8 * s, i * 4 * s);
      ctx.stroke();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = '#b45a30';
    circle(ctx, -1 * s, 1 * s, 6 * s);
    ctx.fill();
    ctx.strokeStyle = '#f7f3e3';
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(4 * s, -4 * s); ctx.lineTo(8 * s, -8 * s);
    ctx.stroke();
    circle(ctx, 8 * s, -9 * s, 2.5 * s);
    ctx.fillStyle = '#f7f3e3';
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 0, 0, 3.5 * s);
    ctx.fillStyle = '#ffb703';
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#4a8c1d';
    ctx.beginPath();
    ctx.ellipse(-3 * s, -2 * s, 5 * s, 3 * s, -0.5, 0, Math.PI * 2);
    ctx.ellipse(3 * s, -2 * s, 5 * s, 3 * s, 0.5, 0, Math.PI * 2);
    ctx.ellipse(0, 3 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2f5d10';
    ctx.beginPath();
    ctx.moveTo(0, 2 * s); ctx.lineTo(0, 9 * s);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#3a2418';
    roundRect(ctx, -4 * s, -7 * s, 8 * s, 14 * s, 2 * s);
    ctx.fill();
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(-4 * s, -9 * s, 8 * s, 3 * s);
    ctx.fillStyle = '#fff8ec';
    ctx.font = `bold ${7 * s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', 0, 1 * s);
  }
  ctx.restore();
}

// A finished dish on a plate: white plate, the food piled in the middle.
export function drawDish(ctx, dishId, x, y, size) {
  const recipe = RECIPES[dishId];
  const r = size / 2;
  circle(ctx, x, y, r);
  ctx.fillStyle = '#fffdf5';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#d9cfa8';
  ctx.stroke();
  circle(ctx, x, y, r * 0.62);
  ctx.fillStyle = recipe.color;
  ctx.fill();
  ctx.save();
  ctx.translate(x, y);
  const s = size / 28;
  if (dishId === 'nasigoreng') {
    ctx.fillStyle = '#f7f3e3';
    ctx.beginPath(); ctx.arc(0, 1 * s, 6 * s, Math.PI, 0); ctx.fill();
    circle(ctx, 2 * s, -2 * s, 3 * s); ctx.fillStyle = '#ffd93b'; ctx.fill();
  } else if (dishId === 'miegoreng') {
    ctx.strokeStyle = '#8a5a00';
    ctx.lineWidth = 2 * s;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-6 * s, i * 3 * s);
      ctx.bezierCurveTo(-2 * s, i * 3 * s - 3 * s, 2 * s, i * 3 * s + 3 * s, 6 * s, i * 3 * s);
      ctx.stroke();
    }
  } else if (dishId === 'sateayam') {
    ctx.strokeStyle = '#8a5a00';
    ctx.lineWidth = 1.5 * s;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath(); ctx.moveTo(-7 * s, i * 4 * s); ctx.lineTo(7 * s, i * 4 * s); ctx.stroke();
      ctx.fillStyle = '#b45a30';
      ctx.fillRect(-3 * s, i * 4 * s - 2.5 * s, 5 * s, 5 * s);
    }
  } else {
    ctx.fillStyle = '#4a8c1d';
    ctx.beginPath();
    ctx.ellipse(-2 * s, -1 * s, 5 * s, 3 * s, -0.4, 0, Math.PI * 2);
    ctx.ellipse(3 * s, 1 * s, 5 * s, 3 * s, 0.4, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 1 * s, -3 * s, 2.5 * s); ctx.fillStyle = '#ffd93b'; ctx.fill();
  }
  ctx.restore();
}

function drawCheck(ctx, x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x - 1, y + 5);
  ctx.lineTo(x + 7, y - 5);
  ctx.stroke();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.bezierCurveTo(-8, -3, -4, -9, 0, -4);
  ctx.bezierCurveTo(4, -9, 8, -3, 0, 5);
  ctx.closePath();
  ctx.fillStyle = filled ? '#e76f51' : 'rgba(255,248,236,0.5)';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = filled ? '#b23a2a' : 'rgba(43,45,66,0.4)';
  ctx.stroke();
  ctx.restore();
}

function drawPlant(ctx, x, y) {
  ctx.fillStyle = '#4a8c1d';
  ctx.beginPath();
  ctx.ellipse(x - 8, y - 18, 7, 12, -0.4, 0, Math.PI * 2);
  ctx.ellipse(x + 8, y - 18, 7, 12, 0.4, 0, Math.PI * 2);
  ctx.ellipse(x, y - 24, 7, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c96f4a';
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 8);
  ctx.lineTo(x + 12, y - 8);
  ctx.lineTo(x + 8, y + 8);
  ctx.lineTo(x - 8, y + 8);
  ctx.closePath();
  ctx.fill();
}

function drawProgressRing(ctx, x, y, r, progress, color) {
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(43,45,66,0.18)';
  circle(ctx, x, y, r);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();
}

function drawStation(ctx, station, state) {
  const { x, y, w, h } = station;
  ctx.fillStyle = WOOD_DARK;
  roundRect(ctx, x, y + 4, w, h, 10);
  ctx.fill();
  ctx.fillStyle = station.kind === 'serve' ? TEAL : WOOD;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  roundRect(ctx, x + 4, y + 4, w - 8, 10, 5);
  ctx.fill();

  if (station.kind === 'ingredient') {
    drawIngredient(ctx, station.ingredient, station.cx, station.cy - 6, 30);
  } else if (station.kind === 'chop') {
    const slot = state.prep.board;
    ctx.fillStyle = '#e8d5a8';
    roundRect(ctx, station.cx - 34, station.cy - 16, 68, 32, 6);
    ctx.fill();
    ctx.strokeStyle = '#9a7b4f';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (slot.item) {
      drawIngredient(ctx, slot.item.id, station.cx, station.cy - 2, 26);
      if (!slot.done) drawProgressRing(ctx, station.cx, station.cy - 2, 20, slot.progress, '#e76f51');
      else drawCheck(ctx, station.cx + 22, station.cy - 14, '#2a9d8f');
    } else {
      ctx.strokeStyle = '#5b4636';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(station.cx - 18, station.cy + 2); ctx.lineTo(station.cx + 14, station.cy - 6); ctx.stroke();
      ctx.fillStyle = '#5b4636';
      ctx.fillRect(station.cx + 12, station.cy - 10, 12, 4);
    }
  } else if (station.kind === 'cook') {
    const slot = state.prep.wok;
    ctx.fillStyle = '#3a3a3a';
    circle(ctx, station.cx, station.cy - 4, 26);
    ctx.fill();
    ctx.fillStyle = '#222';
    circle(ctx, station.cx, station.cy - 4, 20);
    ctx.fill();
    if (slot.item) {
      drawIngredient(ctx, slot.item.id, station.cx, station.cy - 4, 26);
      if (!slot.done) drawProgressRing(ctx, station.cx, station.cy - 4, 26, slot.progress, '#f4a261');
      else drawCheck(ctx, station.cx + 24, station.cy - 16, '#2a9d8f');
    }
    ctx.fillStyle = slot.item && !slot.done ? '#ff9f1c' : '#c96f4a';
    ctx.beginPath();
    ctx.moveTo(station.cx - 16, station.cy + 22);
    ctx.quadraticCurveTo(station.cx - 6, station.cy + 8, station.cx, station.cy + 20);
    ctx.quadraticCurveTo(station.cx + 6, station.cy + 8, station.cx + 16, station.cy + 22);
    ctx.closePath();
    ctx.fill();
  } else if (station.kind === 'plate') {
    const plate = state.plates[station.plate];
    circle(ctx, station.cx, station.cy - 4, 24);
    ctx.fillStyle = '#fffdf5';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d9cfa8';
    ctx.stroke();
    plate.items.forEach((item, i) => {
      const angle = (i / Math.max(1, plate.items.length)) * Math.PI * 2 - Math.PI / 2;
      drawIngredient(ctx, item.id, station.cx + Math.cos(angle) * 9, station.cy - 4 + Math.sin(angle) * 9, 18);
    });
    const dish = recipeForPlate(plate.items);
    if (dish) {
      ctx.strokeStyle = '#2a9d8f';
      ctx.lineWidth = 3;
      circle(ctx, station.cx, station.cy - 4, 28);
      ctx.stroke();
      ctx.fillStyle = '#2a9d8f';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(RECIPES[dish].name, station.cx, station.cy + 26);
    }
  } else if (station.kind === 'serve') {
    ctx.fillStyle = '#fff8ec';
    roundRect(ctx, station.cx - 62, station.cy - 18, 124, 30, 6);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SAJIKAN DI SINI', station.cx, station.cy - 2);
    const ready = state.chef.plate && state.orders.some((o) => o.dish === state.chef.plate.dish);
    if (ready) {
      ctx.strokeStyle = '#ffd93b';
      ctx.lineWidth = 4;
      roundRect(ctx, x - 3, y - 3, w + 6, h + 6, 12);
      ctx.stroke();
    }
  } else if (station.kind === 'trash') {
    ctx.fillStyle = '#5b6b7a';
    roundRect(ctx, station.cx - 16, station.cy - 14, 32, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#42505e';
    ctx.fillRect(station.cx - 18, station.cy - 18, 36, 6);
  }

  ctx.fillStyle = '#fff8ec';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(station.label, station.cx, station.y + station.h - 6);
}

function drawTicket(ctx, order, x, y, w, h, now) {
  const recipe = RECIPES[order.dish];
  const urgent = order.patience < 12;
  const shake = urgent ? Math.sin(now * 24) * 1.5 : 0;
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = 'rgba(43,45,66,0.25)';
  roundRect(ctx, x + 2, y + 3, w, h, 8);
  ctx.fill();
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.fillStyle = recipe.color;
  roundRect(ctx, x, y, 8, h, 8);
  ctx.fill();
  drawDish(ctx, order.dish, x + 28, y + h / 2 - 4, 34);
  ctx.fillStyle = INK;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(recipe.name, x + 50, y + 16);
  const needIds = Object.keys(recipe.needs);
  needIds.forEach((id, i) => {
    drawIngredient(ctx, id, x + 58 + i * 24, y + 36, 18);
  });
  const frac = Math.max(0, order.patience / order.max);
  ctx.fillStyle = 'rgba(43,45,66,0.15)';
  roundRect(ctx, x + 10, y + h - 10, w - 20, 5, 2);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? TEAL : frac > 0.25 ? '#f4a261' : '#e76f51';
  roundRect(ctx, x + 10, y + h - 10, (w - 20) * frac, 5, 2);
  ctx.fill();
  ctx.fillStyle = urgent ? '#e76f51' : INK;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(Math.ceil(order.patience) + 's', x + w - 10, y + 16);
  ctx.restore();
}

function drawChef(ctx, chef, state) {
  const { x, y } = chef;
  ctx.fillStyle = 'rgba(43,45,66,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + 20, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Apron body.
  ctx.fillStyle = '#2a9d8f';
  roundRect(ctx, x - 14, y - 2, 28, 22, 9);
  ctx.fill();
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, x - 10, y + 2, 20, 16, 6);
  ctx.fill();
  // Head and hat.
  circle(ctx, x, y - 12, 12);
  ctx.fillStyle = '#f2c09a';
  ctx.fill();
  ctx.fillStyle = '#fffdf5';
  circle(ctx, x - 7, y - 22, 7);
  ctx.fill();
  circle(ctx, x + 7, y - 22, 7);
  ctx.fill();
  ctx.fillRect(x - 11, y - 24, 22, 8);
  // Face.
  ctx.fillStyle = INK;
  circle(ctx, x - 4 + chef.facing * 1.5, y - 12, 1.6);
  ctx.fill();
  circle(ctx, x + 4 + chef.facing * 1.5, y - 12, 1.6);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + chef.facing * 1.5, y - 8, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Tray: carried ingredients float above the hat.
  const items = chef.tray;
  items.forEach((item, i) => {
    const ix = x + (i - (items.length - 1) / 2) * 24;
    drawIngredient(ctx, item.id, ix, y - 40, 20);
    if (item.stage < INGREDIENTS[item.id].prep.length) {
      ctx.fillStyle = '#e76f51';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('•', ix, y - 26);
    }
  });
  // A carried plate rides above the tray.
  if (chef.plate) {
    drawDish(ctx, chef.plate.dish, x, y - 40, 34);
  }
}

function drawHud(ctx, state, best) {
  const mins = Math.floor(state.shiftLeft / 60);
  const secs = Math.ceil(state.shiftLeft % 60);
  const clock = mins + ':' + String(secs === 60 ? 0 : secs).padStart(2, '0');
  ctx.fillStyle = INK;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('Skor ' + state.score, VIEW.width - 16, 22);
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(clock, VIEW.width - 16, 48);
  // Shift bar.
  ctx.fillStyle = 'rgba(43,45,66,0.15)';
  roundRect(ctx, VIEW.width - 216, 58, 200, 6, 3);
  ctx.fill();
  ctx.fillStyle = state.shiftLeft < 30 ? '#e76f51' : TEAL;
  roundRect(ctx, VIEW.width - 216, 58, 200 * (state.shiftLeft / SHIFT_SECONDS), 6, 3);
  ctx.fill();
  // Hearts.
  for (let i = 0; i < HEARTS; i += 1) {
    drawHeart(ctx, VIEW.width - 206 + i * 24, 22, 16, i < state.hearts);
  }
  if (state.combo > 1 && state.comboTimer > 0) {
    ctx.fillStyle = '#e76f51';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Combo x' + state.combo, VIEW.width - 16, 78);
  }
  if (best > 0) {
    ctx.fillStyle = 'rgba(43,45,66,0.55)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Terbaik ' + best, VIEW.width - 16, 96);
  }
}

function drawOverlays(ctx, screen, state, best) {
  if (screen === SCREEN_TITLE) {
    ctx.fillStyle = 'rgba(43,45,66,0.68)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = CREAM;
    ctx.textAlign = 'center';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('DAPUR KILAT', VIEW.width / 2, 220);
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Warung Rush: masak cepat, sajikan tepat waktu!', VIEW.width / 2, 258);
    ctx.fillStyle = '#fffdf5';
    ctx.font = '16px sans-serif';
    ctx.fillText('Ambil bahan, potong dan masak di wajan, rakit di piring, sajikan sebelum pelanggan pergi.', VIEW.width / 2, 310);
    ctx.fillText('Gerak: WASD / panah / klik  •  Pakai stasiun: Spasi / E / klik stasiun  •  Jeda: P', VIEW.width / 2, 336);
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Tekan Spasi atau klik untuk mulai', VIEW.width / 2, 392);
    if (best > 0) {
      ctx.fillStyle = '#fffdf5';
      ctx.font = '16px sans-serif';
      ctx.fillText('Skor terbaik: ' + best, VIEW.width / 2, 424);
    }
  } else if (screen === SCREEN_PAUSED) {
    ctx.fillStyle = 'rgba(43,45,66,0.6)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = CREAM;
    ctx.textAlign = 'center';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('JEDA', VIEW.width / 2, 300);
    ctx.font = '18px sans-serif';
    ctx.fillText('Tekan P atau Spasi untuk lanjut', VIEW.width / 2, 340);
  } else if (screen === SCREEN_OVER) {
    ctx.fillStyle = 'rgba(43,45,66,0.75)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = CREAM;
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(state.overReason === 'hearts' ? 'WARUNG TUTUP!' : 'SHIFT SELESAI!', VIEW.width / 2, 200);
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = GOLD;
    ctx.fillText('Skor ' + state.score, VIEW.width / 2, 258);
    ctx.fillStyle = '#fffdf5';
    ctx.font = '18px sans-serif';
    ctx.fillText('Hidangan disajikan: ' + state.served + '   •   Combo terbaik: x' + Math.max(1, state.bestCombo) + '   •   Pelanggan pergi: ' + state.lost, VIEW.width / 2, 300);
    if (state.score >= best && state.score > 0) {
      ctx.fillStyle = GOLD;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Skor terbaik baru!', VIEW.width / 2, 332);
    }
    ctx.fillStyle = '#fffdf5';
    ctx.font = '18px sans-serif';
    ctx.fillText('Tekan Spasi untuk main lagi', VIEW.width / 2, 380);
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function draw(state, screen, best, now) {
    // Floor: warm checker tiles.
    ctx.fillStyle = '#f3e3c2';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    const tile = 40;
    ctx.fillStyle = '#eed9ac';
    for (let ty = 0; ty < VIEW.height / tile; ty += 1) {
      for (let tx = 0; tx < VIEW.width / tile; tx += 1) {
        if ((tx + ty) % 2 === 0) ctx.fillRect(tx * tile, ty * tile, tile, tile);
      }
    }
    // Wall strip behind the top bins.
    ctx.fillStyle = TERRA;
    ctx.fillRect(0, 0, VIEW.width, 70);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(0, 66, VIEW.width, 4);

    // Floor dressing: a round rug in the middle of the aisle and a potted
    // plant at each end, so the kitchen reads as a room, not an empty grid.
    ctx.fillStyle = 'rgba(201,111,74,0.35)';
    ctx.beginPath();
    ctx.ellipse(480, 350, 150, 84, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,111,74,0.55)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(480, 350, 132, 70, 0, 0, Math.PI * 2);
    ctx.stroke();
    drawPlant(ctx, 52, 500);
    drawPlant(ctx, 908, 500);

    // Order board: tickets on the left, HUD on the right.
    state.orders.forEach((order, i) => {
      drawTicket(ctx, order, 16 + i * 218, 8, 206, 56, now);
    });
    drawHud(ctx, state, best);

    for (const station of STATIONS) drawStation(ctx, station, state);

    // A faint ring shows the station the chef can use right now.
    drawChef(ctx, state.chef, state);

    // Particles and floating scores.
    for (const part of state.particles) {
      ctx.globalAlpha = Math.max(0, part.life / part.max);
      ctx.fillStyle = part.color;
      circle(ctx, part.x, part.y, part.size * (part.life / part.max));
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    for (const pop of state.popups) {
      ctx.globalAlpha = Math.max(0, pop.life / pop.max);
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(pop.text, pop.x, pop.y);
    }
    ctx.globalAlpha = 1;

    // Hint line at the bottom of the aisle.
    if (state.hintLife > 0 && state.hint) {
      ctx.globalAlpha = Math.min(1, state.hintLife);
      ctx.fillStyle = INK;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(state.hint, VIEW.width / 2, FLOOR.y + FLOOR.height - 8);
      ctx.globalAlpha = 1;
    }

    drawOverlays(ctx, screen, state, best);
  }

  return { draw, drawIngredient, drawDish };
}
