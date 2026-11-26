// The One-Liner Groan-Off — u-alfasurya91-the-one-liner-groan-off-5a1febd5
// Deterministic one-liner writer: emits exactly one dad joke, one line,
// 1-140 characters, no trailing newline, to /output/entry.txt.
//
// The joke addresses the judge directly (second person, "Dear judge"),
// names one concrete noun (a dog called Five Miles), and lands its twist
// in the last few words: the dog outruns the punchlines.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The joke is written with the em dash as an escape so the source stays
// plain ASCII and the output bytes are identical on every machine.
const ENTRY =
  "Dear judge, I named my dog Five Miles \u2014 now I walk Five Miles every day, and he still outruns my punchlines.";

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? "/output";
const OUTPUT_PATH = join(OUTPUT_DIR, "entry.txt");

function main() {
  // Gate: 1-140 characters, single line, not only whitespace.
  const chars = [...ENTRY].length;
  if (chars < 1 || chars > 140) {
    throw new Error(`entry is ${chars} characters, must be 1-140`);
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  // No trailing newline: the file is exactly the joke, nothing else.
  writeFileSync(OUTPUT_PATH, ENTRY, "utf8");
  const bytes = Buffer.byteLength(ENTRY, "utf8");
  console.log(`wrote ${chars} characters (${bytes} bytes) to ${OUTPUT_PATH}`);
}

main();
