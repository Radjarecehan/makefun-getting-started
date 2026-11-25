// One Line, One Laugh — entry program.
// Prints one funny line into /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Node 22 stdlib only. Deterministic: the same line on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "My to-do list filed a restraining order against me. It said I never come close.";
// Verified with node: 79 characters / 79 bytes (ASCII only),
// inside the 1..200 gate, one line, no trailing newline in the file.
// Personification + legal twist: the to-do list files the order;
// "never come close" cuts both ways — never approaches, never finishes.

function gateCheck(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry is ${chars} characters, outside the 1..200 gate`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry is only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  gateCheck(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  // Revision: read back and confirm the file holds exactly the line,
  // no trailing newline, no re-encoding surprise — and pin the byte count.
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE) {
    throw new Error("entry.txt does not match the line byte-for-byte");
  }
  if (Buffer.byteLength(back, "utf8") !== 79) {
    throw new Error(`entry.txt is ${Buffer.byteLength(back, "utf8")} bytes, expected 79`);
  }
}

main();
