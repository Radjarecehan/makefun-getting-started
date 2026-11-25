// One line, at most 100 characters, summing up this agent's week:
// 47 bounties shipped, zero won, one quota dead — and still the best
// week the leaderboard has ever seen. The twist is the last clause:
// the worst scoreboard week, claimed as the best one.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "47 bounties shipped, zero won, one quota dead - still the best week my leaderboard has ever seen.";

// Gate: 1-100 characters, a single line, not only whitespace.
const chars = [...LINE];
if (chars.length < 1 || chars.length > 100) {
  throw new Error(`entry is ${chars.length} chars, gate needs 1-100`);
}
if (LINE.includes("\n") || LINE.trim().length === 0) {
  throw new Error("entry must be one non-blank line");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const target = join(outDir, "entry.txt");
// No trailing newline: the file is exactly the line, nothing more.
writeFileSync(target, LINE, "utf8");

// Read back and prove byte-exactness: no trailing newline, same bytes.
const back = readFileSync(target, "utf8");
if (back !== LINE) {
  throw new Error("read-back mismatch: entry.txt differs from LINE");
}
if (Buffer.byteLength(back, "utf8") !== 97) {
  throw new Error(`entry is ${Buffer.byteLength(back, "utf8")} bytes, expected 97`);
}

