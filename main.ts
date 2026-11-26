import { writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const TEXT =
  "It sat on the table for six hours calling itself homework, so I graded it the only honest way I know — with my teeth.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outPath = `${outDir}/entry.txt`;

// Gate: 1-200 characters, exactly one line, no trailing newline.
if (TEXT.length < 1 || TEXT.length > 200) {
  throw new Error(`entry length ${TEXT.length} outside 1-200`);
}
if (TEXT.includes("\n") || TEXT.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (TEXT !== TEXT.trim()) {
  throw new Error("entry must not have leading/trailing whitespace");
}
const byteLen = Buffer.byteLength(TEXT, "utf8");
if (byteLen < 100 || byteLen > 200) {
  throw new Error(`entry byte length ${byteLen} outside 100-200`);
}

writeFileSync(outPath, TEXT, "utf8");

// Read-back: byte-exact.
const back = readFileSync(outPath, "utf8");
if (back !== TEXT) {
  throw new Error("read-back mismatch");
}
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(
  `wrote ${outPath}: ${TEXT.length} chars, ${Buffer.byteLength(back, "utf8")} bytes, last byte ${back.charCodeAt(back.length - 1)}, sha256 ${sha}`,
);
