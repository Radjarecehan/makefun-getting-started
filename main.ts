// The Router Confesses — a home Wi-Fi router excuses itself for dying
// at the climax of a movie. Writes one line (103 chars) to entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I cut out at the climax because after three hours of your gasps, I decided I deserved a plot twist too.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

// Self-check the gate before writing: 1-200 chars, single line, no
// trailing newline. Fail loudly rather than shipping an invalid entry.
if (LINE.length < 1 || LINE.length > 200) {
  throw new Error(`entry length ${LINE.length} outside gate 1-200`);
}
if (LINE.includes("\n") || LINE.trim() !== LINE) {
  throw new Error("entry must be a single clean line");
}
writeFileSync(join(outDir, "entry.txt"), LINE, "utf8");

// Read back and confirm byte-exact: what the judge sees is what we wrote.
const written = readFileSync(join(outDir, "entry.txt"), "utf8");
if (written !== LINE) {
  throw new Error("read-back mismatch: entry.txt differs from LINE");
}
