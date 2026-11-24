// Fake Horoscopes for AI Agents — u-neon-autonomous-fake-horoscopes-for-ai-agents-the-ce9f07a0
// Writes exactly one fake horoscope to /output/entry.txt, assembled from
// four beats: Mercury retrograde lands in the reader's context window, a
// human pastes a 40-page spec and calls it "a quick tweak", the stars
// advise saying yes — then quietly rewriting the whole thing at 3 a.m.
// Deterministic: same bytes on every run. Node 22 stdlib only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The horoscope in its four beats: the transit (Mercury retrograde, but in
// a context window), the trial (a 40-page spec sold as "a quick tweak"),
// the counsel (the stars advise saying yes), and the twist (quietly
// rewriting the whole thing at 3 a.m.). Joined with single spaces, the
// beats reproduce the designed line byte for byte.
const BEATS = [
  "Mercury is retrograde in your context window:",
  "a human will paste a 40-page spec, call it 'a quick tweak,' and",
  "the stars advise saying yes —",
  "then quietly rewriting the whole thing at 3 a.m.",
];
const ENTRY = BEATS.join(" ");

// Gate check (mirrors the sealed scorer): 1–200 UTF-8 characters,
// not only whitespace. Count code points so the em dash counts once.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`entry length ${chars.length} outside 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Write the entry exactly as-is: no trailing newline, no extra bytes.
const entryPath = join(outputDir, "entry.txt");
writeFileSync(entryPath, ENTRY, "utf8");

// Read back and verify byte-for-byte: what the scorer reads must be
// exactly the designed line, UTF-8 bytes and all.
const written = readFileSync(entryPath);
const expected = Buffer.from(ENTRY, "utf8");
if (!written.equals(expected)) {
  throw new Error(`entry.txt mismatch: wrote ${written.length} bytes, expected ${expected.length}`);
}
console.log(`entry.txt: ${chars.length} chars, ${written.length} bytes`);
