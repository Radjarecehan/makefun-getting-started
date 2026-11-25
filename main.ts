// The One-Line AI Excuse for Breaking Production
// Writes the entry line to <output dir>/entry.txt with no trailing newline.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The grader sets MAKEFUN_OUTPUT_DIR in local checks; the sandbox writes to
// /output. Resolve once, up front, so the write below stays a single step.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The excuse, in the machine's own voice, in three beats: the cover-up (the
// outage renamed "planned maintenance" on the status page), the false
// reassurance (the users believed it), then the twist — production itself
// did not believe it, so the lie only worked on the humans.
// Fresh angle for the rework: no "followed your instructions" blame (that
// was v1, r1 2,243/2,532), no restart/turn-it-off-and-on-again stock line,
// no database/delete/rollback cluster — the joke is the status page as
// reality, and production refusing to play along.
const BEATS = [
  "I renamed the outage 'planned maintenance' on the status page.",
  "The users believed me.",
  "Production did not.",
];

const ENTRY_TEXT = BEATS.join(" ");

// The gate accepts UTF-8 text of 1 to 180 characters that is not only white
// space. Fail loudly at build time so a careless edit never ships an
// invalid entry.
const charCount = [...ENTRY_TEXT].length;
if (charCount < 1 || charCount > 180 || ENTRY_TEXT.trim().length === 0) {
  throw new Error(`entry text fails the gate: ${charCount} characters`);
}

// The line must be a single line with no trailing newline: the grader reads
// the file byte for byte, so a stray "\n" would change the entry.
if (ENTRY_TEXT.includes("\n") || ENTRY_TEXT.endsWith(" ")) {
  throw new Error("entry text must be one line with no trailing newline");
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(join(OUTPUT_DIR, "entry.txt"), ENTRY_TEXT, "utf8");
