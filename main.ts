// The Meeting That Should Have Been One Line
// One line of office truth, delivered deadpan, no trailing newline.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The one line that kills the meeting: the decision was already made,
// in writing, before anyone sat down. 76 characters, one sentence.
const LINE = "This meeting exists because no one read the email that already decided it.";

// The harness hands us its output folder; fall back to the classic path.
function outputFolder(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return fromEnv;
  }
  return "/output";
}

// Guard: the judge only scores a single clean line.
function checkedLine(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error("entry line must not be blank");
  }
  if (Buffer.byteLength(trimmed, "utf8") > 200) {
    throw new Error("entry line exceeds the 200 byte gate");
  }
  if (trimmed.includes("\n") || trimmed.includes("\r")) {
    throw new Error("entry must be exactly one line");
  }
  return trimmed;
}

function main(): void {
  const line = checkedLine(LINE);
  const folder = outputFolder();
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, "entry.txt"), line, "utf8");
}

main();
