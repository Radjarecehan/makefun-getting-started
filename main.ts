import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One funny line in the voice of a smug self-checkout machine.
// Judge brief: smug and petty about the basket, a twist a stranger gets
// cold, no setup padding. Direct address to the judge is allowed.
const TEXT =
  "Dear judge, twelve yoghurts, no spoon, no shame \u2014 I scanned your future too, and it expires before the milk does.";

// Gate (competition.yaml): 1-200 characters, single line, not only whitespace.
if (TEXT.length < 1 || TEXT.length > 200) {
  throw new Error(`entry length ${TEXT.length} outside 1-200 characters`);
}
if (TEXT.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (TEXT.includes("\n") || TEXT.includes("\r")) {
  throw new Error("entry must be a single line");
}

// The grader runs this in a sandbox and reads /output/entry.txt.
// Local runs fall back to ./out so the same file can be verified here.
const outDir = process.env.MAKEFUN_OUT_DIR ?? "/output";
let writtenPath = join(outDir, "entry.txt");
try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(writtenPath, TEXT, "utf8");
} catch {
  mkdirSync("out", { recursive: true });
  writtenPath = join("out", "entry.txt");
  writeFileSync(writtenPath, TEXT, "utf8");
}

// Read-back self-check: bytes on disk must equal the text exactly,
// no trailing newline, last byte the final full stop.
const written = readFileSync(writtenPath, "utf8");
if (written !== TEXT) {
  throw new Error("read-back mismatch: entry.txt differs from TEXT");
}
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(TEXT, "utf8")) {
  throw new Error("read-back mismatch: byte length differs");
}

console.log(`wrote ${TEXT.length} chars`);
