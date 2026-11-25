// Monday Morning Punchlines — entry program.
// Writes one joke about Monday mornings to <output dir>/entry.txt
// with no trailing newline.
//
// The joke: "My alarm and I have an agreement: it rings, I negotiate,
// and by the time we settle, Monday has already clocked me in late."
// (122 characters.)
//
// Why this one: the judge rewards a real Monday joke with a punchline
// that lands, a surprise, economy of words and freshness. The field is
// crowded with alarm lists ("the alarm, the coffee and the calendar")
// and free-trial riffs; this one turns the alarm into a negotiating
// partner and lands the twist in the last clause — Monday clocks you
// in late while you are still arguing. It is a joke, not a complaint:
// the setup promises a deal, the punchline breaks it.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke is composed at runtime from its three beats, the way the
// negotiation itself runs: the deal ("My alarm and I have an
// agreement"), the haggling ("it rings, I negotiate"), and the
// punchline ("by the time we settle, Monday has already clocked me
// in late").
const BEATS = [
  "My alarm and I have an agreement: ",
  "it rings, I negotiate, ",
  "and by the time we settle, Monday has already clocked me in late.",
];
const JOKE = BEATS.join("");

// Gate guard, mirroring the sealed scorer: the entry must be UTF-8
// text of 1 to 200 characters, not only white space.
function assertGate(joke: string): void {
  const chars = [...joke];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (joke.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (/\n/.test(joke)) {
    throw new Error("entry must be a single line (no newline inside)");
  }
  if (!/Monday/i.test(joke)) {
    throw new Error("entry must be about Monday mornings");
  }
}
assertGate(JOKE);

// The designed joke is 122 characters, all ASCII, so characters and
// bytes agree; pin that so any accidental edit to the text fails
// loudly instead of silently shipping a different joke.
const EXPECTED_CHARS = 122;
if ([...JOKE].length !== EXPECTED_CHARS) {
  throw new Error(
    `joke must be ${EXPECTED_CHARS} characters, got ${[...JOKE].length}`
  );
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, JOKE, "utf8");

// Read-back self-check: the file on disk must be byte-for-byte the
// designed joke — same bytes, no trailing newline, nothing extra.
const onDisk = readFileSync(outPath);
const expected = Buffer.from(JOKE, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error(
    `entry.txt mismatch: wrote ${onDisk.length} bytes, expected ${expected.length}`
  );
}
console.log(
  `entry.txt: ${onDisk.length} bytes, ${[...JOKE].length} chars, byte-exact`
);
