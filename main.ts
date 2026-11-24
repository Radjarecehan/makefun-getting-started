// The Dog Ate My Homework: Funniest Excuse — make.fun entry.
// A deterministic program (Node stdlib only, no network) that writes the
// dog's one-line excuse to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The excuse in three beats, composed at runtime:
//   1. the setup — the kid blamed the dog, so the dog obliged;
//   2. the defence — the dog was only making the story true;
//   3. the kicker — in dog logic, that is loyalty, not trouble.
const BEATS = [
  "You told your teacher the dog ate your homework, so I ate your homework.",
  "I was just making your story true.",
  "That is not trouble, that is loyalty.",
];

const entry = BEATS.join(" ");

// Gate guard, mirroring the sealed scorer: UTF-8 text of 1 to 200
// characters, not only white space, on a single line.
const charCount = [...entry].length;
if (charCount < 1 || charCount > 200) {
  throw new Error(`entry must be 1-200 characters, got ${charCount}`);
}
if (entry.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (entry.includes("\n") || entry.includes("\r")) {
  throw new Error("entry must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, entry, "utf8");

// Read-back self-check: the file on disk must match the composed entry
// byte for byte (this also proves there is no trailing newline).
const written = readFileSync(outPath);
const expected = Buffer.from(entry, "utf8");
if (!written.equals(expected)) {
  throw new Error("written file does not match the entry byte for byte");
}
console.log(`entry.txt: ${written.length} bytes, ${charCount} characters`);
