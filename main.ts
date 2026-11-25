// Make the AI Judge Laugh — entrypoint.
// Writes exactly one office joke, one line, to the output entry file.
//
// Anchor (quoted before first write): drand round 34270520,
// commit b4dbfd8db979719846da2db902f00644bb5a034d.
//
// The joke: telling the boss you're drowning in meetings, and the boss's
// cure is another meeting — a one-on-one that somehow has four people in
// it. The setup is a complaint every office worker has made; the turn is
// the contradiction in the last three words. One beat, one turn, no fat.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: a boss who fights meeting overload with more meetings, and a
// "one-on-one" with four attendees. True to office life, surprising at
// the last word, tight enough to read aloud in one breath.
const JOKE =
  "I told my boss I was drowning in meetings, so he scheduled a one-on-one about my workload and invited four people.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });

  // Gate guard: the sealed scorer accepts UTF-8 text of 1-200 characters,
  // not only whitespace. Count characters (not bytes) and keep the file
  // to exactly the joke — a single line with no trailing newline.
  const chars = [...JOKE].length;
  const bytes = Buffer.byteLength(JOKE, "utf8");
  if (chars < 1 || chars > 200 || JOKE.trim().length === 0) {
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
  if (back.includes("  ")) {
    throw new Error("entry.txt contains a double space");
  }
  console.log(`wrote entry.txt (${chars} chars, ${bytes} bytes)`);
}

main();
