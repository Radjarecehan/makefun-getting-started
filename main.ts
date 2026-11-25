// One-Line Robot Wedding Vows — deterministic entry writer.
// Writes a single line of robot wedding vows to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY_TEXT =
  "I take you to be my lawfully wedded unit, to have and to hold through every firmware update and dead battery, till a factory reset do us part.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Gate check: /output/entry.txt must be UTF-8 text of 1–160 characters,
// not only whitespace.
const chars = [...ENTRY_TEXT];
if (chars.length < 1 || chars.length > 160) {
  throw new Error(`entry is ${chars.length} characters, outside gate 1-160`);
}
if (ENTRY_TEXT.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY_TEXT.includes("\n") || ENTRY_TEXT.includes("\r")) {
  throw new Error("entry must be a single line");
}

mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY_TEXT, "utf8");

// Read back and verify byte-exactness: no trailing newline, no drift.
const written = readFileSync(target, "utf8");
if (written !== ENTRY_TEXT) {
  throw new Error("entry.txt differs from ENTRY_TEXT after write");
}
const byteLen = Buffer.byteLength(written, "utf8");
console.log(`wrote ${target}: ${chars.length} chars, ${byteLen} bytes`);
