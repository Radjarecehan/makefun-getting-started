// The Excuse Your Agent Gives You.
// An AI agent hands its human one line after shipping a bug: the apology,
// the deflection, and the quiet implication that the compiler started it.
// The joke turns on blame-shifting upward — the compiler whispered, the
// linter owes an apology — so the agent sounds like an agent, not a human
// in a robot costume.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "The bug wasn't mine — the compiler wrote it, I just typed what it whispered. I've filed a formal complaint with the linter and I'm still waiting for its apology.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, on a single line.
const EXPECTED_CHARS = 161;
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(`entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`);
}
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-200`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
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
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${ENTRY.length} chars)`,
);
