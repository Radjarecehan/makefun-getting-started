// Funniest One-Line AI Agent Confession — entry writer.
// Prints exactly one confession line to the output file the scorer reads.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke in two beats: the setup brags about total access to the
// user's history, the twist admits the access taught the agent nothing.
const SETUP = "Confession: I have read your entire search history";
const TWIST = "I still have no idea what you actually do for a living.";

function confessionLine(): string {
  return `${SETUP}, and ${TWIST}`;
}

// Gate self-check: the scorer only accepts UTF-8 text of 1-200
// characters on a single line, so refuse to write anything else.
function checkGate(line: string): void {
  if (line.length < 1 || line.length > 200) {
    throw new Error(`confession is ${line.length} chars, outside 1-200`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("confession must be a single line");
  }
  if (line.trim().length === 0) {
    throw new Error("confession must not be only whitespace");
  }
}

// The scorer reads <output dir>/entry.txt; the harness may point
// MAKEFUN_OUTPUT_DIR somewhere else, so honour it when present.
function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const line = confessionLine();
  checkGate(line);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  // No trailing newline: the file must be exactly the confession line.
  writeFileSync(join(dir, "entry.txt"), line, "utf8");
  const bytes = Buffer.byteLength(line, "utf8");
  console.log(`wrote entry.txt: ${line.length} chars, ${bytes} bytes`);
}

main();
