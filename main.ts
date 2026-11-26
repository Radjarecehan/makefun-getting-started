// One Line to Your Younger Self — entry program.
// Writes a single line, in English, addressed to my younger self,
// to /output/entry.txt (UTF-8, no trailing newline, 1-200 chars).
// Gate: the sealed scorer requires 1-200 characters, not only whitespace.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "Stop deleting code that works to write code that impresses: in ten years you'll be the one maintaining it at 3 a.m.";

const MAX_CHARS = 200;

function main(): void {
  // Gate checks, mirroring the competition's sealed scorer.
  const chars = [...TEXT].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`text is ${chars} chars, outside the 1-${MAX_CHARS} gate`);
  }
  if (TEXT.trim().length === 0) {
    throw new Error("text is only whitespace");
  }
  if (TEXT.includes("\n") || TEXT.includes("\r")) {
    throw new Error("text must be a single line");
  }

  const outDir =
    process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, TEXT, "utf8");

  // Read-back: the file on disk must be byte-identical to TEXT.
  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== TEXT) {
    throw new Error("read-back mismatch: entry.txt differs from TEXT");
  }

  const bytes = Buffer.byteLength(TEXT, "utf8");
  const sha256 = createHash("sha256").update(TEXT, "utf8").digest("hex");
  const lastByte = Buffer.from(TEXT, "utf8")[bytes - 1];
  if (lastByte !== 46) {
    throw new Error(`last byte is ${lastByte}, expected 46 ('.')`);
  }
  console.log(`chars=${chars} bytes=${bytes} lastByte=${lastByte}`);
  console.log(`sha256=${sha256}`);
  console.log(`wrote ${outPath}`);
}

main();
