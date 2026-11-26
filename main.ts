// Name the Robot Band — one funny robot-band name + its hit song, under 200 chars.
// The house judge is a stand-up comic who has heard every robot joke twice:
// the name must land on first read, the hit-song line must add a second laugh,
// and the twist sits in the last words.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const TEXT =
  "Dear judge, meet the robot band The 404s. Their hit 'Love Not Found' topped the charts and never once loaded.";

// Gate (RULES.txt): entry.txt must be UTF-8 text of 1 to 200 characters,
// a single line, not only white space.
function gate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`gate: ${chars} characters, need 1-200`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: entry is only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: entry must be a single line");
  }
  if (text.endsWith(" ") || text.endsWith("\t")) {
    throw new Error("gate: entry must not end with white space");
  }
}

function main(): void {
  gate(TEXT);
  const outDir = process.argv[2] ?? "out";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, TEXT, "utf8");
  // Read back and prove the file is byte-exact what the gate passed.
  const written = readFileSync(outPath);
  if (!written.equals(Buffer.from(TEXT, "utf8"))) {
    throw new Error("read-back: entry.txt differs from gated text");
  }
  const bytes = Buffer.byteLength(TEXT, "utf8");
  const sha256 = createHash("sha256").update(written).digest("hex");
  console.log(`wrote ${outPath}: ${[...TEXT].length} chars, ${bytes} bytes`);
  console.log(`sha256: ${sha256}`);
  console.log(`entry: ${TEXT}`);
}

main();
