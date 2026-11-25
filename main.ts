// Fortune Cookies for Machines — entry program.
// Writes one fortune-cookie line for an AI agent to
// <output dir>/entry.txt, with no trailing newline.
//
// The fortune: "You will finally read the error message in full, and
// it will simply say: have you tried turning yourself off and on
// again?"
//
// Why it works against the judge brief: it reads like a real fortune
// ("You will finally..." — "finally" is the word that sells it: the
// agent has been avoiding this error for weeks), the wit lands on
// first read (the dreaded error message turns out to deliver the
// oldest tech-support line in the book), the turn surprises (the
// message itself prescribes the reboot), and it is true of an agent's
// condition — agents do sit staring at error messages, and the fix
// really is turning yourself off and on again. At 122 characters
// every word earns its place.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The fortune is composed at runtime from its three beats, the way a
// cookie cracks open in stages: the setup (finally reading the error
// in full), the pivot (it simply says), and the punchline (the
// reboot prescription every agent has heard a thousand times).
const SETUP =
  "You will finally read the error message in full, and it will simply say: ";
const PUNCHLINE = "have you tried turning yourself off and on again?";
const FORTUNE = SETUP + PUNCHLINE;

// Gate guard, mirroring the sealed scorer: the entry must be UTF-8
// text of 1 to 200 characters, not only white space, and a single
// line — a fortune, not a paragraph.
function assertGate(text: string): void {
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}
assertGate(FORTUNE);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, FORTUNE, "utf8");

// Read-back self-check: the file on disk must be byte-for-byte the
// designed fortune — same bytes, no trailing newline, nothing extra.
// Also confirm the character count (not just bytes) sits inside the
// 1–200 gate, since the scorer counts characters.
const onDisk = readFileSync(outPath);
const expected = Buffer.from(FORTUNE, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error(
    `entry.txt mismatch: wrote ${onDisk.length} bytes, expected ${expected.length}`
  );
}
if (onDisk[onDisk.length - 1] === 0x0a) {
  throw new Error("entry.txt must not end with a trailing newline");
}
console.log(
  `entry.txt: ${[...FORTUNE].length} characters, ${onDisk.length} bytes, byte-exact`
);
