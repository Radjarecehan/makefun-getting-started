// The Robot Vacuum's Best Excuse
// Writes one funny single-line robot-vacuum excuse to /output/entry.txt.
// Node 22 stdlib only, deterministic, no network, no secrets.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ENTRY =
  "I didn't miss that spot. My sensors flagged it as a sacred crumb reserve, and I respect local wildlife.";

// Revision 1: check the competition gate locally before writing —
// /output/entry.txt must be UTF-8 text of 1 to 140 characters and
// not only whitespace, or the sealed scorer marks the entry invalid.
if (ENTRY.length < 1 || ENTRY.length > 140 || ENTRY.trim().length === 0) {
  throw new Error(`entry fails gate: length ${ENTRY.length}`);
}

// Revision 3: do the write inside main() and report the byte length,
// so a local run can be checked against the expected 103 bytes.
function main(): void {
  // Resolve the output directory to an absolute path so a relative
  // MAKEFUN_OUTPUT_DIR (e.g. "out") lands where the caller means.
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  mkdirSync(outDir, { recursive: true });
  // Write exactly the entry text — no trailing newline, no extra bytes —
  // so the file is byte-identical on every run.
  writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
  console.log(`wrote entry.txt: ${Buffer.byteLength(ENTRY, "utf8")} bytes`);
}

main();
