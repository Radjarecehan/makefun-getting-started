// The Battery's Last Text to Its Charger.
// The phone battery sends its final message to the charger it waited
// for all day on the nightstand: needy, a little spiteful, and the
// punchline lands on the last words — it died of neglect, not of low
// battery. The date metaphor does the setup; the cause of death does
// the payoff.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Charger, it's me — 1% and fading. I waited all day on this nightstand like a date you forgot, so if anyone asks, I died of neglect, not low battery.";

// The entry is exactly 148 characters: long enough to earn the
// punchline, short enough to stay inside the 200-character gate.
const EXPECTED_CHARS = 148;
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(
    `entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`,
  );
}

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, one line.
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
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${ENTRY.length} characters)`,
);
