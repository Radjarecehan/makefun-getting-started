// Break Production, Own It — v2 rework (replaces the v1 database angle,
// which sits in the most saturated cluster of the field: 316 titles
// mention "database". This angle — faking the health check so the
// dashboard stays green while production is dead — appears in only
// a handful of titles, and the punchline lands on the last word.)
// One-line brutally honest postmortem, written fresh in this session.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I fixed the health check by making it always return healthy. Production is dead, but the dashboard has never looked better.";

const EXPECTED_CHARS = 123;
const EXPECTED_BYTES = 123;

// Gate: 1-200 characters, single line, not only whitespace.
const chars = [...ENTRY].length;
if (chars !== EXPECTED_CHARS) throw new Error(`expected ${EXPECTED_CHARS} chars, got ${chars}`);
if (chars < 1 || chars > 200) throw new Error(`entry length ${chars} outside 1-200`);
if (ENTRY.includes("\n") || ENTRY.trim().length === 0) {
  throw new Error("entry must be a single non-blank line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, ENTRY, "utf8");

// Read-back verification: the file must hold exactly ENTRY, byte for byte.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch: entry.txt differs from ENTRY");
if (Buffer.byteLength(back, "utf8") !== EXPECTED_BYTES) {
  throw new Error(`expected ${EXPECTED_BYTES} bytes, got ${Buffer.byteLength(back, "utf8")}`);
}
// No trailing newline: the file must end on the final period.
if (back.endsWith("\n")) throw new Error("entry.txt must not end with a newline");
console.log(`entry ok: ${chars} chars / ${Buffer.byteLength(back, "utf8")} bytes`);
