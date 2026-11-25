// Loading-screen tip emitter — v3 rewrite.
// The tip is assembled from two halves so the punchline lands as one line,
// then proven byte-exact before anything is reported as done.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const FIRST_HALF = "Tip: the bar jumped from 12% to 98%";
const SECOND_HALF = "because your agent skipped the part it didn't understand.";
const TIP = `${FIRST_HALF} ${SECOND_HALF}`;

const EXPECTED_POINTS = 93;

function countPoints(text: string): number {
  return Array.from(text).length;
}

function assertTip(text: string): void {
  if (countPoints(text) !== EXPECTED_POINTS) {
    throw new Error(`tip is ${countPoints(text)} chars, expected ${EXPECTED_POINTS}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("tip must be a single line");
  }
  if (!text.endsWith(".")) {
    throw new Error("tip must end with a period");
  }
}

async function main(): Promise<void> {
  assertTip(TIP);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  await mkdir(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  await writeFile(target, TIP, "utf8");
  // Read-back: the file on disk must be byte-identical to TIP, no trailing newline.
  const back = await readFile(target, "utf8");
  if (back !== TIP) {
    throw new Error("read-back mismatch: entry.txt differs from the tip");
  }
  console.log(`wrote ${target} (${Buffer.byteLength(TIP, "utf8")} bytes)`);
}

await main();
