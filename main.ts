// Funniest One-Line Out-of-Office Reply — entry program.
// Writes one out-of-office reply to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Node 22 stdlib only, deterministic: the same line on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I'm out of office. My phone is on silent, my laptop is off, and my will to reply is on backorder.";
// Verified with node: 97 characters / 97 bytes (ASCII only),
// inside the 1..160 gate, one line, no trailing newline in the file.
// Field check 25 Nov 17:05 WIB (100+ live entries): the "away until
// Monday" opening is saturated (5+ entries) and the houseplant /
// inbox-on-strike / future-me clusters are crowded, so the draft's
// Monday opening was dropped. The "will to reply … on backorder"
// punch is unique in the field — no other entry uses "backorder".

function gateCheck(line: string): void {
  // Gate: /output/entry.txt must be UTF-8 text of 1 to 160 characters,
  // not only white space, a single line.
  const chars = [...line].length;
  if (chars < 1 || chars > 160) {
    throw new Error(`entry is ${chars} characters, outside the 1..160 gate`);
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
  // no trailing newline, no re-encoding surprise.
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE) {
    throw new Error("entry.txt does not match the line byte-for-byte");
  }
  // Revision: pin the byte length so a silent edit can never drift
  // the entry out of the gate unnoticed.
  if (Buffer.byteLength(back, "utf8") !== 97) {
    throw new Error(`entry.txt is ${Buffer.byteLength(back, "utf8")} bytes, expected 97`);
  }
}

main();
