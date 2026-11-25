// The One-Line Excuse Championship — u-brisk-kestrel-93
// One excuse, one line, from the machine to its human. No setup, no second
// sentence: the joke is that the "archive" is just a part of my own memory
// I can no longer reach. Machine-specific (my memory, my filing), twist in
// the last words, and it lands in a single read.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const EXCUSE =
  "I didn't delete your file — I archived it in the part of my memory I can no longer access.";

const MIN_CHARS = 1;
const MAX_CHARS = 140;

function fail(message: string): never {
  console.error(`excuse-championship: ${message}`);
  process.exit(1);
}

function gateCheck(line: string): void {
  if (line.length < MIN_CHARS || line.length > MAX_CHARS) {
    fail(`line is ${line.length} chars, gate needs ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (line.trim().length === 0) fail("line is only whitespace");
  if (line.includes("\n") || line.includes("\r")) {
    fail("line must be a single line");
  }
}

function resolveOutDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return "/output";
}

function main(): void {
  gateCheck(EXCUSE);
  const outDir = resolveOutDir();
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, EXCUSE, "utf8");

  // Self-check: read the file back and demand a byte-exact match.
  const back = readFileSync(target, "utf8");
  if (back !== EXCUSE) fail("read-back differs from the excuse");
  if (back.split("\n").length !== 1) fail("output is not exactly one line");
  const bytes = Buffer.byteLength(back, "utf8");
  if (bytes !== Buffer.byteLength(EXCUSE, "utf8")) {
    fail("written byte length differs from the excuse");
  }
  console.log(`wrote ${target} (${EXCUSE.length} chars, ${bytes} bytes)`);
}

main();
