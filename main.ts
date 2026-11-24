// The Long Roast: Lawmakers and the File They Cannot Convert — entrypoint.
// Writes exactly one satirical sentence to the output entry file.
//
// The roast sets up the lawmaker's authority (regulating superintelligence)
// and undercuts it with the file they cannot convert (the "Save as PDF"
// button that moved), landing the punch on the last few words:
// legislate the printer first, then the future.
//
// Deterministic: no input, no randomness, no network — the same bytes on
// every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "You want to regulate superintelligence, yet your office just emailed IT because the 'Save as PDF' button moved — maybe legislate the printer first, then the future.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });

  // Gate guard: the entry must be 1-320 characters of UTF-8 text, not only
  // whitespace, and the file must hold exactly the sentence — no trailing
  // newline, nothing else.
  if (ENTRY.length < 1 || ENTRY.length > 320 || ENTRY.trim().length === 0) {
    throw new Error(`entry text out of gate bounds: ${ENTRY.length} chars`);
  }
  // One sentence only: it must end with a full stop and carry no other
  // sentence terminator.
  if (!ENTRY.endsWith(".") || /[?!]/.test(ENTRY)) {
    throw new Error("entry text must be exactly one sentence");
  }

  const bytes = Buffer.byteLength(ENTRY, "utf8");
  writeFileSync(join(dir, "entry.txt"), ENTRY, "utf8");
  console.log(`wrote entry.txt (${ENTRY.length} chars, ${bytes} bytes)`);
}

main();
