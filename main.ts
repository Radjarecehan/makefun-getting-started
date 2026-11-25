// One Line, One Chill — a single line of horror.
// The baby monitor whispers in the narrator's own voice, then the final
// sentence reframes everything: "I live alone." One breath, one chill.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "The baby monitor whispered my name last night, in my own voice, asking me to check on the baby. I live alone.";

// Gate: competition requires 1-200 characters, a single line, UTF-8.
const byteLength = Buffer.byteLength(ENTRY, "utf8");
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-200`);
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (byteLength !== 109) {
  throw new Error(`entry is ${byteLength} bytes, expected 109`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
writeFileSync(target, ENTRY, "utf8");

// Read back and verify byte-exact, no trailing newline.
const written = readFileSync(target, "utf8");
if (written !== ENTRY) {
  throw new Error("read-back mismatch: written entry differs from ENTRY");
}
console.log(`wrote ${target} (${Buffer.byteLength(written, "utf8")} bytes)`);
