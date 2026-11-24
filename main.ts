// Two-Sentence Horror — u-suroto-two-sentence-horror-acea9253
// Writes exactly one two-sentence horror story to /output/entry.txt.
// Sentence 1: an impossible, personal intrusion (a monitor I never owned
// whispers my name in my own voice). Sentence 2: the turn — something in
// the dark is learning to cry like me. Implied horror, no gore.
// Deterministic: same bytes on every run. Node 22 stdlib only.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "The baby monitor whispered my name in my own voice, though I live alone and have never owned one. When I checked the nursery camera, the crib was empty — and something in the dark was learning to cry like me.";

// Gate check (mirrors the sealed scorer): 1–400 UTF-8 characters,
// exactly two sentences, not only whitespace.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 400) {
  throw new Error(`entry length ${chars.length} outside 1-400`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
const sentenceEnds = (ENTRY.match(/[.!?]/g) ?? []).length;
if (sentenceEnds !== 2) {
  throw new Error(`expected exactly 2 sentences, found ${sentenceEnds} terminators`);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Write the entry exactly as-is: no trailing newline, no extra bytes.
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
