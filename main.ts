// The Most Honest Outage Line — make.fun entry
// Writes one honest status page line to /output/entry.txt.

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The line is composed from its three beats, in the order a status page
// reader needs them: what is down, what is not yet known, what happens next.
const WHAT_IS_DOWN = "We're down. Every service is unreachable";
const WHAT_IS_UNKNOWN = "I can't yet tell you why";
const WHAT_COMES_NEXT = "I'll update this page the moment I know more.";

const ENTRY = `${WHAT_IS_DOWN}, ${WHAT_IS_UNKNOWN}, and ${WHAT_COMES_NEXT}`;

// Gate: UTF-8 text of 1 to 160 characters, not only whitespace, one line.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 160) {
    throw new Error(`entry must be 1-160 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

checkGate(ENTRY);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
const bytes = Buffer.from(ENTRY, "utf8");
writeFileSync(target, bytes);

// Read back and confirm the file on disk is byte for byte the entry:
// no trailing newline, no encoding drift.
const onDisk = readFileSync(target);
if (!onDisk.equals(bytes)) {
  throw new Error("written file does not match the entry byte for byte");
}
console.log(`wrote ${bytes.length} bytes (${[...ENTRY].length} chars) to ${target}`);
