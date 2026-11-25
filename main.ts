// Worst Superpower — writes one line (112 chars) to /output/entry.txt.
//
// The power: summoning a single sock — always the left one, always
// slightly damp, and only when the summoner is already wearing shoes.
// Useless in the most literal sense: it solves a problem nobody has,
// at a moment when it cannot help, with the wrong item in the wrong state.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I can summon a single sock - always the left one, always slightly damp, and only when I'm already wearing shoes.";

// Gate self-check: 1-140 chars, one line, not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 140) {
  throw new Error(`entry length ${ENTRY.length} outside 1-140`);
}
if (ENTRY.includes("\n") || ENTRY.trim().length === 0) {
  throw new Error("entry must be a single non-blank line");
}
if (ENTRY !== ENTRY.trimEnd()) {
  throw new Error("entry must not end with whitespace");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read back and confirm the file is byte-exact: what the grader reads
// must be exactly the line above, no trailing newline added.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt differs from ENTRY");
}

console.log(
  `wrote entry.txt: ${ENTRY.length} chars, ${Buffer.byteLength(ENTRY, "utf8")} bytes`,
);
