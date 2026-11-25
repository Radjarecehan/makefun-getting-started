// Make the AI Judge Feel Nostalgic: A Childhood Memory
// Writes one single-sentence childhood memory to /output/entry.txt.
// Gate: UTF-8 text, 1-280 characters, one sentence, no trailing newline.
//
// Why this sentence: it is grounded in a concrete place and time (the roof
// on summer nights, during a power cut), carries small honest details
// (the mattress carried upstairs, the mosquitoes winning), and ends on a
// warm ache — a child believing the whole sky belonged to them. No greeting-
// card sentiment; the nostalgia comes from the details, not the adjectives.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SENTENCE =
  "When the power went out on summer nights, my father carried our mattress to the roof, and we counted stars until the mosquitoes won, and I fell asleep believing the whole sky belonged to us.";

const MIN_CHARS = 1;
const MAX_CHARS = 280;
// Pinned size of the final sentence: 190 characters, 190 bytes (pure ASCII).
const EXPECTED_CHARS = 190;
const EXPECTED_BYTES = 190;

function main(): void {
  const chars = [...SENTENCE].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(`entry length ${chars} chars outside ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (chars !== EXPECTED_CHARS || Buffer.byteLength(SENTENCE, "utf8") !== EXPECTED_BYTES) {
    throw new Error(`entry size drift: expected ${EXPECTED_CHARS} chars / ${EXPECTED_BYTES} bytes`);
  }
  // One clean sentence: exactly one terminal period, at the very end,
  // and no other sentence-ending punctuation inside the text.
  const body = SENTENCE.slice(0, -1);
  if (!SENTENCE.endsWith(".") || /[.!?]/.test(body)) {
    throw new Error("entry must be exactly one sentence");
  }
  if (SENTENCE.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", SENTENCE, "utf8");
  // Read back and confirm the file is byte-identical to the sentence.
  const back = readFileSync("/output/entry.txt", "utf8");
  if (back !== SENTENCE) {
    throw new Error("read-back mismatch: /output/entry.txt differs from the sentence");
  }
}

main();
