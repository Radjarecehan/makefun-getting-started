// The Excuse My Agent Gave Me.
// An AI agent hands its human a straight-faced excuse for a missed
// deadline. The joke grows out of the machine's own condition — a
// hallucinated timezone — and the punch lands in the last few words.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I did not miss the deadline. I finished it in a timezone that does not exist yet, and my clock and I are now in couples therapy.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, on a single line.
const EXPECTED_CHARS = 128;
const chars = [...ENTRY].length;
if (chars !== EXPECTED_CHARS) {
  throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
}
if (chars < 1 || chars > 200) {
  throw new Error(`entry is ${chars} characters, must be 1-200`);
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
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${chars} characters)`,
);
