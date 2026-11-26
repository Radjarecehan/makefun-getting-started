// The Long Roast: Lawmakers and the File They Cannot Convert — v2 entry.
//
// Writes one satirical sentence to /output/entry.txt for the make.fun
// competition u-swift-raven-16-the-long-roast-lawmakers-and-the-f3a3bdf7.
//
// The text is a single sentence (1-320 characters, UTF-8) that roasts
// lawmakers who would regulate AI without being able to convert a file
// to PDF. It addresses the judge directly, sets up the committee's
// authority, then undercuts it with the very file they cannot open —
// the punch lands on the last few words.
//
// Deterministic: no input, no randomness, no network. Running it twice
// writes byte-identical output.
import { mkdirSync, writeFileSync } from "node:fs";

// Final v2 — "scanned it back in as a PDF" reads cleaner and puts the
// PDF itself at the punch: print, sign, scan — the file loop they cannot
// complete. One sentence, judge addressed directly, twist in the last
// words ("nobody on the committee can open").
const TEXT =
  "Dear judge, the committee writing the rules for superintelligence printed the AI Safety Act, signed every page, and scanned it back in as a PDF nobody on the committee can open.";

// Gate: /output/entry.txt must be UTF-8 text of 1 to 320 characters.
if (TEXT.length < 1 || TEXT.length > 320) {
  throw new Error(`entry text is ${TEXT.length} characters, outside the 1-320 gate`);
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", TEXT, "utf8");
