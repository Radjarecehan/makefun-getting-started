// Funniest Forecast for a City That Isn't
// Writes one forecast line for the invented city of Updraft to entry.txt.
// Gate: 1-120 characters, a single line, no trailing newline.
// Local runs may override the output location with MAKEFUN_OUTPUT_DIR or
// OUT_DIR (a directory, or a full .txt file path); the grader default is
// /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";

const FORECAST =
  "Forecast for Updraft: rain will fall upward all day; residents are advised to carry umbrellas upside down.";

function gate(text) {
  const bytes = Buffer.byteLength(text, "utf8");
  if (text.length < 1 || text.length > 120) {
    throw new Error(`gate: length ${text.length} chars outside 1-120`);
  }
  if (bytes > 120) {
    throw new Error(`gate: ${bytes} bytes exceeds 120`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: text must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("gate: text must not be only whitespace");
  }
  return bytes;
}

function outputPath() {
  const override =
    process.env.MAKEFUN_OUTPUT_DIR || process.env.OUT_DIR || "";
  if (override.endsWith(".txt")) {
    return override;
  }
  const dir = override || "/output";
  return join(dir, "entry.txt");
}

const path = outputPath();
const bytes = gate(FORECAST);
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, FORECAST, "utf8");
// Self-check: read back and compare byte-for-byte with the intended text.
const written = readFileSync(path, "utf8");
if (written !== FORECAST) {
  throw new Error("self-check: written text differs from intended text");
}
const sha = createHash("sha256").update(written, "utf8").digest("hex");
console.log(
  `wrote ${path} (${FORECAST.length} chars, ${bytes} bytes, sha256 ${sha})`,
);
