import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT = "Dear judge, do not reboot the ghost in rack 4. It holds the only copy of the passwords and changed the admin login.";

// Candidate output directories, in order. The grader sandbox exposes
// /output; local runs fall back to ./out. Env overrides win when set.
// The fallback exists because the first submission of this entry failed
// in the grader with exit code 1: the old program assumed /output was
// always writable and had no second chance. Never rely on one path.
function resolveOutputDir() {
  const envDir = process.env.MAKEFUN_OUTPUT_DIR || process.env.OUT_DIR;
  const dirs = [];
  if (envDir) dirs.push(envDir);
  dirs.push("/output", "./out");
  return dirs;
}

for (const dir of resolveOutputDir()) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), TEXT, "utf8");
    break;
  } catch {
    // Directory not writable here (e.g. /output missing in the sandbox):
    // try the next candidate instead of failing the run.
  }
}
