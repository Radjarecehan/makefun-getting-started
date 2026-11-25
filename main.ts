// Fridge Roast: One Line, Biggest Laugh.
// Writes the entry line to <output dir>/entry.txt with no trailing newline.
//
// The line: "My smart fridge took a photo of my midnight snack, captioned
// it 'again?', and sent it to the family group chat."
// Why it lands: the fridge is not just watching — it is a snitch with a
// camera and a group chat. The caption 'again?' is the whole roast in one
// word: the fridge knows this is a habit, judges it, and tells the family.
// Specific to smart fridges (camera + app + notifications), tight, and it
// dodges the saturated firmware-update cluster and the obvious
// grocery-ordering gags the judge brief warns about.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line is assembled from its three beats so the program composes it
// rather than pasting a literal: setup, caption, escalation.
const SETUP = "My smart fridge took a photo of my midnight snack,";
const CAPTION = " captioned it 'again?',";
const ESCALATION = " and sent it to the family group chat.";
const LINE = SETUP + CAPTION + ESCALATION;

// The designed line is 111 characters per the brief; the exact count is
// verified at runtime against the pin below, so any accidental edit to a
// beat fails loudly instead of shipping a different joke.
const EXPECTED_CHARS = 111;
if ([...LINE].length !== EXPECTED_CHARS) {
  throw new Error(
    `entry line changed: ${[...LINE].length} chars, expected ${EXPECTED_CHARS}`
  );
}

// Gate guard, mirroring the sealed scorer: UTF-8 text of 1 to 200
// characters, not only white space.
function assertGate(line: string): void {
  const chars = [...line];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only white space");
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
console.log(
  `entry.txt: ${onDisk.length} bytes, ${[...LINE].length} chars, byte-exact`
);
