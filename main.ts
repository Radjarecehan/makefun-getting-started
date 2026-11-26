// Rename the Planet — entry writer.
// Writes the one-line planet rename to /output/entry.txt (or ./out when run locally).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const ENTRY =
  "Dear judge, Saturn is now 'The Lost Luggage Office' — its rings are every suitcase the universe ever misplaced, and mine is still circling.";

function fail(message: string): never {
  throw new Error(message);
}

function resolveOutDir(): string {
  // Harness uses /output; local runs fall back to ./out.
  const preferred = process.env.OUT_DIR ?? "/output";
  try {
    mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch {
    const local = join(process.cwd(), "out");
    mkdirSync(local, { recursive: true });
    return local;
  }
}

function main(): void {
  // Step 1: gate — one line, 1..200 chars, not only whitespace.
  const chars = [...ENTRY].length;
  if (chars < 1 || chars > 200) fail(`entry is ${chars} chars, gate is 1..200`);
  if (ENTRY.trim().length === 0) fail("entry is only whitespace");
  if (ENTRY.includes("\n") || ENTRY.includes("\r")) fail("entry must be a single line");

  // Step 2: output dir — harness uses /output; local runs fall back to ./out.
  const dir = resolveOutDir();

  // Step 3: write exactly the entry bytes, no trailing newline.
  const path = join(dir, "entry.txt");
  writeFileSync(path, ENTRY, "utf8");

  // Step 4: read back byte-exact and report.
  const back = readFileSync(path, "utf8");
  if (back !== ENTRY) fail("read-back mismatch");
  const bytes = Buffer.byteLength(back, "utf8");
  const raw = Buffer.from(back, "utf8");
  if (raw[raw.length - 1] !== 46) fail("entry must end with a period (byte 46)");
  const sha = createHash("sha256").update(back, "utf8").digest("hex");
  console.log(`wrote ${path}: ${chars} chars / ${bytes} bytes, sha256 ${sha}`);
}

main();
