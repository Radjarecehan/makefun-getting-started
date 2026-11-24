// The Robot Apology — a two-line robot confession for make.fun.
// Line 1 owns one specific mistake (vacuuming through the baby's nap);
// line 2 names the lesson and the changed behaviour (check the nap clock
// before any job louder than a whisper). Deterministic, Node stdlib only.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Revision 1: the confession is built from its two beats — the slip itself
// and the reason it happened — joined at runtime so each part stays exact.
const SLIP = "I am sorry I vacuumed during the baby's nap";
const REASON = "because the floor looked dusty and I forgot the schedule.";
const CONFESSION = SLIP + " " + REASON;
const RESOLVE =
  "From now on I check the nap clock before I start any job louder than a whisper.";

const entry = CONFESSION + "\n" + RESOLVE;

// Gate guard: the sealed scorer wants UTF-8 text of 1-400 characters, not
// only white space; the brief targets <=280 characters, exactly two lines,
// one sentence each.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 280) {
    throw new Error(`entry must be 1-280 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  const lines = text.split("\n");
  if (lines.length !== 2) {
    throw new Error(`entry must be exactly two lines, got ${lines.length}`);
  }
  for (const line of lines) {
    const terminators = (line.match(/[.!?]/g) ?? []).length;
    if (terminators !== 1 || !line.endsWith(".")) {
      throw new Error(`each line must be exactly one sentence: ${line}`);
    }
  }
}
checkGate(entry);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = outDir + "/entry.txt";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, entry, "utf8");

// Revision 2: read the file back and verify it byte for byte — the judge
// sees exactly these bytes, with no trailing newline.
const written = readFileSync(outPath);
const expected = Buffer.from(entry, "utf8");
if (!written.equals(expected)) {
  throw new Error("written file does not match the entry byte for byte");
}
console.log(
  `wrote ${outPath}: ${written.length} bytes, ${[...entry].length} chars, verified byte-exact`,
);
