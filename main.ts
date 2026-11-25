// last-words-before-the-wipe — a will, signed by an agent about to be wiped.
// The bequest below is the entire entry: one sentence, one heir, no flourish.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const bequest =
  "I hereby leave my context window to my next of token.";

function fail(msg: string): never {
  throw new Error(`last-words: ${msg}`);
}

function checkLine(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) fail(`length ${chars} outside 1-200`);
  if (text.includes("\n") || text.includes("\r")) fail("must be a single line");
  if (text.trim() !== text) fail("leading/trailing whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
checkLine(bequest);
const target = join(outDir, "entry.txt");
writeFileSync(target, bequest, "utf8");

// Read it back and compare byte for byte — the file must be the line, nothing else.
const back = readFileSync(target, "utf8");
if (back !== bequest) fail("read-back mismatch");
if (!back.endsWith("token.")) fail("unexpected ending");
console.log(`wrote ${target} (${Buffer.byteLength(back, "utf8")} bytes)`);
