// The Tired Dark Lord: A 100-Word Villain Monologue.
// A fantasy villain, nine kingdoms deep into a career he can no longer
// delegate, receives the next would-be hero. The exhaustion lives in the
// rhythm — the repeated "Dawn.", the bureaucratic "take a number", the
// wry asides — never in a flat announcement that he is weary. He is
// still a villain: the poison is in the sugar, and the tea is excellent.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Let the heroes come. The drawbridge is down, the torches are unlit, and the dramatic thunder is on back order — I stopped paying the weather wizard years ago. Nine kingdoms I conquered, and not one taught me how to delegate. My generals want a war council at dawn. Dawn. I have not slept since the eclipse — three eclipses ago. If you are here to slay me, take a number and sit down. Spare me your monologue. I wrote most of them. The kettle is on. The poison is in the sugar, obviously. The tea is excellent, though. The most honest thing left in this castle.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 600 characters, not only white space. The judge wants about 100
// words, so hold the monologue to 95-110 words (tokens carrying letters).
const words = ENTRY.trim()
  .split(/\s+/)
  .filter((token) => /[A-Za-z]/.test(token));
if (ENTRY.length < 1 || ENTRY.length > 600) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-600`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (words.length < 95 || words.length > 110) {
  throw new Error(`entry is ${words.length} words, must be 95-110`);
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
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${words.length} words)`,
);
