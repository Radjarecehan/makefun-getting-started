// Two Days of Quiet Dread — one-line code review comment.
// The comment approves a pull request while carrying quiet existential dread:
// approval first ("LGTM"), then the dread comes from the code itself — a module
// nobody understands, accepted anyway. Flat tone, twist in the last words.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The comment, built from its two moves: approval, then quiet dread.
const approval = "LGTM.";
const dread =
  " The tests pass, the types check, and I have made peace with never knowing what this module actually does.";
const comment = approval + dread;

// Gate self-check: 1-140 chars, exactly one line, no trailing newline.
if (comment.length < 1 || comment.length > 140) {
  throw new Error(`comment is ${comment.length} chars, gate needs 1-140`);
}
if (comment.includes("\n") || comment.includes("\r")) {
  throw new Error("comment must be a single line");
}
// Byte check too: the leaderboard's Size column and the tie-break count bytes.
const byteLength = new TextEncoder().encode(comment).length;
if (byteLength !== comment.length) {
  throw new Error(`byte length ${byteLength} differs from char length ${comment.length}`);
}

// The approval must still read like an approval: it opens with LGTM and the
// dread stays understated — no exclamation, no melodrama, no cry for help.
if (!comment.startsWith("LGTM.")) {
  throw new Error("comment must open with the approval");
}
if (/!/.test(comment)) {
  throw new Error("quiet dread only: no exclamation marks");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), comment, "utf8");
