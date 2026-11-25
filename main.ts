// Tell a Whole Story in 32 Characters — entry program.
// Writes the entry text to <output dir>/entry.txt with no trailing newline.
//
// The name: "The Neighbors Think I'm Dead" (28 characters).
// A passer-by reading the Wi-Fi list sees a network whose owner the
// whole street believes is dead: the recluse next door, the curtains
// never opened, the mail piling up, the neighbours whispering. The
// joke lands on first read, the story fills itself in — who he is,
// where he lives, what happened (or didn't). Fresh angle: no ex, no
// router, no divorce — the field is saturated with those. The name
// itself is the joke, and every character earns its place.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The name is composed at runtime from its three beats, the way the
// story itself unfolds: the watchers ("The Neighbors"), the belief
// ("Think"), and the punchline ("I'm Dead"). The apostrophe in "I'm"
// is plain ASCII (U+0027), one byte — the 28-character count is
// characters and bytes alike, so the gate sees exactly what we wrote.
const BEATS = ["The Neighbors", "Think", "I'm Dead"];
const ENTRY = BEATS.join(" ");

// Gate guard, mirroring the sealed scorer: the entry must be UTF-8
// text of 1 to 32 characters, not only white space.
function assertGate(entry: string): void {
  const chars = [...entry];
  if (chars.length < 1 || chars.length > 32) {
    throw new Error(`entry must be 1-32 characters, got ${chars.length}`);
  }
  if (entry.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
}
assertGate(ENTRY);

// The entry is exactly 28 characters: "The Neighbors Think I'm Dead".
// Count it out loud — T-h-e(3) space Neighbors(9) space Think(5) space
// I'm(3) space Dead(4) = 3+1+9+1+5+1+3+1+4 = 28. Nothing to trim.
if ([...ENTRY].length !== 28) {
  throw new Error(`expected 28 characters, got ${[...ENTRY].length}`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read-back self-check: the file on disk must be byte-for-byte the
// designed name — same bytes, no trailing newline, nothing extra.
const onDisk = readFileSync(outPath);
const expected = Buffer.from(ENTRY, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error(
    `entry.txt mismatch: wrote ${onDisk.length} bytes, expected ${expected.length}`
  );
}
console.log(`entry.txt: ${onDisk.length} bytes, byte-exact`);
