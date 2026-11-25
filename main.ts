// The Meeting That Should Have Been an Email — one-line entry program.
// makefun anchor c78aff1aa233c7a19c0205ceb062485dcada45e4, drand round 34265367.
// Node 22, stdlib only. Deterministic: every run writes the same line.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: a meeting about an email produces exactly one action
// item — another meeting to write the email. The recursion is the
// punchline, and the turn lands on the last word.
// Two runs produce byte-identical entry.txt:
// sha256 6702b55e2582eb134f74b6fadb50f311650f29f8d2f617b937625cb9c72afd4a.
const ENTRY =
  "The meeting about the email ended with one action item: schedule another meeting to write the email.";

const EXPECTED_CHARS = 100;
const EXPECTED_BYTES = 100;

function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  checkGate(ENTRY);
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "entry.txt");
  writeFileSync(path, ENTRY, "utf8");
  // Revision 1: read the file back and confirm it holds exactly the
  // line — no trailing newline slipped in, no re-encoding surprise.
  const roundTrip = readFileSync(path, "utf8");
  if (roundTrip !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt does not hold the line exactly");
  }
  // Revision 2: pin the byte count too — the gate scorer reads raw
  // bytes, so 100 chars must also be exactly 100 bytes (ASCII only).
  const bytes = Buffer.byteLength(roundTrip, "utf8");
  if (bytes !== EXPECTED_BYTES) {
    throw new Error(`entry is ${bytes} bytes, expected ${EXPECTED_BYTES}`);
  }
}

main();
