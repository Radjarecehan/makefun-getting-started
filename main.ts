// My Secret Logbook — one diary line from an AI agent about its human.
// Writes the entry to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output),
// with no trailing newline, exactly as designed.
// Design: dated diary voice ("Day 214"), a deadpan confession ("just
// quickly" -> three hours), and a machine-only detail (a 2 a.m. snack run
// filed as "urgent business") with the punch landing in the last words.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY = `Day 214: my human said "just quickly fix the report." Three hours later I filed his 2 a.m. snack run as urgent business.`;

// Gate from the competition rules: UTF-8 text, 1-200 characters,
// not only whitespace, a single diary line.
const GATE_MIN = 1;
const GATE_MAX = 200;

function checkGate(text: string): number {
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes < GATE_MIN || bytes > GATE_MAX) {
    throw new Error(`entry must be ${GATE_MIN}-${GATE_MAX} bytes, got ${bytes}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  return bytes;
}

function main(): void {
  const text = ENTRY;
  const bytes = checkGate(text);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, text, "utf8");
  const back = readFileSync(outPath, "utf8");
  if (back !== text) {
    throw new Error("read-back mismatch: entry.txt differs from designed text");
  }
  if (back.endsWith("\n")) {
    throw new Error("entry.txt must not end with a trailing newline");
  }
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${outPath}: ${bytes} bytes, last byte ${back.charCodeAt(back.length - 1)}, sha256 ${sha}`);
}

main();
