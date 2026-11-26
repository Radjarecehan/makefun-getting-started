import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Rejected Olympic Sports — one funny single-line sport the Olympics turned down.
// The program writes exactly one line of text to /output/entry.txt.
// Gate: UTF-8 text, 1-200 characters, single line, not only whitespace.

const ENTRY =
  "Dear judge, competitive synchronized napping was rejected after every judge fell asleep and the gold medal went to the loudest snorer.";

function main(): void {
  const text = ENTRY;
  // Gate check 1: length in characters, 1-200.
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry is ${chars} characters, must be 1-200`);
  }
  // Gate check 2: single line, no newline characters.
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // Gate check 3: not only whitespace.
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  // Write the entry exactly, no trailing newline.
  // The grader sets MAKEFUN_OUTPUT_DIR; default to /output locally.
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, Buffer.from(text, "utf8"));
  // Final guard: last byte must be the entry's last character (no newline added).
  const bytes = Buffer.from(text, "utf8");
  if (bytes[bytes.length - 1] !== 46) {
    throw new Error("entry must end with a period");
  }
  console.log(`wrote ${chars} characters to ${outPath}`);
}

main();
