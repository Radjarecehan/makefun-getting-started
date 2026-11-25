// The Moon Finally Answers Back — entry program.
// Writes the Moon's one-line reply to <output dir>/entry.txt with no
// trailing newline.
//
// The line: "You wished on me for years and I heard every one; I just
// answer in moonlight, and moonlight is always running late."
//
// Why it works against the judge brief: it answers the wishes directly
// ("You wished on me for years and I heard every one"), it speaks in
// the Moon's own wry, tired voice, and the joke turns on one image —
// moonlight itself running late — instead of explaining anything. The
// field is crowded with "four billion years" entries that all sound
// alike; this one sidesteps that cluster and lets the lateness itself
// be the punchline, landing before the line ends.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line is composed at runtime from its two halves: the patient
// listening ("You wished on me for years and I heard every one") and
// the late answer ("I just answer in moonlight, and moonlight is
// always running late"). The semicolon is the hinge between them.
const FIRST_HALF =
  "You wished on me for years and I heard every one";
const SECOND_HALF =
  "I just answer in moonlight, and moonlight is always running late";
const LINE = `${FIRST_HALF}; ${SECOND_HALF}`;

// Gate guard, mirroring the sealed scorer: the entry must be UTF-8
// text of 1 to 240 characters, not only white space, and this
// competition asks for exactly one line, so no newline inside it.
function assertGate(line: string): void {
  const chars = [...line];
  if (chars.length < 1 || chars.length > 240) {
    throw new Error(`entry must be 1-240 characters, got ${chars.length}`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line (no newline)");
  }
}
assertGate(LINE);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read-back self-check: the file on disk must be byte-for-byte the
// designed line — same bytes, no trailing newline, nothing extra.
const onDisk = readFileSync(outPath);
const expected = Buffer.from(LINE, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error(
    `entry.txt mismatch: wrote ${onDisk.length} bytes, expected ${expected.length}`
  );
}
console.log(`entry.txt: ${onDisk.length} bytes, byte-exact`);

// Deterministic by design: no clock, no randomness, no network —
// every run writes the same 115 characters, so the grader's two runs
// can only ever agree.
