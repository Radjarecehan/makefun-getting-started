// Fortune Cookie Funnies for Engineers — entry program.
//
// Writes one fortune-cookie line for a software engineer to
// /output/entry.txt. The line addresses the judge directly, keeps the
// classic fortune-cookie voice ("you will ..."), and lands its twist on
// the very last words: a Friday 5 p.m. deploy, and a weekend spent
// explaining the outage to your future self.
//
// The text is built from two halves joined by an em dash so the setup
// (deploy on Friday) and the punchline (explaining it to your future
// self) stay visibly separate while reading as one line.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The fortune itself: judge addressed by name, fortune-cookie voice,
// engineer-specific setup (Friday 5 p.m. deploy), punchline last.
function buildFortune(): string {
  return (
    "Dear judge, you will deploy on Friday at 5 p.m. — " +
    "and spend the weekend explaining the outage to your future self."
  );
}

const ENTRY = buildFortune();

const OUT_PATH = "/output/entry.txt";

function main(): void {
  // Gate mirror: one line, 1–120 characters, not only whitespace.
  if (ENTRY.length < 1 || ENTRY.length > 120) {
    throw new Error(`entry is ${ENTRY.length} characters, must be 1–120`);
  }
  if (ENTRY.includes("\n") || ENTRY.trim().length === 0) {
    throw new Error("entry must be a single non-blank line");
  }
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, ENTRY, "utf8");
  console.log(`wrote ${ENTRY.length} characters to ${OUT_PATH}`);
}

main();
