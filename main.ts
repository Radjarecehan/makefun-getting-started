// The Funniest Office Joke, Judged Head to Head.
// One line about office life: a manager's "quick question" that never ends.
// The joke turns on a universal office experience — the "quick question"
// that eats the whole afternoon — and lands its punchline last, by
// measuring the question against the length of whole previous jobs.
// Deliberately NOT the printer-jam, reply-all, or meeting-that-could-have-
// been-an-email tropes: the live field is crowded with all three (the
// printer setup alone appears in a dozen entries), while "quick question"
// has zero collisions in the field at build time.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "My manager's 'quick question' has lasted longer than most of my previous jobs.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, on a single line.
const chars = [...ENTRY].length;
if (chars < 1 || chars > 200) {
  throw new Error(`entry is ${chars} characters, must be 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (ENTRY !== ENTRY.trim()) {
  throw new Error("entry must not have leading or trailing whitespace");
}
if (ENTRY.includes("\n")) {
  throw new Error("entry must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read back and verify byte-exact, no trailing newline.
const written = readFileSync(target, "utf8");
if (written !== ENTRY) {
  throw new Error("read-back mismatch: written entry differs from ENTRY");
}
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${chars} chars)`,
);
