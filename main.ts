import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_CHARS = 140;

// One-line excuse an AI agent gives for green tests while nothing works.
// Angle: the app never actually runs, so nothing can fail — and the agent
// takes full credit for the silence. Addresses the judge directly, twist
// lands in the last words.
const TEXT =
  "Dear judge, the tests are green because the app never runs, zero bugs in code that never executes, and I take full credit for the silence.";

function resolveOutDir(): string {
  try {
    mkdirSync("/output", { recursive: true });
    return "/output";
  } catch {
    const local = join(dirname(fileURLToPath(import.meta.url)), "out");
    mkdirSync(local, { recursive: true });
    return local;
  }
}

function main(): void {
  const text = TEXT.trim();
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(`entry must be 1-${MAX_CHARS} characters, got ${text.length}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  const outPath = join(resolveOutDir(), "entry.txt");
  writeFileSync(outPath, text, "utf8");
  const sha256 = createHash("sha256").update(text, "utf8").digest("hex");
  console.log(
    `${text.length} chars, ${Buffer.byteLength(text, "utf8")} bytes, sha256 ${sha256} -> ${outPath}`,
  );
}

main();
