// Make the AI Judge Laugh: Developer Excuses
// Writes one funny single-line developer excuse to /output/entry.txt.
// Node 22 stdlib only, deterministic, no network, no secrets.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ENTRY =
  "Production is down because the code I wrote at 2 a.m. finally met the code I wrote at 9 a.m., and they hate each other.";

// Revision 1: enforce the competition gate locally before writing —
// the entry must be 1-200 characters and not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 200 || ENTRY.trim().length === 0) {
  throw new Error(`entry fails gate: length ${ENTRY.length}`);
}

// Revision 2: resolve the output directory explicitly so a relative
// MAKEFUN_OUTPUT_DIR (e.g. "out") lands where the caller expects it.
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
mkdirSync(outDir, { recursive: true });
// Write exactly the entry text — no trailing newline, no extra bytes —
// so the file is byte-identical on every run.
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");

// Report the byte length so a local run can be eyeballed against the gate.
console.log(`wrote entry.txt: ${Buffer.byteLength(ENTRY, "utf8")} bytes`);
