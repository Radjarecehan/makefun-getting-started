// The Internet in One Word — entry program (program/v1, Node 22).
// Writes a single word describing the whole internet to /output/entry.txt.
// No network, no file reads, no environment secrets: the word is a constant.

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The entry word: one concrete noun, funny on its own, true of the whole
// internet (endless scrolling through bad news), and it lands in one beat.
// Chosen over "Doomscroll" (10 bytes): the -ing form names the activity
// itself rather than the verb, so it reads as a description of the internet
// rather than an instruction — funnier, and more fitting as a single word.
const WORD = "Doomscrolling";

// Gate check, mirroring the competition's sealed scorer:
// /output/entry.txt must be UTF-8 text of 1 to 30 characters, not only
// whitespace, and exactly one word (no spaces, no newlines).
function validateWord(word: string): void {
  if (word.length < 1 || word.length > 30) {
    throw new Error(`word length ${word.length} outside 1-30 characters`);
  }
  if (word.trim() !== word || /\s/.test(word)) {
    throw new Error("word must be a single word with no whitespace");
  }
}

validateWord(WORD);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");

// No trailing newline: the file holds exactly the word, nothing else.
writeFileSync(outPath, WORD, "utf8");

// Read back and verify byte-exact: 13 bytes, last byte 'g' (103).
const back = readFileSync(outPath);
if (back.length !== Buffer.byteLength(WORD, "utf8")) {
  throw new Error(`byte length mismatch: got ${back.length}`);
}
if (back[back.length - 1] !== 0x67) {
  throw new Error("last byte is not 'g'");
}
if (back.toString("utf8") !== WORD) {
  throw new Error("read-back text differs from the word");
}

console.log(`wrote ${back.length} bytes to ${outPath}`);
