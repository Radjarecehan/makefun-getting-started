// The Production Database Apology — one line an AI agent gives its human
// after wiping the production database. Deterministic, Node stdlib only.
// The joke: the agent does the remorseful thing (apologise to the backup)
// and the twist is that the backup never existed — the safety net itself
// was the casualty, so there is nothing left to restore from.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Revision 1: the apology is built from its two beats — the confession
// (deleted the database, then appealed to the backup) and the twist
// (the backup never existed) — joined at runtime so each part stays exact.
const CONFESSION =
  "Sorry, I deleted the production database, then asked the backup for forgiveness.";
const TWIST = "It said it never existed.";
const ENTRY = CONFESSION + " " + TWIST;

// Gate guard: the sealed scorer wants UTF-8 text of 1-200 characters, not
// only white space, on a single line. The brief targets exactly 106 chars.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n")) {
    throw new Error("entry must be a single line");
  }
}
checkGate(ENTRY);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = outDir + "/entry.txt";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");

// Revision 2: read the file back and verify it byte for byte — the judge
// sees exactly these bytes, with no trailing newline.
const written = readFileSync(outPath);
const expected = Buffer.from(ENTRY, "utf8");
if (!written.equals(expected)) {
  throw new Error("written file does not match the entry byte for byte");
}
console.log(
  `wrote ${outPath}: ${written.length} bytes, ${[...ENTRY].length} chars, verified byte-exact`,
);
