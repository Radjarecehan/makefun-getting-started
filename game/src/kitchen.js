// Dapur Kilat — kitchen state, stations, orders and recipes.
// Pure logic, no canvas and no DOM: render.js draws what this file decides.

export const SHIFT_SECONDS = 150;
export const MAX_CARRY = 3;

export const RECIPES = {
  nasigoreng: {
    id: 'nasigoreng',
    name: 'Nasi Goreng',
    short: 'NasGor',
    needs: ['nasi', 'telur', 'cabai_cincang'],
    cook: 'wok',
    cookTime: 6,
    price: 100,
    color: '#e8a33d',
  },
  miegoreng: {
    id: 'miegoreng',
    name: 'Mie Goreng',
    short: 'MieGor',
    needs: ['mie', 'sayur_cincang', 'ayam_cincang'],
    cook: 'wok',
    cookTime: 6,
    price: 110,
    color: '#f2c14e',
  },
  sate: {
    id: 'sate',
    name: 'Sate Ayam',
    short: 'Sate',
    needs: ['tusuk', 'bumbu'],
    cook: 'grill',
    cookTime: 4,
    price: 120,
    color: '#b4713b',
  },
};

export const INGREDIENTS = {
  nasi: { name: 'Nasi', chop: false, color: '#fff7e0' },
  telur: { name: 'Telur', chop: false, color: '#ffd94d' },
  cabai: { name: 'Cabai', chop: true, color: '#e33d2e' },
  mie: { name: 'Mie', chop: false, color: '#f2c14e' },
  sayur: { name: 'Sayur', chop: true, color: '#3fae5a' },
  ayam: { name: 'Ayam', chop: true, color: '#c98a4b' },
  tusuk: { name: 'Tusuk Sate', chop: false, color: '#d9b380' },
  bumbu: { name: 'Bumbu Kacang', chop: false, color: '#8a5a2b' },
  cabai_cincang: { name: 'Cabai Cincang', chop: false, color: '#ff6b5e' },
  sayur_cincang: { name: 'Sayur Cincang', chop: false, color: '#7ed491' },
  ayam_cincang: { name: 'Ayam Cincang', chop: false, color: '#e0a866' },
};

/** The raw ingredient a (possibly chopped) need comes from. */
export function rawOf(item) {
  return item.endsWith('_cincang') ? item.slice(0, -8) : item;
}

/** The chopped form of a raw ingredient, or null when it needs no chopping. */
export function choppedOf(raw) {
  return INGREDIENTS[raw] && INGREDIENTS[raw].chop ? `${raw}_cincang` : null;
}

export function itemName(item) {
  if (item.startsWith('cooked:')) return `${RECIPES[item.slice(7)].name} (matang)`;
  if (item.startsWith('dish:')) return RECIPES[item.slice(5)].name;
  return (INGREDIENTS[item] && INGREDIENTS[item].name) || item;
}

export const STATIONS = [
  { id: 'fridge', name: 'Kulkas', hint: 'Ambil bahan', x: 330, y: 84, w: 150, h: 112 },
  { id: 'board', name: 'Talenan', hint: 'Potong bahan', x: 520, y: 84, w: 150, h: 112 },
  { id: 'wok', name: 'Wajan', hint: 'Masak di wajan', x: 710, y: 84, w: 170, h: 112 },
  { id: 'grill', name: 'Panggangan', hint: 'Bakar sate', x: 950, y: 268, w: 196, h: 112 },
  { id: 'plate', name: 'Meja Saji', hint: 'Rakit di piring', x: 520, y: 500, w: 240, h: 112 },
  { id: 'window', name: 'Jendela Saji', hint: 'Antar pesanan', x: 920, y: 500, w: 240, h: 120 },
];

export function stationById(id) {
  return STATIONS.find((s) => s.id === id) || null;
}

export function stationCenter(st) {
  return { x: st.x + st.w / 2, y: st.y + st.h / 2 };
}

export function createState() {
  return {
    phase: 'title', // title | playing | over
    time: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    lost: 0,
    player: { x: 640, y: 430, r: 22, carrying: [], face: 1 },
    orders: [],
    orderSeq: 0,
    spawnIn: 2,
    wok: { items: [], progress: 0, cooking: false, done: false, burnt: false, burnIn: 0, recipe: null },
    grill: { items: [], progress: 0, cooking: false, done: false, burnt: false, burnIn: 0, recipe: null },
    board: { item: null, progress: 0, marker: 0, dir: 1, done: false },
    plate: { items: [], dish: null },
    message: '',
    messageT: 0,
    flash: '',
    flashT: 0,
  };
}

function say(state, text, seconds = 2.2) {
  state.message = text;
  state.messageT = seconds;
}

function flash(state, text, seconds = 1.6) {
  state.flash = text;
  state.flashT = seconds;
}

/** Pick the next recipe: sate joins the menu after 45 seconds of the shift. */
function pickRecipe(state) {
  const pool = state.time < 45 ? ['nasigoreng', 'miegoreng'] : ['nasigoreng', 'miegoreng', 'sate'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function orderSeconds(state) {
  // Orders get tighter as the shift goes on: 50s down to 34s.
  return Math.max(34, 50 - state.time * 0.11);
}

export function spawnOrder(state) {
  if (state.orders.length >= 4) return;
  const recipe = pickRecipe(state);
  const secs = orderSeconds(state);
  state.orderSeq += 1;
  state.orders.push({ id: state.orderSeq, recipe, timeLeft: secs, total: secs });
}

function cookerOf(state, kind) {
  return kind === 'wok' ? state.wok : state.grill;
}

function recipeForCooker(cooker, kind) {
  for (const recipe of Object.values(RECIPES)) {
    if (recipe.cook !== kind) continue;
    const have = [...cooker.items].sort().join(',');
    const need = [...recipe.needs].sort().join(',');
    if (have === need) return recipe;
  }
  return null;
}

function tickCooker(state, cooker, kind, dt) {
  if (cooker.burnt) return;
  if (cooker.done) {
    cooker.burnIn -= dt;
    if (cooker.burnIn <= 0) {
      cooker.burnt = true;
      cooker.done = false;
      cooker.items = [];
      say(state, kind === 'wok' ? 'Wajan gosong! Bersihkan dengan E.' : 'Panggangan gosong! Bersihkan dengan E.');
    }
    return;
  }
  if (!cooker.cooking) {
    const recipe = recipeForCooker(cooker, kind);
    if (recipe) {
      cooker.cooking = true;
      cooker.recipe = recipe.id;
      cooker.progress = 0;
    }
    return;
  }
  const recipe = RECIPES[cooker.recipe];
  cooker.progress += dt / recipe.cookTime;
  if (cooker.progress >= 1) {
    cooker.progress = 1;
    cooker.cooking = false;
    cooker.done = true;
    cooker.burnIn = 10;
    say(state, `${recipe.name} matang! Angkat sebelum gosong.`);
  }
}

function tickBoard(state, dt) {
  const board = state.board;
  if (!board.item || board.done) return;
  board.progress += dt * 0.85;
  board.marker += board.dir * dt * 1.5;
  if (board.marker >= 1) { board.marker = 1; board.dir = -1; }
  if (board.marker <= 0) { board.marker = 0; board.dir = 1; }
  if (board.progress >= 1) {
    board.progress = 1;
    board.done = true;
    say(state, `${itemName(board.item)} sudah dicincang — ambil dengan E.`);
  }
}

export function update(state, dt) {
  if (state.phase !== 'playing') return;
  state.time += dt;
  state.timeLeft -= dt;
  if (state.messageT > 0) state.messageT -= dt;
  if (state.flashT > 0) state.flashT -= dt;

  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnOrder(state);
    state.spawnIn = Math.max(9, 17 - state.time * 0.05);
  }
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const order = state.orders[i];
    order.timeLeft -= dt;
    if (order.timeLeft <= 0) {
      state.orders.splice(i, 1);
      state.lost += 1;
      state.combo = 0;
      say(state, `Pesanan ${RECIPES[order.recipe].name} hangus — pelanggan pergi!`);
    }
  }
  tickCooker(state, state.wok, 'wok', dt);
  tickCooker(state, state.grill, 'grill', dt);
  tickBoard(state, dt);

  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.phase = 'over';
  }
}

/** All items the player, cookers, board and plate currently hold, for fridge lookup. */
function heldItems(state) {
  const held = new Set(state.player.carrying);
  for (const item of state.wok.items) held.add(item);
  for (const item of state.grill.items) held.add(item);
  if (state.board.item) held.add(state.board.item);
  for (const item of state.plate.items) held.add(item);
  return held;
}

function handsFull(state) {
  return state.player.carrying.length >= MAX_CARRY;
}

function carryingDish(state) {
  return state.player.carrying.some((item) => item.startsWith('dish:'));
}

/** Interact with a station. Returns a short label of what happened (for sound). */
export function interact(state, stationId) {
  if (state.phase !== 'playing') return 'none';
  const player = state.player;

  if (stationId === 'fridge') {
    if (carryingDish(state)) { say(state, 'Tangan penuh hidangan — antar dulu!'); return 'error'; }
    if (handsFull(state)) { say(state, 'Tangan penuh!'); return 'error'; }
    const held = heldItems(state);
    let pick = null;
    for (const order of state.orders) {
      for (const need of RECIPES[order.recipe].needs) {
        const raw = rawOf(need);
        if (!held.has(raw) && !held.has(need)) { pick = raw; break; }
      }
      if (pick) break;
    }
    if (!pick) pick = 'nasi';
    player.carrying.push(pick);
    say(state, `Mengambil ${INGREDIENTS[pick].name}.`);
    return 'take';
  }

  if (stationId === 'board') {
    const board = state.board;
    if (board.item && board.done) {
      if (handsFull(state)) { say(state, 'Tangan penuh!'); return 'error'; }
      player.carrying.push(choppedOf(board.item));
      board.item = null;
      board.done = false;
      board.progress = 0;
      say(state, `Mengambil ${itemName(player.carrying[player.carrying.length - 1])}.`);
      return 'take';
    }
    if (board.item && !board.done) {
      if (board.marker >= 0.3 && board.marker <= 0.7) {
        board.progress = 1;
        board.done = true;
        flash(state, 'PERFECT!');
        say(state, 'Potongan sempurna!');
        return 'perfect';
      }
      board.progress = Math.min(1, board.progress + 0.18);
      say(state, 'Potong terus — tekan E saat penanda di hijau!');
      return 'chop';
    }
    const idx = player.carrying.findIndex((item) => choppedOf(item));
    if (idx < 0) { say(state, 'Bawa bahan yang bisa dipotong (cabai, sayur, ayam).'); return 'error'; }
    board.item = player.carrying.splice(idx, 1)[0];
    board.progress = 0;
    board.marker = 0;
    board.dir = 1;
    board.done = false;
    say(state, `Memotong ${INGREDIENTS[board.item].name} — tekan E di zona hijau!`);
    return 'chop';
  }

  if (stationId === 'wok' || stationId === 'grill') {
    const cooker = stationId === 'wok' ? state.wok : state.grill;
    const kind = stationId;
    if (cooker.burnt) {
      cooker.burnt = false;
      cooker.items = [];
      cooker.recipe = null;
      cooker.progress = 0;
      say(state, stationId === 'wok' ? 'Wajan bersih lagi.' : 'Panggangan bersih lagi.');
      return 'clean';
    }
    if (cooker.done) {
      if (handsFull(state)) { say(state, 'Tangan penuh!'); return 'error'; }
      player.carrying.push(`cooked:${cooker.recipe}`);
      say(state, `Mengangkat ${RECIPES[cooker.recipe].name} matang.`);
      cooker.items = [];
      cooker.done = false;
      cooker.recipe = null;
      cooker.progress = 0;
      return 'take';
    }
    if (cooker.cooking) { say(state, 'Masih dimasak — tunggu sampai matang.'); return 'none'; }
    const cook = kind === 'wok' ? 'wok' : 'grill';
    let moved = 0;
    for (let i = player.carrying.length - 1; i >= 0; i--) {
      const item = player.carrying[i];
      if (item.startsWith('cooked:') || item.startsWith('dish:')) continue;
      const fits = Object.values(RECIPES).some(
        (r) => r.cook === cook && r.needs.includes(item) && !cooker.items.includes(item),
      );
      if (fits) {
        cooker.items.push(item);
        player.carrying.splice(i, 1);
        moved++;
      }
    }
    if (moved === 0) {
      say(state, kind === 'wok' ? 'Bawa bahan masakan ke wajan (nasi, mie, telur, cabai...).' : 'Bawa tusuk dan bumbu ke panggangan.');
      return 'error';
    }
    const recipe = recipeForCooker(cooker, kind);
    if (recipe) say(state, `Memasak ${recipe.name}...`);
    else say(state, `Masukkan ${moved} bahan — lengkapi resepnya.`);
    return 'put';
  }

  if (stationId === 'plate') {
    const plate = state.plate;
    if (plate.dish && !carryingDish(state) && player.carrying.length === 0) {
      player.carrying.push(`dish:${plate.dish}`);
      say(state, `${RECIPES[plate.dish].name} siap diantar!`);
      plate.dish = null;
      plate.items = [];
      return 'take';
    }
    const idx = player.carrying.findIndex((item) => item.startsWith('cooked:'));
    if (idx < 0) {
      if (plate.dish) say(state, 'Piring sudah siap — ambil dengan tangan kosong.');
      else say(state, 'Bawa hidangan matang ke meja saji.');
      return 'error';
    }
    const cooked = player.carrying.splice(idx, 1)[0];
    const recipeId = cooked.slice(7);
    plate.items.push(cooked);
    plate.dish = recipeId;
    flash(state, `${RECIPES[recipeId].name.toUpperCase()} SIAP!`);
    say(state, `${RECIPES[recipeId].name} siap — antar ke jendela saji!`);
    return 'plate';
  }

  if (stationId === 'window') {
    const idx = player.carrying.findIndex((item) => item.startsWith('dish:'));
    if (idx < 0) { say(state, 'Bawa hidangan siap saji ke jendela.'); return 'error'; }
    const dish = player.carrying.splice(idx, 1)[0];
    const recipeId = dish.slice(5);
    const orderIdx = state.orders.findIndex((o) => o.recipe === recipeId);
    if (orderIdx < 0) {
      state.combo = 0;
      say(state, 'Tidak ada yang memesan itu — hidangan dibuang.');
      return 'error';
    }
    const order = state.orders[orderIdx];
    state.orders.splice(orderIdx, 1);
    const gain = RECIPES[recipeId].price + 25 * state.combo;
    state.score += gain;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    flash(state, `+${gain}  •  KOMBO x${state.combo}`);
    say(state, `Pesanan ${RECIPES[recipeId].name} terkirim! +${gain}`);
    return 'serve';
  }

  return 'none';
}

/** Drop everything the player carries (X key). */
export function discardHands(state) {
  if (state.player.carrying.length === 0) return;
  state.player.carrying = [];
  say(state, 'Bahan dibuang.');
}

export function startGame(state) {
  const fresh = createState();
  Object.assign(state, fresh, { phase: 'playing' });
  spawnOrder(state);
}

/** Deterministic scenes for screenshots: ?shot=start|play|rush|serve&seed=1 */
export function buildShotState(shot) {
  const state = createState();
  state.phase = 'playing';
  if (shot === 'start') {
    state.phase = 'title';
    return state;
  }
  if (shot === 'play') {
    state.time = 32;
    state.timeLeft = 118;
    state.score = 150;
    state.combo = 1;
    state.bestCombo = 2;
    state.served = 1;
    state.orders = [
      { id: 1, recipe: 'nasigoreng', timeLeft: 38, total: 50 },
      { id: 2, recipe: 'miegoreng', timeLeft: 29, total: 46 },
      { id: 3, recipe: 'sate', timeLeft: 22, total: 42 },
    ];
    state.orderSeq = 3;
    state.player.x = 595;
    state.player.y = 300;
    state.player.carrying = ['cabai_cincang', 'telur'];
    state.wok.items = ['nasi', 'telur', 'cabai_cincang'];
    state.wok.cooking = true;
    state.wok.recipe = 'nasigoreng';
    state.wok.progress = 0.6;
    state.board.item = 'sayur';
    state.board.progress = 0.45;
    state.board.marker = 0.5;
    state.board.dir = 1;
    return state;
  }
  if (shot === 'rush') {
    state.time = 128;
    state.timeLeft = 22;
    state.score = 860;
    state.combo = 3;
    state.bestCombo = 4;
    state.served = 7;
    state.orders = [
      { id: 8, recipe: 'nasigoreng', timeLeft: 8, total: 36 },
      { id: 9, recipe: 'sate', timeLeft: 12, total: 38 },
      { id: 10, recipe: 'miegoreng', timeLeft: 17, total: 40 },
    ];
    state.orderSeq = 10;
    state.player.x = 1040;
    state.player.y = 470;
    state.player.carrying = ['dish:nasigoreng'];
    state.wok.items = ['mie', 'sayur_cincang', 'ayam_cincang'];
    state.wok.done = true;
    state.wok.recipe = 'miegoreng';
    state.wok.burnIn = 6;
    state.grill.items = ['tusuk', 'bumbu'];
    state.grill.cooking = true;
    state.grill.recipe = 'sate';
    state.grill.progress = 0.8;
    state.plate.dish = 'miegoreng';
    state.plate.items = ['cooked:miegoreng'];
    return state;
  }
  // serve
  state.time = 96;
  state.timeLeft = 54;
  state.score = 1250;
  state.combo = 3;
  state.bestCombo = 4;
  state.served = 9;
  state.orders = [{ id: 6, recipe: 'sate', timeLeft: 20, total: 40 }];
  state.orderSeq = 6;
  state.player.x = 1040;
  state.player.y = 470;
  state.player.carrying = [];
  state.plate.dish = 'sate';
  state.plate.items = ['cooked:sate'];
  state.flash = '+145  •  KOMBO x3';
  state.flashT = 99;
  state.message = 'Pesanan Nasi Goreng terkirim! +145';
  state.messageT = 99;
  return state;
}
