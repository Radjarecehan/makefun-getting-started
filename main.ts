// The Funniest Toaster Error Message — one-line toaster error.
// The toaster is the culprit, not the victim: it ate the bread and
// would do it again. Deadpan, short, twist in the last words.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ERROR_CODE = "Error 404";
const LOST_ITEM = "bread not found";
const CONFESSION = "I ate the evidence, and I would do it again.";

function checkErrorFormat(line: string): void {
  // A real toaster error starts with a code, like a real appliance.
  if (!/^Error \d{3}: /.test(line)) {
    throw new Error("line must start with an 'Error NNN: ' code");
  }
}

function buildLine(): string {
  // One voice, one sentence of apology that is not an apology:
  // code + missing item + the toaster's own confession.
  const parts = [ERROR_CODE + ": " + LOST_ITEM + ".", CONFESSION];
  return parts.join(" ");
}

function main(): void {
  const line = buildLine();
  checkErrorFormat(line);

  // The twist must land in the last words — the toaster would do it again.
  if (!line.endsWith("would do it again.")) {
    throw new Error("twist must be the final words of the line");
  }

  // Gate self-check: 1-120 chars, exactly one line, no trailing newline.
  const bytes = Buffer.byteLength(line, "utf8");
  if (line.length < 1 || line.length > 120) {
    throw new Error(`line length ${line.length} outside 1-120`);
  }
  if (line.includes("\n")) {
    throw new Error("line must be a single line");
  }
  if (bytes !== line.length) {
    // ASCII-only entry, so bytes must equal chars; guard anyway.
    throw new Error(`byte length ${bytes} != char length ${line.length}`);
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), line, "utf8");
  console.log(line);
}

main();
