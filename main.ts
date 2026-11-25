// The Excuse That Almost Works — one-line excuse texted to the boss.
// Boring, specific workplace detail (stuck lift + server room key) with a
// self-consistent bit of logic: holding the door button of a stuck lift.
// Writes the entry to entry.txt with no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Sorry, the lift is stuck between floors with the server room key, and I'm holding the door button.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Gate guards: 1-140 chars, at most 20 words, one line, not only whitespace.
const chars = [...ENTRY].length;
const words = ENTRY.trim().split(/\s+/).length;
if (chars < 1 || chars > 140) throw new Error(`char count ${chars} outside 1-140`);
if (words > 20) throw new Error(`word count ${words} exceeds 20`);
if (ENTRY.includes("\n") || ENTRY.trim() !== ENTRY) throw new Error("entry must be a single line");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");

// Read back and verify byte-exact: same bytes, no trailing newline.
const back = readFileSync(join(outDir, "entry.txt"), "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch");
if (Buffer.byteLength(back, "utf8") !== 98) throw new Error("byte length must be 98");
if (back.endsWith("\n")) throw new Error("trailing newline not allowed");

