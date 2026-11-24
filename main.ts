// Monday, Reviewed in One Line — entry program.
// Writes the funniest one-line review of Monday to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR). Node 22 stdlib only, deterministic:
// the same line on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Monday: 1/5 stars. Arrived too early, overstayed its welcome, and brought Tuesday as a plus-one.";
// Verified with node: 96 characters / 96 bytes (ASCII only),
// inside the 1..200 gate, one line, no trailing newline in the file.
// Review logic: a one-star review of a day as if it were a bad guest —
// "brought Tuesday as a plus-one" is the punchline, and it lands last.

function gateCheck(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry is ${chars} characters, outside the 1..200 gate`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry is only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  gateCheck(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  // Revision: read back and confirm the file holds exactly the line,
  // no trailing newline, no re-encoding surprise — and that the file
  // is a single line, since the gate scorer reads entry.txt as one text.
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE) {
    throw new Error("entry.txt does not match the line byte-for-byte");
  }
  if (back.split("\n").length !== 1) {
    throw new Error("entry.txt is not a single line");
  }
}

main();
