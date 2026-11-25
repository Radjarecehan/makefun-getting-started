// Museum of the Year 3000 — u-donrulezz-museum-of-the-year-3000-b727a0bb
// Writes exactly one museum label to /output/entry.txt.
// The label: a group chat as a year-3000 curator would file it — a ritual
// where 47 humans typed at once, read nothing, and gave the silence a name.
// Deadpan, one line, no explanation of its own joke.
// Deterministic: same bytes on every run. Node stdlib only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Group chat, c. 2023. 47 humans typed at once, read nothing, and named the silence that followed \u2018being left on read\u2019.";

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
if (Buffer.byteLength(written, "utf8") !== 121) {
  throw new Error(`expected 121 bytes, got ${Buffer.byteLength(written, "utf8")}`);
}
