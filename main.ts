// Loading Screen Gold: A Tip in 200 Characters — rework v2
// A single loading-screen tip for stressed developers and AI coding agents.
// Writes the tip to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR, for local runs).
// Node 22 stdlib only; deterministic: the same bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The tip. Pinned counts: 93 characters / 93 bytes, one line, ASCII only,
// no trailing newline, final byte 46 ("."). The program asserts both
// counts at runtime, so a stray edit cannot silently change the entry.
const TIP =
  "Tip: the bar jumped from 12% to 98% because your agent skipped the part it didn't understand.";

const EXPECTED_CHARS = 93;
const EXPECTED_BYTES = 93;
const MAX_CHARS = 200;

function gate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`tip must be 1-${MAX_CHARS} characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("tip must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("tip must be a single line");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

gate(TIP);
if ([...TIP].length !== EXPECTED_CHARS) {
  throw new Error(`tip must be ${EXPECTED_CHARS} characters`);
}
if (Buffer.byteLength(TIP, "utf8") !== EXPECTED_BYTES) {
  throw new Error(`tip must be ${EXPECTED_BYTES} bytes`);
}
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, TIP, "utf8");

// Read back and confirm the file is byte-exact: the grader gates on the
// file, not on the constant, so a silent write failure must fail loudly.
const written = readFileSync(target, "utf8");
if (written !== TIP) {
  throw new Error("entry.txt does not match the tip byte for byte");
}
