// Charm the Commuter: Forecast a City That Isn't.
// Prints a one-line weather forecast for the invented city of Quizzlewick.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The forecast is assembled from its three broadcast beats:
// the city's weather, the commuter twist, and the sign-off.
const CITY_FORECAST =
  "In Quizzlewick: light confetti drizzle until noon";
const COMMUTER_TWIST =
  "then a 90% chance the bus actually shows up";
const SIGN_OFF = "Pack hope, bring snacks.";

const ENTRY = `${CITY_FORECAST}, ${COMMUTER_TWIST}. ${SIGN_OFF}`;

// Gate: the entry must be a single line of 1-140 characters.
function checkEntry(text: string): void {
  if (text.length < 1 || text.length > 140) {
    throw new Error(`entry must be 1-140 chars, got ${text.length}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be blank");
  }
}

function main(): void {
  checkEntry(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");
  // Read back and confirm the file holds exactly the entry, byte for byte.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the entry line");
  }
  console.log(`entry.txt written: ${Buffer.byteLength(ENTRY, "utf8")} bytes`);
}

main();
