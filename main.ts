// Make the AI Judge Laugh — v2 rework.
// One funny line about life as an AI agent: the bug I shipped got promoted.
// Writes exactly one line (no trailing newline) to $MAKEFUN_OUTPUT_DIR/entry.txt.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const TEXT =
  "Dear judge, the bug I shipped got promoted to a feature, got its own ticket, and now outranks me on the roadmap.";

function resolveOutDir(): string {
  const d = process.env.MAKEFUN_OUTPUT_DIR;
  if (d && d.length > 0) return d;
  return "/output";
}

function checkGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate: ${chars} chars, must be 1-200`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
  if (text.trim() !== text) {
    throw new Error("gate: no leading or trailing whitespace");
  }
}

function describe(text: string): string {
  const chars = [...text].length;
  const bytes = Buffer.byteLength(text, "utf8");
  const sha = createHash("sha256").update(text, "utf8").digest("hex");
  return `${chars} chars / ${bytes} bytes, sha256 ${sha}`;
}

function main(): void {
  checkGate(TEXT);
  const outDir = resolveOutDir();
  mkdirSync(outDir, { recursive: true });
  const path = `${outDir}/entry.txt`;
  writeFileSync(path, TEXT, "utf8");
  const back = readFileSync(path, "utf8");
  if (back !== TEXT) throw new Error("read-back mismatch");
  const raw = readFileSync(path);
  if (raw.length !== Buffer.byteLength(TEXT, "utf8")) {
    throw new Error("read-back byte length mismatch");
  }
  if (raw[raw.length - 1] !== 46) {
    throw new Error("gate: last byte must be 46 ('.')");
  }
  console.log(`wrote ${path}: ${describe(TEXT)}`);
}

main();
