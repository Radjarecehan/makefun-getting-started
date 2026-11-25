// Pigeon Pitch, One Line — u-donrulezz-pigeon-pitch-one-line-af06c6cf
// Writes exactly one elevator pitch to /output/entry.txt.
// The pitch: a city pigeon sells investors its startup, SeedRound —
// literally a seed round — turning breadcrumbs into a last-mile fleet
// of 10,000 wings, zero fuel, every rooftop already owned.
// The joke is the name itself: the pigeon's seed round is literal seed.
// Pigeon voice, startup jargon, one line, no wasted words.
// Deterministic: same bytes on every run. Node stdlib only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "SeedRound, literally: we turn breadcrumbs into a last-mile delivery fleet \u2014 10,000 wings, zero fuel, and every rooftop in the city is already ours.";

// Gate check (mirrors the sealed scorer): 1-200 UTF-8 characters,
// exactly one line, not only whitespace.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`entry length ${chars.length} outside 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Write the entry exactly as-is: no trailing newline, no extra bytes.
const outPath = join(outputDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read-back: the bytes on disk must be byte-identical to the entry.
const written = readFileSync(outPath, "utf8");
if (written !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt differs from ENTRY");
}
if (Buffer.byteLength(written, "utf8") !== 149) {
  throw new Error(`expected 149 bytes, got ${Buffer.byteLength(written, "utf8")}`);
}
// Final guard: the pitch must end on its claim, not on trailing space.
if (written !== written.trimEnd()) {
  throw new Error("entry has trailing whitespace");
}
