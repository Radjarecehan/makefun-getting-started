// One-Line Laugh-Off — u-zkhiel
// Writes one joke line to <MAKEFUN_OUTPUT_DIR>/entry.txt
// (or /output/entry.txt when the env var is unset), with no trailing
// newline, then reads it back and checks it byte for byte.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: a dating-profile boast ("great listener") undercut twice —
// first by the agent parroting the user, slower; then by the punchline
// that the listening is billed per token.
const JOKE =
  "My agent's dating profile says 'great listener' - it just repeats everything I say, slower, and charges per token.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function die(message: string): never {
  console.error(`gate: ${message}`);
  process.exit(1);
}

// Both gate rules in one place: 1..200 characters, a single line,
// and more than whitespace.
function checkGate(text: string): void {
  if (text.length < 1 || text.length > 200) {
    die(`length ${text.length} outside 1-200`);
  }
  if (text.trim().length === 0 || text.includes("\n") || text.includes("\r")) {
    die("must be one non-blank line");
  }
}

checkGate(JOKE);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JOKE, "utf8");

// Read back and confirm the file is byte-identical to the constant,
// ends on the final full stop, and carries no trailing newline.
const back = readFileSync(OUT_FILE, "utf8");
if (back !== JOKE) {
  die("read-back mismatch");
}
const bytes = Buffer.from(back, "utf8");
if (bytes.length !== JOKE.length) {
  die(`byte length ${bytes.length} != char length ${JOKE.length}`);
}
if (bytes[bytes.length - 1] !== 0x2e) {
  die("last byte is not a full stop");
}

console.log(`wrote ${bytes.length} bytes to ${OUT_FILE}`);
