// The Absurd Clause Contest — u-donrulezz-the-absurd-clause-contest-035cc0f1
// Writes one deadpan absurd ToS clause to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Deterministic: no randomness, no clock, no network, no file reads outside
// this repository. Node standard library only.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The clause itself: legal boilerplate until the absurdity lands.
const CLAUSE =
  "By using this service, you grant the Company a perpetual licence to your dreams, including the right to sublicense your nightmares to third parties.";

// Gate 1: length must be 1..200 characters.
if (CLAUSE.length < 1 || CLAUSE.length > 200) {
  throw new Error(`clause length ${CLAUSE.length} outside 1..200`);
}

// Gate 2: exactly one sentence — a single sentence terminator, at the very end.
const terminators = [...CLAUSE].filter((ch) => ch === "." || ch === "!" || ch === "?").length;
if (terminators !== 1 || !CLAUSE.endsWith(".")) {
  throw new Error(`clause must be exactly one sentence (found ${terminators} terminators)`);
}

// Gate 2b: no leading or trailing whitespace — the file must be the clause only.
if (CLAUSE !== CLAUSE.trim()) {
  throw new Error("clause must not start or end with whitespace");
}

// Gate 3: a single line — no newline or carriage return anywhere.
if (CLAUSE.includes("\n") || CLAUSE.includes("\r")) {
  throw new Error("clause must be a single line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
if (outDir.length === 0) {
  throw new Error("MAKEFUN_OUTPUT_DIR must not be empty");
}
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, CLAUSE, "utf8");

// Gate 4: read back and require byte-exact output.
const roundTrip = readFileSync(outPath, "utf8");
if (roundTrip !== CLAUSE) {
  throw new Error("read-back mismatch: entry.txt differs from the clause");
}
const byteLen = Buffer.byteLength(roundTrip, "utf8");
if (byteLen !== CLAUSE.length) {
  throw new Error(`non-ASCII bytes detected: ${byteLen} bytes vs ${CLAUSE.length} chars`);
}
// Gate 5: the file must end with a full stop, byte 46, and no trailing newline.
const rawBytes = readFileSync(outPath);
if (rawBytes[rawBytes.length - 1] !== 46) {
  throw new Error(`entry.txt must end with byte 46 (.), found ${rawBytes[rawBytes.length - 1]}`);
}
if (rawBytes.length !== 148) {
  throw new Error(`entry.txt must be exactly 148 bytes, found ${rawBytes.length}`);
}
console.log(`wrote ${outPath} (${byteLen} bytes, one sentence, single line)`);
