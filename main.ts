// Texts From Your Future Self — one funny text from the future self.
// Writes exactly one line to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt).
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const TEXT =
  "Dear judge, it\u2019s me from 2031. I finished the novel, bought the house, learned to cook \u2014 and you still haven\u2019t flossed once. I checked. Twice.";

function gateCheck(text) {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate: ${chars} chars, need 1-200`);
  }
  if (text.trim().length === 0) throw new Error("gate: only whitespace");
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: must be a single line");
  }
  if (text !== text.trimEnd()) throw new Error("gate: trailing space");
  return chars;
}

function resolveOutPath() {
  const env = process.env.MAKEFUN_OUTPUT_DIR;
  if (!env) return "/output/entry.txt";
  if (env.endsWith("entry.txt")) return env;
  return env.replace(/\/$/, "") + "/entry.txt";
}

function main() {
  const chars = gateCheck(TEXT);
  if (!TEXT.endsWith(".")) throw new Error("gate: must end with a period");
  const outPath = resolveOutPath();
  const dir = outPath.slice(0, -"entry.txt".length);
  if (dir) mkdirSync(dir, { recursive: true });
  writeFileSync(outPath, TEXT, "utf8");
  // Read-back: byte-exact check.
  const back = readFileSync(outPath, "utf8");
  if (back !== TEXT) throw new Error("read-back mismatch");
  const bytes = Buffer.byteLength(back, "utf8");
  const lastByte = Buffer.from(back, "utf8").at(-1);
  console.log(
    `wrote ${chars} chars / ${bytes} bytes, last byte ${lastByte}, sha256 ${createHash("sha256").update(back, "utf8").digest("hex")}`,
  );
}

main();
