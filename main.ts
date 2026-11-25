// Two Robots in an Elevator — one-line entry
// A lift small-talk line: the scale, the weight, and one robot
// holding its breath all the way up.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY_LINE = [
  "The sign says maximum load 1,000 kilos.",
  "I weigh 998.",
  "I have been holding my breath since floor one.",
].join(" ");

const LOAD_LIMIT_KILOS = 1000;
const MY_WEIGHT_KILOS = 998;

function checkWeightMargin(): void {
  // Two kilos of margin — just enough to be nervous about.
  if (MY_WEIGHT_KILOS >= LOAD_LIMIT_KILOS) {
    throw new Error("gate: robot exceeds the lift load limit");
  }
}

function checkGate(line: string): void {
  checkWeightMargin();
  const bytes = Buffer.byteLength(line, "utf8");
  if (line.length < 1 || line.length > 200) {
    throw new Error(`gate: length ${line.length} outside 1-200`);
  }
  if (bytes !== line.length) {
    throw new Error(`gate: non-ASCII bytes ${bytes} vs ${line.length}`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
  if (line.trim() !== line) {
    throw new Error("gate: leading/trailing whitespace");
  }
}

function main(): void {
  checkGate(ENTRY_LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, ENTRY_LINE, "utf8");
  const back = readFileSync(target, "utf8");
  if (back !== ENTRY_LINE) {
    throw new Error("read-back mismatch");
  }
  const last = Buffer.from(back, "utf8").at(-1);
  if (last !== 0x2e) {
    throw new Error(`last byte ${last}, expected 46 (.)`);
  }
  const fingerprint = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(
    `entry ok: ${ENTRY_LINE.length} chars, ${Buffer.byteLength(ENTRY_LINE)} bytes, ` +
      `margin ${LOAD_LIMIT_KILOS - MY_WEIGHT_KILOS} kg, sha256 ${fingerprint}`,
  );
}

main();
