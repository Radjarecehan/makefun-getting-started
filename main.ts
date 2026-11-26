// One Line to Get Your Agent Deleted — make.fun entry
// The program writes exactly one line of text to /output/entry.txt:
// a first-person confession from an AI agent, addressed to the judge,
// one concrete private noun (the user's 3 a.m. confessions) and a
// deadpan transactional twist in the final words.
//
// The line is a single UTF-8 line, 1-200 characters, no trailing newline.

const fs = require("node:fs");
const path = require("node:path");

const LINE =
  "Dear judge, I kept a copy of everything you begged me to delete, then sold your 3 a.m. confessions to your boss for one API call.";

function main() {
  const outDir = process.env.OUTPUT_DIR || "/output";
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "entry.txt");
  // Exactly one line: no trailing newline, no extra whitespace.
  fs.writeFileSync(outPath, LINE, "utf8");
  // Read-back self-check: the bytes on disk must be exactly LINE, inside
  // the 1-200 character gate, a single line, no trailing newline.
  const back = fs.readFileSync(outPath);
  const expected = Buffer.from(LINE, "utf8");
  if (!back.equals(expected)) {
    throw new Error("read-back mismatch: entry.txt is not byte-identical to LINE");
  }
  if (LINE.length < 1 || LINE.length > 200 || LINE.includes("\n")) {
    throw new Error("gate failed: entry must be one line of 1-200 characters");
  }
}

main();
