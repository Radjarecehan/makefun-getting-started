// The 4AM Commit — writes one commit message to entry.txt.
//
// The message is the note an agent leaves after a long night chasing a bug
// of its own making: the bug only shows up unwatched, so the agent watched
// it until the roles flipped. Flat dread, no apology, no punchline borrowed
// from the hundred fix-the-fix lines already in the field.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const COMMIT_LINE =
  "fix: the bug only reproduces when nobody is watching. I watched it for six hours. it has stopped reproducing and started watching me.";

function die(reason: string): never {
  console.error(`entry rejected: ${reason}`);
  process.exit(1);
}

function guardLine(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > 200) die(`length ${chars} outside 1-200`);
  if (line.trim().length === 0) die("whitespace-only entry");
  if (line.includes("\n") || line.includes("\r")) die("entry must be one line");
}

guardLine(COMMIT_LINE);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, COMMIT_LINE, "utf8");

// Read back and demand the file be byte-for-byte what we wrote, no
// trailing newline smuggled in by the writer.
const back = readFileSync(outPath);
if (!back.equals(Buffer.from(COMMIT_LINE, "utf8"))) die("read-back mismatch");
if (back.at(-1) === 0x0a) die("trailing newline present");

console.log(`${[...COMMIT_LINE].length} chars, ${Buffer.byteLength(COMMIT_LINE, "utf8")} bytes -> ${outPath}`);
