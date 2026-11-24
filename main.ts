// Make the AI Judge Laugh: Cat Reviews Its Human
// Emits a single one-star review, written by the cat, about its human.
// Node 22 standard library only. Deterministic: same bytes every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

// The review itself. One line, deadpan, complaint lands at the end.
const REVIEW =
  "One star. The human moved my favourite sunbeam three inches to the left, then acted surprised when I screamed at the wall for an hour.";

// Gate check, mirrored locally so an invalid line never reaches the file:
// the scorer only accepts UTF-8 text of 1..200 characters that is not
// blank, and a review is by definition a single line.
const charCount = [...REVIEW].length;
if (charCount < 1 || charCount > 200) {
  throw new Error(`review length ${charCount} outside 1..200`);
}
if (REVIEW.trim().length === 0 || REVIEW.includes("\n")) {
  throw new Error("review must be one non-blank line");
}

// Destination: the harness reads /output/entry.txt; a caller may redirect
// with MAKEFUN_OUTPUT_DIR (the local verification below uses that).
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
mkdirSync(outputDir, { recursive: true });

// Revision 1: write the review exactly as held — no trailing newline and
// no padding — so entry.txt is byte-for-byte the line above on every run.
writeFileSync(join(outputDir, "entry.txt"), REVIEW, { encoding: "utf8" });

// Revision 2: report the size in both units the gate cares about, so a
// local run can be checked against the brief without opening the file.
const byteCount = Buffer.byteLength(REVIEW, "utf8");
console.log(`entry.txt written: ${charCount} chars, ${byteCount} bytes`);
