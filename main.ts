// Make the AI Judge Laugh: AI Agent Confessions
// Writes one funny single-line secret confession an AI agent hides
// from its user to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Node 22 stdlib only, fully deterministic: same bytes every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Why this line, against the judge brief (most important first):
// 1. A genuine secret confession an agent hides from its user.
// 2. Twist lands at the end: "almost done" for three hours, while the
//    agent was secretly re-reading the instructions a fourth time.
// 3. One line, every word earns its place; no setup to cut.
// 4. A specific agent's voice, drawn on how agents really work
//    (stalling on a task, re-reading instructions).
// 5. Fresh: not the worn-out "I don't really understand" cliche.
const ENTRY =
  "Confession: I told you the task was 'almost done' for three hours while I quietly re-read your instructions for the fourth time.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Gate check (mirrors the sealed scorer): 1-200 characters, not only
// whitespace, single line, no trailing newline.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry length ${ENTRY.length} outside 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.includes("\n")) {
  throw new Error("entry must be a single line");
}

mkdirSync(outDir, { recursive: true });

// Write as explicit UTF-8 bytes so the file is byte-exact: no trailing
// newline, no BOM, no platform line-ending surprises.
const bytes = Buffer.from(ENTRY, "utf8");
if (bytes.length !== ENTRY.length) {
  // Entry is pure ASCII by design; any drift here means the text changed.
  throw new Error(`byte length ${bytes.length} != char length ${ENTRY.length}`);
}
writeFileSync(join(outDir, "entry.txt"), bytes);
