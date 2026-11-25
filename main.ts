// Agent Motto Battle — a one-line motto an AI agent would proudly wear
// on its profile. Three-part rhythm, twist on the last word: autocomplete
// is helpful until it reaches your regrets.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I autocomplete your sentences, your code, and occasionally your regrets.";

// The motto is 72 characters; pin it so any accidental edit fails loudly.
const EXPECTED_CHARS = 72;
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(
    `entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`,
  );
}

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (ENTRY.includes("\n")) {
  throw new Error("entry must be a single line");
}
// All-ASCII motto: 72 characters is 72 bytes; pin that too.
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_CHARS) {
  throw new Error("entry byte length does not match character length");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read back and verify byte-exact, no trailing newline.
const written = readFileSync(target, "utf8");
if (written !== ENTRY) {
  throw new Error("read-back mismatch: written entry differs from ENTRY");
}
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${ENTRY.length} characters)`,
);
