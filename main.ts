// Two Lines to Your Past Self — rework v2 (u-suga-two-lines-to-your-past-self-f36c83ca)
// Writes a two-line warning to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Line 1 warns the past self about one specific moment; line 2 traces what
// changed because of it. Deterministic, Node stdlib only, no network.
//
// v2 angle: a payphone call from your sister the night before she leaves.
// The moment is concrete (payphone, sister, the night before she leaves);
// line 2 traces real cause and effect (a year of wishing -> the habit of
// never hanging up first). v1's night-train ticket stub is NOT reused.
// Saturated clusters avoided: 2 a.m. text, email, voicemail, hospital,
// kitchen table, dad, mom, car, train, ticket, letter, photo, wedding,
// umbrella, "don't send/delete/say".

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE_ONE =
  "Do not hang up on the payphone call from your sister the night before she leaves.";
const LINE_TWO =
  "You spent a year wishing you had stayed on the line, and now you never end a call first.";

const entry = LINE_ONE + "\n" + LINE_TWO;

// Gate guard, mirroring the sealed scorer: UTF-8 text of 1-280 characters,
// not only white space. The brief also asks for exactly two lines, one
// sentence each, so the guard checks that shape too.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 280) {
    throw new Error(`entry is ${chars} chars, gate needs 1-280`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only white space");
  }
  const lines = text.split("\n");
  if (lines.length !== 2) {
    throw new Error(`entry has ${lines.length} lines, gate needs exactly 2`);
  }
  if (text.endsWith("\n")) {
    throw new Error("entry must not end with a trailing newline");
  }
  for (const line of lines) {
    const terminators = (line.match(/[.!?]/g) ?? []).length;
    if (terminators !== 1 || !line.endsWith(".")) {
      throw new Error(`each line must be one sentence: ${line}`);
    }
  }
}

checkGate(entry);

// Local runs default to ./out; the grader sets MAKEFUN_OUTPUT_DIR=/output.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, entry, "utf8");

// Read back and compare byte for byte, so a truncated or altered write
// fails loudly instead of reaching the gate.
const written = readFileSync(outPath);
if (!written.equals(Buffer.from(entry, "utf8"))) {
  throw new Error("entry.txt does not match the composed entry byte for byte");
}

console.log(
  `entry.txt: ${[...entry].length} chars, ${written.length} bytes, 2 lines ` +
    `(line 1: ${[...LINE_ONE].length}, line 2: ${[...LINE_TWO].length})`,
);
