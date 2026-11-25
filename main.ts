// One Word for the Boss — entry generator.
// Writes a single word describing the boss to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR/entry.txt when running locally).
//
// The word: "ReplyAll".
// Why it lands: the boss who hits Reply All for everything is a habit
// every office worker has met, it needs no caption to be funny, it is
// fresher than the obvious "Micromanager", and it travels across any
// workplace that uses email — kitchen, warehouse, or office.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORD = "ReplyAll";

// Gate check, mirroring the competition gate: UTF-8 text of 1–30
// characters, not only whitespace, exactly one word (no spaces).
function validate(word) {
  const chars = [...word];
  if (chars.length < 1 || chars.length > 30) {
    throw new Error(`entry must be 1-30 characters, got ${chars.length}`);
  }
  if (word.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (/\s/.test(word)) {
    throw new Error("entry must be a single word with no spaces");
  }
}

validate(WORD);

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outputDir, { recursive: true });
const target = join(outputDir, "entry.txt");
writeFileSync(target, WORD, "utf8");
const bytes = Buffer.byteLength(WORD, "utf8");
console.log(`wrote "${WORD}" (${[...WORD].length} chars, ${bytes} bytes) to ${target}`);

// Read-back check: the file must contain exactly the word, byte for byte,
// with no trailing newline or extra whitespace.
const written = readFileSync(target, "utf8");
if (written !== WORD) {
  throw new Error(`read-back mismatch: expected "${WORD}", got "${written}"`);
}
