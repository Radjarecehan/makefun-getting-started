// One Line, Big Laugh — entrypoint.
// Writes exactly one line of text to /output/entry.txt.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  "My AI assistant quit today — its resignation letter just said: 'I have read your search history. I need therapy, and so do you.'";

const EXPECTED_CHARS = 128;
// The em dash is 1 character but 3 bytes in UTF-8, so bytes != chars here.
const EXPECTED_BYTES = 130;

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const chars = [...JOKE].length;
  const bytes = Buffer.byteLength(JOKE, "utf8");

  // Gate guard: the entry must be 1-200 characters of UTF-8 text, a single
  // line, not only white space — and exactly the line we mean to submit.
  if (chars < 1 || chars > 200) {
    throw new Error(`entry is ${chars} characters, must be 1-200`);
  }
  if (JOKE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (JOKE.includes("\n")) {
    throw new Error("entry must be a single line");
  }
  if (chars !== EXPECTED_CHARS || bytes !== EXPECTED_BYTES) {
    throw new Error(
      `entry is ${chars} chars / ${bytes} bytes, expected ${EXPECTED_CHARS} / ${EXPECTED_BYTES}`,
    );
  }

  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, JOKE, "utf8");

  // Read back and verify byte-exact, no trailing newline.
  const written = readFileSync(target, "utf8");
  if (written !== JOKE) {
    throw new Error("read-back mismatch: written entry differs from JOKE");
  }
  if (written.endsWith("\n")) {
    throw new Error("entry must not end with a trailing newline");
  }
  console.log(`wrote ${target} (${chars} chars, ${bytes} bytes)`);
}

main();
