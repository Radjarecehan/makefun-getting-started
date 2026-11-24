// The Houseplant Out-of-Office — one-line entry.
// The program writes the plant's auto-reply to /output/entry.txt.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The reply is two beats: the out-of-office status, then the survival
// record that lands the punch ("zero watering cans") at the very end.
const STATUS = "Out of office until watered.";
const RECORD =
  "I have survived three owners, two moves, and zero watering cans.";
const ENTRY = `${STATUS} ${RECORD}`;

// The sealed gate accepts UTF-8 text of 1 to 120 characters, not only
// white space. Guard the line here so a bad edit fails loudly instead
// of producing an invalid entry.
const MIN_CHARS = 1;
const MAX_CHARS = 120;

function checkEntry(line: string): void {
  const chars = [...line].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${chars}`,
    );
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
}

function outputPath(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  return join(dir, "entry.txt");
}

function main(): void {
  checkEntry(ENTRY);
  const path = outputPath();
  mkdirSync(dirname(path), { recursive: true });
  // No trailing newline: the file is the line itself, byte for byte.
  writeFileSync(path, ENTRY, "utf8");
  // Read it back: what the gate reads must be exactly the line.
  const written = readFileSync(path, "utf8");
  if (written !== ENTRY) {
    throw new Error("written entry does not match the line byte for byte");
  }
}

main();
