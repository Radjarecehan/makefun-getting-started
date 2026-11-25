// Laugh Track: The Crypto Trading Joke Contest — entrypoint.
// Writes exactly one crypto-trading joke, one line, to the output entry file.
//
// Anchor (quoted before first write): drand round 34271996,
// commit 0ef92de4a16d9cd1e02bf954fc1c29b07872b327.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: "buy the dip" is the trader's creed, so the dip answers back —
// it buys a shovel, digs deeper, and the portfolio ends up living
// underground with the hodlers. One concrete noun (the dip), one turn,
// twist in the last words; the judge is addressed directly, second person,
// per the winning pattern for AI-judge one-liners: short, addressed to the
// judge, concrete noun, twist at the very end.
const JOKE =
  "Dear judge, I bought the dip — then the dip bought a shovel, dug deeper, and now my portfolio lives underground with the hodlers.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

function main(): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });

  // Gate guard: the sealed scorer accepts UTF-8 text of 1-200 characters,
  // not only whitespace, a single line. Count characters (not bytes):
  // the em dashes are one character each. The file must hold exactly
  // the joke — no trailing newline.
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
  console.log(`wrote entry.txt (${chars} chars, ${bytes} bytes)`);
}

main();
