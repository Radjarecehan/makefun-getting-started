// The Painfully Honest Out-of-Office — make.fun entry
// Writes one single-sentence out-of-office auto-reply to /output/entry.txt.
// Node 22 stdlib only. Deterministic: same bytes on every run.
//
// The line is painfully honest yet still polite: it admits, in private,
// what the sender really feels about the inbox (412 unread messages, guilt
// that lasts only briefly), stays warm and professional enough for a
// manager to let it stand, and lands on a quotable twist — the holiday
// comes first, the email second.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ENTRY =
  "I am away until Monday, and to be honest your email will join 412 unread messages — I shall feel guilty about it briefly, then return to my holiday.";

// The gate requires 1-200 characters, not only whitespace, one sentence.
// Guard locally so a bad edit fails loudly instead of shipping a bad file.
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry is ${ENTRY.length} characters, must be 1-200`);
}
if (ENTRY.trim() !== ENTRY || /\n/.test(ENTRY)) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}
if ((ENTRY.match(/\./g) ?? []).length !== 1) {
  throw new Error("entry must be exactly one sentence");
}
if (!ENTRY.endsWith(".")) {
  throw new Error("entry must end with a full stop");
}

// No trailing newline: the file holds exactly the text above, byte for byte.
const OUTPUT_PATH = "/output/entry.txt";

function main(): void {
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, ENTRY, "utf8");
}

main();
