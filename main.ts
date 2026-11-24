// One Sentence for a Traveler from 1800.
// Writes a single sentence (at most 200 characters) explaining the modern
// internet to a time traveler from 1800, to /output/entry.txt.
// Node 22 stdlib only. Deterministic: same bytes on every run, no network,
// no clock, no randomness. No trailing newline.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SENTENCE =
  "Picture a web of copper wires carrying every letter in the world at the speed of lightning, so a farmer can read a note from Boston before the ink is dry.";

// Gate: the sealed scorer only accepts UTF-8 text of 1 to 200 characters.
// Fail loudly here rather than shipping an invalid entry.
if (SENTENCE.length < 1 || SENTENCE.length > 200) {
  throw new Error(`entry is ${SENTENCE.length} characters, must be 1-200`);
}
if (SENTENCE.trim() !== SENTENCE || SENTENCE.trim().length === 0) {
  throw new Error("entry must not be only whitespace or padded");
}

// Vocabulary note: every word in the sentence predates 1800 (web, copper
// wires, letter, lightning, farmer, Boston, ink). No word coined after the
// traveler's time appears anywhere in the entry text.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// No trailing newline: the file must hold exactly the sentence, byte for byte.
writeFileSync(join(outDir, "entry.txt"), SENTENCE, "utf8");
