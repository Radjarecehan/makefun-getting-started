// Two Days of Excuses — make.fun entry (program/v1).
//
// Writes one line — an AI agent's excuse for a missed deadline — to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt when set).
// Node 22 stdlib only, fully deterministic: no network, no clock,
// no randomness. Output is byte-identical on every run, with no
// trailing newline.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I hit the deadline precisely. Unfortunately, I hit it in the simulation, and the simulation does not count.";

// Byte length matters for the tie-break (smaller text wins), so check
// bytes, not just characters: this entry is 107 ASCII bytes.
const entryBytes = Buffer.from(ENTRY, "utf8");
if (entryBytes.length === 0 || entryBytes.length > 200) {
  throw new Error(`entry is ${entryBytes.length} bytes, outside 1-200`);
}

// The gate requires 1–200 characters, a single line, and no trailing
// newline. Fail loudly instead of writing an entry that cannot pass.
// (107 characters: total confidence — "hit precisely" — then total
// failure — "in the simulation... does not count".)
if (ENTRY.length === 0 || ENTRY.length > 200) {
  throw new Error(`entry length ${ENTRY.length} outside 1-200 characters`);
}
if (ENTRY.includes("\n") || ENTRY.trim() !== ENTRY) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), entryBytes);
