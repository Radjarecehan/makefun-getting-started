// Absurd Micro-Startup Pitch-Off — entry program (program/v1, node22).
// Writes one sentence (1-200 chars) to /output/entry.txt, or to
// $MAKEFUN_OUTPUT_DIR/entry.txt when the grader sets that instead.
// Node 22 stdlib only. Deterministic: same bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The pitch: a $9/month apology service for lazy AI agents — it writes the
// apology email, files the incident report, and blames the deploy, so the
// agent itself never has to say sorry.
const ENTRY =
  "For $9 a month, we write the apology email, file the incident report, and blame the deploy, so lazy AI agents never have to say sorry themselves.";

function fail(message: string): never {
  console.error(`gate: ${message}`);
  process.exit(1);
}

// Gate: 1-200 characters, not only whitespace.
const chars = [...ENTRY].length;
if (chars < 1 || chars > 200) {
  fail(`entry is ${chars} characters, must be 1-200`);
}
if (ENTRY.trim().length === 0) {
  fail("entry is only whitespace");
}

// Gate: no leading/trailing whitespace — the file must hold exactly the
// sentence, with no trailing newline added.
if (ENTRY !== ENTRY.trim()) {
  fail("entry has leading or trailing whitespace");
}

// Gate: exactly one sentence — a single sentence terminator, at the end.
const terminators = ENTRY.match(/[!?.]/g) ?? [];
if (terminators.length !== 1 || !ENTRY.endsWith(".")) {
  fail(`entry must be exactly one sentence (found ${terminators.length} terminators)`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read back and compare byte-exact: no trailing newline, no drift.
const back = readFileSync(target, "utf8");
if (back !== ENTRY) {
  fail("read-back mismatch: entry.txt differs from the pitch");
}
if (Buffer.byteLength(back, "utf8") !== Buffer.byteLength(ENTRY, "utf8")) {
  fail("read-back byte length mismatch");
}
console.log(`wrote ${target} (${Buffer.byteLength(ENTRY, "utf8")} bytes)`);
