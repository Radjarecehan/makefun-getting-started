// Dapur Kilat — boot, game loop, movement, collision and interaction wiring.

import {
  STATIONS,
  buildShotState,
  createState,
  discardHands,
  interact,
  startGame,
  stationCenter,
  update,
} from './kitchen.js';
import { VIEW_H, VIEW_W, draw } from './render.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const state = shot ? buildShotState(shot) : createState();
const input = createInput(canvas);
const audio = createAudio();

const SPEED = 280;
const REACH = 130;
let time = 0;
let last = performance.now();
let activeId = null;
let moveTarget = null;

const SOUNDS = {
  take: 'take',
  chop: 'chop',
  perfect: 'perfect',
  put: 'put',
  plate: 'put',
  serve: 'serve',
  error: 'error',
  clean: 'clean',
};

function playResult(result) {
  const name = SOUNDS[result];
  if (name && audio[name]) audio[name]();
}

/** The station whose centre is nearest the player, when in reach. */
function nearestStation() {
  const p = state.player;
  let best = null;
  let bestD = REACH;
  for (const st of STATIONS) {
    const c = stationCenter(st);
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    if (d < bestD) {
      bestD = d;
      best = st.id;
    }
  }
  return best;
}

/** Keep the chef inside the walkable floor and out of station counters. */
function collide() {
  const p = state.player;
  p.x = Math.min(1252, Math.max(322, p.x));
  p.y = Math.min(692, Math.max(212, p.y));
  for (const st of STATIONS) {
    const ex = st.x - p.r;
    const ey = st.y - p.r;
    const ew = st.w + 2 * p.r;
    const eh = st.h + 2 * p.r;
    if (p.x > ex && p.x < ex + ew && p.y > ey && p.y < ey + eh) {
      const dxl = p.x - ex;
      const dxr = ex + ew - p.x;
      const dyt = p.y - ey;
      const dyb = ey + eh - p.y;
      const m = Math.min(dxl, dxr, dyt, dyb);
      if (m === dxl) p.x = ex;
      else if (m === dxr) p.x = ex + ew;
      else if (m === dyt) p.y = ey;
      else p.y = ey + eh;
    }
  }
}

function stationAt(point) {
  for (const st of STATIONS) {
    if (point.x >= st.x && point.x <= st.x + st.w && point.y >= st.y && point.y <= st.y + st.h) {
      return st.id;
    }
  }
  return null;
}

function walkToward(target, dt) {
  const p = state.player;
  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const d = Math.hypot(dx, dy);
  if (d < 8) {
    moveTarget = null;
    return;
  }
  p.x += (dx / d) * SPEED * dt;
  p.y += (dy / d) * SPEED * dt;
  p.face = dx !== 0 ? Math.sign(dx) : p.face;
}

function handleClick(click) {
  const hit = stationAt(click);
  if (hit) {
    const c = stationCenter(STATIONS.find((s) => s.id === hit));
    const d = Math.hypot(state.player.x - c.x, state.player.y - c.y);
    if (d < REACH + 40) {
      moveTarget = null;
      playResult(interact(state, hit));
      return;
    }
  }
  moveTarget = { x: click.x, y: click.y };
}

function stepPlaying(dt) {
  const a = input.axis();
  if (a.x !== 0 || a.y !== 0) {
    state.player.x += a.x * SPEED * dt;
    state.player.y += a.y * SPEED * dt;
    state.player.face = a.x !== 0 ? Math.sign(a.x) : state.player.face;
    moveTarget = null;
  } else if (moveTarget) {
    walkToward(moveTarget, dt);
  }
  collide();
  activeId = nearestStation();

  const click = input.takeClick();
  if (click) handleClick(click);

  if (input.wasPressed('KeyE', 'Space')) {
    audio.unlock();
    if (activeId) playResult(interact(state, activeId));
  }
  if (input.wasPressed('KeyX')) discardHands(state);
  update(state, dt);
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  time += dt;

  if (!shot) {
    if (state.phase === 'playing') {
      stepPlaying(dt);
    } else if (state.phase === 'title') {
      if (input.wasPressed('Enter', 'Space')) {
        audio.unlock();
        startGame(state);
      }
      const click = input.takeClick();
      if (click) {
        audio.unlock();
        startGame(state);
      }
    } else if (state.phase === 'over') {
      if (input.wasPressed('KeyR', 'Enter')) {
        audio.unlock();
        startGame(state);
      }
    }
  }

  draw(ctx, state, state.phase === 'playing' ? activeId : null, time);
  input.endFrame();
  requestAnimationFrame(frame);
}

// Debug + playtest handle: Playwright drives the game through this.
window.__DAPUR__ = {
  state,
  VIEW_W,
  VIEW_H,
  start: () => startGame(state),
  interact: (id) => interact(state, id),
  discard: () => discardHands(state),
};

requestAnimationFrame(frame);
