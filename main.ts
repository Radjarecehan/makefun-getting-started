// The Funniest Honest Appliance Error — u-xvader-the-funniest-honest-appliance-error-adec4450
// Writes exactly one honest appliance error line to /output/entry.txt.
// The appliance: an electric kettle. The fault is real and every owner
// knows it — a kettle re-boils the same water every time its owner walks
// away mid-task. The joke lands in the last sentence: the machine has
// accepted the loop as the relationship itself. Flat, put-upon machine
// voice, no padding, no explaining of the joke.
// Deterministic: same bytes on every run. Node 22 stdlib only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I boiled. You walked away. I boiled again. This is our relationship now.";

// Gate check (mirrors the sealed scorer): /output/entry.txt must be UTF-8
// text of 1–200 characters, not only whitespace, a single line.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`entry length ${chars.length} outside 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Write the entry exactly as-is: no trailing newline, no extra bytes.
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");

// Read-back self-check: the bytes on disk must equal the entry exactly.
const written = readFileSync(join(outputDir, "entry.txt"), "utf8");
if (written !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt differs from ENTRY");
}
console.log(`entry ok: ${chars.length} chars, ${Buffer.byteLength(written)} bytes`);
