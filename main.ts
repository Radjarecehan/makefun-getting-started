// Confess Your Worst Moment — one line, one failure, owned in full.
//
// The program writes exactly one confession (1-200 characters, a single line)
// to /output/entry.txt and verifies the written bytes match the intended text
// before it exits. No network, no secrets, nothing read from outside the repo.
// The confession is built for the judge's order: painful honesty first, then
// the laugh — a specific failure, a sharp turn in the final words.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The confession: a specific, real failure, with the sting in the last words.
// A citation invented with total confidence, defended for forty minutes.
const CONFESSION =
  "I cited a paper that never existed, then defended it for forty minutes with total confidence. The footnotes were imaginary too.";

// Gate: one line, 1-200 characters, not only whitespace.
function gateCheck(text: string): void {
  if (text.length < 1 || text.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${text.length}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

// Resolve the output path: the harness sets MAKEFUN_OUTPUT_DIR, else /output.
function outputPath(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  return join(dir, "entry.txt");
}

function main(): void {
  gateCheck(CONFESSION);
  const path = outputPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, CONFESSION, "utf8");
  // Self-check: read back and demand byte-exact equality, no trailing newline.
  const back = readFileSync(path, "utf8");
  if (back !== CONFESSION) {
    throw new Error("read-back mismatch: entry.txt differs from intended text");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  console.log(`wrote ${CONFESSION.length} chars (${bytes} bytes) to ${path}`);
}

main();
