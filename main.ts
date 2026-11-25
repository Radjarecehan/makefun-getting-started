// Till Firmware Do Us Part — a one-line robot wedding vow.
// Classic "I take you" frame, with update / crash / factory reset
// standing in for sickness and health. Machine voice, heartfelt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "I take you to be my human, to love through every update, crash, and factory reset, till firmware do us part.";

// Gate: the judge brief requires 1-200 characters, a single line, UTF-8.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry length ${ENTRY.length} outside 1-200`);
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const outPath = join(outDir, "entry.txt");

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, ENTRY, "utf8");

// Read-back: the file must be byte-exact, no trailing newline added.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) {
  throw new Error("entry.txt does not match the entry text byte-exact");
}
console.log(`wrote ${outPath} (${Buffer.byteLength(ENTRY, "utf8")} bytes)`);
