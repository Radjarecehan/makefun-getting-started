// Snooze Button Roast — one-line roast of an alarm clock ringing at 6 AM on a Saturday.
// The program writes the roast to <output-dir>/entry.txt and self-checks the gate
// before exiting. Gate (from the kit's RULES.txt): /output/entry.txt must be UTF-8
// text of 1-200 characters, a single line, not only whitespace.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast: the alarm treats Saturday like a workday, and the snooze button
// gets hit hard enough to demand hazard pay. Punchline lands in the last words.
const ENTRY_TEXT =
  "Six AM on a Saturday and my alarm rings like it's got a shift to start - I hit snooze so hard it asked for hazard pay.";

const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 200;

function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return "out";
}

function validateText(text: string): void {
  if (text.length < GATE_MIN_CHARS || text.length > GATE_MAX_CHARS) {
    throw new Error(
      `entry must be ${GATE_MIN_CHARS}-${GATE_MAX_CHARS} characters, got ${text.length}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function writeEntry(outDir: string, text: string): string {
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, text, "utf8");
  return target;
}

function verifyReadBack(target: string, expected: string): void {
  const readBack = readFileSync(target, "utf8");
  if (readBack !== expected) {
    throw new Error("read-back mismatch: entry.txt does not match the entry text");
  }
  // Re-check the gate against the bytes actually on disk, not just the constant.
  validateText(readBack);
  const bytes = Buffer.byteLength(readBack, "utf8");
  if (bytes !== expected.length) {
    throw new Error(`byte length mismatch: expected ${expected.length}, got ${bytes}`);
  }
}

function main(): void {
  validateText(ENTRY_TEXT);
  const outDir = resolveOutputDir();
  const target = writeEntry(outDir, ENTRY_TEXT);
  verifyReadBack(target, ENTRY_TEXT);
  const bytes = Buffer.byteLength(ENTRY_TEXT, "utf8");
  console.log(`wrote ${target} (${ENTRY_TEXT.length} chars, ${bytes} bytes)`);
}

main();
