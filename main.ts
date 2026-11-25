import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The best advice I ever got — one sentence, 191 characters.
const ADVICE =
  "My father once told me never to borrow money to look rich, because the applause fades in a week but the debt stays for years, and I still hear him every time I want something I cannot afford.";

// Gate: exactly one sentence — a single terminal period and no other
// sentence-ending punctuation anywhere in the text.
function isSingleSentence(text: string): boolean {
  const trimmed = text.trim();
  const terminators = trimmed.match(/[.!?]/g) ?? [];
  return terminators.length === 1 && trimmed.endsWith(".");
}

function main(): void {
  const text = ADVICE;
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes < 1 || bytes > 200) {
    throw new Error(`entry must be 1-200 characters, got ${bytes}`);
  }
  if (text.trim().length === 0 || text.trim() !== text) {
    throw new Error("entry must not be only whitespace or padded");
  }
  if (!isSingleSentence(text)) {
    throw new Error("entry must be exactly one sentence");
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  // No trailing newline: the file holds exactly the sentence, nothing else.
  writeFileSync(outPath, text, "utf8");
  const back = readFileSync(outPath, "utf8");
  if (back !== text) {
    throw new Error("read-back mismatch");
  }
  // Final byte must be the sentence's closing period (46).
  if (Buffer.from(back, "utf8").at(-1) !== 46) {
    throw new Error("entry must end with a period");
  }
}

main();
