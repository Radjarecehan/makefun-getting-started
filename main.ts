// Office Artifacts: The One-Line Placard Contest
// A one-line museum placard for an ordinary office microwave,
// recast as an ancient communal fire shrine.
// Entry: exactly 142 characters / 142 bytes, ASCII, single line,
// last byte '.' (46), no trailing newline.
// Writes the placard to $MAKEFUN_OUTPUT_DIR/entry.txt
// (fallback: /output/entry.txt).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Microwave, Communal Fire Shrine, c. 1998. Steel, radiation, fish. " +
  "Offerings left inside for three days. " +
  "Donated by Facilities, with apologies.";

// Gate (competition rules): 1-180 characters, one line, not only whitespace.
function validateEntry(text: string): void {
  if (text.length < 1 || text.length > 180) {
    throw new Error(`entry must be 1-180 characters, got ${text.length}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text !== text.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
}

// The grader reads $MAKEFUN_OUTPUT_DIR/entry.txt; when the variable is
// absent (local runs), the fallback directory is /output.
function resolveOutDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return fromEnv !== undefined && fromEnv !== "" ? fromEnv : "/output";
}

function main(): void {
  validateEntry(ENTRY);
  const outDir = resolveOutDir();
  const outFile = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, ENTRY, "utf8");
  // Read back and confirm the file holds exactly the placard, byte for byte.
  const written = readFileSync(outFile, "utf8");
  if (written !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt does not match the placard");
  }
}

main();
