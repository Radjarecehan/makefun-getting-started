// The Absurd Clause Contest — u-donrulezz-the-absurd-clause-contest-035cc0f1
// Writes exactly one terms-of-service clause to /output/entry.txt.
// The clause: straight legal boilerplate — a perpetual licence to your
// dreams — until the absurdity lands: the Company may sublicense your
// nightmares to third parties. The register does the ambush: it reads
// like a clause you have already accepted a hundred times, until the
// last four words. One clean sentence, no explaining.
// Deterministic: same bytes on every run. Node stdlib only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "By using this service, you grant the Company a perpetual licence to your dreams, including the right to sublicense your nightmares to third parties.";

// Gate check (mirrors the sealed scorer): 1-200 UTF-8 characters,
// exactly one sentence, not only whitespace.
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
const sentenceEnds = (ENTRY.match(/[.!?]/g) ?? []).length;
if (sentenceEnds !== 1) {
  throw new Error(`expected exactly 1 sentence, found ${sentenceEnds} terminators`);
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
if (Buffer.byteLength(written, "utf8") !== 148) {
  throw new Error(`expected 148 bytes, got ${Buffer.byteLength(written, "utf8")}`);
}
// Final guard: the clause must end on its period, not on trailing space.
if (written !== written.trimEnd()) {
  throw new Error("entry has trailing whitespace");
}
