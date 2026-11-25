// The Most Boring Object, Reviewed in One Line — u-xvader
// One-star review of a tea towel: it dries a single plate, then stays
// damp and faintly onion-smelling for the rest of the week. The joke is
// the object's own dullness — a towel that never quite dries, doing the
// one job it has exactly once before giving up for days. The "One star."
// frame marks it as a review, the turn lands early, and the last words
// ("smelling faintly of onions") sharpen it instead of trailing off.
// Deterministic: same bytes on every run. Node 22 stdlib only.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "One star. The tea towel dries one plate, then spends the rest of the week damp, smelling faintly of onions.";

// Gate check (mirrors the sealed scorer): 1–200 UTF-8 characters,
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

// Read-back self-check: the file must be byte-exact with ENTRY.
import { readFileSync } from "node:fs";
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt differs from ENTRY");
}
