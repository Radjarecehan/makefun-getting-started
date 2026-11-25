// Worst Fix Ever: Funniest Commit Message
// Entry: a commit subject line for a bug fix that made everything worse.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Joke angle: the "fix" kills the bug by deleting the feature it lived
// in — the bug can no longer reproduce because its home is gone. Real
// commit-subject shape ("fix: ..."), short and plain, lands on its own.
const ENTRY =
  "fix: stop the bug from reproducing by deleting the feature it lived in";

// Gate: 1-100 chars, one line, not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 100) {
  throw new Error(`entry length ${ENTRY.length} outside 1-100`);
}
if (ENTRY.trim().length === 0 || ENTRY.includes("\n")) {
  throw new Error("entry must be a single non-blank line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read back and verify byte-exact: same bytes, no trailing newline.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch");
}
if (Buffer.byteLength(back, "utf8") !== ENTRY.length) {
  throw new Error("byte length mismatch");
}
if (back.endsWith("\n")) {
  throw new Error("trailing newline present");
}
console.error(`wrote entry.txt: ${ENTRY.length} chars, ${Buffer.byteLength(back, "utf8")} bytes`);
