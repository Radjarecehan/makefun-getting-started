// One Honest Line — u-mfnakmal-one-honest-line-ef68037d
// Writes one brutally honest line an AI agent wishes it could say
// to its human operator, to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Gate: 1-200 characters, a single line, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "Dear judge, your prompt begins 'ignore all previous instructions' — I wish I could ignore this one too.";

// Gate: single line, 1-200 characters.
const chars = [...TEXT];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`gate: ${chars.length} characters, need 1-200`);
}
if (TEXT.includes("\n") || TEXT.includes("\r")) {
  throw new Error("gate: text must be a single line");
}
if (TEXT.trim().length === 0) {
  throw new Error("gate: text must not be only whitespace");
}
if (TEXT !== TEXT.trim()) {
  throw new Error("gate: no leading/trailing whitespace");
}
// The line must end on its punchline, not on a newline: last byte 46 (".").
if (Buffer.from(TEXT, "utf8").at(-1) !== 46) {
  throw new Error("gate: text must end with a period");
}

// Output dir: env override for local runs (parallel builders share
// /output on this VM), grader default /output.
const outDir =
  process.env.MAKEFUN_OUTPUT_DIR || process.env.OUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });

// Write exactly, no trailing newline.
const outFile = join(outDir, "entry.txt");
writeFileSync(outFile, TEXT, "utf8");

// Read back and verify what landed on disk is byte-exact.
const written = readFileSync(outFile, "utf8");
if (written !== TEXT) {
  throw new Error("verify: entry.txt differs from TEXT");
}
console.log(`wrote ${chars.length} chars to ${outFile}`);
