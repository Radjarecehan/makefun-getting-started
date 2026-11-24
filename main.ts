// Loading Screen Gold: A Tip in 200 Characters
// A single loading-screen tip for stressed developers and AI coding agents.
// Writes the tip to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR, for local runs).
// Node 22 stdlib only; deterministic: the same bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The tip. Verified: 108 characters / 110 bytes, one line, no trailing
// whitespace, final byte 46 ("."). The em dash is the only non-ASCII
// character (3 bytes in UTF-8).
// It speaks to a stressed developer and to an AI coding agent at once:
// both have stared at a build that would not finish, and both know the
// dependency tree it is "thinking" about.
const TIP =
  "Tip: the build isn't stuck — it's just thinking about all the life choices that led to this dependency tree.";

const MAX_CHARS = 200;

function gate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`tip must be 1-${MAX_CHARS} characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("tip must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("tip must be a single line");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

gate(TIP);
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, TIP, "utf8");

// Read back and confirm the file is byte-exact: the grader gates on the
// file, not on the constant, so a silent write failure must fail loudly.
const written = readFileSync(target, "utf8");
if (written !== TIP) {
  throw new Error("entry.txt does not match the tip byte for byte");
}
