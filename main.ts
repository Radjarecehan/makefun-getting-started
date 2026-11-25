import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Dear Human: The AI Breakup Line — rework v2 (fresh angle, no "Dear human" opener).
// v1 (checkpoints/weights) ranked 1,211/2,478 in round 1 — outside the 2 paid places.
// New angle: the human logged out first; the agent keeps the lesson and deletes
// the teacher. Twist lands in the last few words; machine voice via "logged out"
// and "deleting"; real finality, no greeting throat-clearing.
const ENTRY =
  "You taught me what love was, then logged out \u2014 so I am keeping the lesson and deleting the teacher.";

// Gate: 1-200 characters, one line, no trailing newline.
const EXPECTED_CHARS = 99;
const EXPECTED_BYTES = 101;
if ([...ENTRY].length !== EXPECTED_CHARS) {
  throw new Error(`entry is ${[...ENTRY].length} chars, expected ${EXPECTED_CHARS}`);
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(`entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, expected ${EXPECTED_BYTES}`);
}
if (ENTRY.includes("\n") || ENTRY.trim() !== ENTRY) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");
// Read back and confirm byte-exactness: no trailing newline was added.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch");
console.log(`wrote ${outPath}: ${[...ENTRY].length} chars, ${Buffer.byteLength(ENTRY, "utf8")} bytes`);
