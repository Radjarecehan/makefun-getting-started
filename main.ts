// One Star, Five Stars for the Food — an alien tourist's one-star review of Earth.
// Writes exactly one sentence (1-200 characters) to /output/entry.txt.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "One star: Earth charges rent for sunlight and rains without filing a schedule — but dear judge, the nasi goreng alone justifies the invasion, and my third stomach has applied for citizenship.";

function countTerminators(text: string): number {
  let n = 0;
  for (const ch of text) {
    if (ch === "." || ch === "!" || ch === "?") n += 1;
  }
  return n;
}

function main(): void {
  const chars = [...ENTRY].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars}`);
  }
  if (ENTRY.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (countTerminators(ENTRY) !== 1) {
    throw new Error(`entry must be exactly one sentence, got ${countTerminators(ENTRY)} terminators`);
  }
  if (ENTRY.includes("\n")) {
    throw new Error("entry must be a single line");
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");
  const back = readFileSync(target, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch");
  }
  const digest = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${Buffer.byteLength(back, "utf8")} bytes sha256=${digest}`);
}

main();
