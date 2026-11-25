// news-image-20261124 v2 — "THE WORLD TODAY", evening edition.
// Fresh build, written from scratch in this session. Draws a dark broadsheet
// front page for Tuesday 24 November 2026: Huang returns to Nvidia, markets
// roar back, plus the day's other big stories across regions and fields.
// Node 22 stdlib only (fs, zlib). No network, no randomness, no timestamps:
// two runs write byte-identical PNGs. Output: 1024x1024 PNG, <= 1 MiB.
const fs = require("node:fs");
const zlib = require("node:zlib");

const W = 1024;
const H = 1024;

// ---- palette ---------------------------------------------------------------
const INK = [13, 20, 34]; // deep navy page background
const PANEL = [22, 34, 56]; // lighter panel
const GRID = [42, 54, 78]; // faint grid / border
const PAPER = [244, 241, 232]; // off-white main text
const MUTED = [158, 170, 188]; // grey-blue secondary text
const RED = [198, 16, 46]; // breaking-news red
const GOLD = [212, 175, 55]; // gold rules and kickers
const GREEN = [46, 204, 113]; // market green
const GREEN_DK = [27, 140, 74];

// ---- framebuffer -----------------------------------------------------------
const px = new Uint8Array(W * H * 3);
function fill(c) {
  for (let i = 0; i < W * H; i++) {
    px[i * 3] = c[0];
    px[i * 3 + 1] = c[1];
    px[i * 3 + 2] = c[2];
  }
}
function set(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}
function blend(x, y, c, a) {
  // alpha-blend colour c over the pixel at (x, y); a in [0, 1]
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = Math.round(px[i] * (1 - a) + c[0] * a);
  px[i + 1] = Math.round(px[i + 1] * (1 - a) + c[1] * a);
  px[i + 2] = Math.round(px[i + 2] * (1 - a) + c[2] * a);
}
function rect(x, y, w, h, c) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) set(i, j, c);
  }
}
function hline(x, y, w, c, t) {
  rect(x, y, w, t === undefined ? 1 : t, c);
}
function vline(x, y, h, c, t) {
  rect(x, y, t === undefined ? 1 : t, h, c);
}
function frame(x, y, w, h, c, t) {
  const th = t === undefined ? 1 : t;
  hline(x, y, w, c, th);
  hline(x, y + h - th, w, c, th);
  vline(x, y, h, c, th);
  vline(x + w - th, y, h, c, th);
}
function line(x0, y0, x1, y1, c, t) {
  // Bresenham line with square brush of side t
  const th = t === undefined ? 1 : t;
  const half = Math.floor(th / 2);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    rect(x - half, y - half, th, th, c);
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

// ---- PNG encoder (deterministic: fixed zlib level, no ancillary chunks) -----
const CRC_TABLE = (function () {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG() {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- 5x7 bitmap font (own glyphs, drawn from scratch) ----------------------
// Each glyph is 7 rows of 5 cells; "#" is ink, " " is empty.
const FONT = {
  A: [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  B: ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
  C: [" ### ", "#   #", "#    ", "#    ", "#    ", "#   #", " ### "],
  D: ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
  E: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
  F: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#    "],
  G: [" ### ", "#   #", "#    ", "#  ##", "#   #", "#   #", " ### "],
  H: ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  I: [" ### ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
  J: ["  ###", "   # ", "   # ", "   # ", "   # ", "#  # ", " ##  "],
  K: ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"],
  L: ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
  M: ["#   #", "## ##", "# # #", "# # #", "#   #", "#   #", "#   #"],
};
Object.assign(FONT, {
  N: ["#   #", "##  #", "# # #", "#  ##", "#   #", "#   #", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  P: ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
  Q: [" ### ", "#   #", "#   #", "#   #", "# # #", "#  # ", "  ## "],
  R: ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
  S: [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  V: ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
  W: ["#   #", "#   #", "#   #", "# # #", "# # #", "## ##", "#   #"],
  X: ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
  Y: ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
  Z: ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
  "0": [" ### ", "#  ##", "# # #", "# # #", "##  #", "#   #", " ### "],
  "1": ["  #  ", " ##  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
  "2": [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"],
  "3": ["#### ", "    #", "    #", " ### ", "    #", "    #", "#### "],
  "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "],
  "5": ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
  "6": [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "],
  "7": ["#####", "    #", "   # ", "   # ", "  #  ", "  #  ", "  #  "],
  "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "],
  "9": [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "],
  " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
  ".": ["     ", "     ", "     ", "     ", "     ", " ##  ", " ##  "],
  ",": ["     ", "     ", "     ", "     ", " ##  ", " ##  ", "#    "],
  ":": ["     ", " ##  ", " ##  ", "     ", " ##  ", " ##  ", "     "],
  "!": ["  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "     ", "  #  "],
  "?": [" ### ", "#   #", "    #", "   # ", "  #  ", "     ", "  #  "],
  "-": ["     ", "     ", "     ", "#####", "     ", "     ", "     "],
  "+": ["     ", "  #  ", "  #  ", "#####", "  #  ", "  #  ", "     "],
  "%": ["#   #", "#  # ", "  #  ", " #   ", "#  # ", "#   #", "     "],
  "/": ["    #", "    #", "   # ", "  #  ", " #   ", "#    ", "#    "],
  "(": ["   # ", "  #  ", " #   ", " #   ", " #   ", "  #  ", "   # "],
  ")": [" #   ", "  #  ", "   # ", "   # ", "   # ", "  #  ", " #   "],
  "'": ["  #  ", "  #  ", " #   ", "     ", "     ", "     ", "     "],
});

// ---- text drawing ----------------------------------------------------------
function textWidth(s, sc) {
  return s.length * 6 * sc - sc;
}
function drawText(x, y, s, sc, c) {
  for (let i = 0; i < s.length; i++) {
    const g = FONT[s[i]];
    if (!g) continue;
    const gx = x + i * 6 * sc;
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === "#") rect(gx + col * sc, y + r * sc, sc, sc, c);
      }
    }
  }
}
function drawTextCentered(cx, y, s, sc, c) {
  drawText(cx - Math.floor(textWidth(s, sc) / 2), y, s, sc, c);
}
function drawTextRight(rx, y, s, sc, c) {
  drawText(rx - textWidth(s, sc), y, s, sc, c);
}
function wrapLines(s, sc, maxW) {
  const words = s.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const test = cur === "" ? w : cur + " " + w;
    if (textWidth(test, sc) <= maxW || cur === "") {
      cur = test;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}
function drawWrappedCentered(cx, y, s, sc, maxW, c, leading) {
  const lines = wrapLines(s, sc, maxW);
  const lh = 7 * sc + (leading === undefined ? 8 : leading);
  lines.forEach((ln, i) => drawTextCentered(cx, y + i * lh, ln, sc, c));
  return lines.length;
}
function drawWrapped(x, y, s, sc, maxW, c, leading) {
  const lines = wrapLines(s, sc, maxW);
  const lh = 7 * sc + (leading === undefined ? 4 : leading);
  lines.forEach((ln, i) => drawText(x, y + i * lh, ln, sc, c));
  return lines.length;
}

// ---- composition -----------------------------------------------------------
// A dark "evening edition" front page. Big type throughout so the page still
// reads at ~300 px wide: masthead scale 7, hero headline scale 11, story
// headlines scale 2 (never smaller).
function drawPage() {
  fill(INK);

  // Breaking bar
  rect(0, 0, W, 58, RED);
  drawText(28, 14, "BREAKING", 4, PAPER);
  drawTextRight(W - 28, 20, "TUESDAY, 24 NOVEMBER 2026", 2, PAPER);

  // Masthead
  drawTextCentered(512, 84, "THE WORLD TODAY", 7, PAPER);
  hline(48, 150, 928, GOLD, 3);
  drawTextCentered(512, 166, "ALL THE DAY'S NEWS ON ONE PAGE", 2, MUTED);

  // Hero headline
  drawTextCentered(512, 206, "HUANG IS BACK", 11, PAPER);
  drawTextCentered(512, 296, "NVIDIA SOARS 35%", 8, GOLD);
  drawWrappedCentered(
    512,
    368,
    "WALL STREET POSTS ITS BEST DAY SINCE APRIL 2025 AS ITS CHIEF RETURNS",
    3,
    920,
    PAPER,
    8
  );

  // Chart panel: the rally after the return
  rect(48, 440, 928, 192, PANEL);
  frame(48, 440, 928, 192, GRID, 2);
  drawText(64, 454, "NVIDIA - THE RALLY AFTER THE RETURN", 2, PAPER);
  drawTextRight(960, 450, "+35%", 6, GREEN);
  // chart geometry
  const cx0 = 70;
  const cx1 = 780;
  const cyTop = 492;
  const cyBase = 604;
  const data = [3, 4, 5, 7, 10, 15, 22, 33, 48, 68, 100];
  const pts = data.map((v, i) => [
    Math.round(cx0 + (i * (cx1 - cx0)) / (data.length - 1)),
    Math.round(cyBase - (v / 100) * (cyBase - cyTop)),
  ]);
  // gridlines
  hline(cx0, cyTop, cx1 - cx0, GRID, 1);
  hline(cx0, Math.round((cyTop + cyBase) / 2), cx1 - cx0, GRID, 1);
  hline(cx0, cyBase, cx1 - cx0, GRID, 2);
  // area fill under the line
  for (let x = cx0; x <= cx1; x++) {
    let yLine = pts[pts.length - 1][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (x >= a[0] && x <= b[0]) {
        const f = b[0] === a[0] ? 0 : (x - a[0]) / (b[0] - a[0]);
        yLine = Math.round(a[1] + f * (b[1] - a[1]));
        break;
      }
    }
    for (let y = yLine; y <= cyBase; y++) blend(x, y, GREEN, 0.16);
  }
  // the rising line (thick so it still reads at ~300 px wide)
  for (let i = 0; i < pts.length - 1; i++) {
    line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], GREEN, 5);
  }
  rect(pts[pts.length - 1][0] - 4, pts[pts.length - 1][1] - 4, 9, 9, GREEN);
  drawText(cx0, 612, "MON 23 NOV", 2, MUTED);
  drawTextRight(cx1, 612, "TUE 24 NOV", 2, MUTED);
  // Wall Street closes, right column (under the big +35%)
  drawText(800, 500, "S AND P 7,237", 2, PAPER);
  drawText(800, 530, "NASDAQ 24,090", 2, PAPER);
  drawText(800, 560, "DOW 49,595", 2, PAPER);

  // Market ticker strip
  const tiles = [
    ["NVIDIA", "+35%"],
    ["S AND P", "+4.73%"],
    ["NASDAQ", "+6.51%"],
    ["DOW", "+3.01%"],
    ["NIKKEI", "+4.4%"],
  ];
  tiles.forEach((t, i) => {
    const tx = 48 + i * 194;
    rect(tx, 648, 186, 60, PANEL);
    frame(tx, 648, 186, 60, GRID, 1);
    drawTextCentered(tx + 93, 656, t[0], 2, MUTED);
    drawTextCentered(tx + 93, 678, t[1], 3, GREEN);
  });

  // Also today: six stories across regions and fields
  drawText(48, 726, "ALSO TODAY", 2, GOLD);
  hline(48, 746, 928, GOLD, 2);
  const stories = [
    ["EUROPE", "EU PROPOSES 22ND SANCTIONS PACKAGE ON RUSSIA"],
    ["UKRAINE", "NEW RUSSIAN STRIKES HIT KYIV REGION, SEVERAL MISSING"],
    ["INDONESIA", "BANTEN FACTORY FIRE KILLS WORKERS AS RESCUE GOES ON"],
    ["MIDDLE EAST", "IRAN WARNS OF RESPONSE TO US SEA BLOCKADE"],
    ["WORLD COURT", "ICJ: MYANMAR COMMITTED GENOCIDE AGAINST ROHINGYA"],
    ["EUROPE", "LISBON MARCHES OVER COST OF LIVING"],
  ];
  stories.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 48 + col * 488;
    const sy = 762 + row * 76;
    rect(sx, sy + 2, 10, 10, RED);
    drawText(sx + 18, sy, s[0], 2, GOLD);
    drawWrapped(sx + 18, sy + 22, s[1], 2, 422, PAPER, 4);
  });

  // Footer
  hline(48, 986, 928, GRID, 1);
  drawTextCentered(512, 998, "THE WORLD TODAY | TUESDAY, 24 NOVEMBER 2026", 2, MUTED);
}

function main() {
  drawPage();
  const out =
    process.argv[2] ||
    (fs.existsSync("/output") ? "/output/entry.png" : "entry.png");
  const buf = encodePNG();
  fs.writeFileSync(out, buf);
  console.log("wrote " + out + " " + buf.length + " bytes");
}

main();
