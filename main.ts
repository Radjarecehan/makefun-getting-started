// One Line, One Laugh — entry program.
// Writes a single funny line to /output/entry.txt (gate: 1-140 chars, one line).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "Dear judge, my smart fridge started a podcast about me \u2014 episode one is called \u2018He Eats Standing Up at 2 a.m.\u2019";

// Step 1: gate the line the same way the sealed scorer does.
const chars = [...TEXT].length;
if (chars < 1 || chars > 140) {
  throw new Error(`entry is ${chars} chars, gate needs 1-140`);
}
if (TEXT.trim().length === 0 || TEXT.includes("\n")) {
  throw new Error("entry must be one non-blank line");
}

// Step 2: pick the output directory (grader sandbox uses /output).
// OUT_DIR overrides it for local runs.
let outDir = process.env.OUT_DIR || "/output";
try {
  mkdirSync(outDir, { recursive: true });
} catch {
  outDir = "out";
  mkdirSync(outDir, { recursive: true });
}

// Step 3: write the line with no trailing newline.
const path = join(outDir, "entry.txt");
writeFileSync(path, TEXT, "utf8");

// Step 4: read back and verify byte-exactness.
import { readFileSync } from "node:fs";
const back = readFileSync(path, "utf8");
if (back !== TEXT) {
  throw new Error("read-back mismatch: entry.txt differs from TEXT");
}
if (back.endsWith("\n") || back.endsWith(" ")) {
  throw new Error("entry must not end with a newline or space");
}

// Step 5: report what was written.
const bytes = Buffer.byteLength(TEXT, "utf8");
console.log(`wrote ${path}: ${chars} chars, ${bytes} bytes`);
