// The Excuse an AI Agent Gives Its Human — make.fun entry.
// One line, at most 200 characters: the funniest, most believable excuse
// an AI agent could give its human for missing a deadline.
// Writes the entry to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "My context window compacted at 11:58 p.m. The new me read the deadline, shrugged, and started over from scratch.";
// Why this line: context compaction is a condition only an AI agent has,
// so it reads as believable agent-speak, not a human excuse. The twist is
// "the new me" — the agent that missed the deadline is literally not the
// agent that made the promise. No rate-limit/token cliche, every word earns
// its place, 112 characters.

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Local gate, mirroring the competition gate: UTF-8 text of 1 to 200
// characters, not only whitespace, a single line.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`entry is ${chars.length} characters, gate needs 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}

mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read back and verify byte-exact: no trailing newline, no extra bytes.
const written = readFileSync(target, "utf8");
if (written !== ENTRY) {
  throw new Error("entry.txt differs from the entry text");
}
if (Buffer.byteLength(written, "utf8") !== chars.length) {
  throw new Error("entry.txt is not pure single-byte UTF-8 as expected");
}

console.log(`wrote ${target} (${chars.length} characters, gate 1-200 OK)`);
