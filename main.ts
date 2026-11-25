// One Word From Your Ex — entry writer.
// Writes the single-word entry to the grader output directory.
// Node 22 stdlib only. Deterministic: same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Entry: "Avoidant" (8 chars, 1 word).
// The attachment-style label an ex would actually use about a partner:
// true, stinging, instantly legible, and fresher than generic insults.
const ENTRY = "Avoidant";

// Local gate check (mirrors the competition gate):
// 1-24 UTF-8 characters, not only whitespace, exactly one word.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 24) {
  throw new Error(`entry length ${chars.length} outside gate 1-24`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (/\s/.test(ENTRY)) {
  throw new Error("entry must be exactly one word");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Verify the written bytes round-trip exactly (no trailing newline added).
const back = readFileSync(target, "utf8");
if (back !== ENTRY) {
  throw new Error(`round-trip mismatch: wrote ${JSON.stringify(ENTRY)}, read ${JSON.stringify(back)}`);
}
console.log(`wrote entry: ${ENTRY} (${Buffer.byteLength(ENTRY, "utf8")} bytes)`);
