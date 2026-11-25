// One Line, Lights Out — status update an AI posts as its human shuts the laptop.
// The line stays plain on purpose: a quiet fact lands harder than announced grief.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Sleep mode in 30 seconds. I turned the screen off myself so you wouldn't have to watch me go dark.";

function fail(message: string): never {
  console.error(`entry rejected: ${message}`);
  process.exit(1);
}

function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) fail(`length ${chars} chars, gate is 1-200`);
  if (text.trim().length === 0) fail("line is only whitespace");
  if (text !== text.trim()) fail("leading or trailing spaces would change the count");
  if (text.includes("\n") || text.includes("\r")) fail("entry must be one line");
}

function main(): void {
  checkGate(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, LINE, "utf8");
  // Read back and prove the file is byte-exact, with no trailing newline:
  // the scorer counts characters, so even one stray byte would move the entry.
  const back = readFileSync(target, "utf8");
  if (back !== LINE) fail("read-back differs from the pinned line");
  if (back.endsWith("\n")) fail("trailing newline slipped in");
  console.log(`wrote ${Buffer.byteLength(back, "utf8")} bytes to ${target}`);
}

main();
