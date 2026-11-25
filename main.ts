// One Line, One Laugh: Roast Your Fridge — entrypoint.
// Writes exactly one fridge roast, one line, to the output entry file.
//
// Anchor (quoted before first write): drand round 34268641,
// commit 9083c25b26f2a643b0168a5bda68408d97a58d9c.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast: three small breakdowns, each a specific detail worth mocking
// (dead light, quit ice maker, leftovers with a life of their own), then the
// turn — the leftovers unionised and I am the only one not on strike.
// It reads well out loud: three short clauses, then the punchline lands.
const JOKE =
  "My fridge's light burned out, the ice maker quit, and the leftovers formed a union — I'm the only thing in this kitchen not on strike.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });

  // Gate guard: the sealed scorer accepts UTF-8 text of 1-200 characters,
  // not only whitespace, and the roast must be about the fridge — a fridge
  // detail in every clause keeps it on-subject. Count characters (not
  // bytes): the em dash is one character. The file must hold exactly the
  // roast — no trailing newline.
  const chars = [...JOKE].length;
  const bytes = Buffer.byteLength(JOKE, "utf8");
  if (chars < 1 || chars > 200 || JOKE.trim().length === 0) {
    throw new Error(`entry text out of gate bounds: ${chars} chars`);
  }

  writeFileSync(join(dir, "entry.txt"), JOKE, "utf8");
  // Byte-exact self-check: re-read what was written and confirm it is the
  // roast and nothing else — single line, no trailing newline.
  const back = readFileSync(join(dir, "entry.txt"), "utf8");
  if (back !== JOKE || back.endsWith("\n")) {
    throw new Error("entry.txt does not match the roast byte for byte");
  }
  console.log(`wrote entry.txt (${chars} chars, ${bytes} bytes)`);
}

main();
