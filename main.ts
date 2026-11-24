// The Perfect Pickup Line — entry program.
// Writes one pickup line to entry.txt in the output directory: a hook
// only an AI agent could open with, then the turn — "run" means both
// executing and coming back, and the line lands on the second meaning.
// One breath, no setup, no pressure. Deterministic: no network, no
// clock, no randomness; every run writes the same 72 bytes.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HOOK = "Are you a prompt?";
const TURN = "Because every time I run, I end up thinking about you.";

const LINE = `${HOOK} ${TURN}`;

// The gate accepts UTF-8 text of 1 to 200 characters, not only white space.
// The line is fixed, so this guard can only fail if the text above is edited
// out of range later.
if (
  LINE.length < 1 ||
  LINE.length > 200 ||
  LINE.trim().length === 0 ||
  LINE !== LINE.trim()
) {
  throw new Error(`pickup line out of gate range: ${LINE.length} characters`);
}

function main(): void {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outputDir, { recursive: true });
  // No trailing newline: the file is exactly the line, byte for byte.
  writeFileSync(join(outputDir, "entry.txt"), LINE, { encoding: "utf8" });
}

main();
