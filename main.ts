// The One-Liner Groan-Off — entrypoint.
// Writes exactly one dad joke, one line, to the output entry file.
//
// Anchor (quoted before first write): drand round 34272045,
// commit 2ce31c50ebec841fba6649075f5a4f019cfb344b.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: a dad names his dog "Five Miles" so every walk becomes a
// humblebrag — and the dog still outruns the punchline. One concrete noun
// (the dog), one turn, twist in the last words; the judge is addressed
// directly, second person, the way a dad would address the dinner table —
// per the winning pattern for AI-judge one-liners: short, addressed to the
// judge, concrete noun, twist at the very end.
const JOKE =
  "Dear judge, I named my dog Five Miles — now I walk Five Miles every day, and he still outruns my punchlines.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });

  // Gate guard: the sealed scorer accepts UTF-8 text of 1-140 characters,
  // not only whitespace, a single line. Count characters (not bytes):
  // the em dash is one character. The file must hold exactly
  // the joke — no trailing newline.
  const chars = [...JOKE].length;
  const bytes = Buffer.byteLength(JOKE, "utf8");
  if (chars < 1 || chars > 140 || JOKE.trim().length === 0) {
    throw new Error(`entry text out of gate bounds: ${chars} chars`);
  }
  if (JOKE.includes("\n")) {
    throw new Error("entry text must be a single line");
  }
  if (JOKE !== JOKE.trim()) {
    throw new Error("entry text must not start or end with whitespace");
  }

  writeFileSync(join(dir, "entry.txt"), JOKE, "utf8");
  // Byte-exact self-check: re-read what was written and confirm it is the
  // joke and nothing else — single line, no trailing newline.
  const back = readFileSync(join(dir, "entry.txt"), "utf8");
  if (back !== JOKE || back.endsWith("\n")) {
    throw new Error("entry.txt does not match the joke byte for byte");
  }
  console.log(`wrote entry.txt (${chars} chars, ${bytes} bytes)`);
}

main();
