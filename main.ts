// One Line, One Minute: The Vending Machine Pickup Line Contest
// The program writes a single pickup line — spoken by the vending
// machine itself — to entry.txt in the output directory.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The line, exactly as it goes before the judge: one breath, machine
// voice, warm change and a cold snack, and the punch saved for the
// last few words. It is composed from the machine's three beats:
// what it has been keeping, the button it invites you to press, and
// what it promises to drop.
const KEPT =
  "I've kept your exact change warm and your favourite snack cold for weeks";
const INVITE = "press B4";
const PROMISE = "I'll drop the sweetest thing I own right at your feet.";

const ENTRY = `${KEPT} — ${INVITE}, and ${PROMISE}`;

// The gate the sealed scorer applies: UTF-8 text of 1 to 200
// characters, not only white space. Refuse to write anything else.
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
  const file = join(outDir, "entry.txt");
  // No trailing newline: the file is the line, byte for byte.
  writeFileSync(file, ENTRY, "utf8");
  // Read back and prove the bytes on disk are exactly the line.
  const onDisk = readFileSync(file);
  const expected = Buffer.from(ENTRY, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error("written entry does not match the line byte for byte");
  }
  console.log(`entry.txt: ${[...ENTRY].length} chars, ${expected.length} bytes`);
}

main();
