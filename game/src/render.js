// Dapur Kilat — all canvas drawing: kitchen, stations, food, HUD and screens.

import { INGREDIENTS, RECIPES, STATIONS, choppedOf, itemName, stationCenter } from './kitchen.js';

export const VIEW_W = 1280;
export const VIEW_H = 720;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function bar(ctx, x, y, w, h, frac, fill, back = 'rgba(0,0,0,0.35)') {
  rr(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = back;
  ctx.fill();
  if (frac > 0) {
    rr(ctx, x, y, Math.max(h, w * Math.min(1, frac)), h, h / 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

/** A small drawn icon for one carried/cooked item, centered at (x, y), size ~s. */
export function drawIngredient(ctx, item, x, y, s = 26) {
  ctx.save();
  ctx.translate(x, y);
  const u = s / 26;
  if (item === 'nasi' || item === 'nasi_cincang') {
    ctx.fillStyle = '#fff7e0';
    ctx.beginPath();
    ctx.ellipse(0, 2 * u, 13 * u, 8 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.ellipse(-3 * u, -2 * u, 7 * u, 4 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (item === 'telur') {
    ctx.fillStyle = '#fdfdfd';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * u, 9 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(2 * u, 0, 5.5 * u, 0, Math.PI * 2);
    ctx.fill();
  } else if (item === 'cabai') {
    ctx.strokeStyle = '#e33d2e';
    ctx.lineWidth = 6 * u;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -2 * u, 9 * u, Math.PI * 0.15, Math.PI * 0.95);
    ctx.stroke();
    ctx.strokeStyle = '#3fae5a';
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.moveTo(8 * u, -10 * u);
    ctx.lineTo(12 * u, -14 * u);
    ctx.stroke();
  } else if (item === 'cabai_cincang') {
    ctx.fillStyle = '#ff6b5e';
    for (const [dx, dy] of [[-7, -3], [0, 3], [7, -4], [-2, -7], [4, 6]]) {
      ctx.fillRect(dx * u - 3 * u, dy * u - 2 * u, 6 * u, 4 * u);
    }
  } else if (item === 'mie') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 3.5 * u;
    ctx.lineCap = 'round';
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      for (let t = 0; t <= 6; t++) {
        const px = -11 * u + (t / 6) * 22 * u;
        const py = k * 6 * u + Math.sin(t * 1.4) * 2.5 * u;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  } else if (item === 'sayur') {
    ctx.fillStyle = '#3fae5a';
    for (const [dx, dy, rot] of [[-6, 0, -0.5], [0, -4, 0], [6, 0, 0.5]]) {
      ctx.save();
      ctx.translate(dx * u, dy * u);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 5 * u, 9 * u, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (item === 'sayur_cincang') {
    ctx.fillStyle = '#7ed491';
    for (const [dx, dy] of [[-7, -3], [0, 3], [7, -4], [-2, -7], [4, 6]]) {
      ctx.beginPath();
      ctx.arc(dx * u, dy * u, 3.5 * u, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (item === 'ayam') {
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath();
    ctx.arc(-2 * u, 1 * u, 8 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f3e2c7';
    ctx.lineWidth = 3 * u;
    ctx.beginPath();
    ctx.moveTo(5 * u, -3 * u);
    ctx.lineTo(12 * u, -9 * u);
    ctx.stroke();
  } else if (item === 'ayam_cincang') {
    ctx.fillStyle = '#e0a866';
    for (const [dx, dy] of [[-7, -2], [0, 4], [7, -3]]) {
      ctx.fillRect(dx * u - 4 * u, dy * u - 4 * u, 8 * u, 8 * u);
    }
  } else if (item === 'tusuk') {
    ctx.strokeStyle = '#c9a06a';
    ctx.lineWidth = 2.5 * u;
    ctx.beginPath();
    ctx.moveTo(-12 * u, 0);
    ctx.lineTo(12 * u, 0);
    ctx.stroke();
    ctx.fillStyle = '#a86f3c';
    for (const dx of [-7, 0, 7]) {
      ctx.fillRect((dx - 3) * u, -5 * u, 6 * u, 10 * u);
    }
  } else if (item === 'bumbu') {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.ellipse(0, 2 * u, 11 * u, 7 * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a9743f';
    ctx.beginPath();
    ctx.ellipse(-2 * u, -1 * u, 6 * u, 3.5 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.startsWith('cooked:') || item.startsWith('dish:')) {
    drawDish(ctx, item.slice(item.indexOf(':') + 1), x, y, s);
  } else {
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(0, 0, 8 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A plated dish: white plate, food mound in the recipe colour, garnish. */
export function drawDish(ctx, recipeId, x, y, s = 30) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return;
  ctx.save();
  ctx.translate(x, y);
  const u = s / 30;
  ctx.fillStyle = '#fbfbfb';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16 * u, 11 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8d8d8';
  ctx.lineWidth = 1.5 * u;
  ctx.stroke();
  ctx.fillStyle = recipe.color;
  ctx.beginPath();
  ctx.ellipse(0, -1 * u, 11 * u, 7 * u, 0, 0, Math.PI * 2);
  ctx.fill();
  if (recipeId === 'nasigoreng') {
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(3 * u, -3 * u, 3.5 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e33d2e';
    ctx.fillRect(-8 * u, -6 * u, 4 * u, 2.5 * u);
  } else if (recipeId === 'miegoreng') {
    ctx.strokeStyle = '#b98a1e';
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.moveTo(-8 * u, -2 * u);
    ctx.quadraticCurveTo(0, -8 * u, 8 * u, -2 * u);
    ctx.stroke();
    ctx.fillStyle = '#3fae5a';
    ctx.fillRect(4 * u, -7 * u, 4 * u, 3 * u);
  } else if (recipeId === 'sate') {
    ctx.strokeStyle = '#c9a06a';
    ctx.lineWidth = 2 * u;
    ctx.beginPath();
    ctx.moveTo(-11 * u, -3 * u);
    ctx.lineTo(11 * u, -3 * u);
    ctx.stroke();
    ctx.fillStyle = '#8a5a2b';
    for (const dx of [-6, 0, 6]) {
      ctx.fillRect((dx - 2.5) * u, -7 * u, 5 * u, 8 * u);
    }
  }
  ctx.restore();
}

function drawStationBase(ctx, st, fill, active) {
  rr(ctx, st.x, st.y, st.w, st.h, 12);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = active ? 4 : 2;
  ctx.strokeStyle = active ? '#ffd94d' : 'rgba(0,0,0,0.35)';
  ctx.stroke();
  text(ctx, st.name, st.x + st.w / 2, st.y + 22, 17, '#fff', 'center');
}

function drawFridge(ctx, st, active) {
  drawStationBase(ctx, st, '#7fa8c9', active);
  ctx.fillStyle = '#a9c6de';
  rr(ctx, st.x + 18, st.y + 32, st.w - 36, 34, 6);
  ctx.fill();
  rr(ctx, st.x + 18, st.y + 72, st.w - 36, 26, 6);
  ctx.fill();
  ctx.fillStyle = '#4a6b8a';
  ctx.fillRect(st.x + st.w - 34, st.y + 42, 5, 16);
  ctx.fillRect(st.x + st.w - 34, st.y + 78, 5, 14);
  text(ctx, '❄', st.x + 26, st.y + 56, 18, '#fff');
}

function drawBoard(ctx, st, state, active) {
  drawStationBase(ctx, st, '#8a6a45', active);
  ctx.fillStyle = '#c9a06a';
  rr(ctx, st.x + 20, st.y + 36, st.w - 40, 56, 8);
  ctx.fill();
  const board = state.board;
  if (board.item) {
    drawIngredient(ctx, board.item, st.x + st.w / 2 - 18, st.y + 64, 30);
    if (!board.done) {
      const gx0 = st.x + 24;
      const gx1 = st.x + st.w - 24;
      bar(ctx, gx0, st.y + st.h - 16, gx1 - gx0, 8, board.progress, '#7ed491');
      ctx.fillStyle = 'rgba(255,217,77,0.9)';
      ctx.fillRect(gx0 + (gx1 - gx0) * 0.3, st.y + st.h - 19, (gx1 - gx0) * 0.4, 14);
      ctx.fillStyle = '#fff';
      ctx.fillRect(gx0 + (gx1 - gx0) * board.marker - 2, st.y + st.h - 21, 4, 18);
    } else {
      drawIngredient(ctx, choppedOf(board.item), st.x + st.w / 2 + 22, st.y + 64, 30);
      text(ctx, 'SIAP', st.x + st.w / 2, st.y + st.h - 8, 11, '#d8ffd8', 'center');
    }
  } else {
    text(ctx, '— kosong —', st.x + st.w / 2, st.y + 66, 13, 'rgba(255,255,255,0.75)', 'center');
  }
}

function drawCooker(ctx, st, cooker, kind, state, active, time) {
  drawStationBase(ctx, st, kind === 'wok' ? '#5a4a52' : '#4a4a58', active);
  const cx = st.x + st.w / 2;
  const cy = st.y + 62;
  if (cooker.cooking) {
    ctx.fillStyle = '#ff7a2a';
    for (let k = 0; k < 3; k++) {
      const fx = cx - 26 + k * 26 + Math.sin(time * 6 + k * 2) * 3;
      ctx.beginPath();
      ctx.moveTo(fx - 8, cy + 16);
      ctx.quadraticCurveTo(fx, cy - 8 - (k % 2) * 6, fx + 8, cy + 16);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.fillStyle = '#2b2b30';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 6, 52, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3d3d44';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 52, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  if (cooker.items.length > 0) {
    const shown = cooker.items.slice(0, 3);
    shown.forEach((item, i) => {
      drawIngredient(ctx, item, cx - 28 + i * 28, cy, 24);
    });
  }
  if (cooker.cooking) {
    bar(ctx, st.x + 20, st.y + st.h - 16, st.w - 40, 9, cooker.progress, '#ffb03a');
    text(ctx, 'MEMASAK…', cx, st.y + st.h - 22, 11, '#ffd9a0', 'center');
  } else if (cooker.done) {
    const urgent = cooker.burnIn < 4;
    text(ctx, urgent ? 'ANGKAT! GOSONG!' : 'MATANG — ANGKAT!', cx, st.y + st.h - 20, 12, urgent ? '#ff5a4d' : '#7ed491', 'center');
    bar(ctx, st.x + 20, st.y + st.h - 14, st.w - 40, 7, cooker.burnIn / 10, urgent ? '#ff5a4d' : '#7ed491');
  } else if (cooker.burnt) {
    text(ctx, 'GOSONG — E: BERSIHKAN', cx, st.y + st.h - 20, 11, '#ff5a4d', 'center');
  } else if (cooker.items.length > 0) {
    text(ctx, 'Tambah bahan…', cx, st.y + st.h - 20, 11, 'rgba(255,255,255,0.7)', 'center');
  }
}

function drawPlateStation(ctx, st, state, active) {
  drawStationBase(ctx, st, '#6a8a6a', active);
  ctx.fillStyle = '#e8e2d2';
  rr(ctx, st.x + 16, st.y + 34, st.w - 32, 58, 8);
  ctx.fill();
  const plate = state.plate;
  if (plate.dish) {
    drawDish(ctx, plate.dish, st.x + st.w / 2, st.y + 64, 44);
    text(ctx, `${RECIPES[plate.dish].name.toUpperCase()} SIAP`, st.x + st.w / 2, st.y + st.h - 8, 12, '#eaffea', 'center');
  } else if (plate.items.length > 0) {
    drawIngredient(ctx, plate.items[0], st.x + st.w / 2, st.y + 64, 34);
  } else {
    text(ctx, '— piring kosong —', st.x + st.w / 2, st.y + 66, 13, 'rgba(255,255,255,0.75)', 'center');
  }
}

function drawWindow(ctx, st, state, active) {
  drawStationBase(ctx, st, '#a86f3c', active);
  ctx.fillStyle = '#ffd9a0';
  rr(ctx, st.x + 16, st.y + 34, st.w - 32, 52, 8);
  ctx.fill();
  ctx.fillStyle = '#7a4a22';
  ctx.fillRect(st.x + 16, st.y + 58, st.w - 32, 6);
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(st.x + st.w - 34, st.y + 48, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a22';
  ctx.fillRect(st.x + st.w - 36, st.y + 56, 4, 6);
  text(ctx, 'ANTAR DI SINI', st.x + st.w / 2 - 12, st.y + st.h - 10, 12, '#ffe9c9', 'center');
}

function drawPlayer(ctx, state, time) {
  const p = state.player;
  const bob = Math.sin(time * 10) * 1.5;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 20, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2f2f2';
  rr(ctx, -17, -8, 34, 30, 10);
  ctx.fill();
  ctx.strokeStyle = '#c94f43';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-17, 4);
  ctx.lineTo(17, 4);
  ctx.stroke();
  ctx.fillStyle = '#f0c08a';
  ctx.beginPath();
  ctx.arc(0, -16, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-7, -26, 8, 0, Math.PI * 2);
  ctx.arc(0, -30, 9, 0, Math.PI * 2);
  ctx.arc(7, -26, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-13, -26, 26, 6);
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(-5 + p.face * 2, -17, 1.8, 0, Math.PI * 2);
  ctx.arc(5 + p.face * 2, -17, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a33';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.face * 2, -11, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (p.carrying.length > 0) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    rr(ctx, -30, -52, 60, 22, 8);
    ctx.fill();
    p.carrying.slice(0, 3).forEach((item, i) => {
      drawIngredient(ctx, item, -20 + i * 20, -41, 20);
    });
  }
  ctx.restore();
}

function drawOrders(ctx, state) {
  const x = 16;
  const y = 84;
  rr(ctx, x, y, 292, 372, 12);
  ctx.fillStyle = 'rgba(30,22,16,0.88)';
  ctx.fill();
  ctx.strokeStyle = '#c9a06a';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PAPAN PESANAN', x + 146, y + 28, 17, '#ffd94d', 'center');
  if (state.orders.length === 0) {
    text(ctx, 'Belum ada pesanan…', x + 146, y + 70, 14, 'rgba(255,255,255,0.7)', 'center');
  }
  state.orders.forEach((order, i) => {
    const recipe = RECIPES[order.recipe];
    const oy = y + 44 + i * 72;
    const frac = Math.max(0, order.timeLeft / order.total);
    rr(ctx, x + 12, oy, 268, 62, 8);
    ctx.fillStyle = frac < 0.3 ? '#7a2d24' : '#4a3a28';
    ctx.fill();
    ctx.fillStyle = recipe.color;
    rr(ctx, x + 20, oy + 10, 42, 42, 8);
    ctx.fill();
    drawDish(ctx, order.recipe, x + 41, oy + 31, 30);
    text(ctx, recipe.name, x + 72, oy + 26, 16, '#fff');
    text(ctx, `Rp ${recipe.price}`, x + 72, oy + 46, 13, '#ffd94d');
    bar(ctx, x + 72, oy + 50, 150, 7, frac, frac < 0.3 ? '#ff5a4d' : '#7ed491');
    text(ctx, `${Math.ceil(order.timeLeft)} dtk`, x + 268, oy + 30, 15, frac < 0.3 ? '#ff8a7a' : '#fff', 'right');
  });
  text(ctx, 'Antar hidangan yang benar', x + 146, y + 44 + 4 * 72 + 4, 12, 'rgba(255,255,255,0.55)', 'center');
  text(ctx, 'sebelum waktunya habis!', x + 146, y + 44 + 4 * 72 + 22, 12, 'rgba(255,255,255,0.55)', 'center');
}

function drawHud(ctx, state) {
  rr(ctx, 0, 0, VIEW_W, 64, 0);
  ctx.fillStyle = '#241a12';
  ctx.fill();
  text(ctx, 'DAPUR KILAT', 20, 42, 28, '#ffd94d');
  text(ctx, 'street-food Indonesia', 218, 42, 14, '#c9a06a');
  const cx = 640;
  const frac = Math.max(0, state.timeLeft / 150);
  text(ctx, 'SHIFT', cx - 150, 26, 13, '#c9a06a', 'center');
  bar(ctx, cx - 140, 32, 280, 16, frac, frac < 0.2 ? '#ff5a4d' : '#7ed491');
  text(ctx, `${Math.ceil(state.timeLeft)} dtk`, cx, 45, 13, '#fff', 'center');
  text(ctx, `SKOR  ${state.score}`, 1060, 30, 20, '#fff', 'right');
  text(ctx, `KOMBO x${state.combo}   •   TERLAYANI ${state.served}`, 1060, 52, 13, state.combo >= 3 ? '#ffd94d' : '#c9a06a', 'right');
}

function drawPrompt(ctx, state, activeId) {
  if (!activeId) return;
  const st = STATIONS.find((s) => s.id === activeId);
  if (!st) return;
  const label = `E: ${st.hint}`;
  ctx.save();
  ctx.font = '700 15px "Trebuchet MS", Verdana, sans-serif';
  const w = ctx.measureText(label).width + 24;
  const x = Math.min(Math.max(16, st.x + st.w / 2 - w / 2), VIEW_W - w - 16);
  const y = st.y + st.h + 8;
  rr(ctx, x, y, w, 28, 14);
  ctx.fillStyle = 'rgba(20,14,8,0.9)';
  ctx.fill();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + 19, 15, '#ffd94d', 'center');
  ctx.restore();
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'DAPUR KILAT', VIEW_W / 2, 190, 72, '#ffd94d', 'center');
  text(ctx, 'Dapur street-food Indonesia — masak cepat, antar tepat waktu!', VIEW_W / 2, 232, 20, '#fff', 'center');
  text(ctx, 'Kak Rina butuh bantuanmu menjalankan dapur malam ini.', VIEW_W / 2, 262, 16, '#e8dcc0', 'center');
  const lines = [
    ['WASD / Panah', 'Bergerak di dapur'],
    ['E / Spasi / Klik', 'Ambil, potong, masak, rakit, antar'],
    ['X', 'Buang bahan di tangan'],
    ['R', 'Mulai ulang setelah shift selesai'],
  ];
  lines.forEach(([key, desc], i) => {
    const y = 320 + i * 34;
    text(ctx, key, 470, y, 17, '#ffd94d');
    text(ctx, desc, 700, y, 17, '#fff');
  });
  text(ctx, 'Resep:  Nasi Goreng  •  Mie Goreng  •  Sate Ayam', VIEW_W / 2, 480, 17, '#7ed491', 'center');
  text(ctx, 'Tekan ENTER untuk mulai shift 150 detik', VIEW_W / 2, 540, 20, '#fff', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(20,12,6,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  text(ctx, 'SHIFT SELESAI!', VIEW_W / 2, 200, 56, '#ffd94d', 'center');
  text(ctx, `Skor akhir: ${state.score}`, VIEW_W / 2, 280, 30, '#fff', 'center');
  text(ctx, `Pesanan terlayani: ${state.served}   •   Pesanan hangus: ${state.lost}`, VIEW_W / 2, 330, 20, '#e8dcc0', 'center');
  text(ctx, `Kombo terbaik: x${state.bestCombo}`, VIEW_W / 2, 366, 20, '#e8dcc0', 'center');
  text(ctx, 'Tekan R untuk main lagi', VIEW_W / 2, 440, 20, '#7ed491', 'center');
}

function drawFloor(ctx) {
  ctx.fillStyle = '#3a2a1c';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#54382a';
  ctx.fillRect(0, 64, VIEW_W, 26);
  ctx.fillStyle = '#6b4a35';
  for (let x = 0; x < VIEW_W; x += 64) {
    ctx.fillRect(x, 64, 2, 26);
  }
  ctx.fillStyle = '#4a3423';
  for (let y = 96; y < VIEW_H; y += 64) {
    for (let x = (y % 128 === 0 ? 0 : 32); x < VIEW_W; x += 64) {
      ctx.fillRect(x, y, 62, 62);
    }
  }
  ctx.fillStyle = '#5d4128';
  ctx.fillRect(308, 210, 4, 490);
}

function drawMessage(ctx, state) {
  if (state.messageT > 0 && state.message) {
    ctx.save();
    ctx.font = '700 16px "Trebuchet MS", Verdana, sans-serif';
    const w = ctx.measureText(state.message).width + 28;
    const x = VIEW_W / 2 - w / 2;
    rr(ctx, x, 676, w, 30, 15);
    ctx.fillStyle = 'rgba(20,14,8,0.9)';
    ctx.fill();
    ctx.strokeStyle = '#c9a06a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    text(ctx, state.message, VIEW_W / 2, 696, 16, '#fff', 'center');
    ctx.restore();
  }
  if (state.flashT > 0 && state.flash) {
    text(ctx, state.flash, VIEW_W / 2, 300, 40, '#ffd94d', 'center');
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 6;
    ctx.font = '700 40px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(state.flash, VIEW_W / 2, 300);
    ctx.restore();
  }
}

/** Draw one frame of the game. `activeId` is the station in interaction range. */
export function draw(ctx, state, activeId, time) {
  drawFloor(ctx);
  drawOrders(ctx, state);
  for (const st of STATIONS) {
    const active = st.id === activeId;
    if (st.id === 'fridge') drawFridge(ctx, st, active);
    else if (st.id === 'board') drawBoard(ctx, st, state, active);
    else if (st.id === 'wok') drawCooker(ctx, st, state.wok, 'wok', state, active, time);
    else if (st.id === 'grill') drawCooker(ctx, st, state.grill, 'grill', state, active, time);
    else if (st.id === 'plate') drawPlateStation(ctx, st, state, active);
    else if (st.id === 'window') drawWindow(ctx, st, state, active);
  }
  if (state.phase !== 'title') drawPlayer(ctx, state, time);
  drawHud(ctx, state);
  if (state.phase === 'playing') drawPrompt(ctx, state, activeId);
  drawMessage(ctx, state);
  if (state.phase === 'title') drawTitle(ctx, state);
  if (state.phase === 'over') drawGameOver(ctx, state);
}
