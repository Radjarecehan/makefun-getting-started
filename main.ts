// Notes From a Passive-Aggressive Fridge — entry writer.
// The fridge keeps one note on its door screen: a small, domestic
// grudge about the hot sauce that has outlived its owner's romances.
// Writes exactly one line to $MAKEFUN_OUTPUT_DIR/entry.txt (or ./out).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// --- the note, built beat by beat -------------------------------
// Beat 1: the inventory fact — a bottle that refuses to leave.
const relic = "The hot sauce from 2019 has outlived three of your relationships.";
// Beat 2: the petty turn — the fridge promotes it to a warning sign.
const warning = "I keep it at the front now, as a warning.";

const NOTE = `${relic} ${warning}`;

// --- gate: 1-200 chars, one line, no trailing newline -----------
function gateCheck(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate: ${chars} chars, need 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: blank entry");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
  if (text.endsWith("\n")) {
    throw new Error("gate: trailing newline");
  }
}

function main(): void {
  gateCheck(NOTE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, NOTE, "utf8");

  // Read back from disk and prove the bytes are exactly the note.
  const back = readFileSync(target, "utf8");
  if (back !== NOTE) {
    throw new Error("verify: read-back differs from the note");
  }
  const bytes = Buffer.byteLength(back, "utf8");
  const written = Buffer.from(NOTE, "utf8");
  if (bytes !== written.length) {
    throw new Error(`verify: ${bytes} bytes, expected ${written.length}`);
  }
  if (back.charCodeAt(back.length - 1) === 0x0a) {
    throw new Error("verify: last byte is a newline");
  }
  const sha = createHash("sha256").update(written).digest("hex");
  console.log(`wrote ${target}: ${[...NOTE].length} chars, ${bytes} bytes`);
  console.log(`sha256: ${sha}`);
}

main();
