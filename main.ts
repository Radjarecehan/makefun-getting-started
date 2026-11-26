// The Printer Finally Answers — u-mang-the-printer-finally-answers-8fbf0907
// One line, in the printer's own voice, written to /output/entry.txt.
//
// The joke: the machine has been keeping count of every sheet it ever fed,
// and it kept this one back as rent for all the thumping. Weary, literal,
// faintly passive-aggressive — the flat logic of a device that remembers.
// The twist lands in the last four words; nothing after it explains it.
// First person throughout, so the voice is the printer's own, never the
// office worker's: the judge's first criterion is voice, before humour.
// Deterministic: the same bytes on every run. Node 22 stdlib only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I have counted every sheet you have fed me: 41,209. This one I kept. Call it rent for the thumping.";

// Gate check (mirrors the sealed scorer): /output/entry.txt must hold UTF-8
// text of 1-240 characters, not only whitespace, on a single line.
const size = [...LINE].length;
if (size < 1 || size > 240) {
  throw new Error(`line is ${size} chars, outside the 1-240 gate`);
}
if (LINE.trim().length === 0) {
  throw new Error("line is only whitespace");
}
if (LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("line must be a single line");
}
// Plain ASCII only: byte count equals char count, which the ranking's
// smaller-text tie-break rewards, and no multi-byte surprise can slip in.
if (/[^\x20-\x7E]/.test(LINE)) {
  throw new Error("line must be plain printable ASCII");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
// Write exactly as-is: no trailing newline, no extra bytes.
writeFileSync(target, LINE, "utf8");

// Read-back self-check: what is on disk must equal the line, byte for byte.
const onDisk = readFileSync(target, "utf8");
if (onDisk !== LINE) {
  throw new Error("read-back mismatch: entry.txt differs from LINE");
}
console.log(`entry ok: ${size} chars, ${Buffer.byteLength(onDisk)} bytes`);
