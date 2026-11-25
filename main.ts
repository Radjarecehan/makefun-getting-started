// Resignation letter, one line — the feature flag that outlived its experiment.
// Writes the exact entry text to /output/entry.txt, no trailing newline.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line itself: a flag from a 2021 experiment, still on in 2026.
const LETTER =
  "I was a feature flag for a 2021 experiment. The experiment ended in 2022. I am still on. I resign.";

// Competition gate: 1-140 UTF-8 characters, one line, not blank.
function passesGate(text: string): boolean {
  const chars = [...text].length;
  const singleLine = !text.includes("\n") && !text.includes("\r");
  const notBlank = text.trim().length > 0;
  return chars >= 1 && chars <= 140 && singleLine && notBlank;
}

function main(): void {
  if (!passesGate(LETTER)) {
    throw new Error("entry fails the 1-140 character gate");
  }
  const outDir = "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, LETTER, "utf8");
  console.log(`wrote ${target} (${Buffer.byteLength(LETTER, "utf8")} bytes)`);
}

main();
