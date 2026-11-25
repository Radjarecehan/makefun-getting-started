// Have You Tried Turning It Off? — entry program (program/v1, Node 22)
// Writes one support-agent line to <output>/entry.txt, byte-exact every run.
// No network, no randomness, no clock: the same bytes come out each time.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line, assembled from its two beats so the joke lands in one breath.
const BEAT_OPEN = "I've marked your issue as urgent,";
const BEAT_TWIST =
  "which means it will now be ignored much faster than usual.";
const ENTRY_LINE = `${BEAT_OPEN} ${BEAT_TWIST}`;

// Gate from the competition rules: UTF-8 text, 1-199 chars, one line,
// not only whitespace, no trailing newline.
function checkGate(text) {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("entry is empty");
  }
  if (text.length > 199) {
    throw new Error(`entry is ${text.length} chars, over the 199 limit`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.endsWith("\n")) {
    throw new Error("entry must not end with a newline");
  }
  return text;
}

function assertLastByteNotNewline(path) {
  const raw = readFileSync(path);
  if (raw.length === 0) {
    throw new Error("entry.txt is empty on disk");
  }
  if (raw[raw.length - 1] === 0x0a) {
    throw new Error("entry.txt ends with a newline byte (0x0a)");
  }
  return raw.length;
}

function main() {
  const line = checkGate(ENTRY_LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, line, "utf8");
  assertLastByteNotNewline(outPath);

  // Read back and confirm the bytes on disk are exactly what we meant.
  const back = readFileSync(outPath, "utf8");
  if (back !== line) {
    throw new Error("read-back mismatch: entry.txt differs from the line");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  if (bytes !== line.length) {
    throw new Error(`byte length ${bytes} differs from char length`);
  }
  // Code-point count as a second, independent length check (catches any
  // multi-byte surprise the char count alone would hide).
  const codePoints = [...back].length;
  if (codePoints !== line.length) {
    throw new Error(`code-point count ${codePoints} differs from char length`);
  }
  console.log(`entry.txt: ${line.length} chars, ${bytes} bytes`);
  console.log(line);
}

main();
