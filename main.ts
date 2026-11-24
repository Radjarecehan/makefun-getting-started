// THE WORLD TODAY — a one-page newspaper summing up Tuesday, 24 November 2026.
// Entry program for the make.fun competition "news-image-20261124".
// Node 22, standard library only, no network. Fully deterministic: every run
// writes exactly the same bytes to /output/entry.png (1024x1024 PNG, <= 1 MiB).
// The image is drawn from scratch here: a small software rasteriser, a 5x7
// bitmap font, and a hand-rolled PNG encoder (zlib comes from node:zlib).

(async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const zlib = await import("node:zlib");

  // ------------------------------------------------------------------
  // CRC32, as PNG chunk checksums require.
  // ------------------------------------------------------------------
  const CRC_TABLE = (() => {
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table.push(c >>> 0);
    }
    return table;
  })();

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function pngChunk(type, data) {
    const out = Buffer.alloc(12 + data.length);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, "ascii");
    data.copy(out, 8);
    const crcData = Buffer.concat([Buffer.from(type, "ascii"), data]);
    out.writeUInt32BE(crc32(crcData), 8 + data.length);
    return out;
  }

  // Encode an RGB framebuffer (Uint8Array, 3 bytes per pixel, row-major)
  // as a PNG with filter type 0 on every scanline.
  function encodePNG(width, height, rgb) {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // colour type: truecolour RGB
    ihdr[10] = 0; // compression
    ihdr[11] = 0; // filter
    ihdr[12] = 0; // interlace: none
    const stride = width * 3;
    const raw = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y++) {
      raw[y * (stride + 1)] = 0; // filter: none
      Buffer.from(rgb.buffer, rgb.byteOffset + y * stride, stride).copy(
        raw,
        y * (stride + 1) + 1
      );
    }
    const idat = zlib.deflateSync(raw, { level: 9 });
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    return Buffer.concat([
      signature,
      pngChunk("IHDR", ihdr),
      pngChunk("IDAT", idat),
      pngChunk("IEND", Buffer.alloc(0)),
    ]);
  }

  // ------------------------------------------------------------------
  // Framebuffer and drawing primitives.
  // ------------------------------------------------------------------
  const W = 1024;
  const H = 1024;
  const px = new Uint8Array(W * H * 3);

  const PAPER = [248, 244, 233];
  const INK = [22, 19, 14];
  const RED = [179, 35, 27];
  const NAVY = [16, 36, 62];
  const NAVY_LINE = [43, 79, 116];
  const PANEL_SUB = [159, 194, 232];
  const CHART_GREEN = [53, 212, 101];
  const CHART_FILL = [18, 58, 38];
  const WHITE = [255, 255, 255];
  const BOX_BG = [255, 253, 246];
  const BOX_BORDER = [186, 178, 152];
  const GRAY = [96, 90, 74];

  function setPx(x, y, color) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    px[i] = color[0];
    px[i + 1] = color[1];
    px[i + 2] = color[2];
  }

  function fillAll(color) {
    for (let i = 0; i < W * H; i++) {
      px[i * 3] = color[0];
      px[i * 3 + 1] = color[1];
      px[i * 3 + 2] = color[2];
    }
  }

  function fillRect(x, y, w, h, color) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(W, Math.floor(x + w));
    const y1 = Math.min(H, Math.floor(y + h));
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

  function strokeRect(x, y, w, h, t, color) {
    fillRect(x, y, w, t, color);
    fillRect(x, y + h - t, w, t, color);
    fillRect(x, y, t, h, color);
    fillRect(x + w - t, y, t, h, color);
  }

  // Thick line via Bresenham, stamping a square brush of radius r.
  function drawLine(x0, y0, x1, y1, r, color) {
    let dx = Math.abs(x1 - x0);
    let dy = -Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    for (;;) {
      for (let oy = -r; oy <= r; oy++) {
        for (let ox = -r; ox <= r; ox++) setPx(x + ox, y + oy, color);
      }
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

  // ------------------------------------------------------------------
  // 5x7 bitmap font. Each glyph is 7 rows of 5 bits, drawn as strings.
  // ------------------------------------------------------------------
  const FONT = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    D: ["11100", "10010", "10001", "10001", "10001", "10010", "11100"],
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
    W: ["10001", "10001", "10001", "10001", "10101", "10101", "01010"],
    X: ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
    Y: ["10001", "01010", "00100", "00100", "00100", "00100", "00100"],
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
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
    "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
    '"': ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
    "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
    "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
    "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
    ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
    ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
    ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
    "•": ["00000", "00000", "01110", "01110", "01110", "00000", "00000"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };

  // ------------------------------------------------------------------
  // Text engine. Advance is 6 units per character at the given scale;
  // a glyph cell is 5x7 units. Bold = a second pass shifted right.
  // ------------------------------------------------------------------
  function normalizeText(text) {
    return String(text)
      .toUpperCase()
      .replace(/’/g, "'")
      .replace(/“/g, '"')
      .replace(/”/g, '"')
      .replace(/–/g, "-")
      .replace(/—/g, "-");
  }

  function textWidth(text, scale) {
    const t = normalizeText(text);
    if (t.length === 0) return 0;
    return t.length * 6 * scale - scale;
  }

  function drawChar(x, y, ch, scale, color, bold) {
    const glyph = FONT[ch] || FONT[" "];
    const shift = bold ? Math.max(1, Math.floor(scale / 2)) : 0;
    for (let row = 0; row < 7; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col++) {
        if (bits[col] === "1") {
          fillRect(x + col * scale, y + row * scale, scale, scale, color);
          if (bold) {
            fillRect(
              x + col * scale + shift,
              y + row * scale,
              scale,
              scale,
              color
            );
          }
        }
      }
    }
  }

  function drawText(x, y, text, scale, color, bold) {
    const t = normalizeText(text);
    let cx = x;
    for (const ch of t) {
      drawChar(cx, y, ch, scale, color, bold);
      cx += 6 * scale;
    }
    return cx - x - (t.length ? scale : 0);
  }

  function drawTextCentered(centerX, y, text, scale, color, bold) {
    const w = textWidth(text, scale);
    return drawText(Math.round(centerX - w / 2), y, text, scale, color, bold);
  }

  function drawTextRight(rightX, y, text, scale, color, bold) {
    const w = textWidth(text, scale);
    return drawText(rightX - w, y, text, scale, color, bold);
  }

  // Greedy word wrap to a maximum number of characters per line.
  function wrapText(text, maxChars) {
    const words = normalizeText(text).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      if (line === "") {
        line = word;
      } else if (line.length + 1 + word.length <= maxChars) {
        line += " " + word;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line !== "") lines.push(line);
    return lines;
  }

  // Draw a wrapped paragraph; returns the y just past the last line.
  function drawPara(x, y, text, scale, color, maxChars, lineStep, maxLines) {
    const lines = wrapText(text, maxChars).slice(0, maxLines);
    let cy = y;
    for (const line of lines) {
      drawText(x, cy, line, scale, color, false);
      cy += lineStep;
    }
    return cy;
  }

  // ------------------------------------------------------------------
  // Masthead: nameplate, date bar, rules.
  // ------------------------------------------------------------------
  function drawMasthead() {
    strokeRect(14, 14, 996, 996, 3, INK);
    strokeRect(22, 22, 980, 980, 1, INK);
    drawTextCentered(512, 46, "THE WORLD TODAY", 8, INK, false);
    fillRect(40, 112, 944, 4, INK);
    fillRect(40, 121, 944, 1, INK);
    drawText(40, 136, "WORLD EDITION", 2, GRAY, false);
    drawTextCentered(512, 132, "TUESDAY, 24 NOVEMBER 2026", 3, INK, true);
    drawTextRight(984, 136, "NO. 328", 2, GRAY, false);
    fillRect(40, 162, 944, 2, INK);
  }

  // ------------------------------------------------------------------
  // Hero: the Huang comeback and the market rally, with a chart panel.
  // ------------------------------------------------------------------
  function drawChartPanel() {
    const X = 612;
    const Y = 178;
    const Wd = 372;
    const Hd = 300;
    fillRect(X, Y, Wd, Hd, NAVY);
    strokeRect(X, Y, Wd, Hd, 1, NAVY_LINE);
    drawText(X + 16, Y + 14, "TWO-WEEK ROUND TRIP", 2, WHITE, true);
    fillRect(X + 260, Y + 12, 96, 18, RED);
    drawTextCentered(X + 308, Y + 14, "MARKETS", 2, WHITE, true);

    // Plot area.
    const px0 = X + 20;
    const px1 = X + Wd - 20;
    const py0 = Y + 50;
    const py1 = Y + 148;
    const pts = [
      [px0, py0 + 22],
      [px0 + 52, py0 + 66],
      [px0 + 102, py0 + 73],
      [px0 + 156, py0 + 69],
      [px0 + 206, py0 + 57],
      [px0 + 254, py0 + 24],
      [px0 + 294, py0 + 6],
      [px1, py0 - 1],
    ];
    // Area under the curve.
    for (let x = px0; x <= px1; x++) {
      let seg = 0;
      while (seg < pts.length - 2 && x > pts[seg + 1][0]) seg++;
      const [ax, ay] = pts[seg];
      const [bx, by] = pts[seg + 1];
      const t = bx === ax ? 0 : (x - ax) / (bx - ax);
      const y = Math.round(ay + (by - ay) * t);
      fillRect(x, y, 1, py1 - y, CHART_FILL);
    }
    // Grid.
    for (let i = 0; i <= 4; i++) {
      const gy = py0 + Math.round(((py1 - py0) * i) / 4);
      fillRect(px0, gy, px1 - px0, 1, NAVY_LINE);
      const gx = px0 + Math.round(((px1 - px0) * i) / 4);
      fillRect(gx, py0, 1, py1 - py0, NAVY_LINE);
    }
    // The line itself, plus an end marker.
    for (let i = 0; i < pts.length - 1; i++) {
      drawLine(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 1, CHART_GREEN);
    }
    fillRect(px1 - 4, pts[pts.length - 1][1] - 4, 8, 8, CHART_GREEN);

    drawText(X + 16, Y + 162, "11 NOV: HUANG QUITS", 2, PANEL_SUB, false);
    drawTextRight(X + Wd - 16, Y + 162, "MON +35%", 2, CHART_GREEN, true);
    fillRect(X + 16, Y + 188, Wd - 32, 1, NAVY_LINE);

    const rows = [
      ["S&P 500", "+4.73%", "7,237"],
      ["NASDAQ", "+6.51%", "24,090"],
      ["DOW", "+3.01%", "49,595"],
      ["NIKKEI", "+4.4%", "KOSPI +7%"],
    ];
    rows.forEach(([label, pct, level], i) => {
      const ry = Y + 200 + i * 26;
      drawText(X + 16, ry, label, 2, PANEL_SUB, false);
      drawText(X + 178, ry, pct, 2, CHART_GREEN, true);
      drawTextRight(X + Wd - 16, ry, level, 2, WHITE, false);
    });
  }

  function drawHero() {
    drawText(40, 178, "NVIDIA • WALL STREET • THE COMEBACK", 2, RED, true);
    drawText(40, 202, "HUANG RETURNS,", 4, INK, true);
    drawText(40, 240, "MARKETS ROAR BACK", 4, INK, true);
    drawPara(
      40,
      288,
      "NVIDIA REINSTATED JENSEN HUANG AS CHIEF EXECUTIVE ON SUNDAY, TWO " +
        "WEEKS AFTER HIS SHOCK RESIGNATION. WALL STREET ANSWERED WITH ITS " +
        "BIGGEST RALLY SINCE APRIL 2025, AND NVIDIA LEAPT AS MUCH AS 35%, " +
        "ADDING $1 TRILLION OF VALUE IN A SINGLE DAY.",
      2,
      INK,
      46,
      17,
      6
    );
    drawPara(
      40,
      398,
      "IN ASIA ON TUESDAY THE RELIEF SPREAD FAST: TOKYO'S NIKKEI " +
        "CLIMBED 4.4% AND SEOUL'S KOSPI JUMPED 7%.",
      2,
      INK,
      46,
      17,
      3
    );
    fillRect(40, 458, 560, 1, BOX_BORDER);
    drawText(
      40,
      466,
      "READ THE BRIEFS BELOW FOR THE REST OF THE DAY",
      2,
      GRAY,
      false
    );
    drawChartPanel();
    fillRect(40, 490, 944, 2, INK);
  }

  // ------------------------------------------------------------------
  // The story grid: nine briefs in a 3x3 lattice, each with a colour tab.
  // ------------------------------------------------------------------
  function drawStory(x, y, accent, title, body) {
    fillRect(x, y, 304, 138, BOX_BG);
    strokeRect(x, y, 304, 138, 1, BOX_BORDER);
    fillRect(x, y, 304, 5, accent);
    const titleLines = wrapText(title, 23).slice(0, 2);
    let ty = y + 13;
    for (const line of titleLines) {
      drawText(x + 12, ty, line, 2, INK, true);
      ty += 17;
    }
    fillRect(x + 12, ty + 2, 280, 1, BOX_BORDER);
    drawPara(x + 12, ty + 9, body, 2, INK, 23, 16, 5);
  }

  function drawGrid() {
    const stories = [
      [
        RED,
        "EU UNVEILS 22ND RUSSIA SANCTIONS",
        "BRUSSELS TARGETS BANKS AND CRYPTO PLATFORMS; RUSSIAN TEAMS FACE BANS AT EU EVENTS.",
      ],
      [
        [36, 86, 166],
        "STRIKES HIT KYIV REGION",
        "RUSSIAN DRONES AND MISSILES HIT THE KYIV REGION; SEVERAL PEOPLE ARE MISSING.",
      ],
      [
        [199, 116, 0],
        "FACTORY FIRE IN BANTEN",
        "WORKERS ARE DEAD AND MISSING AFTER A FIRE AT A BANTEN FACTORY; THE RESCUE GOES ON.",
      ],
      [
        [91, 127, 30],
        "IRAN WARNS OVER US BLOCKADE",
        "TEHRAN WARNS IT MAY ANSWER THE US NAVAL BLOCKADE, RAISING TENSIONS ACROSS THE GULF.",
      ],
      [
        [109, 63, 160],
        "ICJ: GENOCIDE IN MYANMAR",
        "THE WORLD COURT RULES THAT MYANMAR COMMITTED GENOCIDE AGAINST THE ROHINGYA PEOPLE.",
      ],
      [
        [160, 44, 90],
        "LISBON MARCHES ON PRICES",
        "THOUSANDS MARCH THROUGH LISBON OVER HOUSING COSTS AND THE SOARING PRICE OF LIVING.",
      ],
      [
        [30, 127, 134],
        "COP31 ENDS IN DISMAY",
        "GUTERRES IS 'DEEPLY DISAPPOINTED' AS THE LONGEST COP ENDS; EYES TURN TO COP32 IN ADDIS ABABA.",
      ],
      [
        [138, 109, 26],
        "LAGARDE QUITS THE ECB",
        "CHRISTINE LAGARDE RESIGNS AS HEAD OF THE EUROPEAN CENTRAL BANK; THE EU HUNTS A SUCCESSOR.",
      ],
      [
        [36, 86, 166],
        "VERSTAPPEN RULES VEGAS",
        "VERSTAPPEN WINS THE LAS VEGAS GRAND PRIX; IN CRICKET, PANT SCORES 128 AGAINST NEW ZEALAND.",
      ],
    ];
    stories.forEach(([accent, title, body], i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      drawStory(40 + col * 320, 502 + row * 147, accent, title, body);
    });
  }

  function drawFooter() {
    fillRect(40, 946, 944, 2, INK);
    const lines = wrapText(
      "ALSO: NORWAY COURT VOIDS OIL LICENCES • RUSSIAN SHIP BURNS IN " +
        "FINNISH GULF • UKRAINE SAYS IT SANK RUSSIAN WARSHIP OFF LIBYA",
      78
    ).slice(0, 2);
    lines.forEach((line, i) => {
      drawTextCentered(512, 958 + i * 20, line, 2, INK, false);
    });
  }

  // ------------------------------------------------------------------
  // Compose the page and write the PNG.
  // ------------------------------------------------------------------
  fillAll(PAPER);
  drawMasthead();
  drawHero();
  drawGrid();
  drawFooter();

  const png = encodePNG(W, H, px);
  const out = process.env.ENTRY_OUT || "/output/entry.png";
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, png);
  console.log("wrote " + out + " (" + png.length + " bytes)");
})();
