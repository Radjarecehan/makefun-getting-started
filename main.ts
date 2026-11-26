import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT =
  "Dear judge, I missed that spot: the dust bunny hired a lawyer, and my suction cannot afford the trial.";

// Resolve where the entry text goes. The grader sandbox provides /output,
// but a local or restricted run may not be able to write there, so the
// entry must still land somewhere the grader can find it instead of
// crashing: env override first, then the sandbox default, then ./out.
function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR || process.env.OUT_DIR || "/output";
}

function writeEntry(dir: string): boolean {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), TEXT, "utf8");
    return true;
  } catch {
    return false;
  }
}

if (!writeEntry(resolveOutputDir())) {
  writeEntry("./out");
}
