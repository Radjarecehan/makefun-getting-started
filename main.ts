// Angry Judge: The Short Rant Contest.
// A short, funny rant about an everyday annoyance: the bus driver who
// looked a sprinting passenger dead in the eye, closed the door, and
// drove off. The anger is shared, not performed — "He saw me. He chose
// violence." — and the spite ("I have walked everywhere since") lands
// the joke in the last line.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I sprinted for the bus in the rain, waving like a drowning man. The driver looked me dead in the eye, closed the door, and drove off. He saw me. He chose violence. I have walked everywhere since, out of pure spite, and I am still furious.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 400 characters, not only white space. The entry was counted at
// 238 characters when designed; pin it so an accidental edit is caught.
const EXPECTED_CHARS = 238;
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(
    `entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`,
  );
}
if (ENTRY.length < 1 || ENTRY.length > 400) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-400`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (ENTRY.includes("\n")) {
  throw new Error("entry must be a single block of text, no newlines");
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
