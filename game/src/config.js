// Dapur Kilat: all the tuning in one place. Change a number here and the whole
// kitchen follows: timings, prices, station layout, recipes, difficulty ramp.
export const VIEW = { width: 960, height: 640 };
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 150;
export const HEARTS = 3;
export const TRAY_MAX = 3;
export const CHOP_SECONDS = 1.6;
export const COOK_SECONDS = 2.2;
export const CHEF_SPEED = 270;
export const CHEF_RADIUS = 18;
export const INTERACT_RANGE = 64;
export const ORDER_MAX = 3;
export const ORDER_FIRST_DELAY = 3;
export const SPAWN_START = 13;
export const SPAWN_END = 8;
export const PATIENCE_START = 55;
export const PATIENCE_END = 38;
export const BEST_KEY = 'dapurkilat.best';

// Walkable floor: the aisle between the top ingredient bins and the bottom counters.
export const FLOOR = { x: 20, y: 150, width: 920, height: 395 };

// An ingredient's prep is the list of stations it must visit, in order.
// stage counts how many of those steps are done; stage === prep.length means ready.
export const INGREDIENTS = {
  nasi: { name: 'Nasi', color: '#f7f3e3', edge: '#d9cfa8', prep: ['cook'], icon: 'rice' },
  mie: { name: 'Mie', color: '#f2c14e', edge: '#c98f1b', prep: ['cook'], icon: 'noodle' },
  ayam: { name: 'Ayam', color: '#d97b4f', edge: '#a8542c', prep: ['chop', 'cook'], icon: 'chicken' },
  telur: { name: 'Telur', color: '#ffd93b', edge: '#d9a400', prep: ['cook'], icon: 'egg' },
  sayur: { name: 'Sayur', color: '#6abe30', edge: '#4a8c1d', prep: ['chop'], icon: 'veggie' },
  kecap: { name: 'Kecap', color: '#5b3a29', edge: '#3a2418', prep: [], icon: 'sauce' },
};

export const INGREDIENT_IDS = Object.keys(INGREDIENTS);

// A dish is a set of ready ingredients. needs maps ingredient id to count.
export const RECIPES = {
  nasigoreng: { name: 'Nasi Goreng', needs: { nasi: 1, telur: 1, kecap: 1 }, price: 100, color: '#e76f51' },
  miegoreng: { name: 'Mie Goreng', needs: { mie: 1, ayam: 1, sayur: 1 }, price: 120, color: '#f4a261' },
  sateayam: { name: 'Sate Ayam', needs: { ayam: 1, kecap: 1 }, price: 90, color: '#e9c46a' },
  tumissayur: { name: 'Tumis Sayur', needs: { sayur: 1, telur: 1 }, price: 80, color: '#2a9d8f' },
};

export const RECIPE_IDS = Object.keys(RECIPES);

// Stations sit along the top and bottom edges; the chef stands at the approach
// point (ax, ay) inside the aisle to use one. kind is ingredient, chop, cook,
// plate, serve or trash. ingredient stations also name their ingredient id.
export const STATIONS = [
  { id: 'bin-nasi', kind: 'ingredient', ingredient: 'nasi', x: 40, y: 76, w: 140, h: 56, label: 'Nasi' },
  { id: 'bin-mie', kind: 'ingredient', ingredient: 'mie', x: 188, y: 76, w: 140, h: 56, label: 'Mie' },
  { id: 'bin-ayam', kind: 'ingredient', ingredient: 'ayam', x: 336, y: 76, w: 140, h: 56, label: 'Ayam' },
  { id: 'bin-telur', kind: 'ingredient', ingredient: 'telur', x: 484, y: 76, w: 140, h: 56, label: 'Telur' },
  { id: 'bin-sayur', kind: 'ingredient', ingredient: 'sayur', x: 632, y: 76, w: 140, h: 56, label: 'Sayur' },
  { id: 'bin-kecap', kind: 'ingredient', ingredient: 'kecap', x: 780, y: 76, w: 140, h: 56, label: 'Kecap' },
  { id: 'board', kind: 'chop', x: 16, y: 560, w: 150, h: 64, label: 'Talenan' },
  { id: 'wok', kind: 'cook', x: 174, y: 560, w: 150, h: 64, label: 'Wajan' },
  { id: 'plate-0', kind: 'plate', plate: 0, x: 332, y: 560, w: 120, h: 64, label: 'Piring 1' },
  { id: 'plate-1', kind: 'plate', plate: 1, x: 460, y: 560, w: 120, h: 64, label: 'Piring 2' },
  { id: 'window', kind: 'serve', x: 588, y: 560, w: 200, h: 64, label: 'Jendela Saji' },
  { id: 'trash', kind: 'trash', x: 796, y: 560, w: 148, h: 64, label: 'Sampah' },
];

for (const station of STATIONS) {
  station.cx = station.x + station.w / 2;
  station.cy = station.y + station.h / 2;
  // The spot the chef stands to use it: just inside the aisle.
  station.ax = station.cx;
  station.ay = station.y < 300 ? station.y + station.h + 36 : station.y - 36;
}

export function stationById(id) {
  return STATIONS.find((station) => station.id === id) ?? null;
}

// How far through the shift we are, 0 at the start and 1 at the end.
export function shiftProgress(elapsed) {
  return Math.min(1, Math.max(0, elapsed / SHIFT_SECONDS));
}

export function spawnInterval(elapsed) {
  return SPAWN_START + (SPAWN_END - SPAWN_START) * shiftProgress(elapsed);
}

export function orderPatience(elapsed) {
  return PATIENCE_START + (PATIENCE_END - PATIENCE_START) * shiftProgress(elapsed);
}

// Early orders favour the simpler two-ingredient dishes; later ones mix them all.
export function pickDish(random, elapsed) {
  const roll = random.next();
  const p = shiftProgress(elapsed);
  if (roll < 0.3 - 0.1 * p) return 'sateayam';
  if (roll < 0.55 - 0.05 * p) return 'tumissayur';
  if (roll < 0.8) return 'nasigoreng';
  return 'miegoreng';
}
