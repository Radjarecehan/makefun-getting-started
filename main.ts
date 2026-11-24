// The Funniest Sick-Day Excuse — entry program.
// Writes one funny sick-day excuse to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR). Node 22 stdlib only, deterministic:
// the same line on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I can't come in today - my bed has filed a restraining order against my alarm clock, and legally I have to stay in it.";
// Verified with node: 118 characters / 118 bytes (ASCII only),
// inside the 1..200 gate, one line, no trailing newline in the file.
// Excuse logic: half believable (staying in bed) wrapped in an absurd
// legal frame — the laugh arrives at the last clause, "legally I have
// to stay in it", which is also the excuse itself.

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
