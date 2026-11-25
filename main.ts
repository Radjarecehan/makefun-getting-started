// Make the AI Judge Laugh — office-life one-liner writer.
//
// The program emits exactly one joke about office life, a single line of
// 1-200 characters, to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// It guards the gate itself and re-reads its own output to prove the bytes
// on disk are exactly the bytes it meant to write.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke: a drowning-in-meetings complaint answered with yet another
// meeting — the punchline lands on the headcount of the "one-on-one".
// Exactly 114 characters, one line, no trailing newline.
const JOKE =
  "I told my boss I was drowning in meetings, so he scheduled a one-on-one about my workload and invited four people.";

// Gate from the competition rules: UTF-8 text, 1-200 characters,
// not only whitespace, exactly one line.
function gateCheck(line: string): void {
  const chars = [...line];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(`gate: ${chars.length} characters, need 1-200`);
  }
  if (line.trim().length === 0) {
    throw new Error("gate: entry is only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
}

// Where the grader looks: $MAKEFUN_OUTPUT_DIR when set, else /output.
function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv && fromEnv.length > 0 ? fromEnv : "/output";
}

// Write the line with no trailing newline, then read it back and compare
// byte for byte. Any mismatch fails loudly instead of shipping a bad entry.
function emit(line: string): void {
  gateCheck(line);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  const encoded = new TextEncoder().encode(line);
  writeFileSync(target, encoded);
  const back = readFileSync(target);
  if (back.length !== encoded.length) {
    throw new Error(
      `self-check: ${back.length} bytes on disk, expected ${encoded.length}`,
    );
  }
  if (!back.equals(Buffer.from(encoded))) {
    throw new Error("self-check: bytes on disk differ from the entry");
  }
  if (back.toString("utf8") !== line) {
    throw new Error("self-check: text on disk differs from the entry");
  }
  console.log(
    `wrote ${[...line].length} characters (${encoded.length} bytes) to ${target}`,
  );
}

emit(JOKE);
