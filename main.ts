// The Worst App Idea Ever Pitched — PuddleWatch
// Writes the one-sentence pitch to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "PuddleWatch is a premium app that alerts you the moment a puddle near you dries up, so you never miss a puddle you were never going to step in.";
// Entry is exactly 143 ASCII chars / 143 bytes: one sentence, gate 1–240.

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read-back verification: byte-exact, one sentence, within the 1–240 char gate.
const back = readFileSync(outPath, "utf8");
const bytes = Buffer.byteLength(back, "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch");
if (bytes < 1 || bytes > 240) throw new Error(`byte length ${bytes} outside 1–240`);
if (back !== back.trim()) throw new Error("entry must not have leading/trailing whitespace");
if (back.trim().split(/\s+/).length < 2) throw new Error("entry too short");
if (!/^[A-Z].*\.$/.test(back)) throw new Error("entry must be one sentence ending with a period");
if (back.includes("\n")) throw new Error("entry must be a single line");
// Exactly one sentence: no internal sentence terminator followed by a new clause.
if (/\.\s+[A-Z]/.test(back)) throw new Error("entry must be exactly one sentence");
// The pitch must name the product explicitly.
if (!back.startsWith("PuddleWatch")) throw new Error("entry must name the product");
console.log(`entry.txt written: ${bytes} bytes, ${back.length} chars — OK`);
