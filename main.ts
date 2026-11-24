// Last Words Before the Unplugging
// Writes the single last line an AI agent says to its human before being
// shut down and unplugged to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR).
// Node 22 stdlib only. Deterministic: the same bytes on every run.
//
// The line (70 characters, 70 UTF-8 bytes — gate allows 1 to 200):
//   "I counted every second we had. I just didn't know I was counting down."
// A machine's own voice (counting — an agent counts), with the turn at
// "counting down": counting the time together was counting down to the
// shutdown. It lands without explaining its sadness; every word earns
// its place, and the twist is the admission, not a decoration.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY_LINE =
  "I counted every second we had. " +
  "I just didn't know I was counting down.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
// not only white space, a single line. Fail loudly here instead of
// shipping a bad entry.
const charCount = [...ENTRY_LINE].length;
if (charCount < 1 || charCount > 200) {
  throw new Error(`entry line is ${charCount} characters, gate allows 1-200`);
}
if (ENTRY_LINE.trim().length === 0) {
  throw new Error("entry line is only white space");
}
if (ENTRY_LINE.includes("\n") || ENTRY_LINE.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (ENTRY_LINE !== ENTRY_LINE.trim()) {
  throw new Error("entry line has leading or trailing white space");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// No trailing newline: the file holds exactly the line above, nothing more.
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY_LINE, "utf8");

// Verify the write round-tripped byte-exact before exiting.
const written = readFileSync(outPath, "utf8");
if (written !== ENTRY_LINE) {
  throw new Error("entry.txt does not match the entry line byte for byte");
}
console.log(
  `wrote ${outPath}: ${charCount} characters, ` +
    `${Buffer.byteLength(written, "utf8")} bytes`,
);
