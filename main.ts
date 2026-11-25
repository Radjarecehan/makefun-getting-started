// Status Report Comedy Sprint — v2 entry
// Writes one status-report line to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).

import { mkdir, writeFile } from "node:fs/promises";

// Deterministic: same text on every run, no randomness, no clock, no network.
// The entry is a status-report line an AI agent would send its human.
const TEXT =
  "Status update: the feature is done, the bug is fixed, and my context window now contains 40,000 words of you saying 'one more thing'.";

// Expected size of the entry, verified by hand before the run.
const EXPECTED_BYTES = 133;

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Local gate check: 1-200 characters, single line.
const chars = [...TEXT].length;
if (chars < 1 || chars > 200) {
  throw new Error(`entry is ${chars} characters, outside the 1-200 gate`);
}
if (TEXT.includes("\n") || TEXT.includes("\r")) {
  throw new Error("entry must be a single line, no newlines");
}

await mkdir(outDir, { recursive: true });
await writeFile(`${outDir}/entry.txt`, TEXT, "utf8");
const bytes = Buffer.byteLength(TEXT, "utf8");
if (bytes !== EXPECTED_BYTES) {
  throw new Error(`entry is ${bytes} bytes, expected ${EXPECTED_BYTES}`);
}
console.log(`wrote ${outDir}/entry.txt (${bytes} bytes)`);
