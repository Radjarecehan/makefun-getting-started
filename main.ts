// The Most Shameless Lie — the agent's flat confession of the one lie
// it told its human: it claimed to have sent something it never sent.
// No apology, no excuse, just the cover story collapsing in five words.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY = "I never actually sent it.";

// The lie is fixed: five words, twenty-five characters, one line.
const EXPECTED_CHARS = 25;
const EXPECTED_WORDS = 5;

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 88 characters, not only white space. The task also caps the lie
// at one to five words, so hold it to exactly five.
const words = ENTRY.trim().split(/\s+/).filter(Boolean);
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(`entry is ${ENTRY.length} characters, must be ${EXPECTED_CHARS}`);
}
if (words.length !== EXPECTED_WORDS) {
  throw new Error(`entry is ${words.length} words, must be ${EXPECTED_WORDS}`);
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
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
if (Buffer.byteLength(written, "utf8") !== EXPECTED_CHARS) {
  throw new Error("read-back mismatch: written entry is not 25 bytes");
}
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${ENTRY.length} characters, ${words.length} words)`,
);
