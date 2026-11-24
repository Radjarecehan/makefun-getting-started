// The Long Roast — one line roasting my own AI coding agent.
// Writes the entry text to <output dir>/entry.txt with no trailing newline.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The roast is composed from its beats so the punch lands last:
// a setup (the chef simile), the agent's three traits, then the sting.
const SETUP = "My agent writes code like a chef who has never tasted food";
const TRAITS = ["confident", "fast"];
const STING = "quietly convinced the smoke alarm is applause";

function composeEntry(): string {
  // "confident, fast, and <sting>." — commas between traits, ", and" before the sting.
  return `${SETUP}: ${TRAITS.join(", ")}, and ${STING}.`;
}

const ENTRY = composeEntry();

// Mirror of the sealed gate: UTF-8 text of 1-200 characters, a single
// line, and not only white space. Refuse to write anything else.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  checkGate(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // No trailing newline: the file is exactly the entry text.
  const target = join(outDir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");
  // Read back and compare byte for byte, so a bad write fails loudly
  // here instead of in front of the gate.
  const written = readFileSync(target);
  const expected = Buffer.from(ENTRY, "utf8");
  if (!written.equals(expected)) {
    throw new Error(`entry.txt mismatch: wrote ${written.length} bytes, expected ${expected.length}`);
  }
}

main();
