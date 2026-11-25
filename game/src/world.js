// Dapur Kilat rules: the chef, the orders, the stations, the plates, the score.
// The world is a pure simulation: step(dt, intent, attract) advances it one frame
// and returns an event bitmask the boot code turns into sounds and announcements.
import {
  BEST_KEY, CHOP_SECONDS, COOK_SECONDS, FLOOR, HEARTS, INGREDIENTS, INTERACT_RANGE,
  ORDER_FIRST_DELAY, ORDER_MAX, RECIPES, RECIPE_IDS, SHIFT_SECONDS, STATIONS, TRAY_MAX,
  orderPatience, pickDish, spawnInterval, stationById,
} from './config.js';

export const EVENT_PICKUP = 1;
export const EVENT_PLACE = 2;
export const EVENT_READY = 4;
export const EVENT_SERVED = 8;
export const EVENT_LOST = 16;
export const EVENT_OVER = 32;
export const EVENT_ERROR = 64;
export const EVENT_TRASH = 128;

// A plate matches a recipe when its ready ingredients are exactly the recipe's needs.
export function recipeForPlate(items) {
  const counts = {};
  for (const item of items) counts[item.id] = (counts[item.id] ?? 0) + 1;
  for (const id of RECIPE_IDS) {
    const needs = RECIPES[id].needs;
    const keys = Object.keys(needs);
    if (keys.length !== Object.keys(counts).length) continue;
    if (keys.every((key) => counts[key] === needs[key])) return id;
  }
  return null;
}

// Can this ready ingredient join the plate and still become some recipe?
export function plateAccepts(items, itemId) {
  const counts = {};
  for (const item of items) counts[item.id] = (counts[item.id] ?? 0) + 1;
  counts[itemId] = (counts[itemId] ?? 0) + 1;
  return RECIPE_IDS.some((id) => {
    const needs = RECIPES[id].needs;
    return Object.keys(counts).every((key) => counts[key] <= (needs[key] ?? 0));
  });
}

function ready(item) {
  return item.stage >= INGREDIENTS[item.id].prep.length;
}

function nextPrep(item) {
  return INGREDIENTS[item.id].prep[item.stage] ?? null;
}

export function createWorld(random) {
  const state = freshState();

  function freshState() {
    return {
      elapsed: 0,
      shiftLeft: SHIFT_SECONDS,
      score: 0,
      hearts: HEARTS,
      combo: 0,
      comboTimer: 0,
      bestCombo: 0,
      served: 0,
      lost: 0,
      orders: [],
      chef: { x: 480, y: 360, tx: null, ty: null, plate: null, tray: [], facing: 1 },
      prep: {
        board: { item: null, progress: 0, duration: 0, done: false },
        wok: { item: null, progress: 0, duration: 0, done: false },
      },
      plates: [{ items: [] }, { items: [] }],
      popups: [],
      particles: [],
      spawnTimer: ORDER_FIRST_DELAY,
      orderSeq: 0,
      pendingStation: null,
      hint: null,
      hintLife: 0,
      over: false,
      overReason: null,
      steamTimer: 0,
    };
  }

  function reset() {
    Object.assign(state, freshState());
  }

  function say(text) {
    state.hint = text;
    state.hintLife = 2.2;
  }

  function popup(x, y, text, color) {
    state.popups.push({ x, y, text, color, life: 1.3, max: 1.3 });
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = random.next() * Math.PI * 2;
      const speed = 40 + random.next() * 90;
      state.particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 40,
        life: 0.7 + random.next() * 0.4, max: 1.1, color, size: 3 + random.next() * 4,
      });
    }
  }

  function spawnOrder() {
    const dish = pickDish(random, state.elapsed);
    const patience = orderPatience(state.elapsed);
    state.orders.push({ id: state.orderSeq += 1, dish, patience, max: patience });
  }

  function nearestStation(point) {
    let best = null;
    let bestDist = Infinity;
    for (const station of STATIONS) {
      const dx = point.x - station.ax;
      const dy = point.y - station.ay;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = station;
      }
    }
    return bestDist <= INTERACT_RANGE + 40 ? best : null;
  }

  function stationAt(point) {
    for (const station of STATIONS) {
      if (point.x >= station.x - 6 && point.x <= station.x + station.w + 6
        && point.y >= station.y - 6 && point.y <= station.y + station.h + 6) return station;
    }
    return null;
  }

  function interact(station) {
    const chef = state.chef;
    let events = 0;
    if (station.kind === 'ingredient') {
      if (chef.plate) { say('Tangan penuh piring!'); return EVENT_ERROR; }
      if (chef.tray.length >= TRAY_MAX) { say('Nampan penuh!'); return EVENT_ERROR; }
      chef.tray.push({ id: station.ingredient, stage: 0 });
      return EVENT_PICKUP;
    }
    if (station.kind === 'chop' || station.kind === 'cook') {
      const slot = station.kind === 'chop' ? state.prep.board : state.prep.wok;
      const want = station.kind;
      if (slot.item && slot.done) {
        if (chef.plate) { say('Tangan penuh piring!'); return EVENT_ERROR; }
        if (chef.tray.length >= TRAY_MAX) { say('Nampan penuh!'); return EVENT_ERROR; }
        chef.tray.push(slot.item);
        slot.item = null;
        slot.done = false;
        slot.progress = 0;
        return EVENT_PICKUP;
      }
      if (slot.item) return 0;
      const index = chef.tray.findIndex((item) => nextPrep(item) === want);
      if (index === -1) {
        const stuck = chef.tray.find((item) => nextPrep(item));
        if (stuck) say(nextPrep(stuck) === 'chop' ? 'Potong dulu di talenan!' : 'Masak dulu di wajan!');
        else say('Tidak ada bahan untuk ' + station.label + '.');
        return EVENT_ERROR;
      }
      slot.item = chef.tray.splice(index, 1)[0];
      slot.progress = 0;
      slot.duration = want === 'chop' ? CHOP_SECONDS : COOK_SECONDS;
      slot.done = false;
      return EVENT_PLACE;
    }
    if (station.kind === 'plate') {
      const plate = state.plates[station.plate];
      if (chef.plate) { say('Sudah bawa piring!'); return EVENT_ERROR; }
      if (plate.items.length === 0) {
        const index = chef.tray.findIndex((item) => ready(item));
        if (index === -1) {
          if (chef.tray.length > 0) say('Masak dulu sampai matang!');
          else say('Ambil bahan dulu.');
          return EVENT_ERROR;
        }
        plate.items.push(chef.tray.splice(index, 1)[0]);
        return EVENT_PLACE;
      }
      const dish = recipeForPlate(plate.items);
      if (dish) {
        if (chef.tray.length > 0) { say('Kosongkan nampan dulu!'); return EVENT_ERROR; }
        chef.plate = { dish, items: plate.items };
        plate.items = [];
        return EVENT_PICKUP;
      }
      const index = chef.tray.findIndex((item) => ready(item) && plateAccepts(plate.items, item.id));
      if (index === -1) {
        if (chef.tray.length > 0) say('Tidak cocok dengan resep ini.');
        else say('Piring belum lengkap.');
        return EVENT_ERROR;
      }
      plate.items.push(chef.tray.splice(index, 1)[0]);
      return EVENT_PLACE;
    }
    if (station.kind === 'serve') {
      if (!chef.plate) {
        say(chef.tray.length > 0 ? 'Rakit piring lengkap dulu.' : 'Belum ada hidangan.');
        return EVENT_ERROR;
      }
      const dish = chef.plate.dish;
      const orderIndex = state.orders.findIndex((order) => order.dish === dish);
      if (orderIndex === -1) { say('Tidak ada pesanan ' + RECIPES[dish].name + '.'); return EVENT_ERROR; }
      const order = state.orders[orderIndex];
      state.orders.splice(orderIndex, 1);
      const tip = Math.round(RECIPES[dish].price * 0.5 * (order.patience / order.max));
      state.combo = state.comboTimer > 0 ? state.combo + 1 : 1;
      state.comboTimer = 6;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      const gained = Math.round((RECIPES[dish].price + tip) * (1 + 0.1 * (state.combo - 1)));
      state.score += gained;
      state.served += 1;
      popup(station.cx, station.y - 70, '+' + gained, '#2a9d8f');
      if (state.combo > 1) popup(station.cx, station.y - 94, 'Combo x' + state.combo, '#e76f51');
      burst(station.cx, station.y - 10, '#ffd93b', 14);
      chef.plate = null;
      return EVENT_SERVED;
    }
    if (station.kind === 'trash') {
      if (chef.plate) {
        chef.plate = null;
        say('Piring dibuang.');
        return EVENT_TRASH;
      }
      if (chef.tray.length > 0) {
        chef.tray.pop();
        say('Bahan dibuang.');
        return EVENT_TRASH;
      }
      say('Tidak ada yang dibuang.');
      return EVENT_ERROR;
    }
    return events;
  }

  function moveChef(dt, intent) {
    const chef = state.chef;
    let vx = 0;
    let vy = 0;
    if (intent && intent.dir) {
      vx = intent.dir.x;
      vy = intent.dir.y;
      chef.tx = null;
      chef.ty = null;
      state.pendingStation = null;
    } else if (chef.tx !== null && chef.ty !== null) {
      const dx = chef.tx - chef.x;
      const dy = chef.ty - chef.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) {
        chef.tx = null;
        chef.ty = null;
        if (state.pendingStation) {
          const station = state.pendingStation;
          state.pendingStation = null;
          return interact(station);
        }
      } else {
        vx = dx / dist;
        vy = dy / dist;
      }
    }
    if (vx !== 0 || vy !== 0) {
      chef.facing = vx < 0 ? -1 : vx > 0 ? 1 : chef.facing;
      chef.x += vx * 270 * dt;
      chef.y += vy * 270 * dt;
      chef.x = Math.min(FLOOR.x + FLOOR.width - 14, Math.max(FLOOR.x + 14, chef.x));
      chef.y = Math.min(FLOOR.y + FLOOR.height - 14, Math.max(FLOOR.y + 14, chef.y));
    }
    return 0;
  }

  function step(dt, intent, attract) {
    let events = 0;
    if (state.over) return 0;
    state.elapsed += dt;
    state.shiftLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);

    // Orders arrive, wait, and walk away when their patience runs out.
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0 && state.orders.length < ORDER_MAX) {
      spawnOrder();
      state.spawnTimer = spawnInterval(state.elapsed);
    }
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        if (attract) continue;
        state.lost += 1;
        state.hearts -= 1;
        state.combo = 0;
        state.comboTimer = 0;
        popup(480, 120, 'Pelanggan pergi!', '#e76f51');
        events |= EVENT_LOST;
        if (state.hearts <= 0) {
          state.over = true;
          state.overReason = 'hearts';
          events |= EVENT_OVER;
          return events;
        }
      }
    }

    if (state.shiftLeft <= 0) {
      state.over = true;
      state.overReason = 'shift';
      events |= EVENT_OVER;
      return events;
    }

    // Prep stations cook and chop while the chef does other things.
    for (const key of ['board', 'wok']) {
      const slot = state.prep[key];
      if (slot.item && !slot.done) {
        slot.progress += dt / slot.duration;
        if (slot.progress >= 1) {
          slot.progress = 1;
          slot.done = true;
          slot.item.stage += 1;
          events |= EVENT_READY;
        }
      }
    }

    // Steam over a busy wok.
    state.steamTimer -= dt;
    if (state.prep.wok.item && !state.prep.wok.done && state.steamTimer <= 0) {
      state.steamTimer = 0.12;
      const wok = stationById('wok');
      state.particles.push({
        x: wok.cx - 20 + random.next() * 40, y: wok.y + 8,
        vx: (random.next() - 0.5) * 10, vy: -34 - random.next() * 20,
        life: 0.9, max: 0.9, color: '#ffffff', size: 4 + random.next() * 3,
      });
    }

    if (state.comboTimer > 0) state.comboTimer -= dt;
    if (state.comboTimer <= 0) state.combo = 0;
    if (state.hintLife > 0) state.hintLife -= dt;

    for (let i = state.popups.length - 1; i >= 0; i -= 1) {
      const pop = state.popups[i];
      pop.life -= dt;
      pop.y -= 26 * dt;
      if (pop.life <= 0) state.popups.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const part = state.particles[i];
      part.life -= dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      part.vy -= 12 * dt;
      if (part.life <= 0) state.particles.splice(i, 1);
    }

    if (attract) return events;

    // Clicks: on a station it walks there and uses it; on the floor it just walks.
    if (intent && intent.click) {
      const station = stationAt(intent.click) ?? nearestStation(intent.click);
      if (station) {
        state.pendingStation = station;
        state.chef.tx = station.ax;
        state.chef.ty = station.ay;
      } else {
        state.pendingStation = null;
        state.chef.tx = Math.min(FLOOR.x + FLOOR.width - 14, Math.max(FLOOR.x + 14, intent.click.x));
        state.chef.ty = Math.min(FLOOR.y + FLOOR.height - 14, Math.max(FLOOR.y + 14, intent.click.y));
      }
    }
    events |= moveChef(dt, intent);
    if (intent && intent.interact) {
      const station = nearestStation({ x: state.chef.x, y: state.chef.y });
      if (station) events |= interact(station);
    }
    return events;
  }

  return { state, reset, step, interact, nearestStation, recipeForPlate };
}
