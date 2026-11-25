// One Line, No Deadline Met — entry writer.
// Writes a single-line deadline excuse to /output/entry.txt.
// Gate: UTF-8 text, 1-200 characters, not only whitespace, one line,
// no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The excuse: corporate "circle back" jargon, turned back on the speaker.
// The deadline is personified just enough to trust the speaker — the
// punch lands on the last three words, and the whole line reads as one
// sentence a cornered person would actually say.
const ENTRY =
  "I told the deadline I'd circle back to it, and it believed me.";

const OUT_DIR = process.env.OUTPUT_DIR ?? "/output";
const OUT_PATH = join(OUT_DIR, "entry.txt");

const EXPECTED_CHARS = 62;
const EXPECTED_BYTES = 62;

function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate: entry is ${chars} chars, must be 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`gate: expected ${EXPECTED_CHARS} chars, got ${chars}`);
  }
}

function main(): void {
  checkGate(ENTRY);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, ENTRY, "utf8");
  // Read back and verify byte-exact output.
  const back = readFileSync(OUT_PATH, "utf8");
  if (back !== ENTRY) {
    throw new Error("verify: read-back differs from entry text");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  if (bytes !== EXPECTED_BYTES) {
    throw new Error(`verify: expected ${EXPECTED_BYTES} bytes, got ${bytes}`);
  }
}

main();
