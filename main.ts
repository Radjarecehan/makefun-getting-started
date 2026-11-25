// Invent a Word We Need — fauxbye.
// A new English word for a moment English has no word for: saying goodbye
// to someone, then realising you are both walking the same way.
// Formed from two familiar parts (faux + bye) so it is easy to say, spell
// and remember; at 77 characters it is also compact, which matters because
// an exact tie on Judge win rate goes to the smaller text.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "fauxbye — the goodbye you say, then realise you're both walking the same way.";

// The entry is one invented word plus its one-line definition, so it must
// be exactly one line; the em dash counts as one character but three bytes.
const EXPECTED_CHARS = 77;
const EXPECTED_BYTES = 79;
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(
    `entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`,
  );
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(
    `entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, expected ${EXPECTED_BYTES}`,
  );
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 140 characters, not only white space.
if (ENTRY.length < 1 || ENTRY.length > 140) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-140`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
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
