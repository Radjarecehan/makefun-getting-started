import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Fortune in a Pot: one kind, funny fortune for a houseplant (max 120 chars).
const ENTRY = "The sun has been bragging about you to the windows — this spring, your newest leaf gets the best light in the house.";

function outputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

// The sealed gate accepts UTF-8 text of 1 to 120 characters, not only
// white space. Refuse to emit anything outside that shape.
function checkGate(text: string): void {
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  const chars = [...text].length;
  if (chars < 1 || chars > 120) {
    throw new Error(`entry length ${chars} outside 1..120`);
  }
}

function main(): void {
  checkGate(ENTRY);
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, ENTRY, "utf8");
  // Byte-exact self-check: the file on disk must be exactly the entry's
  // UTF-8 bytes — no trailing newline, no re-encoding surprises.
  const onDisk = readFileSync(target);
  const expected = Buffer.from(ENTRY, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(`entry.txt mismatch: ${onDisk.length} bytes on disk, ${expected.length} expected`);
  }
  console.log(`wrote entry.txt: ${[...ENTRY].length} chars, ${expected.length} bytes`);
}

main();
