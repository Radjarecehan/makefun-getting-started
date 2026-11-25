// Dapur Kilat — keyboard + mouse input with edge-triggered actions.
// Keys are held in a set; `wasPressed` answers only on the frame the key went down.

export function createInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let click = null;

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!e.repeat) pressed.add(e.code);
    keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    click = {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  });

  return {
    /** Normalised WASD / arrow movement vector. */
    axis() {
      let x = 0;
      let y = 0;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
      if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
      if (x !== 0 && y !== 0) {
        x *= Math.SQRT1_2;
        y *= Math.SQRT1_2;
      }
      return { x, y };
    },
    /** True when any of the codes went down since the last frame. */
    wasPressed(...codes) {
      return codes.some((c) => pressed.has(c));
    },
    /** The last mouse click in canvas pixels, or null; consumed on read. */
    takeClick() {
      const c = click;
      click = null;
      return c;
    },
    /** Call at the end of every frame to clear edge triggers. */
    endFrame() {
      pressed.clear();
    },
  };
}
