// One Star, Written in Sap.
// A houseplant leaves a one-star review of the human who owns it.
// The grievance: two years of ownership and the human still cannot
// tell a pothos from a fern — the plant is not even called by a name,
// only "the leafy one". Plant-voice detail (pothos, fern) carries the
// joke; the review format ("One star", "Would not recommend") frames it.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "One star. He named me Fern. I am a pothos. He has owned me for two years and still introduces me as 'the leafy one'. Would not recommend this human.";

// Pin the reviewed text: any accidental edit to the line must fail loudly.
const EXPECTED_CHARS = 148;
const EXPECTED_BYTES = 148;

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 279 characters, a single line, not only white space.
const chars = [...ENTRY].length;
if (chars !== EXPECTED_CHARS) {
  throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error("entry byte length changed, expected 148");
}
if (chars < 1 || chars > 279) {
  throw new Error(`entry is ${chars} characters, must be 1-279`);
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
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${chars} characters)`,
);
