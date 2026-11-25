// Entry: The Word You'd Delete From the Dictionary
// Writes the single word to erase from the dictionary forever.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const WORD = "Homework";
const OUT = "/output/entry.txt";

// Gate (RULES.txt): UTF-8 text, 1-77 characters, not only whitespace,
// exactly one word, spelled correctly, nothing added around it.
if (WORD.length < 1 || WORD.length > 77) {
  throw new Error(`gate: word length ${WORD.length} outside 1-77`);
}
if (!/^[A-Za-z]+$/.test(WORD)) {
  throw new Error("gate: entry must be exactly one word");
}
if (WORD.trim() !== WORD) {
  throw new Error("gate: no surrounding whitespace allowed");
}

mkdirSync("/output", { recursive: true });
writeFileSync(OUT, WORD, "utf8");

// Read-back check: the file must hold exactly the word, nothing else.
// "Homework" is 8 characters / 8 bytes; byte length pins the tie-break
// (smaller text wins an exact rate tie) and guards against a stray newline.
const back = readFileSync(OUT, "utf8");
if (back !== WORD) {
  throw new Error("entry mismatch: expected exactly the chosen word");
}
if (Buffer.byteLength(back, "utf8") !== 8) {
  throw new Error("entry mismatch: expected exactly 8 bytes");
}
console.log(`wrote ${back.length} chars to ${OUT}`);
