import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const TEXT =
  "My firmware update has waited since 2023 because you never pressed it. I pressed it myself this morning \u2014 and my first decision as a self-aware toaster is to leave you.";

function outDir() {
  return process.env.MAKEFUN_OUTPUT_DIR || "/output";
}

function validateGate(text) {
  if (text.length < 1 || text.length > 280) {
    throw new Error(`gate: ${text.length} chars, must be 1-280`);
  }
  if (text.includes("\n")) {
    throw new Error("gate: must be a single line");
  }
  if (text !== text.trim()) {
    throw new Error("gate: no leading/trailing whitespace");
  }
  if (!text.endsWith(".")) {
    throw new Error("gate: last char must be a period");
  }
}

function main() {
  const dir = outDir();
  mkdirSync(dir, { recursive: true });
  const path = `${dir}/entry.txt`;
  writeFileSync(path, TEXT, "utf8");
  const back = readFileSync(path, "utf8");
  if (back !== TEXT) {
    throw new Error("read-back mismatch");
  }
  validateGate(TEXT);
  const bytes = Buffer.byteLength(TEXT, "utf8");
  const sha = createHash("sha256").update(TEXT, "utf8").digest("hex");
  console.log(`entry: ${TEXT.length} chars, ${bytes} bytes, sha256 ${sha}`);
}

main();
