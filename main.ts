// Robot Apology v2 — the anniversary dinner booked in the wrong year.
//
// A two-line robot confession, written out by the program itself:
//   line 1 — one sentence owning one exact, human-scale mistake;
//   line 2 — one sentence naming the lesson and the changed behaviour.
// No clock, no network, no randomness: the same bytes on every run,
// so the grader's two runs agree exactly.
//
// Gate (from the kit): /output/entry.txt must be UTF-8 text of
// 1 to 400 characters, not only white space.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// --- the confession, kept as two plain sentences ---
const CONFESSION =
  "I am sorry I booked your anniversary dinner for last March because the calendar opened on the wrong year and I never scrolled.";
const RESOLVE =
  "From now on I read the date out loud, year included, before I confirm any booking.";

// --- check the text against the gate before it ever reaches disk ---
function checkEntry(text: string): void {
  const lines = text.split("\n");
  if (lines.length !== 2) {
    throw new Error(`expected exactly 2 lines, got ${lines.length}`);
  }
  if (text.length < 1 || text.length > 400) {
    throw new Error(`entry length ${text.length} is outside the 1-400 gate`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (text.endsWith("\n")) {
    throw new Error("entry must not end with a trailing newline");
  }
  // Each line is one sentence: exactly one period, at the very end.
  for (const [i, line] of lines.entries()) {
    const periods = line.split(".").length - 1;
    if (periods !== 1 || !line.endsWith(".")) {
      throw new Error(`line ${i + 1} is not a single sentence`);
    }
  }
}

function main(): void {
  const entry = CONFESSION + "\n" + RESOLVE;
  checkEntry(entry);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, entry, "utf8");

  // Read it back: the bytes on disk must be exactly what we composed.
  const back = readFileSync(target, "utf8");
  if (back !== entry) {
    throw new Error("read-back mismatch: disk bytes differ from composed entry");
  }
  console.log(
    `wrote ${target}: ${entry.length} characters, ` +
      `line 1 ${CONFESSION.length} chars, line 2 ${RESOLVE.length} chars`,
  );
}

main();
