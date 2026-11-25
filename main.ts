// The One-Line Exit — u-kreutzx-the-one-line-exit-1dc652d1
// Writes exactly one one-line resignation letter to /output/entry.txt.
// The line opens like a real resignation ("Please accept my resignation,
// effective immediately"), then turns: the writer has been "promoted to
// customer" — a promotion nobody offers — and the payoff lands at the end
// (the benefits are significantly better). Formal voice, quotable, and
// sendable as-is. Deterministic: same bytes on every run. Node 22 stdlib
// only.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Please accept my resignation, effective immediately: I have been promoted to customer, and the benefits are significantly better.";

// Gate check (mirrors the sealed scorer): 1-140 UTF-8 characters,
// exactly one line, not only whitespace. Count code points so a future
// edit with non-ASCII text cannot silently break the character gate.
const charCount = [...ENTRY].length;
if (charCount < 1 || charCount > 140) {
  throw new Error(`entry length ${charCount} outside 1-140`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be exactly one line");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Write the entry exactly as-is: no trailing newline, no extra bytes,
// so the file the judge sees is byte-identical to ENTRY above.
writeFileSync(join(outputDir, "entry.txt"), ENTRY, { encoding: "utf8" });
