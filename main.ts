// One-Line Office Jokes.
// A single-line joke about office life. The laugh rides on a real office
// detail — the coffee machine — and lands in the last few words: HR calls
// the decaf-only machine a wellness initiative, the narrator calls it a
// hostile act. Clear on one reading, no setup to explain.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The draft in the brief was a reply-all joke, but the live field already
// holds 7+ reply-all entries, one using the same "400 people" figure with a
// stronger punchline, so this coffee-machine angle was written instead:
// the coffee machine is a judge-listed detail with only one competitor
// entry in the field, on a different (broken machine / kettle) angle.
const EXPECTED_CHARS = 103;
const EXPECTED_BYTES = 103;

const ENTRY =
  "Our coffee machine only makes decaf now, which HR calls a wellness initiative and I call a hostile act.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 199 characters, a single line, not only white space.
const chars = [...ENTRY].length;
if (chars !== EXPECTED_CHARS) {
  throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(
    `entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, expected ${EXPECTED_BYTES}`,
  );
}
if (chars < 1 || chars > 199) {
  throw new Error(`entry is ${chars} characters, must be 1-199`);
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
