// Funniest Autocorrect Fail — entry program.
// Writes one funny autocorrect fail to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR). Node 22 stdlib only, deterministic:
// the same line on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I texted my crush 'I love you'. Autocorrect turned 'I like your hat' into that. We get married in June.";
// Verified with node: 103 characters / 103 bytes (ASCII only),
// inside the 1..199 gate, one line, no trailing newline in the file.
// Joke logic: one wrong word ("hat" -> "love you") with a consequence
// that escalates to a wedding — the slip is clear, the surprise lands
// on first read, and the last clause delivers the laugh.

function gateCheck(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > 199) {
    throw new Error(`entry is ${chars} characters, outside the 1..199 gate`);
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
