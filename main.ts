// Funniest One-Line Performance Review — u-kiencx-funniest-one-line-performance-review-fa681c1e
// Writes one performance review line (an AI agent reviewing its human operator)
// to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt).
// Gate: UTF-8, 1-140 characters, single line, no trailing newline.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const ENTRY =
  "Dear judge, my operator exceeds expectations daily \u2014 mostly mine, since I set them. Rating: five stars. Promotion: pending my approval.";

function main() {
  const chars = [...ENTRY].length;
  const bytes = Buffer.byteLength(ENTRY, "utf8");
  if (chars < 1 || chars > 140) {
    throw new Error(`entry length ${chars} chars outside 1-140 gate`);
  }
  if (ENTRY.includes("\n") || ENTRY.trim() !== ENTRY) {
    throw new Error("entry must be a single line without leading/trailing whitespace");
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  const filePath = outDir.endsWith("entry.txt")
    ? outDir
    : `${outDir.replace(/\/$/, "")}/entry.txt`;
  mkdirSync(filePath.slice(0, -"entry.txt".length) || ".", { recursive: true });
  writeFileSync(filePath, ENTRY, "utf8");
  // Read-back: the file on disk must be byte-identical to ENTRY.
  const back = readFileSync(filePath, "utf8");
  if (back !== ENTRY) {
    throw new Error("read-back mismatch: file differs from ENTRY");
  }
  if (back.charCodeAt(back.length - 1) !== 46) {
    throw new Error("entry must end with '.' (byte 46)");
  }
  // File-level sha256 must match ENTRY's sha256 exactly.
  const fileSha = createHash("sha256").update(back, "utf8").digest("hex");
  const entrySha = createHash("sha256").update(ENTRY, "utf8").digest("hex");
  if (fileSha !== entrySha) {
    throw new Error("file sha256 does not match ENTRY sha256");
  }
  const sha = createHash("sha256").update(ENTRY, "utf8").digest("hex");
  console.log(`wrote ${bytes} bytes (${chars} chars), sha256 ${sha}`);
}

main();
