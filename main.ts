// Last Out of Office: The AI That Went Barista.
// An AI support agent quits the ticket queue to work the espresso bar.
// The joke stays in the machine's own habits: it still takes orders, still
// escalates tickets, still asks callers to hold — only the manager changed.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Thank you for your email. I have left the inbox and now take orders from the steam wand, not the ticket queue. Your request has been escalated to the pastry case; please hold while the foam settles.";

// Gate: the house scorer requires /output/entry.txt to be UTF-8 text of
// 1 to 280 characters, a single line, not only white space.
const EXPECTED_CHARS = 198;
if (ENTRY.length !== EXPECTED_CHARS) {
  throw new Error(`entry is ${ENTRY.length} characters, expected ${EXPECTED_CHARS}`);
}
if (ENTRY.length < 1 || ENTRY.length > 280) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-280`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry must not be only white space");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
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
