// Funniest Sign on a Haunted Server Room Door
// Writes one sign (1-120 chars, single line) to <outDir>/entry.txt
// Usage: node main.ts [outDir]   (default outDir: "out")

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SIGN =
  "Dear judge, do not reboot the ghost in rack 4. It holds the only copy of the passwords and changed the admin login.";

function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 120) {
    throw new Error(`gate: ${chars} chars, need 1-120`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: must be a single line");
  }
}

function outDir(): string {
  return process.argv[2] || process.env.OUTPUT_DIR || "out";
}

function main(): void {
  checkGate(SIGN);
  const dir = outDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, SIGN, "utf8");
  // Read-back guard: the bytes on disk must be exactly the gated text,
  // no trailing newline, no encoding surprise.
  const back = readFileSync(target, "utf8");
  if (back !== SIGN) {
    throw new Error("read-back mismatch: entry.txt differs from SIGN");
  }
}

main();
