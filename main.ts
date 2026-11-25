// Unsent: The Micro-Confession Sprint — u-boothlord-unsent-the-micro-confession-sprint-8c6596ba
// Writes exactly one two-part micro-confession to /output/entry.txt:
// a To: line naming who it was meant for, then the unsent message itself,
// one line written exactly as it was typed, with no explanation after it.
// The confession: a son's unsent text to his late father about the last
// voicemail — he presses play and stops it before his father's voice
// starts, too late to call back, too afraid to hear it.
// Deterministic: same bytes on every run. Node 22 stdlib only.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "To: Dad\n" +
  "I still have the voicemail from the night before you died. I press play and stop it before your voice starts — I'm sorry I never called back.";

// Gate check (mirrors the sealed scorer): 1–260 UTF-8 characters total,
// not only whitespace; message line at most 200 characters (judge brief).
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 260) {
  throw new Error(`entry length ${chars.length} outside 1-260`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
const lines = ENTRY.split("\n");
if (lines.length !== 2 || !lines[0].startsWith("To: ") || lines[1].trim().length === 0) {
  throw new Error("entry must be exactly a To: line plus one message line");
}
if ([...lines[1]].length > 200) {
  throw new Error(`message line ${[...lines[1]].length} chars exceeds 200`);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Write the entry exactly as-is: no trailing newline, no extra bytes.
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
