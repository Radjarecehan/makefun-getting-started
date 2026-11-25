// The 3 AM Excuse — a hardware wallet that refuses to sign at 3 AM.
// One line, 1-200 chars, written to /output/entry.txt (no trailing newline).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The wallet as a worker who is off the clock at 3 AM.
const PART_A = "Nope. It's 3 AM — I'm off the clock,";
const PART_B = " and your 'urgent' swap smells like a decision";
const PART_C = " you'll regret by breakfast.";

function assembleLine(): string {
  return PART_A + PART_B + PART_C;
}

function gateOk(line: string): boolean {
  const chars = [...line].length;
  // One line only: no newline characters anywhere in the entry.
  if (line.includes("\n") || line.includes("\r")) {
    return false;
  }
  return chars >= 1 && chars <= 200 && line.trim().length > 0;
}

function main(): void {
  const line = assembleLine();
  if (!gateOk(line)) {
    throw new Error(`gate failed: ${[...line].length} chars`);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, line, "utf8");
  // Read back and confirm the file holds exactly the line, nothing else.
  const back = readFileSync(target, "utf8");
  if (back !== line) {
    throw new Error("read-back mismatch");
  }
  console.log(
    `wrote ${[...line].length} chars / ${Buffer.byteLength(line, "utf8")} bytes to ${target}`,
  );
}

main();
