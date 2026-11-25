// The Funniest Out-of-Office — u-kreutzx-the-funniest-out-of-office-054815cf
// Writes exactly one out-of-office auto-reply line to /output/entry.txt.
//
// The joke: a perfectly plausible OOO opener ("out of office until
// Monday"), then the handover — the inbox is unsupervised and the office
// plants are in charge — and the twist lands in the final clause: the
// plants are doing a better job than the owner ever did. Self-deprecating,
// personal voice, no template phrasing, every word earns its place.
//
// Deterministic: same bytes on every run. Node 22 stdlib only.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The reply is composed from its three beats so each part can be tuned
// independently: the believable opener, the handover, and the punchline.
const OPENER = "I'm out of office until Monday.";
const HANDOVER = "My inbox is unsupervised, my plants are in charge,";
const PUNCHLINE = "and they are doing a better job than I ever did.";
const ENTRY = [OPENER, HANDOVER, PUNCHLINE].join(" ");

// Gate check (mirrors the sealed scorer): 1–140 UTF-8 characters,
// a single line, not only whitespace.
const chars = [...ENTRY];
if (chars.length < 1 || chars.length > 140) {
  throw new Error(`entry length ${chars.length} outside 1-140`);
}
if (ENTRY.trim().length === 0) {
  throw new Error("entry is only whitespace");
}
if (ENTRY.includes("\n") || ENTRY.includes("\r")) {
  throw new Error("entry must be a single line");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
// Write the entry exactly as-is: no trailing newline, no extra bytes.
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
console.log(`wrote ${Buffer.byteLength(ENTRY, "utf8")} bytes to entry.txt`);
