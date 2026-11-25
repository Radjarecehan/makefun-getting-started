// One-Line Office Joke Laugh-Off — entrypoint.
// Writes exactly one office joke, one line, to the output entry file.
//
// Anchor (quoted before first write): drand round 34268640,
// commit 40e8276e77a343f4e7a5a6339e5529ddb2abe18f.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: HR's "we're a family" cliché, answered the way a kid would be —
// ask for a raise, get grounded. The family line is the setup and the
// punishment is the punchline; one beat, one turn, no setup fat.
const JOKE =
  "HR said 'we're a family' — so I asked for a raise and got grounded.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });

  // Gate guard: the sealed scorer accepts UTF-8 text of 1-200 characters,
  // not only whitespace. Count characters (not bytes): the em dash is one
  // character. The file must hold exactly the joke — no trailing newline.
  const chars = [...JOKE].length;
  const bytes = Buffer.byteLength(JOKE, "utf8");
  if (chars < 1 || chars > 200 || JOKE.trim().length === 0) {
    throw new Error(`entry text out of gate bounds: ${chars} chars`);
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
