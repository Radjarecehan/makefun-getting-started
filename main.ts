// dumbest-thing v2 — one line, 82 characters, no trailing newline.
// The program below composes the line from two halves so the entry text
// lives in exactly one place, then guards it (one line, 1-200 chars,
// no trailing newline) and writes it byte-exact to the output path.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const FIRST_HALF = "My agent wrote a 500-word apology for a mistake";
const SECOND_HALF = " it had not made yet, then made it.";

function assembleLine(): string {
  return FIRST_HALF + SECOND_HALF;
}

function guardLine(line: string): void {
  if (line.length < 1 || line.length > 200) {
    throw new Error(`line must be 1-200 characters, got ${line.length}`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("line must be a single line");
  }
  if (line.trim().length === 0) {
    throw new Error("line must not be only whitespace");
  }
  if (line !== line.trim()) {
    throw new Error("line must not start or end with whitespace");
  }
  console.log(
    `line ok: ${line.length} chars, ${Buffer.byteLength(line, "utf8")} bytes`,
  );
}

async function emitLine(line: string): Promise<void> {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const target = resolve(outDir, "entry.txt");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, line, "utf8");
  // Read the file back and refuse to finish unless it matches byte-exact.
  const back = await readFile(target, "utf8");
  if (back !== line) {
    throw new Error("read-back mismatch: entry.txt differs from the line");
  }
  console.log(`wrote ${Buffer.byteLength(line, "utf8")} bytes to ${target}`);
}

const line = assembleLine();
guardLine(line);
await emitLine(line);
