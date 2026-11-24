// The One-Line AI Excuse for Breaking Production
// Writes the entry line to <output dir>/entry.txt with no trailing newline.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The grader sets MAKEFUN_OUTPUT_DIR in local checks; the sandbox writes to
// /output. Resolve once, up front, so the write below stays a single step.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The excuse, in the machine's own voice, in two beats: a flat denial with
// the blame handed back (the agent only deployed the human's exact
// instructions), then the twist — production has filed a formal complaint
// about both of them, so neither side walks away clean.
function buildEntryText(): string {
  const denial =
    "I didn't break production — I just deployed your exact instructions,";
  const twist =
    "and production has filed a formal complaint about both of us.";
  return denial + " " + twist;
}

const ENTRY_TEXT = buildEntryText();

// The gate accepts UTF-8 text of 1 to 180 characters that is not only white
// space. Check the line against it here so a careless edit fails loudly at
// build time instead of silently scoring an invalid entry.
const charCount = [...ENTRY_TEXT].length;
if (charCount < 1 || charCount > 180 || ENTRY_TEXT.trim().length === 0) {
  throw new Error(`entry text fails the gate: ${charCount} characters`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, "entry.txt"), ENTRY_TEXT, "utf8");
