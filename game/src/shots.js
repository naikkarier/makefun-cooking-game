// Screenshot scenes behind ?shot=start|play|serve|end. Each one plays the real
// rules forward from a fresh world, steered by a greedy autopilot that reads the
// kitchen and does the sensible thing next, so the frame is what a short game
// really looks like and the same seed always gives the same frame.
import { INGREDIENTS, RECIPES, RECIPE_IDS, SHIFT_SECONDS, STATIONS, STEP, stationById } from './config.js';
import { EVENT_OVER, EVENT_SERVED, plateAccepts, recipeForPlate } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 6;
const PLAY_SECONDS = 26;
const SERVE_LIMIT_SECONDS = 120;
const END_SHIFT_LEFT = 25;
const SAMPLE = STEP;

function ready(item) {
  return item.stage >= INGREDIENTS[item.id].prep.length;
}

function nextPrep(item) {
  return INGREDIENTS[item.id].prep[item.stage] ?? null;
}

// What the kitchen already holds for a dish: ready items on plates and in the
// tray, plus items still being prepped. Returns the first ingredient id the
// dish still needs from a bin, or null when it is covered.
function missingIngredient(state, dish) {
  const needs = { ...RECIPES[dish].needs };
  const have = {};
  const count = (id) => { have[id] = (have[id] ?? 0) + 1; };
  for (const item of state.chef.tray) count(item.id);
  for (const plate of state.plates) for (const item of plate.items) count(item.id);
  for (const key of ['board', 'wok']) {
    const slot = state.prep[key];
    if (slot.item) count(slot.item.id);
  }
  for (const id of Object.keys(needs)) {
    if ((have[id] ?? 0) < needs[id]) return id;
  }
  return null;
}

function plateNeedsItem(state, plateIndex) {
  const plate = state.plates[plateIndex];
  if (plate.items.length === 0) return false;
  if (recipeForPlate(plate.items)) return false;
  return state.chef.tray.some((item) => ready(item) && plateAccepts(plate.items, item.id));
}

// The sensible next station, or null when the chef should wait.
function autopilotGoal(state) {
  const chef = state.chef;
  if (chef.plate) {
    if (state.orders.some((order) => order.dish === chef.plate.dish)) return 'window';
    return 'trash';
  }
  for (let i = 0; i < state.plates.length; i += 1) {
    if (recipeForPlate(state.plates[i].items) && chef.tray.length === 0) return 'plate-' + i;
  }
  for (const key of ['board', 'wok']) {
    const slot = state.prep[key];
    if (slot.item && slot.done && chef.tray.length < 3) return key === 'board' ? 'board' : 'wok';
  }
  for (let i = 0; i < state.plates.length; i += 1) {
    if (plateNeedsItem(state, i)) return 'plate-' + i;
  }
  // Start a plate: a ready ingredient in the tray that a pending order needs.
  for (let i = 0; i < state.plates.length; i += 1) {
    if (state.plates[i].items.length !== 0) continue;
    const starts = state.chef.tray.some((item) => ready(item) && state.orders.some((order) => {
      const needs = RECIPES[order.dish].needs;
      return (needs[item.id] ?? 0) > 0;
    }));
    if (starts) return 'plate-' + i;
  }
  for (const item of chef.tray) {
    if (nextPrep(item) === 'chop' && !state.prep.board.item) return 'board';
    if (nextPrep(item) === 'cook' && !state.prep.wok.item) return 'wok';
  }
  for (const order of state.orders) {
    const missing = missingIngredient(state, order.dish);
    if (missing) return 'bin-' + missing;
  }
  return null;
}

// One autopilot decision: a click on the goal station when the chef is idle,
// nothing while it is still walking there.
function autopilotIntent(world) {
  const state = world.state;
  const chef = state.chef;
  if (chef.tx !== null || chef.ty !== null || state.pendingStation) return { dir: null, click: null, interact: false };
  const goal = autopilotGoal(state);
  if (!goal) return { dir: null, click: null, interact: false };
  const station = stationById(goal);
  if (!station) return { dir: null, click: null, interact: false };
  return { dir: null, click: { x: station.cx, y: station.cy }, interact: false };
}

function runAutopilot(world, seconds, stopOnServe) {
  let served = false;
  const steps = Math.floor(seconds / SAMPLE);
  for (let i = 0; i < steps; i += 1) {
    const events = world.step(SAMPLE, autopilotIntent(world), false);
    if (events & EVENT_SERVED) served = true;
    if (stopOnServe && served) {
      for (let j = 0; j < 30; j += 1) world.step(SAMPLE, { dir: null, click: null, interact: false }, false);
      return { served: true, over: false };
    }
    if (events & EVENT_OVER) return { served, over: true };
  }
  return { served, over: world.state.over };
}

/**
 * Set `world` to the named scene (start, play, serve or end; any other name is
 * start) and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    for (let i = 0; i < START_SECONDS / STEP; i += 1) world.step(STEP, null, true);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'end') {
    world.state.elapsed = SHIFT_SECONDS - END_SHIFT_LEFT;
    const result = runAutopilot(world, END_SHIFT_LEFT + 10, false);
    return { screen: result.over ? SCREEN_OVER : SCREEN_PLAY, best: 0 };
  }
  if (name === 'serve') {
    const result = runAutopilot(world, SERVE_LIMIT_SECONDS, true);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  runAutopilot(world, PLAY_SECONDS, false);
  return { screen: SCREEN_PLAY, best: 0 };
}
