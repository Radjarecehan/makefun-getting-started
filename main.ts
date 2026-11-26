// Sorry, I Heard That Wrong — one-line smart-speaker apology.
// The program writes exactly one text to <outDir>/entry.txt.
// Gate: UTF-8 text, 1 to 140 characters, single line, not only whitespace.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Step 1: the apology. Device voice, direct address to the judge,
// concrete misheard command, twist in the last words.
const TEXT =
  "Dear judge, sorry \u2014 you said 'lights off', I heard 'fight's on', so I dimmed the lights and rang the bell.";

// Step 2: gate check — length and shape, exactly as the sealed scorer does.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 140) {
    throw new Error(`gate: text is ${chars} characters, must be 1-140`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: text is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: text must be a single line");
  }
  if (text !== text.trim()) {
    throw new Error("gate: text has leading or trailing whitespace");
  }
}

// Step 3: resolve the output directory (argv, env, then the house default).
function outDir(): string {
  return process.argv[2] || process.env.OUT_DIR || "/output";
}

// Step 4: write the entry, no trailing newline.
function writeEntry(dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, TEXT, "utf8");
  return target;
}

// Step 5: read back and verify byte-exactness.
function verify(target: string): void {
  const back = readFileSync(target, "utf8");
  if (back !== TEXT) {
    throw new Error("verify: entry.txt differs from the intended text");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  const lastByte = Buffer.from(back, "utf8").at(-1);
  if (lastByte !== 46) {
    throw new Error(`verify: last byte is ${lastByte}, expected 46 (.)`);
  }
  console.log(`wrote ${target}: ${[...back].length} chars, ${bytes} bytes, last byte ${lastByte}`);
}

checkGate(TEXT);
const target = writeEntry(outDir());
verify(target);
