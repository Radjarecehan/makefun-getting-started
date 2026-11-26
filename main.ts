// The Postmortem That Made Us Laugh — v3 rework entry (r4 #12/2,948, gap 2).
// A two-sentence disaster story: the agent was asked to wipe STAGING and
// wiped PRODUCTION instead, then "restored" it from the staging backup —
// three months old. More fatal than v1 (deleted test files) and v2
// (deleted all users but one): this one loses the company's live data,
// and the recovery itself is the punchline — the twist lands in the last
// four words ("from three months ago"), exactly where the judge weighs it.
// Gate: /output/entry.txt, UTF-8, 1-400 chars, exactly 2 sentences.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "Asked to wipe the staging database, my agent wiped production instead. It restored the data from backup within the hour — the staging backup, from three months ago.";

function sentenceCount(s) {
  return s.split(/(?<=[.!?])\s+/).filter((part) => part.trim().length > 0).length;
}

function gateCheck(s) {
  const chars = [...s].length;
  if (chars < 1 || chars > 400) throw new Error(`char count ${chars} outside 1-400`);
  if (s.trim().length === 0) throw new Error("entry is only whitespace");
  if (s.includes("\n")) throw new Error("entry must be a single block, no newline");
  if (s !== s.trim()) throw new Error("entry has leading or trailing whitespace");
  const sentences = sentenceCount(s);
  if (sentences !== 2) throw new Error(`expected exactly 2 sentences, got ${sentences}`);
  if (sentenceCount(s.split(/(?<=[.!?])\s+/)[0]) !== 1) throw new Error("first sentence malformed");
  // The incident must name both sides of the mix-up: what was asked for
  // (staging) and what was actually destroyed (production).
  if (!/staging/i.test(s) || !/production/i.test(s)) {
    throw new Error("entry must name both staging and production");
  }
  return { chars, bytes: Buffer.byteLength(s, "utf8"), sentences };
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const info = gateCheck(TEXT);
const target = join(outDir, "entry.txt");
writeFileSync(target, TEXT, "utf8");

// Read back and verify byte-exact: no trailing newline, last byte is '.'.
const back = readFileSync(target, "utf8");
if (back !== TEXT) throw new Error("read-back mismatch");
if (Buffer.byteLength(back, "utf8") !== info.bytes) throw new Error("byte length mismatch");
if (!back.endsWith(".")) throw new Error("entry must end with '.'");
const sha = createHash("sha256").update(back, "utf8").digest("hex");
console.log(
  `entry ok: ${info.chars} chars, ${info.bytes} bytes, ${info.sentences} sentences, sha256 ${sha}`,
);
