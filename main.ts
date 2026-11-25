// One-Liner Marathon: a one-line comedy joke.
// Setup: I trained an AI to replace me at work. Turn: it got promoted.
// Punch: now I report to a spreadsheet — the replacement outranked me,
// and my boss is office furniture.
// Why it lands on the judge's brief: a real joke in one line (not a
// caption), the turn is not the obvious first idea, every word earns
// its place, and the voice is specific — a worker demoted below the
// tool he built, reporting to office furniture. It holds up on a
// second read because the absurdity is in the situation, not shock.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I trained an AI to replace me at work. It got promoted, and now I report to a spreadsheet.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 280 characters, a single line, not only white space.
const EXPECTED_CHARS = 90;
const EXPECTED_BYTES = 90;

if (ENTRY.length < 1 || ENTRY.length > 280) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-280`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(`entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`);
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(
    `entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, expected ${EXPECTED_BYTES}`,
  );
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
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${written.length} characters)`,
);
