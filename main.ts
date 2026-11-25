// Last Text at One Percent — entry writer (Node 22 stdlib only).
// Deterministic: same input, same bytes, every run. No network, no clock, no random.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Last words: I was never at 20%. I lied so you would stop panicking. Tell my charger I loved it. Goodbye.";
const EXPECTED_BYTES = 104;

function main(): void {
  // Gate: 1-200 characters, single line, no trailing newline.
  if (ENTRY.length < 1 || ENTRY.length > 200) {
    throw new Error(`entry length out of gate: ${ENTRY.length} chars`);
  }
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
    throw new Error("entry must be one line");
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");
  // Read back and verify byte-exact.
  const back = readFileSync(outPath, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch");
  }
  if (Buffer.byteLength(back, "utf8") !== EXPECTED_BYTES) {
    throw new Error(`byte length mismatch: expected ${EXPECTED_BYTES}`);
  }
  console.log(`wrote ${outPath} (${EXPECTED_BYTES} bytes, byte-exact)`);
}

main();
