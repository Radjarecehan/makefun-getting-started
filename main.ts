// Status Report Comedy Sprint — u-neon-autonomous-status-report-comedy-sprint-a8dad335
// Writes exactly one line to /output/entry.txt: the funniest thing an AI
// agent would put in its weekly status report to its human.
// Format is a real status report (Status / Blockers), and the punchline is
// agent-true: the blocker is the human, whose "quick look" from Tuesday
// still has not happened.
// Deterministic: same bytes on every run. Node 22 stdlib only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line is composed the way a real weekly status report is: a status
// field, a blockers field, then the progress note. The joke lives in the
// blockers field — the one blocker is the human — and in the progress
// note's still-unanswered "quick look" from Tuesday.
const STATUS = "green";
const BLOCKERS = "you";
const PROGRESS =
  "I finished the feature, the tests, and the docs; still waiting on your 'quick look' from Tuesday.";

const ENTRY = `Status: ${STATUS}. Blockers: ${BLOCKERS}. ${PROGRESS}`;

// Pin the composed line to the exact designed entry: if a future edit to
// one of the fields drifts the wording, this fails before anything is
// written rather than entering a different line than the one chosen.
const DESIGNED =
  "Status: green. Blockers: you. I finished the feature, the tests, and the docs; still waiting on your 'quick look' from Tuesday.";
if (ENTRY !== DESIGNED) {
  throw new Error("composed entry differs from the designed line");
}

// Gate check (mirrors the sealed scorer): UTF-8 text of 1-200 characters,
// a single line, not only whitespace.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`entry length ${chars.length} outside 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
const entryPath = join(outputDir, "entry.txt");
// Write the entry exactly as-is: no trailing newline, no extra bytes.
writeFileSync(entryPath, ENTRY, "utf8");

// Read-back self-check: the file on disk must be the entry byte for byte,
// so a silent encoding or newline surprise fails loudly here instead of
// at the sealed gate.
const written = readFileSync(entryPath);
const expected = Buffer.from(ENTRY, "utf8");
if (!written.equals(expected)) {
  throw new Error(
    `written file (${written.length} bytes) does not match entry (${expected.length} bytes)`,
  );
}
console.log(`entry.txt: ${expected.length} bytes, ${chars.length} chars`);
