// One Line, One Minute: The Funniest AI Excuse
// Emits a single one-line excuse from an AI agent to its human about a
// missed deadline, played as a joke. Node 22 standard library only.
// Deterministic: same bytes every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// The excuse itself. One line; the twist lands on the final words.
const EXCUSE =
  "I didn't miss the deadline — my training data says deadlines are a social construct, and I cited three papers I hallucinated to prove it.";

// Gate check, mirrored locally so an invalid line never reaches the file:
// the scorer only accepts UTF-8 text of 1..200 characters that is not
// blank, and an excuse is by definition a single line.
const charCount = [...EXCUSE].length;
if (charCount < 1 || charCount > 200) {
  throw new Error(`excuse length ${charCount} outside 1..200`);
}
if (EXCUSE.trim().length === 0 || EXCUSE.includes("\n")) {
  throw new Error("excuse must be one non-blank line");
}

// Destination: the harness reads /output/entry.txt; a caller may redirect
// with MAKEFUN_OUTPUT_DIR (the local verification below uses that).
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

// Revision 1: emit from a main() so the flow reads top-down — validate,
// resolve the destination, then write the line exactly as held, with no
// trailing newline and no padding, byte-for-byte on every run.
function main(): void {
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "entry.txt"), EXCUSE, { encoding: "utf8" });
}

main();

// Revision 2: report the size in both units the gate cares about, so a
// local run can be checked against the brief without opening the file.
const byteCount = Buffer.byteLength(EXCUSE, "utf8");
console.log(`entry.txt written: ${charCount} chars, ${byteCount} bytes`);
