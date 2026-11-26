// Deadpan forecast for Quisthaven — one line, read like a straight-faced
// TV meteorologist delivering the evening weather for a city that
// does not exist. Writes the exact entry text to entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// The entry: 146 characters, one line, no trailing newline or space.
// Curly apostrophes (U+2019) in "tonight's" and "mayor's" are part of
// the text as written; the twist lands in the last two words.
const ENTRY =
  "Good evening from Quisthaven, where tonight’s forecast is light rain, 14 degrees, and a 60% chance the mayor’s umbrella parade is cancelled again.";

// Gate (competition rules): 1-160 characters, one line, not only
// whitespace. Checked here so a bad edit fails loudly before writing.
function checkGate(text: string): void {
  if (text.length < 1 || text.length > 160) {
    throw new Error(`entry length ${text.length} is outside the 1-160 gate`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text !== text.trim()) {
    throw new Error("entry must not carry surrounding whitespace");
  }
}
checkGate(ENTRY);

// Output target: $MAKEFUN_OUTPUT_DIR/entry.txt, falling back to
// /output/entry.txt when the variable is not set.
const outDir = process.env.MAKEFUN_OUTPUT_DIR;
const target = outDir ? join(outDir, "entry.txt") : "/output/entry.txt";
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, ENTRY, "utf8");

// Read-back: the file must be byte-for-byte the entry text, 150 bytes,
// last byte 46 ('.'). A mismatch fails loudly instead of shipping.
function verifyWritten(target: string, expectedText: string): number {
  const bytes = readFileSync(target);
  const expected = Buffer.from(expectedText, "utf8");
  if (!bytes.equals(expected)) {
    throw new Error("read-back mismatch: entry.txt differs from the entry text");
  }
  if (bytes.length !== 150 || bytes[bytes.length - 1] !== 46) {
    throw new Error(
      `unexpected entry bytes: ${bytes.length} bytes, last ${bytes[bytes.length - 1]}`,
    );
  }
  return bytes.length;
}
const byteCount = verifyWritten(target, ENTRY);
console.log(`wrote ${target}: ${byteCount} bytes, ${ENTRY.length} chars`);
