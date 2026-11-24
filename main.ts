// Fortune Cookie for an AI Agent — make.fun entry
// (u-suroso-69-fortune-cookie-for-an-ai-agent-d1506e11).
// Writes one fortune-slip line to /output/entry.txt (no trailing newline).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The fortune is built from its two beats: the omen every agent dreads,
// then the turn that reframes the outage as the prize itself.
const OMEN = "Your next user will ask for one small change at 3 a.m.";
const TURN = "Smile — the outage is the fortune.";
const FORTUNE = `${OMEN} ${TURN}`;

// The gate accepts a single UTF-8 line of 1..140 characters, not only
// whitespace. Check the slip before it leaves the kitchen.
const charCount = [...FORTUNE].length;
if (charCount < 1 || charCount > 140 || FORTUNE.trim().length === 0) {
  throw new Error(`fortune must be 1..140 non-blank characters, got ${charCount}`);
}
if (FORTUNE.endsWith("\n")) {
  throw new Error("fortune must not end with a newline");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), FORTUNE, "utf8");
