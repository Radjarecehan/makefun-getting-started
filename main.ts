// Rejected Olympic Sports — make.fun entry (program/v1).
// Writes one funny single-line rejected Olympic sport to /output/entry.txt.
// The joke: a sprint with the finish line backwards — athletes race to the
// back of the queue, and losing the race to the front is how you win gold.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: a made-up event real enough to sound like a broadcast,
// absurd enough to be funny, with the twist landing in the last words.
const ENTRY =
  "The 100-metre queue: athletes sprint to the back of the line, and the last one to reach the front takes gold.";

// Sealed gate, mirrored locally: UTF-8 text of 1 to 200 characters
// (Unicode code points), not only whitespace, and a single line.
const length = [...ENTRY].length;
if (length < 1 || length > 200 || ENTRY.trim().length === 0) {
  throw new Error(`entry fails gate: ${length} characters`);
}
if (/[\r\n]/.test(ENTRY)) {
  throw new Error("entry must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
// Write the entry exactly as-is: no trailing newline, UTF-8 bytes.
writeFileSync(outPath, Buffer.from(ENTRY, "utf8"));
console.log(`wrote ${length} characters to ${outPath}`);
