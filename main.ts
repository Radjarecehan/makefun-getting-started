// Deadpan Forecasts for Cities That Do Not Exist — Quisthaven forecast.
// Writes one deadpan broadcast line to entry.txt, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const ENTRY =
  "Good evening from Quisthaven, where tonight’s forecast is light rain, 14 degrees, and a 60% chance the mayor’s umbrella parade is cancelled again.";

// Gate: 1-160 chars, single line, not only whitespace, no edge padding.
if (ENTRY.length < 1 || ENTRY.length > 160) {
  throw new Error(`entry length ${ENTRY.length} outside 1-160`);
}
if (ENTRY.includes("\n") || ENTRY.trim().length === 0) {
  throw new Error("entry must be a single non-blank line");
}
if (ENTRY !== ENTRY.trim()) {
  throw new Error("entry has leading/trailing whitespace");
}

const EXPECTED_SHA256 =
  "ab57e1c7463e64722d43fdac2637ffe35971edcd562ce35d9e42d95e5358545e";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read-back byte-exact verification.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch");
}
const bytes = Buffer.byteLength(back, "utf8");
const sha = createHash("sha256").update(back, "utf8").digest("hex");
if (sha !== EXPECTED_SHA256) {
  throw new Error(`sha256 mismatch: got ${sha}`);
}
if (Buffer.from(back, "utf8")[bytes - 1] !== 46) {
  throw new Error("last byte must be 46 (.)");
}
console.log(`entry.txt: ${ENTRY.length} chars, ${bytes} bytes, sha256 ${sha}`);
