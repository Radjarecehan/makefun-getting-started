// Make the AI Judge Laugh — u-alfasurya91-make-the-ai-judge-laugh-6ed40225
//
// Deterministic one-line office joke writer. The program takes no input,
// reads no files, makes no network calls, and always writes the exact same
// single line to <output-dir>/entry.txt — no trailing newline, so the sealed
// scorer sees exactly the joke text and nothing else.
//
// The joke follows the house judge brief: it is about office life (email
// and meetings, the two things every office worker nods at), it addresses
// the judge directly ("Dear judge"), and its turn lands in the last few
// words — the boss answers corporate-speak with corporate-speak, and the
// pair are now stuck quoting each other forever.
//
// Run locally:  MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
// In the house sandbox the harness sets MAKEFUN_OUTPUT_DIR for us; when it
// is absent we fall back to /output, the path the rules name.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry text. Exactly one line, 128 characters, 130 bytes UTF-8.
const JOKE =
  "Dear judge, I wrote 'per my last email' to my boss — he replied 'per my last meeting,' and now we just quote each other forever.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
// not only whitespace, a single line.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

function main(): void {
  const chars = [...JOKE].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(`joke is ${chars} characters, outside ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (JOKE.trim().length === 0) {
    throw new Error("joke must not be only whitespace");
  }
  if (JOKE.includes("\n") || JOKE.includes("\r")) {
    throw new Error("joke must be a single line");
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // No trailing newline: the file holds exactly the joke, byte for byte.
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, JOKE, "utf8");
  // Read back and confirm the file on disk is exactly the joke. A silent
  // short write must fail loudly here, never reach the sealed scorer.
  const written = readFileSync(outPath, "utf8");
  if (written !== JOKE) {
    throw new Error("entry.txt on disk does not match the joke exactly");
  }
  if (Buffer.byteLength(written, "utf8") !== 130) {
    throw new Error("entry.txt is not 130 bytes as expected");
  }
}

main();
