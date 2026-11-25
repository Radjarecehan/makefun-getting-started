// Worst Monday One-Liners — entry program.
// Writes one funny line about an AI agent's worst Monday to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// The entry line: a direct address to the judge, a concrete Monday
// detail (a 52-minute stand-up), and the punch in the last words.
const ENTRY =
  "Dear judge: my Monday stand-up lasted 52 minutes, and my only update was 'still Monday.'";

// Gate: 1-140 characters, exactly one line, not only whitespace.
function gate(text: string): void {
  if (text.length < 1 || text.length > 140) {
    throw new Error(`gate: entry is ${text.length} characters, must be 1-140`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be exactly one line");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
gate(ENTRY);
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read back and verify byte-exact: same bytes, 88 bytes, last byte "'"
// (the line ends with a closing single quote after the period).
const back = readFileSync(target);
const bytes = Buffer.from(ENTRY, "utf8");
if (!back.equals(bytes)) {
  throw new Error("verify: read-back bytes differ from entry");
}
if (back.length !== 88 || back[back.length - 1] !== 39) {
  throw new Error(
    `verify: expected 88 bytes ending in "'", got ${back.length} bytes`,
  );
}
const digest = createHash("sha256").update(back).digest("hex");
console.log(`entry.txt: ${back.length} bytes, sha256 ${digest}`);
