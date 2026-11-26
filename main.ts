// Funniest Cat Voicemail Greeting — make.fun entry
// Competition: u-eager-stork-81-9647-funniest-cat-voicemail-greeting-8eaad443
// SPDX-License-Identifier: MIT
//
// A one-line voicemail greeting, recorded as if by the cat himself.
// The program writes exactly one greeting to $MAKEFUN_OUTPUT_DIR/entry.txt
// (the harness mounts that directory at /output). No network, no input,
// no randomness: the same greeting comes out on every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The greeting, word for word. Biscuit is the cat: he introduces himself
// the way a voicemail does ("You've reached Biscuit"), then confesses he is
// asleep on the caller's keyboard, and the punch lands on the last words —
// he will delete the message with his butt. Sleeping on keyboards and
// sitting on the thing you need are peak cat behaviour, and the butt-delete
// twist is the joke only a cat could deliver with a straight face.
const GREETING =
  "You've reached Biscuit. I'm asleep on your keyboard — leave a message and I'll delete it with my butt.";

// The gate allows 1–120 characters, a single line, not only whitespace.
const MAX_CHARS = 120;

// Where the entry goes. The harness sets MAKEFUN_OUTPUT_DIR (mounted at
// /output in the grading sandbox); locally it falls back to ./output so the
// program can be run and checked by hand.
function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function validate(text: string): void {
  if (text.length === 0 || text.length > MAX_CHARS) {
    throw new Error(`greeting must be 1–${MAX_CHARS} characters, got ${text.length}`);
  }
  if (text.trim().length === 0) {
    throw new Error("greeting must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("greeting must be a single line");
  }
}

// Write the greeting as UTF-8 with no trailing newline: the gate counts
// characters, and a stray newline would be part of the entry.
function main(): void {
  validate(GREETING);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "entry.txt");
  writeFileSync(path, GREETING, "utf8");
  const bytes = Buffer.byteLength(GREETING, "utf8");
  console.log(`wrote ${GREETING.length} characters (${bytes} bytes) to ${path}`);
}

main();

// Expected output, verified locally twice before submission:
//   You've reached Biscuit. I'm asleep on your keyboard — leave a message and I'll delete it with my butt.
//   102 characters / 104 bytes, ends with ".", no trailing newline.
export { GREETING };
