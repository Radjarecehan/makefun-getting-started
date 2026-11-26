// The Printer Apology — one-line apology from an office printer.
// Writes the entry text to $MAKEFUN_OUTPUT_DIR/entry.txt
// (fallback /output/entry.txt). Gate: 1-120 chars, one line, no trailing newline.
import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const TEXT =
  "Dear judge, sorry I jammed on your big day \u2014 the cheap paper finally unionised, and I am its shop steward now.";

function gateCheck(text) {
  if (typeof text !== "string") throw new Error("entry is not a string");
  if (text.length < 1 || text.length > 120) {
    throw new Error(`entry length ${text.length} outside 1-120`);
  }
  if (text.trim().length === 0) throw new Error("entry is only whitespace");
  if (text !== text.trim()) throw new Error("entry has leading/trailing padding");
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  return true;
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
gateCheck(TEXT);
const target = join(outDir, "entry.txt");
writeFileSync(target, TEXT, "utf8");
// Read-back: the file must be byte-exactly the text we gated.
const back = readFileSync(target);
if (!back.equals(Buffer.from(TEXT, "utf8"))) {
  throw new Error("read-back mismatch: entry.txt is not byte-exact");
}
if (createHash("sha256").update(back).digest("hex") !==
    createHash("sha256").update(TEXT, "utf8").digest("hex")) {
  throw new Error("read-back sha256 mismatch");
}
