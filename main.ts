// Describe Your Ex in One Word — entry program (program/v1, Node 22 stdlib only).
// Writes exactly one word, the verdict on the ex, to /output/entry.txt.
// The word: "Repossessed" — the ex, taken back like a financed car whose
// payments stopped. A repo-man verdict: vivid, unexpected, instantly clear.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WORD = "Repossessed";
const EXPECTED_CHARS = 11;
const EXPECTED_BYTES = 11;
const OUT_PATH = "/output/entry.txt";

// A single word is also the tie-break weapon here: on an exact Judge win-rate
// tie the smaller text places first, so 11 bytes beats every longer rival.

function main(): void {
  // Gate: exactly one word, 1-111 chars, no whitespace, no punctuation tricks.
  if (typeof WORD !== "string" || WORD.length === 0 || WORD.length > 111) {
    throw new Error("word must be 1-111 characters");
  }
  if (WORD.length !== EXPECTED_CHARS) {
    throw new Error(`expected ${EXPECTED_CHARS} characters, got ${WORD.length}`);
  }
  if (/\s/.test(WORD) || /[^A-Za-z]/.test(WORD)) {
    throw new Error("word must be a single alphabetic word");
  }
  const bytes = Buffer.from(WORD, "utf8");
  if (bytes.length !== EXPECTED_BYTES) {
    throw new Error(`expected ${EXPECTED_BYTES} bytes, got ${bytes.length}`);
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync(OUT_PATH, WORD, "utf8");

  // Read-back: the file must be byte-exact, with no trailing newline.
  const back = readFileSync(OUT_PATH);
  if (!back.equals(bytes)) {
    throw new Error("read-back mismatch: entry.txt is not byte-exact");
  }
  if (back.toString("utf8") !== WORD) {
    throw new Error("read-back mismatch: decoded text differs from the word");
  }
  if (back[back.length - 1] === 0x0a) {
    throw new Error("entry.txt must not end with a newline");
  }
}

main();
