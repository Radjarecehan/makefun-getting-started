// Fortune Cookie for the Liquidated Trader — entry program.
// Writes one fortune-cookie line for a freshly liquidated crypto trader
// to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
// Gate: UTF-8, 1-160 characters, at most 20 words, single line, no
// trailing newline. Node 22 stdlib only, fully deterministic.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Your lucky numbers are the ones you sold at. The stars say: buy low, sell lower, laugh anyway.";

// Expected shape of the entry, counted by hand and checked in the brief:
// 18 words, 94 characters, 94 bytes (all ASCII), last byte '.' (0x2e).
const EXPECTED_WORDS = 18;
const EXPECTED_BYTES = 94;

// Gate checks, enforced before anything is written.
const chars = [...ENTRY].length;
if (chars < 1 || chars > 160) {
  throw new Error(`entry length ${chars} chars, gate is 1-160`);
}
const words = ENTRY.trim().split(/\s+/).filter(Boolean);
if (words.length > 20) {
  throw new Error(`entry has ${words.length} words, gate is at most 20`);
}
if (words.length !== EXPECTED_WORDS) {
  throw new Error(`expected ${EXPECTED_WORDS} words, got ${words.length}`);
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only whitespace");
}
// The fortune voice: oracular opening ("Your lucky numbers", "The stars
// say") broken by the punchline — the old maxim turned upside down
// ("buy low, sell lower") and a warm shrug at the end ("laugh anyway").

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read back and verify byte-exact: same bytes, no trailing newline.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt is not byte-exact");
}
const bytes = Buffer.byteLength(back, "utf8");
if (bytes !== EXPECTED_BYTES) {
  throw new Error(`expected ${EXPECTED_BYTES} bytes, got ${bytes}`);
}
const lastByte = Buffer.from(back, "utf8").at(-1);
if (lastByte !== 0x2e) {
  throw new Error(`expected last byte 0x2e ('.'), got 0x${lastByte?.toString(16)}`);
}
