// Pigeon Pitch, One Line — entry writer.
// Writes the one-line pigeon startup pitch to $MAKEFUN_OUTPUT_DIR/entry.txt
// (or ./out/entry.txt when the variable is unset). Node stdlib only,
// fully deterministic: the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "SeedRound, literally: we turn breadcrumbs into a last-mile delivery fleet — 10,000 wings, zero fuel, and every rooftop in the city is already ours.";

// Gate guard: the house gate wants 1–200 characters, one line, not only
// whitespace. Fail loudly instead of writing a bad entry.
function assertGate(text) {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate: entry is ${chars} chars, must be 1–200`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("gate: entry must not be only whitespace");
  }
  if (text !== text.trim()) {
    throw new Error("gate: entry must not start or end with whitespace");
  }
}

assertGate(ENTRY);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const outFile = join(outDir, "entry.txt");

// Entry point: validate, write, then verify by reading the file back.
function main() {
  assertGate(ENTRY);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, ENTRY, "utf8");

  // Read-back: the file on disk must be byte-identical to the entry text,
  // with no trailing newline added by the writer.
  const back = readFileSync(outFile, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt differs from ENTRY");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  console.log(
    `wrote ${outFile} (${bytes} bytes, last byte ${back.charCodeAt(back.length - 1)})`,
  );
}

main();
