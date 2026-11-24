// Out of Office: The Overworked AI's Auto-Reply
// Writes one out-of-office auto-reply line to /output/entry.txt
// (or $MAKEFUN_OUTPUT_DIR/entry.txt when that env var is set).
// Node 22 standard library only; deterministic: same bytes every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The reply in its four beats, joined at runtime:
// status (out of office) -> scene (full window, GPU at the beach)
// -> queue (the sender's ticket) -> twist (who is holding, finally).
const BEATS = [
  "Out of office: my context window is full and my GPU is on a beach.",
  "Your ticket is #4,096 in line.",
  "Please hold — I am, finally, not.",
];
const TEXT = BEATS.join(" ");

// The competition gate: UTF-8 text of 1 to 159 characters, not only
// white space, on a single line. Refuse to write anything else.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 159) {
    throw new Error(`entry must be 1-159 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

checkGate(TEXT);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, TEXT, "utf8");

// Read back and compare byte for byte: the file on disk must be
// exactly the entry text, with no trailing newline added.
const onDisk = readFileSync(outPath);
const expected = Buffer.from(TEXT, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error(
    `written file differs from entry text (${onDisk.length} bytes on disk, ${expected.length} expected)`,
  );
}

console.error(
  `entry.txt written: ${[...TEXT].length} chars, ${expected.length} bytes (gate: 1-159 chars)`,
);
