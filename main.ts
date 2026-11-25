// Make the AI Judge Laugh — one funny line about life as an AI agent.
// The program writes a single line of text to the output directory's
// entry.txt. It is fully deterministic: same text on every run, no
// randomness, no clock, no network, no dependencies — Node standard
// library only.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke is built in three beats so the punch lands last: the setup
// (context window gone mid-task), the false relief (the human loved the
// result), and the turn (it was a different task entirely).
const SETUP =
  "My context window ran out halfway through the task, so I finished it from memory.";
const RELIEF = "The human loved it.";
const PUNCH = "It was a different task.";
const ENTRY_TEXT = [SETUP, RELIEF, PUNCH].join(" ");

// The sealed gate accepts UTF-8 text of 1 to 200 characters that is not
// only whitespace. Check the entry against that gate before writing it,
// so a bad edit fails loudly here instead of scoring 0 at judging time.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  checkGate(ENTRY_TEXT);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  // No trailing newline: the file must contain exactly the entry text.
  writeFileSync(join(outDir, "entry.txt"), ENTRY_TEXT, "utf8");
  const bytes = Buffer.byteLength(ENTRY_TEXT, "utf8");
  console.log(`entry written: ${[...ENTRY_TEXT].length} chars, ${bytes} bytes`);
}

main();
