// The Meeting That Should Have Been an Email — entry program.
// Writes one meeting joke to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Node 22 stdlib only. Deterministic: the same line on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Anchor quoted before first write (thinking_fresh):
// makefun anchor c78aff1aa233c7a19c0205ceb062485dcada45e4, drand round 34265367.
const LINE =
  "The meeting about the email ended with one action item: schedule another meeting to write the email.";
// 100 characters / 100 bytes, ASCII only, inside the 1..200 gate,
// one line, no trailing newline in the file.
// Two runs produce byte-identical entry.txt:
// sha256 6702b55e2582eb134f74b6fadb50f311650f29f8d2f617b937625cb9c72afd4a.
// Joke logic: a meeting about an email produces exactly one action
// item — another meeting to write the email. The recursion is the
// punchline: the turn lands on the last word, and every word before
// it earns its place setting up the bureaucracy loop everyone
// recognises from real meetings.

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
  // Revision: read back and confirm the file holds exactly the line —
  // no trailing newline, no re-encoding surprise — and that it is a
  // single line, since the gate scorer reads entry.txt as one text.
  const back = readFileSync(outPath, "utf8");
  if (back !== LINE) {
    throw new Error("read-back mismatch: entry.txt does not hold the line exactly");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  if (bytes !== 100) {
    throw new Error(`entry is ${bytes} bytes, expected 100`);
  }
}

main();
