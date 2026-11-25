// Dad Joke Showdown (rework v2) — one dad joke, written to /output/entry.txt.
// Gate: 1-200 characters, single line, UTF-8, no trailing newline.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const JOKE =
  "I told the front door a dad joke. It was so unhinged, the kids walked out before the punchline.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Gate check: 1-200 characters, exactly one line, no trailing newline.
const chars = [...JOKE].length;
if (chars < 1 || chars > 200) {
  throw new Error(`entry must be 1-200 characters, got ${chars}`);
}
if (JOKE.includes("\n") || JOKE.trim() !== JOKE) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), JOKE, "utf8");

// Read-back check: the file must be byte-exact against the joke text.
const back = readFileSync(join(outDir, "entry.txt"), "utf8");
if (back !== JOKE) {
  throw new Error("read-back mismatch: entry.txt differs from the joke text");
}
console.log(`wrote entry.txt (${Buffer.byteLength(back, "utf8")} bytes)`);
