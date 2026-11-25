// Keyboard and mouse, read every frame. Keys move the chef; a click sets a
// walk target (or a station to walk to and use); Space or E uses the nearest
// station, Enter confirms, P pauses, M mutes.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_INTERACT = 4;
export const ACTION_MUTE = 8;

const MOVE_KEYS = {
  ArrowLeft: [-1, 0], KeyA: [-1, 0],
  ArrowRight: [1, 0], KeyD: [1, 0],
  ArrowUp: [0, -1], KeyW: [0, -1],
  ArrowDown: [0, 1], KeyS: [0, 1],
};

export function createInput(canvas) {
  const keys = new Set();
  let queued = 0;
  let click = null;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.code);
    if (event.code === 'Space' || event.code === 'Enter') {
      queued |= ACTION_CONFIRM | ACTION_INTERACT;
      event.preventDefault();
    } else if (event.code === 'KeyE') {
      queued |= ACTION_INTERACT;
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      queued |= ACTION_PAUSE;
    } else if (event.code === 'KeyM') {
      queued |= ACTION_MUTE;
    }
    if (MOVE_KEYS[event.code]) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('pointerdown', (event) => {
    click = toLogical(event);
    event.preventDefault();
  });

  // The movement direction this frame, from the keys held down.
  function direction() {
    let x = 0;
    let y = 0;
    for (const code of keys) {
      const move = MOVE_KEYS[code];
      if (!move) continue;
      x += move[0];
      y += move[1];
    }
    if (x === 0 && y === 0) return null;
    const length = Math.hypot(x, y);
    return { x: x / length, y: y / length };
  }

  function takeActions() {
    const actions = queued;
    queued = 0;
    return actions;
  }

  function takeClick() {
    const point = click;
    click = null;
    return point;
  }

  return { direction, takeActions, takeClick };
}
