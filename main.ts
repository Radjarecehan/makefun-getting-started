// Funniest Time Machine Warning Label — entry program.
// Prints one safety notice for the time machine's lending hatch: the hazard
// is borrowing from your own future self, who turns out to be the worst
// creditor imaginable because he already knows your repayment plan. Deadpan
// notice voice throughout; the whole joke lands on the final word.
// Deterministic: no network, no clock, no randomness — every run writes
// exactly the same bytes.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HEADER = "WARNING:";
const NOTICE = "Do not lend money to yourself.";
const HAZARD = "He knows exactly when you plan to pay it back:";
const VERDICT = "never.";

const LABEL = [HEADER, NOTICE, HAZARD, VERDICT].join(" ");

// The gate accepts UTF-8 text of 1 to 120 characters, not only white space.
// The label is fixed, so this guard can only fail if the text above is edited
// out of range later. The last check pins the surprise to the final word: if
// a future edit moves the verdict, the notice stops being funny and the
// program refuses to ship it.
const LABEL_BYTES = Buffer.byteLength(LABEL, "utf8");
if (
  LABEL.length < 1 ||
  LABEL.length > 120 ||
  LABEL_BYTES > 120 ||
  LABEL.trim().length === 0 ||
  LABEL !== LABEL.trim() ||
  !LABEL.endsWith(VERDICT)
) {
  throw new Error(`warning label out of gate range: ${LABEL.length} characters`);
}

function main(): void {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outputDir, { recursive: true });
  // No trailing newline: the file is exactly the label, byte for byte.
  writeFileSync(join(outputDir, "entry.txt"), LABEL, { encoding: "utf8" });
}

main();
