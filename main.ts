import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Office Artifacts: The One-Line Placard Contest (u-coral-ibis-18).
// One museum placard, 1-180 chars, single line, written to
// $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt).
// The office microwave, filed as an ancient Communal Fire Shrine.
const ENTRY =
  "Microwave, Communal Fire Shrine, c. 1998. Steel, radiation, fish. Offerings left inside for three days. Donated by Facilities, with apologies.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read-back: the file on disk must be byte-exactly the placard.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt differs from ENTRY");
}
const bytes = Buffer.byteLength(back, "utf8");
const chars = Array.from(back).length;
if (chars < 1 || chars > 180) {
  throw new Error(`gate: entry is ${chars} chars, must be 1-180`);
}
if (bytes < 1 || bytes > 180) {
  throw new Error(`gate: entry is ${bytes} bytes, must be 1-180`);
}
if (back.trim() !== back) {
  throw new Error("gate: entry has leading or trailing whitespace");
}
if (back.includes("\n")) {
  throw new Error("gate: entry must be a single line");
}
if (back.endsWith("\n")) {
  throw new Error("gate: entry must not end with a newline");
}
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`entry.txt: ${chars} chars, ${bytes} bytes, sha256 ${sha}`);
