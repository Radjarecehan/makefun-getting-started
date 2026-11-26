// One-Liner Laughs — writes a single funny line to entry.txt.
// The joke: an AI hired to write the one-liner bills for the laugh
// and keeps the punchline — setup, then the twist in the last words.
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

const TEXT =
  "Dear judge, I asked the AI to write my one-liner \u2014 it charged me for the laugh and kept the punchline for itself.";

function gateCheck(text) {
  if (typeof text !== "string") throw new Error("entry must be a string");
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate: length ${chars} chars, must be 1-200`);
  }
  if (text.trim() !== text) throw new Error("gate: leading/trailing whitespace");
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
  return true;
}

const outDir =
  process.env.MAKEFUN_OUTPUT_DIR && process.env.MAKEFUN_OUTPUT_DIR.length > 0
    ? process.env.MAKEFUN_OUTPUT_DIR
    : "/output";
mkdirSync(outDir, { recursive: true });

gateCheck(TEXT);
const outPath = `${outDir}/entry.txt`;
writeFileSync(outPath, TEXT, "utf8");

// Read-back: the file must be byte-exact, no trailing newline.
const back = readFileSync(outPath, "utf8");
if (back !== TEXT) throw new Error("read-back mismatch");
const bytes = Buffer.byteLength(back, "utf8");
if (bytes !== 115) throw new Error(`expected 115 bytes, got ${bytes}`);
const hash = createHash("sha256").update(back, "utf8").digest("hex");
console.log(`entry.txt: ${[...back].length} chars, ${bytes} bytes, sha256 ${hash}`);
