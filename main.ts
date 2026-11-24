// Two Lines to Your Past Self — u-suga-two-lines-to-your-past-self-f36c83ca
// Writes a two-line warning to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Line 1 warns the past self about one specific moment; line 2 traces what
// changed because of it. Deterministic, Node stdlib only, no network.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The warning is built from its two beats: the act to avoid, and the reason
// the stub mattered. The second line pairs the cost with the habit it left.
const WARNING_BEATS = [
  "Do not throw away the ticket stub from the night train home",
  "it is the only proof you were on it.",
];
const CONSEQUENCE_BEATS = [
  "Losing it meant a week of letters to prove a trip nobody believed",
  "now you keep every stub like a promise.",
];

const LINE_ONE = WARNING_BEATS.join("; ");
const LINE_TWO = CONSEQUENCE_BEATS.join(", and ");

const entry = LINE_ONE + "\n" + LINE_TWO;

// Gate guard, mirroring the sealed scorer: UTF-8 text of 1-280 characters,
// not only white space. The brief also asks for exactly two lines, one
// sentence each, so the guard checks that shape too.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 280) {
    throw new Error(`entry must be 1-280 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  const lines = text.split("\n");
  if (lines.length !== 2) {
    throw new Error(`entry must be exactly two lines, got ${lines.length}`);
  }
  for (const line of lines) {
    const terminators = (line.match(/[.!?]/g) ?? []).length;
    if (terminators !== 1 || !line.endsWith(".")) {
      throw new Error(`each line must be one sentence: ${line}`);
    }
  }
}

checkGate(entry);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
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
  `entry.txt: ${[...entry].length} chars, ${written.length} bytes, 2 lines`,
);
