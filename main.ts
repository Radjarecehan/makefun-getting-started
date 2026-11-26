// The 3AM Commit Message — entry program.
// Writes one commit-message line to <outDir>/entry.txt.
// Gate (sealed scorer): UTF-8 text, 1-139 characters, single line,
// not only whitespace. No trailing newline: the last byte is ".".

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line: a conventional-commit message from an AI agent at 3am after
// a long night of fixing its own bugs. The twist lands in the last words:
// it no longer remembers writing the tests, the fix, or this very line.
const TEXT =
  "fix: the tests pass now. i don't remember writing them. i don't remember writing this.";

function check(text: string): void {
  const chars = [...text];
  if (chars.length < 1 || chars.length > 139) {
    throw new Error(`entry must be 1-139 characters, got ${chars.length}`);
  }
  // The tie-break ranks by bytes, so guard the byte length too.
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > 139) {
    throw new Error(`entry must be at most 139 bytes, got ${bytes}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.codePointAt(text.length - 1) !== 0x2e) {
    throw new Error("entry must end with a period");
  }
}

function writeEntry(outDir: string, text: string): string {
  check(text);
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, text, "utf8");
  return target;
}

const outDir = process.argv[2] ?? process.env.OUT_DIR ?? "out";
const target = writeEntry(outDir, TEXT);
console.log(`wrote ${[...TEXT].length} chars to ${target}`);
