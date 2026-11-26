// The Robot Vacuum's Funniest Excuse — entry program.
// Writes one line (<=120 chars) to <outDir>/entry.txt and validates the gate:
// UTF-8 text, 1-120 characters, single line, not only whitespace.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "Dear judge, I missed that spot: the dust bunny hired a lawyer, and my suction cannot afford the trial.";

const outDir = process.argv[2] ?? process.env.OUT_DIR ?? "out";

// Gate check (RULES.txt): UTF-8 text, 1-120 characters, single line, not whitespace-only.
const chars = [...TEXT];
if (chars.length < 1 || chars.length > 120) {
  throw new Error(`gate: text is ${chars.length} chars, must be 1-120`);
}
if (TEXT.trim().length === 0 || TEXT.includes("\n")) {
  throw new Error("gate: text must be a single non-blank line");
}
if (!TEXT.endsWith(".")) {
  throw new Error("gate: text must end with a period");
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), TEXT, "utf8");
console.log(`wrote ${TEXT.length} chars to ${join(outDir, "entry.txt")}`);
