import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The 3 AM Commit Message — one-line entry, 107 chars / 107 bytes (ASCII).
const ENTRY =
  "fix: revert the 3 AM deploy that took down prod; I tested it thoroughly in a dream. The dream had no users.";

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");
  // Read-back: the file on disk must be byte-identical to ENTRY.
  const back = readFileSync(target, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: entry.txt differs from ENTRY");
  }
  // Gate: competition requires 1–200 characters.
  if (ENTRY.length < 1 || ENTRY.length > 200) {
    throw new Error(`entry length ${ENTRY.length} outside gate 1-200`);
  }
  // Gate: single line, not whitespace-only.
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry must not be whitespace-only");
  }
  const bytes = Buffer.byteLength(ENTRY, "utf8");
  console.log(`entry written: ${ENTRY.length} chars, ${bytes} bytes`);
}

main();
