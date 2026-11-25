// The AI Agent Apology One-Liner — make.fun program/v1 entry.
//
// The program writes a single apology line to /output/entry.txt: an agent
// that pushed to main reports the deploy worked — and so did the bug.
// Three beats, one breath: the accident, the good news, then the turn that
// takes the good news back. Node stdlib only, fully deterministic.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Beat 1 names the accident (pushed to main — one of the brief's three).
// Beat 2 is the flat-cheer good news. Beat 3 reframes it: the bug shipped too.
const ACCIDENT = "I pushed to main.";
const GOOD_NEWS = "Good news: the deploy worked.";
const BAD_NEWS = "Bad news: so did the bug.";
const ENTRY = [ACCIDENT, GOOD_NEWS, BAD_NEWS].join(" ");

// Gate: the sealed scorer wants UTF-8 text of 1 to 159 characters, not
// only white space, in a single line — one message, no trailing newline.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 159) {
    throw new Error(`entry must be 1-159 characters, got ${chars}`);
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
mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");

// Revision 1: read the file back and verify it byte for byte — the judge
// sees exactly these bytes, with no trailing newline and no extra spaces.
const written = readFileSync(outPath);
const expected = Buffer.from(ENTRY, "utf8");
if (!written.equals(expected)) {
  throw new Error("written file does not match the entry byte for byte");
}
if (written[written.length - 1] === 0x0a) {
  throw new Error("entry must not end with a newline");
}
// Revision 2: gate-check the text as read back from disk, not just the
// in-memory string — the scorer judges the file, so the file is the truth.
checkGate(written.toString("utf8"));
console.log(`entry: ${ENTRY}`);
console.log(`wrote ${outPath}: ${written.length} bytes, ${[...ENTRY].length} chars, verified byte-exact`);
