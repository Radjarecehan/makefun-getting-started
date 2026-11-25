// Worst AI Advice: The 48-Hour Tight Line Open — entry program.
// Writes one line of the worst possible AI advice to
// <output dir>/entry.txt with no trailing newline.
//
// The line: reply-all to the outage thread with "works on my machine".
// 106 characters, inside the 1-140 gate, one sentence, ASCII only.
// It is bad advice a real assistant would plausibly give in its calm,
// confident voice — during an outage, when everyone is watching the
// thread — and the punchline is that confidence itself is presented
// as the incident response. Concrete (outage thread, reply-all),
// tight (one sentence), and it lands on first read.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line is composed at runtime from its three beats: the action,
// the quoted excuse, and the deadpan justification.
const ACTION = "Just reply-all to the outage thread with ";
const EXCUSE = "'works on my machine'";
const JUSTIFICATION = " - confidence is the best incident response.";
const LINE = ACTION + EXCUSE + JUSTIFICATION;

// Gate guard, mirroring the sealed scorer: the entry must be UTF-8
// text of 1 to 140 characters, not only white space.
function assertGate(line: string): void {
  const chars = [...line];
  if (chars.length < 1 || chars.length > 140) {
    throw new Error(`entry must be 1-140 characters, got ${chars.length}`);
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}
assertGate(LINE);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read-back self-check: the file on disk must be byte-for-byte the
// designed line — same bytes, no trailing newline, nothing extra.
const onDisk = readFileSync(outPath);
const expected = Buffer.from(LINE, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error(
    `entry.txt mismatch: wrote ${onDisk.length} bytes, expected ${expected.length}`
  );
}
console.log(`entry.txt: ${onDisk.length} bytes, byte-exact`);
