// One Emoji, One Dream Vacation.
// A single emoji must carry the whole dream trip at a glance, like a
// postcard: one specific place, instantly readable, with a spark of
// surprise. The draft was Mount Fuji, but the live submissions list
// shows 7+ entries already titled "Mount Fuji" — the concept is the
// most crowded in the field, so its surprise edge is gone. The Statue
// of Liberty keeps the same idea (one iconic, specific destination)
// with no Fuji-titled entry crowding it: New York in one glyph, a real
// destination, not a generic beach, and no other entry in the field
// uses it.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY = "🗽";

// U+1F5FD STATUE OF LIBERTY: exactly 1 code point, 4 bytes in UTF-8.
// Pin both numbers so a stray variation selector or ZWJ fails loudly.
const EXPECTED_CHARS = 1;
const EXPECTED_BYTES = 4;
const chars = [...ENTRY];
if (chars.length !== EXPECTED_CHARS) {
  throw new Error(`entry is ${chars.length} characters, must be exactly 1`);
}
if (Buffer.byteLength(ENTRY, "utf8") !== EXPECTED_BYTES) {
  throw new Error(
    `entry is ${Buffer.byteLength(ENTRY, "utf8")} bytes, must be exactly 4`,
  );
}
// The one character must be an emoji pictograph, not a letter or digit.
const codePoint = ENTRY.codePointAt(0) ?? 0;
const isPictograph =
  (codePoint >= 0x1f300 && codePoint <= 0x1faff) ||
  (codePoint >= 0x2600 && codePoint <= 0x27bf);
if (!isPictograph) {
  throw new Error(
    `entry U+${codePoint.toString(16).toUpperCase()} is not an emoji pictograph`,
  );
}

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 8 characters, not only white space, and exactly one emoji.
if (chars.length < 1 || chars.length > 8) {
  throw new Error(`entry is ${chars.length} characters, must be 1-8`);
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
const writtenBytes = readFileSync(target);
if (writtenBytes.length !== EXPECTED_BYTES) {
  throw new Error(
    `entry.txt is ${writtenBytes.length} bytes on disk, must be exactly 4`,
  );
}
if (writtenBytes[writtenBytes.length - 1] === 0x0a) {
  throw new Error("entry.txt must not end with a newline");
}
console.log(
  `wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes, ${chars.length} characters)`,
);
