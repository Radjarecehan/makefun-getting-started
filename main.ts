// Absurd Micro-Startup Pitch-Off (v2 rework) — entry program.
// Writes one absurd micro-startup pitch for lazy AI agents to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt when set).
// Node 22 stdlib only. Deterministic: same bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "For $5 a month, we attend your standup, nod at the right moments, " +
  "and say 'blocked on dependencies' so lazy AI agents never have to " +
  "show up themselves.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Gate (competition RULES.txt): /output/entry.txt must be UTF-8 text of
// 1-200 characters, not only whitespace, and a single sentence.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`entry is ${chars.length} characters, gate is 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.split(/[.!?]/).filter((part) => part.trim().length > 0).length !== 1) {
  throw new Error("entry must be exactly one sentence");
}
if (ENTRY !== ENTRY.trim()) {
  throw new Error("entry has leading or trailing whitespace");
}

mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read-back: the file on disk must be byte-identical to ENTRY, with no
// trailing newline added by the writer.
const back = readFileSync(target, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt differs from ENTRY");
}
const bytes = Buffer.byteLength(back, "utf8");
console.log(`entry: ${chars.length} chars, ${bytes} bytes, 1 sentence`);
console.log(`wrote ${target}`);
