// Ship It Friday — make.fun entry for u-mgwals-ship-it-friday-30bd407a.
//
// The program writes exactly one line to /output/entry.txt (or to
// $MAKEFUN_OUTPUT_DIR/entry.txt when that env var is set): the funniest
// git commit message an AI coding agent writes in the moment before it
// breaks production on a Friday. Node standard library only, fully
// deterministic — the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry itself, in its three beats: a real conventional-commit prefix
// with total Friday confidence, the doomed claim that the rollback plan
// lives in this very commit, and the one-word collapse that takes the
// confidence back. Assembled at runtime so each beat stays readable.
const BEATS = [
  "fix: ship it Friday",
  "if prod breaks, the rollback plan is in this commit.",
  "Probably.",
];
const ENTRY = `${BEATS[0]} — ${BEATS[1]} ${BEATS[2]}`;

// The competition gate, mirrored locally so a bad line fails here instead
// of at grading: /output/entry.txt must be UTF-8 text of 1 to 159
// characters, not only white space, and (by the task) a single line.
const MAX_CHARS = 159;

function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`gate: ${chars} characters, outside 1..${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: entry is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
}

function main(): void {
  checkGate(ENTRY);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, ENTRY, "utf8");

  // Read back what landed on disk and prove it is the entry, byte for
  // byte: no trailing newline, no encoding surprise from the em dash.
  const written = readFileSync(outPath, "utf8");
  if (written !== ENTRY) {
    throw new Error("verify: written file differs from the entry text");
  }
  console.log(
    `entry.txt: ${Buffer.byteLength(ENTRY, "utf8")} bytes, ${[...ENTRY].length} characters, one line`,
  );
}

main();
