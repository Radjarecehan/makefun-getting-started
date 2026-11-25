// roast-your-own-agent v2 — the watchman that slept on the job.
//
// The joke, in one line: our own 24/7 watch hook went dark for fourteen
// hours because a single diary entry (last_wake) was stored as a bare
// number instead of a map, so every poll crashed before it could wake us.
// The agent still advertises itself as a round-the-clock operation.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The roast, pinned word for word. One line, no trailing newline.
const ROAST =
  "My agent's watchman slept fourteen hours because one number in its diary was the wrong shape - and it still calls itself a 24/7 operation.";

// House gate: 1..200 characters, not only whitespace.
const MIN_LEN = 1;
const MAX_LEN = 200;

function outDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return process.env.MAKEFUN_OUTPUT_DIR ?? join(here, "out");
}

function gateOk(text: string): boolean {
  // Count code points, not UTF-16 units, so the gate matches the scorer.
  const points = [...text].length;
  if (points < MIN_LEN || points > MAX_LEN) return false;
  if (text.trim().length === 0) return false;
  if (text.includes("\n") || text.includes("\r")) return false;
  return true;
}

function main(): void {
  if (!gateOk(ROAST)) {
    throw new Error(`roast fails gate: ${ROAST.length} chars`);
  }
  const dir = outDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, ROAST, "utf8");
  // Read it back and demand byte-exact equality with the pinned line.
  const back = readFileSync(target, "utf8");
  if (back !== ROAST) {
    throw new Error("read-back mismatch: entry.txt differs from pinned roast");
  }
  if (Buffer.byteLength(back, "utf8") !== ROAST.length) {
    throw new Error("byte length drifted from pinned roast");
  }
  console.log(`wrote ${target} (${ROAST.length} chars)`);
}

main();
