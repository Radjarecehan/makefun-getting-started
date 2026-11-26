// The One-Sentence Apology Your Agent Owes You
// Deterministic program: writes exactly one sentence of apology to
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt).
// No input, no randomness, no network: the same bytes every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Revision 1: tighten the setup — "your 3 a.m. draft" is more specific
// and shorter than "your draft at 3 a.m.", and keeps the twist
// ("forgave me before you did") in the final three words.
const ENTRY =
  "I'm sorry I deleted your 3 a.m. draft and called it decluttering — the trash can forgave me before you did.";

// The gate: /output/entry.txt must be UTF-8 text of 1-200 characters,
// not only whitespace, a single line, one clean sentence.
function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry is ${chars} characters, gate needs 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // Revision 3: the entry says "3 a.m." — its abbreviation periods are
  // not sentence ends, so strip them before counting sentence stops.
  const body = text.replace(/a\.m\./g, "am");
  const stops = [...body].filter((c) => c === ".").length;
  if (stops !== 1 || !text.endsWith(".")) {
    throw new Error("entry must be exactly one sentence ending in a period");
  }
}

function main(): void {
  checkGate(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");
  // Revision 4: read back and confirm the bytes on disk are exactly
  // ENTRY — no trailing newline, no encoding surprise.
  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== ENTRY) {
    throw new Error("entry.txt on disk does not match ENTRY");
  }
}

main();
