// THE WORLD TODAY — one-page newspaper of Sunday 22 November 2026.
// Draws a 1024x1024 front page with a pure-TypeScript PNG writer and a
// hand-built 5x7 bitmap font. Node 22 stdlib only, no network, fully
// deterministic: the same run always writes the same bytes.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------- PNG ----
// CRC-32 (IEEE) table, built once at load.
const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

function encodePng(w: number, h: number, rgb: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type 2 = truecolour RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0; // filter: none
    raw.set(rgb.subarray(y * w * 3, (y + 1) * w * 3), y * (1 + w * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ------------------------------------------------------------- Canvas ----
export type RGB = [number, number, number];

class Canvas {
  readonly w: number;
  readonly h: number;
  readonly px: Uint8Array; // RGB rows
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.px = new Uint8Array(w * h * 3);
  }
  fill(c: RGB): void {
    for (let i = 0; i < this.px.length; i += 3) {
      this.px[i] = c[0];
      this.px[i + 1] = c[1];
      this.px[i + 2] = c[2];
    }
  }
  set(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.px[i] = c[0];
    this.px[i + 1] = c[1];
    this.px[i + 2] = c[2];
  }
  rect(x: number, y: number, w: number, h: number, c: RGB): void {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) this.set(xx, yy, c);
  }
  hline(x0: number, x1: number, y: number, c: RGB): void {
    for (let x = x0; x <= x1; x++) this.set(x, y, c);
  }
  vline(x: number, y0: number, y1: number, c: RGB): void {
    for (let y = y0; y <= y1; y++) this.set(x, y, c);
  }
  // Bresenham line.
  line(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      this.set(x, y, c);
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
  // Filled circle.
  disc(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = cy - r; y <= cy + r; y++) {
      const dy = y - cy;
      const hw = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)));
      for (let x = cx - hw; x <= cx + hw; x++) this.set(x, y, c);
    }
  }
  // Circle outline, 1px.
  ring(cx: number, cy: number, r: number, c: RGB): void {
    for (let a = 0; a < 360; a += 1) {
      const rad = (a * Math.PI) / 180;
      this.set(Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), c);
    }
  }
  // Filled triangle (scanline over the bounding box).
  tri(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, c: RGB): void {
    const minX = Math.min(x0, x1, x2);
    const maxX = Math.max(x0, x1, x2);
    const minY = Math.min(y0, y1, y2);
    const maxY = Math.max(y0, y1, y2);
    const d = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    if (d === 0) return;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const a = ((x - x0) * (y2 - y0) - (y - y0) * (x2 - x0)) / d;
        const b = ((x1 - x0) * (y - y0) - (y1 - y0) * (x - x0)) / d;
        if (a >= 0 && b >= 0 && a + b <= 1) this.set(x, y, c);
      }
    }
  }
  // Filled ellipse via scaled disc sampling.
  ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB): void {
    for (let y = cy - ry; y <= cy + ry; y++) {
      const t = (y - cy) / ry;
      const hw = Math.floor(rx * Math.sqrt(Math.max(0, 1 - t * t)));
      for (let x = cx - hw; x <= cx + hw; x++) this.set(x, y, c);
    }
  }
}

// Palette: newsprint.
const PAPER: RGB = [247, 242, 231];
const PAPER2: RGB = [238, 231, 214];
const INK: RGB = [17, 17, 17];
const GREY: RGB = [90, 86, 76];
const RED: RGB = [176, 32, 32];
const BLUE: RGB = [30, 78, 140];
const TEAL: RGB = [14, 107, 92];
const GOLD: RGB = [196, 148, 44];
const SKY: RGB = [135, 190, 220];
const SEA: RGB = [46, 110, 150];
const GREEN: RGB = [52, 110, 62];

// ------------------------------------------------------------- Font ------
// Hand-built 5x7 bitmap font. Each glyph is 7 rows of 5 bits ("#" on).
// Uppercase only (newspaper style), plus digits and punctuation.
const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  '"': ["01010", "01010", "00000", "00000", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  "\u2014": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"], // em dash
  "\u2022": ["00000", "00000", "01100", "01100", "01100", "00000", "00000"], // bullet
};

const GLYPH_W = 5;
const GLYPH_H = 7;
const GLYPH_ADV = 6; // advance per char at scale 1

function glyphOf(ch: string): string[] {
  return GLYPHS[ch] ?? GLYPHS["?"];
}

// Draw one glyph with its top-left at (x, y), scaled by s.
function drawGlyph(cv: Canvas, x: number, y: number, s: number, c: RGB, ch: string): void {
  const g = glyphOf(ch);
  for (let r = 0; r < GLYPH_H; r++) {
    for (let col = 0; col < GLYPH_W; col++) {
      if (g[r][col] === "1") cv.rect(x + col * s, y + r * s, s, s, c);
    }
  }
}

function textWidth(text: string, s: number): number {
  if (text.length === 0) return 0;
  return text.length * GLYPH_ADV * s - s;
}

function drawText(cv: Canvas, x: number, y: number, s: number, c: RGB, text: string): number {
  let cx = x;
  for (const ch of text) {
    drawGlyph(cv, cx, y, s, c, ch);
    cx += GLYPH_ADV * s;
  }
  return cx - x;
}

function drawTextCentred(cv: Canvas, cx: number, y: number, s: number, c: RGB, text: string): void {
  drawText(cv, cx - Math.floor(textWidth(text, s) / 2), y, s, c, text);
}

// Greedy word wrap; returns lines that fit maxW pixels at scale s.
function wrapText(text: string, maxW: number, s: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const cand = cur === "" ? w : cur + " " + w;
    if (textWidth(cand, s) <= maxW || cur === "") {
      cur = cand;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

// Draw wrapped text; returns the y just below the last line.
function drawPara(cv: Canvas, x: number, y: number, maxW: number, s: number, lh: number, c: RGB, text: string): number {
  const lines = wrapText(text, maxW, s);
  let yy = y;
  for (const ln of lines) {
    drawText(cv, x, yy, s, c, ln);
    yy += lh;
  }
  return yy;
}

// -------------------------------------------------------- Pictograms ----
// Small drawn scenes that make each story readable from its picture alone.
// All coordinates are local to the pictogram box (x, y, w, h).

function picGlobe(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // Rising sun behind a globe: COP31 climate talks in Antalya.
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h * 0.52);
  const r = Math.floor(Math.min(w, h) * 0.34);
  cv.disc(cx, cy - 8, r + 26, GOLD); // sun glow
  cv.disc(cx, cy - 8, r + 14, [226, 178, 80]);
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    cv.line(
      Math.round(cx + (r + 20) * Math.cos(a)), Math.round(cy - 8 + (r + 20) * Math.sin(a)),
      Math.round(cx + (r + 30) * Math.cos(a)), Math.round(cy - 8 + (r + 30) * Math.sin(a)),
      GOLD,
    );
  }
  cv.disc(cx, cy, r, SEA); // ocean
  cv.ellipse(cx - 14, cy - 12, 20, 10, GREEN); // land mass
  cv.ellipse(cx + 16, cy + 12, 16, 9, GREEN);
  cv.ellipse(cx + 4, cy - 26, 10, 6, GREEN);
  cv.ring(cx, cy, r, INK); // globe outline
  cv.line(cx - r, cy, cx + r, cy, INK); // equator
  cv.line(cx, cy - r, cx, cy + r, INK); // meridian
  cv.ellipse(cx, cy, Math.floor(r * 0.55), r, INK); // second meridian (outline only trick below)
  // redraw ocean inside the ellipse outline so only the curve shows
  cv.disc(cx, cy, r - 2, SEA);
  cv.ellipse(cx - 14, cy - 12, 20, 10, GREEN);
  cv.ellipse(cx + 16, cy + 12, 16, 9, GREEN);
  cv.ellipse(cx + 4, cy - 26, 10, 6, GREEN);
  cv.ring(cx, cy, r, INK);
  cv.line(cx - r, cy, cx + r, cy, INK);
  // ground line + tiny conference flags
  cv.hline(x + 8, x + w - 8, y + h - 6, INK);
  for (let i = 0; i < 3; i++) {
    const fx = x + 24 + i * 26;
    cv.vline(fx, y + h - 30, y + h - 6, INK);
    cv.tri(fx, y + h - 30, fx, y + h - 20, fx + 14, y + h - 25, [RED, TEAL, BLUE][i]);
  }
}

function picShip(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // Cargo ship on waves, a drone above it.
  const by = y + Math.floor(h * 0.62);
  cv.rect(x + 8, by - 26, 64, 10, RED); // hull
  cv.tri(x + 8, by - 26, x + 8, by - 16, x + 22, by - 16, RED);
  cv.tri(x + 72, by - 26, x + 72, by - 16, x + 60, by - 16, RED);
  cv.rect(x + 20, by - 40, 34, 14, BLUE); // containers
  cv.rect(x + 26, by - 40, 2, 14, PAPER);
  cv.rect(x + 38, by - 40, 2, 14, PAPER);
  cv.rect(x + 50, by - 40, 2, 14, PAPER);
  cv.rect(x + 56, by - 52, 10, 12, INK); // bridge
  for (let i = 0; i < 3; i++) {
    const wy = by + 2 + i * 8;
    cv.line(x + 4 + i * 6, wy, x + 20 + i * 6, wy, SEA);
    cv.line(x + 40 + i * 4, wy + 3, x + 62 + i * 4, wy + 3, SEA);
  }
  // Drone: small cross with spinning rotors, above the ship.
  const dx = x + w - 26;
  const dy = y + 10;
  cv.disc(dx, dy, 4, INK);
  cv.line(dx - 10, dy - 6, dx + 10, dy - 6, INK);
  cv.line(dx - 10, dy + 6, dx + 10, dy + 6, INK);
  cv.line(dx - 10, dy - 6, dx - 10, dy + 6, INK);
  cv.line(dx + 10, dy - 6, dx + 10, dy + 6, INK);
  cv.line(dx, dy + 4, dx + 8, by - 40, RED); // strike line to the ship
  cv.disc(dx + 8, by - 40, 3, RED);
}

function picBorder(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // Closed border: fence posts, a striped barrier bar, a stop sign.
  const gy = y + h - 10;
  for (let i = 0; i < 5; i++) {
    const px = x + 6 + i * 16;
    cv.vline(px, y + 8, gy, INK);
    cv.line(px - 2, y + 8, px + 2, y + 8, INK);
  }
  cv.hline(x + 4, x + w - 6, y + 16, INK);
  cv.hline(x + 4, x + w - 6, y + 30, INK);
  // diagonal barrier bar across the fence
  cv.line(x + 2, y + 44, x + w - 4, y + 22, RED);
  cv.line(x + 2, y + 48, x + w - 4, y + 26, RED);
  for (let i = 0; i < 4; i++) {
    const bx = x + 12 + i * 18;
    cv.rect(bx, y + 40 - Math.floor(i * 0), 8, 6, [PAPER, RED][i % 2]);
  }
  // stop octagon (square + cut corners)
  const sx = x + w - 24;
  const sy = y + 44;
  cv.rect(sx, sy, 18, 18, RED);
  cv.tri(sx, sy, sx + 5, sy, sx, sy + 5, PAPER);
  cv.tri(sx + 18, sy, sx + 13, sy, sx + 18, sy + 5, PAPER);
  cv.tri(sx, sy + 18, sx + 5, sy + 18, sx, sy + 13, PAPER);
  cv.tri(sx + 18, sy + 18, sx + 13, sy + 18, sx + 18, sy + 13, PAPER);
  cv.rect(sx + 4, sy + 8, 10, 2, PAPER);
}

function picGavel(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // Judge's gavel over a document: the ICJ ruling.
  cv.line(x + 14, y + 52, x + 58, y + 8, INK); // handle
  cv.line(x + 16, y + 52, x + 60, y + 10, INK);
  cv.rect(x + 44, y + 4, 26, 12, INK); // gavel head
  cv.rect(x + 40, y + 2, 4, 16, INK);
  cv.rect(x + 70, y + 2, 4, 16, INK);
  cv.rect(x + 8, y + 56, 44, 5, INK); // sound block
  // document with lines
  cv.rect(x + 56, y + 40, 30, 24, PAPER);
  cv.rect(x + 56, y + 40, 30, 24, INK); // fill then redraw paper inset below
  cv.rect(x + 57, y + 41, 28, 22, PAPER);
  for (let i = 0; i < 4; i++) cv.hline(x + 60, x + 82, y + 46 + i * 4, INK);
  cv.disc(x + 22, y + 16, 9, GOLD); // seal
  cv.ring(x + 22, y + 16, 9, INK);
}

function picDocument(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // A signed deal document with a big "20" — the Iran deal.
  cv.rect(x + 18, y + 6, 46, 56, PAPER);
  cv.rect(x + 18, y + 6, 46, 56, INK);
  cv.rect(x + 19, y + 7, 44, 54, PAPER);
  cv.rect(x + 18, y + 6, 46, 3, BLUE); // header band
  for (let i = 0; i < 5; i++) cv.hline(x + 24, x + 58, y + 16 + i * 6, GREY);
  drawText(cv, x + 22, y + 42, 2, RED, "20");
  cv.line(x + 24, y + 56, x + 40, y + 50, INK); // signature squiggle
  cv.line(x + 40, y + 50, x + 46, y + 58, INK);
  cv.line(x + 46, y + 58, x + 56, y + 52, INK);
  cv.disc(x + 66, y + 12, 5, RED); // seal dot
}

function picBoat(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // Capsized boat: hull upside down in waves, lifebuoy floating.
  const wy = y + Math.floor(h * 0.55);
  cv.tri(x + 10, wy, x + 66, wy, x + 38, wy - 22, RED); // upturned hull
  cv.rect(x + 10, wy, 56, 4, RED);
  cv.rect(x + 30, wy - 22, 16, 4, INK);
  for (let i = 0; i < 3; i++) {
    const yy = wy + 8 + i * 8;
    cv.line(x + 4 + i * 8, yy, x + 24 + i * 8, yy, SEA);
    cv.line(x + 44 + i * 4, yy + 3, x + 68 + i * 4, yy + 3, SEA);
  }
  // lifebuoy ring
  const bx = x + w - 22;
  const by = wy + 16;
  cv.ring(bx, by, 11, RED);
  cv.ring(bx, by, 6, RED);
  cv.disc(bx - 8, by - 8, 2, RED);
  cv.disc(bx + 8, by + 8, 2, RED);
  cv.disc(bx + 8, by - 8, 2, RED);
  cv.disc(bx - 8, by + 8, 2, RED);
}

function picPlane(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // Airliner silhouette + warning triangle.
  const cy = y + Math.floor(h * 0.45);
  cv.ellipse(x + 34, cy, 30, 7, BLUE); // fuselage
  cv.tri(x + 4, cy, x + 20, cy - 4, x + 20, cy + 4, BLUE); // tail cone
  cv.tri(x + 28, cy - 4, x + 44, cy - 20, x + 48, cy - 4, BLUE); // wing up
  cv.tri(x + 28, cy + 4, x + 40, cy + 14, x + 44, cy + 4, BLUE); // wing down
  cv.tri(x + 8, cy - 4, x + 12, cy - 16, x + 16, cy - 4, BLUE); // tail fin
  for (let i = 0; i < 3; i++) cv.rect(x + 24 + i * 10, cy - 2, 5, 4, PAPER); // windows
  cv.line(x + 6, cy + 16, x + 74, cy + 16, GREY); // flight line
  cv.line(x + 6, cy + 16, x + 14, cy + 12, GREY);
  // warning triangle
  const tx = x + w - 24;
  const ty = y + h - 26;
  cv.tri(tx, ty, tx + 20, ty, tx + 10, ty - 18, GOLD);
  cv.rect(tx + 9, ty - 13, 2, 8, INK);
  cv.rect(tx + 9, ty - 3, 2, 2, INK);
}

function picDove(cv: Canvas, x: number, y: number, w: number, h: number): void {
  // White dove with an olive branch: ceasefire call.
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2);
  cv.ellipse(cx, cy, 16, 9, PAPER); // body
  cv.disc(cx + 14, cy - 8, 6, PAPER); // head
  cv.tri(cx + 19, cy - 10, cx + 28, cy - 7, cx + 19, cy - 5, GOLD); // beak
  cv.disc(cx + 15, cy - 10, 1, INK); // eye
  cv.tri(cx - 12, cy - 6, cx + 2, cy - 16, cx + 6, cy - 4, PAPER); // raised wing
  cv.line(cx - 2, cy - 16, cx + 8, cy - 22, PAPER);
  cv.tri(cx - 16, cy + 2, cx - 4, cy + 2, cx - 14, cy + 10, PAPER); // tail
  cv.line(cx + 22, cy + 4, cx + 34, cy + 10, GREEN); // branch
  cv.disc(cx + 28, cy + 6, 3, GREEN);
  cv.disc(cx + 32, cy + 10, 3, GREEN);
}

// ------------------------------------------------------------ Layout -----
const W = 1024;
const H = 1024;
const MARGIN = 28;

function rule(cv: Canvas, x0: number, x1: number, y: number, thick: number, c: RGB): void {
  for (let i = 0; i < thick; i++) cv.hline(x0, x1, y + i, c);
}

function masthead(cv: Canvas): void {
  // Top double rule, big name, date line, tagline.
  rule(cv, MARGIN, W - MARGIN, 14, 3, INK);
  rule(cv, MARGIN, W - MARGIN, 20, 1, INK);
  drawTextCentred(cv, W / 2, 30, 8, INK, "THE WORLD TODAY");
  rule(cv, MARGIN, W - MARGIN, 100, 1, INK);
  drawText(cv, MARGIN, 108, 2, RED, "SUNDAY, 22 NOVEMBER 2026");
  const right = "WORLD EDITION  •  ONE DAY, ONE PAGE";
  drawText(cv, W - MARGIN - textWidth(right, 2), 108, 2, INK, right);
  rule(cv, MARGIN, W - MARGIN, 126, 2, INK);
}

type Story = {
  kicker: string;
  kickerColor: RGB;
  headline: string;
  body: string;
  pic: (cv: Canvas, x: number, y: number, w: number, h: number) => void;
};

function hero(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.rect(x, y, w, h, PAPER2);
  const tx = x + 20;
  const tw = 560; // text column
  drawText(cv, tx, y + 16, 2, RED, "CLIMATE  •  COP31  •  ANTALYA, TURKEY");
  drawText(cv, tx, y + 42, 5, INK, "COP31 NEARS");
  drawText(cv, tx, y + 78, 5, INK, "FINAL DEAL");
  rule(cv, tx, tx + 120, y + 122, 3, RED);
  drawPara(
    cv, tx, y + 136, tw, 2, 20, INK,
    "DELEGATES WERE HANDED A NEW DRAFT DEAL IN THE EARLY HOURS OF SUNDAY AND MEET AT 06:00 GMT TO APPROVE IT, TWO DAYS AFTER FRIDAY'S DEADLINE.",
  );
  drawPara(
    cv, tx, y + 216, tw, 2, 20, GREY,
    "THE PACKAGE AIMS TO CLOSE THE SUMMIT WITH AGREEMENT AFTER A WEEK OF TALKS THAT RAN LONG INTO THE WEEKEND.",
  );
  // Globe scene on the right.
  picGlobe(cv, x + w - 330, y + 14, 310, h - 28);
}

function storyCell(cv: Canvas, x: number, y: number, w: number, h: number, s: Story): void {
  cv.rect(x, y, w, 3, s.kickerColor);
  const px = x + w - 92; // pictogram box at top right
  const py = y + 12;
  s.pic(cv, px, py, 88, 66);
  const tx = x + 12;
  const tw = w - 112;
  drawText(cv, tx, y + 14, 2, s.kickerColor, s.kicker);
  const afterHead = drawPara(cv, tx, y + 36, tw, 3, 26, INK, s.headline);
  drawPara(cv, tx, afterHead + 4, w - 24, 2, 19, INK, s.body);
  cv.rect(x, y + h - 1, w, 1, GREY);
}

function alsoStrip(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.rect(x, y, w, h, INK);
  picDove(cv, x + 2, y + 4, 52, h - 8);
  drawText(cv, x + 70, y + 7, 2, GOLD, "ALSO TODAY —");
  drawText(cv, x + 70, y + 25, 2, PAPER, "MELANIA TRUMP AGAIN URGES RUSSIA-UKRAINE CEASEFIRE BEFORE CHRISTMAS");
}

// ------------------------------------------------------------- Stories ---
// Every story below happened, or was first reported, on Sunday 22 Nov 2026.
const STORIES: Story[] = [
  {
    kicker: "BALTIC SEA",
    kickerColor: BLUE,
    headline: "DRONE STRIKE HITS RUSSIAN CARGO SHIP",
    body: "A RUSSIAN CARGO SHIP WAS HIT BY DRONES IN THE BALTIC SEA. FINLAND TIGHTENED SECURITY IN RESPONSE.",
    pic: picShip,
  },
  {
    kicker: "ESTONIA",
    kickerColor: RED,
    headline: "ESTONIA CLOSES ITS BORDER WITH RUSSIA",
    body: "TALLINN SHUT ITS BORDER CROSSINGS WITH RUSSIA AS TENSIONS RISE ALONG THE FRONTIER.",
    pic: picBorder,
  },
  {
    kicker: "UNITED NATIONS",
    kickerColor: TEAL,
    headline: "FRANCE URGES UN ACTION ON MYANMAR",
    body: "PARIS ASKED THE SECURITY COUNCIL TO ACT AFTER MYANMAR REJECTED THE WORLD COURT RULING ON THE ROHINGYA.",
    pic: picGavel,
  },
  {
    kicker: "UNITED STATES",
    kickerColor: BLUE,
    headline: "TRUMP: IRAN DEAL COULD LAST 20 YEARS",
    body: "THE PRESIDENT SAID A DEAL WITH TEHRAN COULD HOLD FOR TWO DECADES, AND SPOKE OF REGIME CHANGE AS THE END GOAL.",
    pic: picDocument,
  },
  {
    kicker: "NIGERIA",
    kickerColor: RED,
    headline: "24 DEAD AS BOAT CAPSIZES IN NIGERIA",
    body: "AT LEAST 24 PEOPLE DIED WHEN A BOAT OVERTURNED. RESCUERS SEARCHED THE RIVER FOR SURVIVORS.",
    pic: picBoat,
  },
  {
    kicker: "AVIATION",
    kickerColor: TEAL,
    headline: "US AIRLINES WARNED OF TERROR THREAT",
    body: "CARRIERS WERE WARNED OF A POSSIBLE AL-QAEDA-LINKED ATTACK PLOT AHEAD OF THANKSGIVING TRAVEL.",
    pic: picPlane,
  },
];

// -------------------------------------------------------------- Render ---
function render(): Canvas {
  const cv = new Canvas(W, H);
  cv.fill(PAPER);
  masthead(cv);
  // Hero: COP31.
  hero(cv, MARGIN, 138, W - 2 * MARGIN, 280);
  // Section label.
  drawText(cv, MARGIN, 432, 2, RED, "THE REST OF THE DAY");
  rule(cv, MARGIN, W - MARGIN, 454, 1, INK);
  // Grid: 3 columns x 2 rows.
  const cols = 3;
  const rows = 2;
  const gap = 16;
  const cellW = Math.floor((W - 2 * MARGIN - (cols - 1) * gap) / cols);
  const cellH = 236;
  const y0 = 468;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const s = STORIES[r * cols + c];
      storyCell(cv, MARGIN + c * (cellW + gap), y0 + r * (cellH + 12), cellW, cellH, s);
    }
  }
  // Bottom strip: Melania Trump ceasefire call.
  alsoStrip(cv, MARGIN, 960, W - 2 * MARGIN, 48);
  // Footer hairline.
  drawTextCentred(cv, W / 2, 1012, 1, GREY, "THE WORLD TODAY  •  SUNDAY 22 NOVEMBER 2026");
  return cv;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const cv = render();
  const png = encodePng(cv.w, cv.h, cv.px);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.png"), png);
}

main();
