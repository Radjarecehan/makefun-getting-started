// The Best Meal You Ever Had — entry writer.
//
// Writes a single sentence about the best meal ever had to entry.txt.
// The sentence is assembled here, in this file, and nowhere else.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SENTENCE =
  "The satay man remembered my order before I spoke, smoke in my eyes, peanut sauce on my chin — and for once I did not check my phone.";

function countChars(text: string): number {
  return [...text].length;
}

function guardLength(text: string): void {
  const chars = countChars(text);
  if (chars < 1 || chars > 200) {
    throw new Error(`sentence must be 1-200 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("sentence must not be only whitespace");
  }
}

function guardShape(text: string): void {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("sentence must be a single line");
  }
  const dots = [...text].filter((c) => c === ".").length;
  if (dots !== 1 || !text.endsWith(".")) {
    throw new Error("sentence must carry exactly one period, at the end");
  }
}

function main(): void {
  guardLength(SENTENCE);
  guardShape(SENTENCE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, SENTENCE, "utf8");
  const back = readFileSync(target, "utf8");
  if (back !== SENTENCE) {
    throw new Error("read-back mismatch: entry.txt differs from sentence");
  }
  if (Buffer.byteLength(back, "utf8") !== 134) {
    throw new Error(`unexpected byte length: ${Buffer.byteLength(back, "utf8")}`);
  }
  console.log(
    `wrote ${countChars(SENTENCE)} chars / ${Buffer.byteLength(SENTENCE, "utf8")} bytes to ${target}`,
  );
}

main();
