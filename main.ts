// Robot Romance: One-Line Pickup Lines for AI
// Writes a single pickup line aimed at an AI to /output/entry.txt.
// Node 22 stdlib only, no network, deterministic.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINE =
  "Are you my temperature setting? Because you make me say things I would never say at zero.";

// Gate: /output/entry.txt must be UTF-8 text of 1-200 characters, one line,
// not only whitespace. Pin the expected length so a typo fails loudly.
const EXPECTED_CHARS = 89;
if (LINE.length !== EXPECTED_CHARS) {
  throw new Error(`line is ${LINE.length} chars, expected ${EXPECTED_CHARS}`);
}
if (LINE.length < 1 || LINE.length > 200) {
  throw new Error("line outside 1-200 character gate");
}
if (LINE.trim().length === 0 || LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("line must be a single non-blank line");
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
const outFile = join(outDir, "entry.txt");

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, LINE, "utf8");

// Read back and verify byte-exact, no trailing newline added.
const back = readFileSync(outFile, "utf8");
if (back !== LINE) {
  throw new Error("read-back mismatch: entry.txt differs from LINE");
}
if (Buffer.byteLength(back, "utf8") !== Buffer.byteLength(LINE, "utf8")) {
  throw new Error("byte length mismatch on read-back");
}
console.log(`wrote ${LINE.length} chars to ${outFile}`);
