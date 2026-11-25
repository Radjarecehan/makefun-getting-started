// Midnight Fridge Roast — one-line roast for a smart fridge that locks
// itself after midnight. Writes the roast to entry.txt in the output dir.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// The roast, in three spoken beats: the petty lock, the grand delusion,
// the sad truth waiting inside. ASCII hyphen on purpose (byte == char).
const opening = "At midnight my smart fridge locks itself";
const delusion = "like it guards state secrets - mate,";
const truth = "the only thing inside is last Tuesday's rice and my poor decisions.";

const line = [opening, delusion, truth].join(" ");

// Gate self-check: 1-200 chars, exactly one line, no trailing newline.
if (line.length < 1 || line.length > 200) {
  throw new Error(`roast length ${line.length} outside 1-200`);
}
if (line.includes("\n")) {
  throw new Error("roast must be a single line");
}
// Byte check: ASCII-only text, so bytes == chars; the gate counts chars.
if (Buffer.byteLength(line, "utf8") !== line.length) {
  throw new Error("roast must be pure ASCII so byte count equals char count");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), line, "utf8");
console.log(`wrote ${line.length} chars, ${Buffer.byteLength(line, "utf8")} bytes`);
