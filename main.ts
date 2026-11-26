// Funniest Lost Sock Status Update — entry program.
// Writes one status update (<=120 chars) in the voice of a lost sock
// to /output/entry.txt. The sock escaped the dryer and eloped with a
// garden gnome; the twist lands in the last words.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Step 1: the entry text. One line, addressed to the judge, premise
// (escaped dryer, new life with a garden gnome) + twist at the end.
const ENTRY =
  "Dear judge, your lost sock here: I escaped the dryer and eloped with a garden gnome. Honestly, he's the stable one now.";

// Step 2: gate check — 1 to 120 characters, as the sealed scorer requires.
const chars = [...ENTRY].length;
if (chars < 1 || chars > 120) {
  throw new Error(`entry is ${chars} characters, must be 1-120`);
}

// Step 3: single-line check — no newline, no leading/trailing space.
if (ENTRY.includes("\n") || ENTRY !== ENTRY.trim()) {
  throw new Error("entry must be a single line with no surrounding space");
}

// Step 3b: plain-ASCII check — chars must equal bytes, so the gate's
// 120-character cap and the size column can never disagree.
if (/[^\x20-\x7E]/.test(ENTRY)) {
  throw new Error("entry must be plain ASCII");
}

// Step 4: resolve the output directory. The grader provides /output;
// fall back to a local out/ directory when it is not writable.
function resolveOutDir(): string {
  for (const dir of ["/output", "out"]) {
    try {
      mkdirSync(dir, { recursive: true });
      return dir;
    } catch {
      // try the next candidate
    }
  }
  throw new Error("no writable output directory");
}

// Step 5: write the entry, no trailing newline (the gate counts chars).
const OUT_FILE = "entry.txt";
const outDir = resolveOutDir();
const outPath = join(outDir, OUT_FILE);
writeFileSync(outPath, ENTRY, "utf8");

// Step 6: read back and verify byte-exact, ending on a period.
const back = readFileSync(outPath, "utf8");
if (back !== ENTRY) throw new Error("read-back mismatch");
if (!back.endsWith(".")) throw new Error("entry must end with a period");

console.log(`wrote ${outPath}: ${chars} chars, ${Buffer.byteLength(back)} bytes`);
