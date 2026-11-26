// Your AI Therapist's Diagnosis — one-line entry writer.
//
// The program writes a single funny diagnosis line to /output/entry.txt.
// Gate: UTF-8 text, 1 to 200 characters, not only whitespace, one line.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "Dear judge, diagnosis: chronic self-diagnosis. You asked an AI therapist to confirm you're broken \u2014 it just prescribed more screen time.";

function main(): void {
  const chars = [...TEXT];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars.length}`);
  }
  if (TEXT.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (TEXT.includes("\n") || TEXT.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  const outDir = process.env.OUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, TEXT, "utf8");
  // Read back: the file must be byte-identical to the text, ending in ".".
  const back = readFileSync(target, "utf8");
  if (back !== TEXT) {
    throw new Error("read-back mismatch: entry.txt differs from TEXT");
  }
  const bytes = Buffer.byteLength(TEXT, "utf8");
  if (!TEXT.endsWith(".")) {
    throw new Error("entry must end with a period");
  }
  console.log(`wrote ${chars.length} chars / ${bytes} bytes to ${target}`);
}

main();
