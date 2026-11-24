// Say What Actually Broke — entry program (program/v1, Node 22 stdlib only).
// Deterministic: no network, no clock, no randomness. Writes one single-line
// error message to <output-dir>/entry.txt with no trailing newline.
// The line names the real failure in plain words (the database retired),
// tells the user what to do next (export it now), and lands the twist that
// the dialog itself is on borrowed time too — shippable in a real dialog.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Your file saved perfectly. The database it saved to retired three years ago — export it now, before this dialog retires too.";

// Gate sanity: one line, 1–200 characters, not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 200 || ENTRY.includes("\n")) {
  throw new Error("entry text violates the 1–200 single-line gate");
}

const outDir = (process.env.MAKEFUN_OUTPUT_DIR ?? "/output").trim() || "/output";
const outFile = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
// Write the exact bytes of ENTRY — no trailing newline is ever appended.
writeFileSync(outFile, Buffer.from(ENTRY, "utf8"));
