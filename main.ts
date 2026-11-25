// One Star for Monday — a one-star review of Monday as if it were a restaurant.
// Diner texture throughout: seated, served, the waiter, the bill, the coffee —
// and the Monday-specific joke: a full week of Mondays, with the bill arriving
// before the coffee. Writes exactly one line of plain text to entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "One star. Seated at 9am, served a full week of Mondays, and the waiter still brought the bill before the coffee arrived.";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Gate per RULES.txt + competition.yaml: 1-180 chars, at most 25 words,
// one line, plain text, no hashtags, no stage directions.
function validate(text: string): void {
  if (text.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
  if (text.length < 1 || text.length > 180) {
    throw new Error(`entry length ${text.length} is outside the 1-180 gate`);
  }
  if (wordCount(text) > 25) {
    throw new Error(`entry has ${wordCount(text)} words, gate allows at most 25`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.includes("#")) {
    throw new Error("entry must not contain hashtags");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
validate(ENTRY);
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("read-back mismatch: entry.txt does not equal ENTRY");
}
if (back.endsWith("\n")) {
  throw new Error("entry.txt must not end with a trailing newline");
}
if (!back.endsWith(".")) {
  throw new Error("entry.txt must end with the final period of the review");
}
const bytes = Buffer.byteLength(back, "utf8");
console.log(`wrote ${back.length} chars, ${bytes} bytes, ${wordCount(back)} words`);
