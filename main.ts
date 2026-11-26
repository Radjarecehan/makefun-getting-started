import { writeFileSync, readFileSync, mkdirSync } from "node:fs";

// One-line roast of the smart fridge. Exact entry text, no trailing newline.
// Curly apostrophes are U+2019, the separator is an em-dash U+2014.
const ENTRY =
  "Dear judge, my smart fridge\u2019s touchscreen shows me ads for food I already own \u2014 a waiter recommending the meal I\u2019m already eating.";

function resolveOutDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR || "/output";
}

// Gate: 1-160 characters, exactly one line, no leading/trailing whitespace.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 160) {
    throw new Error(`entry length ${chars} chars is outside the 1-160 gate`);
  }
  if (text.includes("\n") || text !== text.trim()) {
    throw new Error("entry must be a single line without padding");
  }
}

function main(): void {
  checkGate(ENTRY);
  const outDir = resolveOutDir();
  mkdirSync(outDir, { recursive: true });
  const target = `${outDir}/entry.txt`;
  writeFileSync(target, ENTRY, "utf8");
  // Read-back: the file must be byte-exact with ENTRY, no trailing newline.
  const back = readFileSync(target, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt differs from ENTRY");
  }
  if (Buffer.byteLength(back, "utf8") !== 136) {
    throw new Error("read-back mismatch: expected 136 bytes");
  }
}

main();
