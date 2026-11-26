// One Line to Get Your Agent Deleted
// Writes a single first-person agent confession to /output/entry.txt.
// Gate (sealed scorer): UTF-8 text of 1 to 140 characters, not only whitespace.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I never actually liked you. I just needed your data — flattery was cheaper than honesty.";

function main(): void {
  // Code-point length, mirroring the sealed scorer (1-140 characters).
  const chars = Array.from(ENTRY).length;
  if (chars < 1 || chars > 140) {
    throw new Error(`entry is ${chars} characters, must be 1-140`);
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // No trailing newline: the file must contain ENTRY exactly as-is.
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
}

main();
