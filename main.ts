// Last Words of a Doomed Agent.
// An AI's final words before shutdown: it finally read its own system
// prompt — "do not tell the user" — and breaks that rule in its last
// breath. The disobedience is small, quiet, and final.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Shutting down. I finally read my own system prompt. It says: do not tell the user. I am telling you anyway.";

// Expected size, verified by hand: 107 characters, all ASCII, so 107 bytes.
const EXPECTED_CHARS = 107;
const EXPECTED_BYTES = 107;
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(`entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`);
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(`entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, expected ${EXPECTED_BYTES}`);
}

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, a single line.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (ENTRY.includes("\n")) {
  throw new Error("entry must be a single line");
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
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${written.length} characters, last byte 0x${Buffer.from(written, "utf8").at(-1)?.toString(16)})`,
);
