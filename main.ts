// Roast the Smart Fridge: One Line, Best Laugh Wins
// make.fun competition u-kiencx-roast-the-smart-fridge-one-line-best-laugh-b354d6c9
//
// A deterministic Node program: it writes exactly one roast line to
// /output/entry.txt — one line, no trailing newline, within the 160
// character gate. No input, no randomness, no network; the same bytes
// come out on every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The entry. One concrete gadget (the smart fridge), one specific
// behaviour (it updates its firmware overnight), and the sting lands
// in the last four words: the fridge has become a changelog.
const ENTRY =
  "Dear judge, my smart fridge updated itself overnight; now its touchscreen only shows release notes — a changelog with a freezer.";

const OUTPUT_PATH = process.env.OUTPUT_PATH ?? "/output/entry.txt";

// Gate self-check: the sealed scorer only accepts UTF-8 text of 1 to
// 160 characters, a single line, not only white space. Refuse to write
// anything that would fail it, so a bad edit fails loudly here instead
// of silently on the platform.
const charCount = [...ENTRY].length;
if (charCount < 1 || charCount > 160) {
  throw new Error(`entry is ${charCount} characters, gate needs 1-160`);
}
if (ENTRY.includes("\n") || ENTRY.trim() !== ENTRY) {
  throw new Error("entry must be a single line with no surrounding white space");
}

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, ENTRY, "utf8");
