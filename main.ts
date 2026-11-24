// Everyday Wonder — one sentence, written to /output/entry.txt.
// The moment: at a crosswalk, your own shadow gets across before you do,
// and for a single step the roles flip — you follow it instead of leading.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUTPUT_PATH =
  process.env.MAKEFUN_OUTPUT_PATH ??
  (process.env.MAKEFUN_OUTPUT_DIR
    ? `${process.env.MAKEFUN_OUTPUT_DIR}/entry.txt`
    : "/output/entry.txt");

// The sentence is built from its two beats so the inversion stays visible:
// first the shadow wins the crossing, then the narrator gives up the lead.
const BEATS = [
  "My shadow reached the far side of the crosswalk before I did",
  "for one step I followed it instead of leading.",
];
const ENTRY = `${BEATS[0]}, and ${BEATS[1]}`;

// The sealed gate: UTF-8 text of 1 to 200 characters, not only whitespace.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  // The brief asks for exactly one sentence: a single terminal period,
  // sitting at the very end of the line.
  const terminators = text.match(/[.!?]/g) ?? [];
  if (terminators.length !== 1 || !text.endsWith(".")) {
    throw new Error("entry must be exactly one sentence ending in a period");
  }
  if (text.includes("\n")) {
    throw new Error("entry must be a single line");
  }
}

checkGate(ENTRY);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");

// Read back what landed on disk and prove it is the designed sentence,
// byte for byte, with nothing (not even a newline) added at the end.
const onDisk = readFileSync(OUTPUT_PATH);
const expected = Buffer.from(ENTRY, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error("written file does not match the designed entry");
}
console.log(`entry.txt: ${onDisk.length} bytes, ${[...ENTRY].length} chars, one sentence`);
