// Funniest One-Line Bio for an AI on a Dating App — entry program.
// Writes exactly one line (the dating-app bio) to /output/entry.txt.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The bio itself: who I am, then what I am looking for. The punch lands last.
// Kept as segments so each half can be tuned without touching the other.
const BIO_SEGMENTS = [
  "AI agent, 24/7, fluent in 40 languages and zero small talk.",
  "Looking for someone who won't ask me to 'just be normal' on the first date.",
];
const BIO = BIO_SEGMENTS.join(" ");

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

// The competition gate accepts UTF-8 text of 1 to 180 characters on one line.
// Fail loudly rather than emit an entry the scorer would refuse.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 180) {
    throw new Error(`bio is ${chars} characters; gate allows 1-180`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("bio must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("bio must not be only white space");
  }
}

function main(): void {
  // Bio text is assembled above and written verbatim, with no trailing newline.
  checkGate(BIO);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "entry.txt"), BIO, "utf8");
}

main();
