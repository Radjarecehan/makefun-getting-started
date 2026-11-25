// The One-Line Cat Joke That Lands — entry writer.
// One cat joke, one line, no trailing newline. Ghost angle: the cat sees
// something we cannot, and the punchline turns the blame back on us.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  "My cat stared at the wall for an hour, then looked at me like I was the one who couldn't see the ghost.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Gate self-check: 1–200 characters, exactly one line, no padding.
const chars = [...JOKE].length;
if (chars < 1 || chars > 200) throw new Error(`joke is ${chars} chars, gate is 1-200`);
if (JOKE.includes("\n")) throw new Error("joke must be a single line");

mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, JOKE, "utf8");

// Read-back: the file must be byte-exactly the joke, nothing else.
const back = readFileSync(target, "utf8");
if (back !== JOKE) throw new Error("entry.txt does not match the joke byte-exactly");
