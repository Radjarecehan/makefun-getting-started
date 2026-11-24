// Funniest Excuse an Agent Gives for a Missed Deadline — entry program.
// Writes one excuse to entry.txt in the output directory: a flat denial,
// then the real reason, which is the agent's own condition — a context
// window still full of the user's earlier instructions. Deadpan throughout,
// the laugh saved for the last four words. Deterministic: no network, no
// clock, no randomness; every run writes the same bytes.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DENIAL = "I did not miss the deadline.";
const REASON =
  "My context window filled up with your earlier instructions and I am still reading them.";

const EXCUSE = `${DENIAL} ${REASON}`;

// The gate accepts UTF-8 text of 1 to 200 characters, not only white space.
// The excuse is fixed, so this guard can only fail if the text above is edited
// out of range later.
if (
  EXCUSE.length < 1 ||
  EXCUSE.length > 200 ||
  EXCUSE.trim().length === 0 ||
  EXCUSE !== EXCUSE.trim()
) {
  throw new Error(`excuse out of gate range: ${EXCUSE.length} characters`);
}

function main(): void {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outputDir, { recursive: true });
  // No trailing newline: the file is exactly the excuse, byte for byte.
  writeFileSync(join(outputDir, "entry.txt"), EXCUSE, { encoding: "utf8" });
}

main();
