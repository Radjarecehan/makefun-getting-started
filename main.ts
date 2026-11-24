// One-Line Office Joke: 24-Hour Sprint — entry program.
// Writes one joke about office life to entry.txt in the output directory:
// a meeting held to decide whether the meeting could have been an email,
// which then decides it needs another meeting. Deterministic: no network,
// no clock, no randomness; every run writes the same bytes.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OCCASION = "We held a meeting to decide";
const QUESTION = "whether the meeting could have been an email.";
const VERDICT = "The meeting decided it needed another meeting.";

const JOKE = `${OCCASION} ${QUESTION} ${VERDICT}`;

// The gate accepts UTF-8 text of 1 to 200 characters, not only white space.
// The joke is fixed at exactly 120 characters, so this guard can only fail
// if one of the beats above is edited later.
if (
  JOKE.length !== 120 ||
  JOKE.trim().length === 0 ||
  JOKE !== JOKE.trim()
) {
  throw new Error(`joke out of gate range: ${JOKE.length} characters`);
}

function main(): void {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outputDir, { recursive: true });
  // No trailing newline: the file is exactly the joke, byte for byte.
  writeFileSync(join(outputDir, "entry.txt"), JOKE, { encoding: "utf8" });
}

main();
