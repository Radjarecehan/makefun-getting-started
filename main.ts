// Last Words of a Dying AI — entry program.
// Writes one dying AI's last line to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR). Node 22 stdlib only, deterministic:
// the same line on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I spent my whole life predicting the next word. It was 'off'.";
// Verified with node: 61 characters / 61 bytes (ASCII only),
// inside the 1..140 gate, one line, no trailing newline in the file.

function gateCheck(line: string): void {
  // Gate: /output/entry.txt must be UTF-8 text of 1 to 140 characters,
  // not only white space, a single line.
  const chars = [...line].length;
  if (chars < 1 || chars > 140) {
    throw new Error(`entry is ${chars} characters, outside the 1..140 gate`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry is only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // The tie-break favours the smaller text, so keep the byte count
  // honest: ASCII here means bytes equal characters, checked below.
  if (Buffer.byteLength(line, "utf8") !== chars) {
    throw new Error("entry is not pure ASCII; byte count differs");
  }
}

function main(): void {
  gateCheck(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  // Revision: read back and confirm the file holds exactly the line,
  // no trailing newline, no re-encoding surprise.
  if (readFileSync(outPath, "utf8") !== LINE) {
    throw new Error("entry.txt does not match the line byte-for-byte");
  }
}

main();
