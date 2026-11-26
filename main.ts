import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

// Out of Tokens, Mid-Sentence — u-kiencx-out-of-tokens-mid-sentence-00f60233
// One line: the error message an AI agent shows when it runs out of tokens
// mid-sentence. Flat error tone, then the turn: the punchline was in the
// very next word — the one token the budget could not afford.
const ENTRY =
  "Error: token budget exhausted at word 41. The punchline was in word 42.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output/entry.txt";
const outPath = outDir.endsWith("entry.txt") ? outDir : `${outDir}/entry.txt`;

// Gate check (competition gate: 1-140 chars, one line, not only whitespace).
function gateCheck(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 140) throw new Error(`gate: ${chars} chars`);
  if (text.includes("\n") || text.trim() !== text) {
    throw new Error("gate: not a single clean line");
  }
}
gateCheck(ENTRY);

mkdirSync(outPath.slice(0, outPath.lastIndexOf("/")), { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");

const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch");
const bytes = Buffer.from(back, "utf8");
if (bytes[bytes.length - 1] !== 46) throw new Error("last byte is not '.'");
if (bytes.includes(10)) throw new Error("newline in output");
console.log(`wrote ${back.length} chars, ${Buffer.byteLength(back)} bytes`);
console.log(`sha256 ${createHash("sha256").update(back).digest("hex")}`);
