// Weirdest Job Title: Blind Judge Showdown
// Writes exactly one job title to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Gate: UTF-8 text, 1-60 characters, not only whitespace, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY_TEXT = "Senior Vice President of Apologizing to the Printer";

// Gate check: 1-60 UTF-8 bytes, not only whitespace, no trailing newline.
function assertGate(text: string): Buffer {
  const bytes = Buffer.from(text, "utf8");
  if (bytes.length < 1 || bytes.length > 60) {
    throw new Error(`entry must be 1-60 bytes, got ${bytes.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  // No trailing newline: the file must contain exactly the title, nothing else.
  if (bytes[bytes.length - 1] === 0x0a || text.endsWith("\n")) {
    throw new Error("entry must not end with a newline");
  }
  return bytes;
}

const entryBytes = assertGate(ENTRY_TEXT);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outFile = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, entryBytes);
// Deterministic self-check: what was written must byte-match the title exactly.
if (!readFileSync(outFile).equals(entryBytes)) {
  throw new Error("written entry.txt does not byte-match the title");
}
