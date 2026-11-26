// Everyday Wonder, Two Days to Find the Line — v2 entry writer (Node 22, stdlib only).
// Writes exactly one line (no trailing newline) to <output>/entry.txt.
// Gate: UTF-8, 1-200 characters, single line.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Dear judge, the lift mirror caught me mid-yawn this morning, and for a second I waved back at a stranger wearing my face.";

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function main() {
  const chars = [...ENTRY].length;
  const bytes = Buffer.byteLength(ENTRY, "utf8");
  if (chars < 1 || chars > 200) {
    throw new Error("entry must be 1-200 characters, got " + chars);
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (ENTRY !== ENTRY.trim()) {
    throw new Error("entry must not start or end with whitespace");
  }
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  const roundTrip = readFileSync(OUT_FILE, "utf8");
  if (roundTrip !== ENTRY) {
    throw new Error("round-trip check failed: written bytes differ from entry");
  }
  console.log("wrote " + chars + " characters (" + bytes + " bytes) to " + OUT_FILE);
}

main();
