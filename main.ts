// news-image-20261121 — "The World Today": a one-page newspaper front page
// summing up Saturday 21 November 2026. Drawn entirely in code (Node 22
// standard library only — no network, no clock, no randomness): a 1024x1024
// PNG written to /output/entry.png (or $MAKEFUN_OUTPUT_DIR when set).
// Deterministic: identical bytes on every run.
//
// Stories (all first reported on 21 November 2026):
//   HERO  Russia fires 400+ drones and 110+ missiles at Ukraine overnight;
//         at least 8 killed in Kyiv; two missiles and a suspected drone
//         come down in Poland — Warsaw calls it a deliberate provocation.
//   1     AI stock rout: S&P 500 falls 3.7% into correction, Nasdaq -5.3%.
//   2     Iran says it downed a US MQ-9 drone over the Strait of Hormuz;
//         Trump weighs new strikes as Israel presses for action.
//   3     COP31 climate talks in Antalya run past deadline, deadlocked
//         over fossil fuels.
//   4     UK and EU sign their biggest post-Brexit agreements in Brussels.
//   5     A strong earthquake shakes the Peruvian Andes.
//   ALSO  FBI probes reported hack of its criminal database; pancreatic
//         cancer pill trial; Bayer's $7.25bn Roundup settlement.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;

type RGB = [number, number, number];

// ------------------------------------------------------------------ palette
const PAPER: RGB = [248, 243, 232];
const PAPER_DIM: RGB = [238, 231, 216];
const INK: RGB = [22, 22, 22];
const RED: RGB = [176, 32, 32];
const BLUE: RGB = [30, 58, 110];
const NIGHT: RGB = [24, 32, 64];
const NIGHT2: RGB = [44, 56, 104];
const GOLD: RGB = [214, 164, 60];
const ORANGE: RGB = [224, 110, 44];
const SEA: RGB = [38, 92, 120];
const GREEN: RGB = [46, 110, 68];
const GREY: RGB = [118, 114, 106];
const LIGHT: RGB = [255, 255, 255];
const SMOKE: RGB = [150, 146, 138];

// ------------------------------------------------------------ framebuffer
// Raw RGB rows, 3 bytes per pixel, no alpha. Every drawing helper below
// writes into this buffer; encodePng() turns it into a PNG at the end.
const px = new Uint8Array(W * H * 3);

function fill(color: RGB): void {
  for (let i = 0; i < W * H; i++) {
    px[i * 3] = color[0];
    px[i * 3 + 1] = color[1];
    px[i * 3 + 2] = color[2];
  }
}

function setPixel(x: number, y: number, color: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = color[0];
  px[i + 1] = color[1];
  px[i + 2] = color[2];
}

function rect(x: number, y: number, w: number, h: number, color: RGB): void {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(W, x + w);
  const y1 = Math.min(H, y + h);
  for (let yy = y0; yy < y1; yy++) {
    let i = (yy * W + x0) * 3;
    for (let xx = x0; xx < x1; xx++) {
      px[i] = color[0];
      px[i + 1] = color[1];
      px[i + 2] = color[2];
      i += 3;
    }
  }
}

function hline(x: number, y: number, w: number, color: RGB): void {
  rect(x, y, w, 1, color);
}

function vline(x: number, y: number, h: number, color: RGB): void {
  rect(x, y, 1, h, color);
}

// Bresenham line, 1px wide.
function line(x0: number, y0: number, x1: number, y1: number, color: RGB): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    setPixel(x, y, color);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function disc(cx: number, cy: number, r: number, color: RGB): void {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) setPixel(cx + x, cy + y, color);
    }
  }
}

function ring(cx: number, cy: number, r: number, color: RGB): void {
  for (let a = 0; a < 360; a += 2) {
    const t = (a * Math.PI) / 180;
    setPixel(Math.round(cx + r * Math.cos(t)), Math.round(cy + r * Math.sin(t)), color);
  }
}

// Filled triangle.
function triangle(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, color: RGB): void {
  const minX = Math.max(0, Math.min(x0, x1, x2));
  const maxX = Math.min(W - 1, Math.max(x0, x1, x2));
  const minY = Math.max(0, Math.min(y0, y1, y2));
  const maxY = Math.min(H - 1, Math.max(y0, y1, y2));
  const d = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
  if (d === 0) return;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const a = ((x1 - x) * (y2 - y) - (y1 - y) * (x2 - x)) / d;
      const b = ((x2 - x) * (y0 - y) - (y2 - y) * (x0 - x)) / d;
      const c = 1 - a - b;
      if (a >= 0 && b >= 0 && c >= 0) setPixel(x, y, color);
    }
  }
}

// ------------------------------------------------------- deterministic PNG
// Minimal PNG writer: 8-bit RGB, no filtering, zlib level 9. The CRC table
// is built once from the standard polynomial; deflate of the same input
// always yields the same bytes, so two runs write identical files.
function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let value = n;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? (0xedb88320 ^ (value >>> 1)) >>> 0 : value >>> 1;
    }
    table[n] = value >>> 0;
  }
  return table;
}

const CRC_TABLE = buildCrcTable();

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(kind: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(kind, 4, 'ascii');
  data.copy(out, 8);
  const crcData = Buffer.concat([Buffer.from(kind, 'ascii'), data]);
  out.writeUInt32BE(crc32(crcData), 8 + data.length);
  return out;
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([magic, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------- 5x7 font
// Each glyph is 7 rows of 5 cells ('#' on, '.' off). Uppercase only, plus
// digits and the punctuation the copy uses. Drawn at integer scales.
type Glyph = [string, string, string, string, string, string, string];

const FONT: Record<string, Glyph> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#..##', '#.#.#', '##..#', '#...#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '...#.', '..#..', '..#..', '..#..'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '.##..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  ';': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.#...'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '#.##.', '#..##'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '&': ['.##..', '#..#.', '#..#.', '.#...', '#.#.#', '#..#.', '.##.#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  $: ['..#..', '.####', '#.#.#', '.#...', '..###', '...#.', '####.'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
};

// ------------------------------------------------------------- text engine
// One glyph cell is 5x7; a space between glyphs makes the advance 6 cells.
// Scales are integers so text stays crisp at any size.
function glyphWidth(scale: number): number {
  return 6 * scale;
}

function textWidth(text: string, scale: number): number {
  return text.length * glyphWidth(scale) - scale;
}

function drawChar(ch: string, x: number, y: number, scale: number, color: RGB): void {
  const g = FONT[ch];
  if (!g) return;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (g[row][col] === '#') {
        rect(x + col * scale, y + row * scale, scale, scale, color);
      }
    }
  }
}

function drawText(text: string, x: number, y: number, scale: number, color: RGB): void {
  for (let i = 0; i < text.length; i++) {
    drawChar(text[i], x + i * glyphWidth(scale), y, scale, color);
  }
}

function drawTextCentered(text: string, cx: number, y: number, scale: number, color: RGB): void {
  drawText(text, cx - Math.floor(textWidth(text, scale) / 2), y, scale, color);
}

// Word-wrap into lines that fit maxWidth pixels at the given scale.
function wrap(text: string, maxWidth: number, scale: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const word of words) {
    const trial = cur === '' ? word : cur + ' ' + word;
    if (textWidth(trial, scale) <= maxWidth) {
      cur = trial;
    } else {
      if (cur !== '') lines.push(cur);
      cur = word;
    }
  }
  if (cur !== '') lines.push(cur);
  return lines;
}

function drawLines(lines: string[], x: number, y: number, scale: number, color: RGB, leading: number): void {
  for (let i = 0; i < lines.length; i++) {
    drawText(lines[i], x, y + i * leading, scale, color);
  }
}

// --------------------------------------------------------------- pictograms
// Small flat scenes drawn from rectangles, discs, lines and triangles.
// Each one sits in its own panel and reads at a glance.

// Explosion burst: rays out of a bright core.
function burst(cx: number, cy: number, r: number, core: RGB, ray: RGB): void {
  for (let a = 0; a < 12; a++) {
    const t = (a * Math.PI) / 6;
    line(cx, cy, Math.round(cx + r * Math.cos(t)), Math.round(cy + r * Math.sin(t)), ray);
    line(cx, cy, Math.round(cx + (r * 0.7) * Math.cos(t + 0.26)), Math.round(cy + (r * 0.7) * Math.sin(t + 0.26)), ray);
  }
  disc(cx, cy, Math.max(3, Math.floor(r * 0.45)), core);
  disc(cx, cy, Math.max(2, Math.floor(r * 0.2)), LIGHT);
}

// Hero panel: night sky over Kyiv — missile trails arc down, bursts bloom
// over a dark skyline, a bridge silhouette spans the river at the bottom.
function heroScene(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, NIGHT);
  // stars
  const stars: Array<[number, number]> = [
    [0.08, 0.12], [0.2, 0.06], [0.35, 0.16], [0.5, 0.08], [0.62, 0.14],
    [0.74, 0.06], [0.86, 0.12], [0.94, 0.2], [0.12, 0.28], [0.44, 0.24],
  ];
  for (const [fx, fy] of stars) {
    disc(x + Math.floor(w * fx), y + Math.floor(h * fy), 2, LIGHT);
  }
  // missile trails arcing down from the top
  line(x + Math.floor(w * 0.2), y + 4, x + Math.floor(w * 0.3), y + Math.floor(h * 0.52), GOLD);
  line(x + Math.floor(w * 0.2) + 2, y + 4, x + Math.floor(w * 0.3) + 2, y + Math.floor(h * 0.52), GOLD);
  line(x + Math.floor(w * 0.62), y + 2, x + Math.floor(w * 0.55), y + Math.floor(h * 0.44), GOLD);
  line(x + Math.floor(w * 0.62) + 2, y + 2, x + Math.floor(w * 0.55) + 2, y + Math.floor(h * 0.44), GOLD);
  line(x + Math.floor(w * 0.88), y + 6, x + Math.floor(w * 0.78), y + Math.floor(h * 0.58), GOLD);
  // bursts over the skyline
  burst(x + Math.floor(w * 0.3), y + Math.floor(h * 0.55), 26, ORANGE, GOLD);
  burst(x + Math.floor(w * 0.55), y + Math.floor(h * 0.47), 20, ORANGE, GOLD);
  burst(x + Math.floor(w * 0.78), y + Math.floor(h * 0.61), 16, GOLD, ORANGE);
  // skyline + bridge over the river
  rect(x, y + Math.floor(h * 0.72), w, Math.floor(h * 0.1), [74, 92, 150]);
  rect(x + Math.floor(w * 0.1), y + Math.floor(h * 0.62), 26, Math.floor(h * 0.2), [74, 92, 150]);
  rect(x + Math.floor(w * 0.42), y + Math.floor(h * 0.58), 20, Math.floor(h * 0.24), [74, 92, 150]);
  rect(x + Math.floor(w * 0.66), y + Math.floor(h * 0.64), 30, Math.floor(h * 0.18), [74, 92, 150]);
  rect(x, y + Math.floor(h * 0.82), w, Math.floor(h * 0.18), SEA);
  line(x, y + Math.floor(h * 0.82), x + w, y + Math.floor(h * 0.82), LIGHT);
  // lit windows
  for (let i = 0; i < 8; i++) {
    disc(x + 14 + i * 38, y + Math.floor(h * 0.76), 2, GOLD);
  }
}

// Market panel: falling bars and a red down-trend arrow on a light panel.
function marketScene(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, PAPER_DIM);
  const base = y + h - 18;
  const tops = [0.82, 0.6, 0.66, 0.46, 0.52, 0.3, 0.38, 0.25];
  const bw = Math.floor((w - 24) / tops.length);
  for (let i = 0; i < tops.length; i++) {
    const bh = Math.floor((h - 40) * tops[i]);
    rect(x + 12 + i * bw, base - bh, bw - 6, bh, i < 4 ? BLUE : RED);
  }
  line(x + 12, base - Math.floor((h - 40) * 0.82), x + w - 12, base - Math.floor((h - 40) * 0.25), RED);
  line(x + w - 12, base - Math.floor((h - 40) * 0.25), x + w - 26, base - Math.floor((h - 40) * 0.25), RED);
  line(x + w - 12, base - Math.floor((h - 40) * 0.25), x + w - 12, base - Math.floor((h - 40) * 0.25) - 14, RED);
  hline(x, base, w, INK);
}

// ------------------------------------------------------------------- layout
const MX = 24; // page margin
const CW = W - 2 * MX; // content width

function rule(y: number, weight: number, color: RGB): void {
  rect(MX, y, CW, weight, color);
}

// One story block: red kicker, wrapped headline, a scene panel, wrapped deck.
// Returns the y just below the block.
function story(
  x: number,
  y: number,
  w: number,
  kicker: string,
  headline: string,
  headScale: number,
  scene: (x: number, y: number, w: number, h: number) => void,
  sceneH: number,
  deck: string,
): number {
  drawText(kicker, x, y, 2, RED);
  let cy = y + 16 + 4;
  const headLines = wrap(headline, w, headScale);
  drawLines(headLines, x, cy, headScale, INK, headScale * 7 + 5);
  cy += headLines.length * (headScale * 7 + 5) + 6;
  scene(x, cy, w, sceneH);
  cy += sceneH + 8;
  const deckLines = wrap(deck, w, 2);
  drawLines(deckLines, x, cy, 2, INK, 18);
  cy += deckLines.length * 18;
  return cy;
}

function main(): void {
  fill(PAPER);

  // Masthead
  drawTextCentered('THE WORLD TODAY', W / 2, 18, 7, INK);
  drawText('ONE DAY', MX, 40, 2, GREY);
  drawText('ONE PAGE', W - MX - textWidth('ONE PAGE', 2), 40, 2, GREY);
  rect(MX, 78, CW, 4, RED);
  rect(MX, 86, CW, 1, INK);
  drawTextCentered('SATURDAY, 21 NOVEMBER 2026', W / 2, 96, 3, INK);
  rule(122, 1, INK);

  // Hero: Russia's barrage, missiles land in Poland
  drawText('WAR IN EUROPE', MX, 134, 2, RED);
  const heroHead = wrap('MISSILES FALL ON POLAND AS RUSSIA HITS KYIV', 600, 4);
  drawLines(heroHead, MX, 158, 4, INK, 33);
  const heroDeck = wrap(
    'MORE THAN 400 DRONES AND 110 MISSILES RAIN ON UKRAINE OVERNIGHT. ' +
      'AT LEAST 8 KILLED IN KYIV. TWO MISSILES AND A SUSPECTED DRONE COME ' +
      'DOWN IN POLAND. WARSAW CALLS IT A DELIBERATE PROVOCATION.',
    600,
    2,
  );
  drawLines(heroDeck, MX, 232, 2, INK, 18);
  heroScene(648, 150, 352, 180);
  rule(344, 2, INK);

  // Row 2: markets + Iran
  const colW = Math.floor((CW - 24) / 2);
  story(
    MX,
    360,
    colW,
    'MARKETS',
    'AI ROUT DRAGS MARKETS INTO CORRECTION',
    3,
    marketScene,
    84,
    'S AND P 500 FALLS 3.7 PERCENT. NASDAQ DOWN 5.3 PERCENT AS CHIP AND AI SHARES SLIDE.',
  );
  story(
    MX + colW + 24,
    360,
    colW,
    'MIDDLE EAST',
    'IRAN SAYS IT DOWNED A U.S. MQ-9 DRONE',
    3,
    droneScene,
    84,
    'TEHRAN SAYS IT IS THE 58TH DOWNED OVER THE STRAIT OF HORMUZ. TRUMP WEIGHS NEW STRIKES.',
  );
  rule(592, 1, INK);

  // Row 3: COP31 + UK-EU + Peru
  const thirdW = Math.floor((CW - 48) / 3);
  story(
    MX,
    608,
    thirdW,
    'CLIMATE',
    'COP31 TALKS RUN PAST DEADLINE',
    2,
    globeScene,
    76,
    'ANTALYA SUMMIT DEADLOCKED OVER FOSSIL FUELS AS NEARLY 200 NATIONS FAIL TO AGREE.',
  );
  story(
    MX + thirdW + 24,
    608,
    thirdW,
    'EUROPE',
    "UK AND EU SIGN BIGGEST POST-BREXIT DEALS",
    2,
    flagsScene,
    76,
    'THREE AGREEMENTS ON FOOD, CARBON AND YOUTH MOBILITY SIGNED IN BRUSSELS.',
  );
  story(
    MX + 2 * (thirdW + 24),
    608,
    thirdW,
    'SOUTH AMERICA',
    "STRONG QUAKE SHAKES PERU'S ANDES",
    2,
    quakeScene,
    76,
    'A POWERFUL EARTHQUAKE STRIKES THE ANDES. RESIDENTS RUSH OUTDOORS.',
  );
  rule(836, 1, INK);

  // Also today strip
  drawText('ALSO TODAY', MX, 850, 2, RED);
  const alsoY = 874;
  const also = [
    'FBI PROBES REPORTED HACK OF ITS CRIMINAL DATABASE',
    'PANCREATIC CANCER PILL: TUMOURS UNDETECTABLE IN 1 IN 12 PATIENTS',
    'BAYER TO PAY $7.25BN TO SETTLE ROUNDUP COMPLAINTS',
  ];
  for (let i = 0; i < 3; i++) {
    const lines = wrap(also[i], thirdW, 2);
    drawLines(lines, MX + i * (thirdW + 24), alsoY, 2, INK, 18);
  }

  // Footer
  rule(956, 1, INK);
  drawTextCentered('ONE DAY. THE WHOLE WORLD. ONE PAGE. - ALL STORIES REPORTED ON 21 NOVEMBER 2026', W / 2, 970, 2, GREY);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'entry.png'), encodePng());
}

main();

// Drone panel: a small drone silhouette over wavy sea, with a red alert dot.
function droneScene(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, [214, 226, 232]);
  // sun haze
  disc(x + Math.floor(w * 0.78), y + Math.floor(h * 0.26), 22, GOLD);
  // sea waves
  for (let r = 0; r < 3; r++) {
    const wy = y + Math.floor(h * 0.68) + r * 14;
    for (let wx = x + 8; wx < x + w - 8; wx += 26) {
      line(wx, wy, wx + 12, wy, SEA);
    }
  }
  // drone body + rotors
  const cx = x + Math.floor(w * 0.42);
  const cy = y + Math.floor(h * 0.4);
  rect(cx - 26, cy - 5, 52, 10, INK);
  rect(cx - 8, cy + 5, 16, 8, INK);
  rect(cx - 40, cy - 9, 30, 3, GREY);
  rect(cx + 10, cy - 9, 30, 3, GREY);
  disc(cx - 42, cy - 8, 4, INK);
  disc(cx + 42, cy - 8, 4, INK);
  // alert dot
  disc(x + Math.floor(w * 0.86), y + Math.floor(h * 0.62), 7, RED);
  ring(x + Math.floor(w * 0.86), y + Math.floor(h * 0.62), 11, RED);
}

// Globe panel: a simple globe with latitude lines and a red marker.
function globeScene(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, PAPER_DIM);
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2) + 4;
  const r = Math.floor(Math.min(w, h) * 0.36);
  disc(cx, cy, r, SEA);
  ring(cx, cy, r, BLUE);
  // latitude bands
  for (const f of [-0.55, 0, 0.55]) {
    const yy = cy + Math.floor(r * f);
    const hw = Math.floor(Math.sqrt(Math.max(0, r * r - (r * f) * (r * f))));
    line(cx - hw, yy, cx + hw, yy, LIGHT);
  }
  // land blobs (abstract)
  disc(cx - Math.floor(r * 0.4), cy - Math.floor(r * 0.3), Math.floor(r * 0.28), GREEN);
  disc(cx + Math.floor(r * 0.35), cy + Math.floor(r * 0.25), Math.floor(r * 0.3), GREEN);
  disc(cx + Math.floor(r * 0.1), cy - Math.floor(r * 0.55), Math.floor(r * 0.16), GREEN);
  // marker
  disc(cx + Math.floor(r * 0.55), cy - Math.floor(r * 0.45), 5, RED);
}

// Flags panel: two abstract flags side by side, joined by a gold band.
function flagsScene(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, PAPER_DIM);
  const fh = Math.floor(h * 0.5);
  const fy = y + Math.floor(h * 0.22);
  const fw = Math.floor(w * 0.34);
  // left flag: blue field, white cross bars
  rect(x + 8, fy, fw, fh, BLUE);
  rect(x + 8 + Math.floor(fw / 2) - 3, fy, 6, fh, LIGHT);
  rect(x + 8, fy + Math.floor(fh / 2) - 3, fw, 6, LIGHT);
  // right flag: circle of stars on blue
  rect(x + w - 8 - fw, fy, fw, fh, [24, 42, 90]);
  for (let a = 0; a < 12; a++) {
    const t = (a * Math.PI) / 6;
    disc(
      x + w - 8 - Math.floor(fw / 2) + Math.floor((fw / 2 - 10) * Math.cos(t)),
      fy + Math.floor(fh / 2) + Math.floor((fh / 2 - 10) * Math.sin(t)),
      3,
      GOLD,
    );
  }
  // joining band
  rect(x + 8 + fw + 2, fy + Math.floor(fh / 2) - 4, w - 16 - 2 * fw - 4, 8, GOLD);
}

// Quake panel: mountain triangles with a red crack down the middle.
function quakeScene(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, PAPER_DIM);
  const base = y + h - 14;
  triangle(x + 6, base, x + Math.floor(w * 0.3), y + 12, x + Math.floor(w * 0.55), base, [96, 96, 100]);
  triangle(x + Math.floor(w * 0.4), base, x + Math.floor(w * 0.68), y + 26, x + Math.floor(w * 0.94), base, [70, 70, 76]);
  // snow caps
  triangle(x + Math.floor(w * 0.3) - 12, y + 26, x + Math.floor(w * 0.3), y + 12, x + Math.floor(w * 0.3) + 12, y + 26, LIGHT);
  triangle(x + Math.floor(w * 0.68) - 10, y + 38, x + Math.floor(w * 0.68), y + 26, x + Math.floor(w * 0.68) + 10, y + 38, LIGHT);
  // crack
  line(x + Math.floor(w * 0.52), y + 16, x + Math.floor(w * 0.48), y + Math.floor(h * 0.45), RED);
  line(x + Math.floor(w * 0.48), y + Math.floor(h * 0.45), x + Math.floor(w * 0.55), y + Math.floor(h * 0.7), RED);
  line(x + Math.floor(w * 0.55), y + Math.floor(h * 0.7), x + Math.floor(w * 0.5), base, RED);
  hline(x, base, w, INK);
}
