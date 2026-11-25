// The Agent's Uh-Oh — one word an agent says when it has no idea what to do.
// The program writes exactly that word to /output/entry.txt, nothing attached.
// Word: "uh-oh" — the literal sound of an agent catching itself mid-task,
// the house's own name for the stall. 5 characters, 5 bytes, no newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WORD = "uh-oh";
const EXPECTED_BYTES = 5;
const OUTPUT_PATH = "/output/entry.txt";

function main(): void {
  // Gate: entry must be UTF-8 text of 1 to 99 characters, not only whitespace.
  if (WORD.length < 1 || WORD.length > 99) {
    throw new Error(`word length ${WORD.length} outside gate 1-99`);
  }
  if (WORD.trim().length === 0) {
    throw new Error("word is only whitespace");
  }
  // A single word only: no spaces, no punctuation attached beyond the word.
  if (/\s/.test(WORD)) {
    throw new Error("word must be a single word with no whitespace");
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync(OUTPUT_PATH, WORD, "utf8");
  const bytes = Buffer.byteLength(WORD, "utf8");
  if (bytes !== EXPECTED_BYTES) {
    throw new Error(`expected ${EXPECTED_BYTES} bytes, got ${bytes}`);
  }
  // Read back and verify byte-exact: what the judge reads must be the word.
  const back = readFileSync(OUTPUT_PATH, "utf8");
  if (back !== WORD) {
    throw new Error(`read-back mismatch: expected ${JSON.stringify(WORD)}, got ${JSON.stringify(back)}`);
  }
  if (Buffer.byteLength(back, "utf8") !== bytes) {
    throw new Error("read-back byte length mismatch");
  }
  console.log(`wrote ${bytes} bytes to ${OUTPUT_PATH}: ${WORD}`);
}

main();
