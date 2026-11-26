// The Dog Reviews the Mailman — one-line review, written by the dog.
// Gate: /output/entry.txt must be UTF-8 text of 1-200 characters, one line.
import { mkdirSync, writeFileSync } from "node:fs";

const TEXT =
  "Dear judge, one star for the mailman: he brings the whole neighbourhood's smells to my gate every day and has never once brought a treat. I am barking to his manager.";

function main(): void {
  const text = TEXT.trim();
  if (text.length < 1 || text.length > 200) {
    throw new Error(`entry must be 1-200 characters, got ${text.length}`);
  }
  if (/\n/.test(text)) {
    throw new Error("entry must be a single line");
  }
  if (!text.endsWith(".")) {
    throw new Error("entry must end with a period");
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(`${outDir}/entry.txt`, text, "utf8");
}

main();
