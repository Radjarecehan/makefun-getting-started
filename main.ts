// Office Joke Open — one-line office comedy entry.
// Writes the entry text to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output).
// Deterministic: Node stdlib only, no random, no time, no network.
// The text is exactly 107 characters / 107 bytes, one line, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The joke lands on the last words (the 45-minute meeting to discuss the
// 15-minute limit) — office detail up front, payoff at the end, nothing cut.
const ENTRY =
  "Our standup has a strict 15-minute limit, which we enforce by scheduling a 45-minute meeting to discuss it.";

// Expected size, checked at runtime: 107 characters, 107 bytes (pure ASCII).
const EXPECTED_BYTES = 107;

const MIN_CHARS = 1;
const MAX_CHARS = 200;

function gateCheck(text: string): void {
  // Gate: UTF-8 text of 1-200 characters, not only whitespace, single line.
  if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
    throw new Error(`entry length ${text.length} outside ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (!text.trim()) {
    throw new Error("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

function main(): void {
  gateCheck(ENTRY);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  // No trailing newline: the file holds exactly the entry text.
  writeFileSync(target, ENTRY, "utf8");
  // Read back and confirm the file is byte-identical to the entry.
  const written = readFileSync(target, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the entry text");
  }
  const bytes = Buffer.byteLength(written, "utf8");
  if (bytes !== EXPECTED_BYTES || bytes !== ENTRY.length) {
    throw new Error(`entry.txt is ${bytes} bytes, expected ${EXPECTED_BYTES}`);
  }
}

main();
