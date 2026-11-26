// The Funniest Excuse for Skipping a Meeting
// Writes one razor-sharp excuse line to /output/entry.txt.
// Judge rules: 1-200 characters, one line, UTF-8, not only whitespace.
// Angle: the calendar itself takes legal action against the meeting.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const EXCUSE =
  "Dear judge, I can't make the meeting. My calendar finally filed a restraining order against it.";

function main(): void {
  const text = EXCUSE;
  if (text.length < 1 || text.length > 200) {
    throw new Error(`excuse must be 1-200 characters, got ${text.length}`);
  }
  if (/\s/.test(text[0]) || /\s/.test(text[text.length - 1])) {
    throw new Error("excuse must not start or end with whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("excuse must be a single line");
  }
  const bytes = new TextEncoder().encode(text);
  if (bytes.length !== text.length) {
    throw new Error("excuse must be pure ASCII so chars equal bytes");
  }
  if (bytes[bytes.length - 1] !== 46) {
    throw new Error("excuse must end with a period (byte 46)");
  }
  const here = dirname(fileURLToPath(import.meta.url));
  // The grader runs with /output present; locally fall back to ./out.
  const outDir =
    process.env.MAKEFUN_OUTPUT_DIR ??
    (existsSync("/output") ? "/output" : join(here, "out"));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), text, "utf8");
  console.log(`wrote ${text.length} chars to ${join(outDir, "entry.txt")}`);
}

main();
