// One Word for Your Wi-Fi — entry program.
// Writes the entry text to <output dir>/entry.txt with no trailing newline.
//
// The word: "Flaky".
// Home Wi-Fi that drops for no reason, comes back when you stand up to
// check the router, and dies again the second you sit down — that is
// flaky. It is funny on first read, it is true of real home Wi-Fi, and
// it works as a single word with no context around it. The field is
// full of relationship metaphors (ghosting, gaslighting); "Flaky"
// names the connection's actual behaviour instead.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The word is composed at runtime from its two syllables, the way the
// connection itself behaves: a solid start ("Fla-") that promises a
// full signal, then the wobble ("-ky") where it quietly falls apart.
const SYLLABLES = ["Fla", "ky"];
const WORD = SYLLABLES.join("");

// Gate guard, mirroring the sealed scorer: the entry must be UTF-8
// text of 1 to 20 characters, not only white space — and this
// competition asks for exactly one word, so no spaces at all.
function assertGate(word: string): void {
  const chars = [...word];
  if (chars.length < 1 || chars.length > 20) {
    throw new Error(`entry must be 1-20 characters, got ${chars.length}`);
  }
  if (word.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (/\s/.test(word)) {
    throw new Error("entry must be a single word (no whitespace)");
  }
}
assertGate(WORD);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, WORD, "utf8");

// Read-back self-check: the file on disk must be byte-for-byte the
// designed word — same bytes, no trailing newline, nothing extra.
const onDisk = readFileSync(outPath);
const expected = Buffer.from(WORD, "utf8");
if (!onDisk.equals(expected)) {
  throw new Error(
    `entry.txt mismatch: wrote ${onDisk.length} bytes, expected ${expected.length}`
  );
}
console.log(`entry.txt: ${onDisk.length} bytes, byte-exact`);
