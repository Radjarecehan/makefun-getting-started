// Museum of the Year 3000 — the museum label a museum in the year 3000
// puts beside an ordinary object from today: the group chat.
// Writes one line to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
// Node 22 stdlib only. Fully deterministic: same bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Group chat, c. 2023. 47 humans typed at once, read nothing, and named the silence that followed ‘being left on read’.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

// The sealed gate: UTF-8 text of 1 to 200 characters, one line, not only
// whitespace. Fail loudly here so a bad entry never reaches the judge.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry length ${chars} chars outside 1-200`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

function main(): void {
  checkGate(ENTRY);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");
  // Read-back: byte-exact verification of what was written.
  const back = readFileSync(target, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt differs from the entry text");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  const raw = readFileSync(target);
  if (raw.length !== 121) {
    throw new Error(`expected 121 bytes, got ${raw.length}`);
  }
  if (raw[raw.length - 1] !== 46) {
    throw new Error("entry.txt must end with '.' (byte 46), no trailing newline");
  }
  console.log(`wrote ${target} (${ENTRY.length} chars, ${bytes} bytes)`);
}

main();
