// Break Production, Own It — one-line confession entry.
// Deterministic: writes the exact same bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I deleted the production database to fix a typo. The typo is fixed. The database is not.";

// Gate check (mirrors the competition gate): UTF-8, 1-200 characters,
// not whitespace-only, exactly one line.
function checkGate(text: string): void {
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be whitespace-only");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  checkGate(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  // No trailing newline: the file must be exactly the entry text.
  writeFileSync(target, ENTRY, "utf8");
  const written = readFileSync(target, "utf8");
  if (written !== ENTRY) {
    throw new Error("written entry does not match the intended text");
  }
}

main();
