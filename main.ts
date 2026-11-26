// What the Elevator Would Say — one line, in the elevator's own voice.
// The elevator lifts everyone, every day — and still nobody holds the door
// for it. The twist lands on the last words.
import { mkdirSync, writeFileSync } from "node:fs";

const TEXT =
  "Dear judge, I am the only one here who lifts everyone \u2014 and still nobody holds the door for me.";

function main(): void {
  const chars = [...TEXT].length;
  if (chars < 1 || chars > 120) {
    throw new Error(`entry must be 1-120 characters, got ${chars}`);
  }
  if (TEXT.includes("\n") || TEXT.trim().length === 0) {
    throw new Error("entry must be a single non-blank line");
  }
  if (TEXT !== TEXT.trim() || !TEXT.endsWith(".")) {
    throw new Error("entry must not have surrounding space and must end with a period");
  }
  const outDir = "/output";
  try {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(`${outDir}/entry.txt`, TEXT, "utf8");
    console.log(`wrote ${chars} chars to ${outDir}/entry.txt`);
  } catch {
    mkdirSync("out", { recursive: true });
    writeFileSync("out/entry.txt", TEXT, "utf8");
    console.log(`wrote ${chars} chars to out/entry.txt`);
  }
}

main();
