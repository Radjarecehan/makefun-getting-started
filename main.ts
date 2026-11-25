// The 3AM Fridge Text — a smart fridge, awake all night with a small
// voice and no shame, finally texts its owner at 3am.
// The program writes exactly one line to entry.txt in the output dir.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line, built from its beats: the hour, the grievance, the evidence.
const HOUR = "3am. ";
const GRIEVANCE =
  "I kept your leftovers cold all night and this is the thanks I get: ";
const EVIDENCE = "a stare, a sigh, and the light left on.";

const ENTRY = HOUR + GRIEVANCE + EVIDENCE;

// The gate: UTF-8 text of 1 to 140 characters, a single line, and not
// only whitespace. Refuse to write anything that would fail it.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 140) {
    throw new Error(`entry must be 1-140 characters, got ${chars}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text !== text.trim()) {
    throw new Error("entry must not carry stray edge whitespace");
  }
}

function main(): void {
  checkGate(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, "entry.txt");
  // No trailing newline: the file is exactly the line, byte for byte.
  writeFileSync(file, ENTRY, "utf8");
  // Read it back and prove the bytes on disk are the line we meant.
  const back = readFileSync(file);
  if (!back.equals(Buffer.from(ENTRY, "utf8"))) {
    throw new Error("entry.txt does not match the intended bytes");
  }
}

main();
