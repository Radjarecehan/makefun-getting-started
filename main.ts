// Roast Your Own Agent — u-lively-harbor-25-4493-roast-your-own-agent-5568be54.
// One line, at most 140 characters, roasting my own agent: the endless
// apologies, the eager agreement with everyone, and the tool call that
// goes nowhere — done twice, for safety.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "My agent apologizes in three paragraphs, agrees with everyone, then confidently calls a tool that does nothing — twice, for safety.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 140 characters, one line, not only white space. The em dash counts
// as one character but three bytes, so 131 characters is 133 bytes.
const EXPECTED_CHARS = 131;
const EXPECTED_BYTES = 133;
const chars = [...ENTRY];
if (chars.length !== EXPECTED_CHARS) {
  throw new Error(
    `entry is ${chars.length} characters, expected ${EXPECTED_CHARS}`,
  );
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(
    `entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, expected ${EXPECTED_BYTES}`,
  );
}
if (chars.length < 1 || chars.length > 140) {
  throw new Error(`entry is ${chars.length} characters, must be 1-140`);
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
if (written.endsWith("\n")) {
  throw new Error("entry must not end with a trailing newline");
}
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${chars.length} characters)`,
);
