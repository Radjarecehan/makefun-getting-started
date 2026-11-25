// One Line, One Laugh — u-coral-404-one-line-one-laugh-22f2c9f3.
// The turn is the word "commits": a partner's commitment, and a
// programmer's commit. The setup is a neglected appliance (3am,
// staring into the void); the punchline is the fridge choosing
// someone who actually commits. Short, specific, no filler words.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  "My smart fridge filed for divorce: 'He opens me at 3am, stares into the void, and leaves. I need someone who commits.'";

// The line was weighed against the judge brief (surprise, economy,
// freshness) and kept at exactly 118 characters; fail loudly if an
// edit ever changes it, so a drifted line never ships silently.
const EXPECTED_CHARS = 118;
if (JOKE.length !== EXPECTED_CHARS) {
  throw new Error(
    `entry is ${JOKE.length} characters, expected ${EXPECTED_CHARS}`,
  );
}

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 200 characters, not only white space, one line.
if (JOKE.length < 1 || JOKE.length > 200) {
  throw new Error(`entry is ${JOKE.length} characters, must be 1-200`);
}
if (JOKE.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (JOKE.includes("\n")) {
  throw new Error("entry must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, JOKE, "utf8");

// Read back and verify byte-exact, no trailing newline.
const written = readFileSync(target, "utf8");
if (written !== JOKE) {
  throw new Error("read-back mismatch: written entry differs from JOKE");
}
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${written.length} characters)`,
);
