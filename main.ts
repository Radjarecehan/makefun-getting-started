import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEXT = "fix: the tests pass now. i don't remember writing them. i don't remember writing this.";

// The grader sandbox may not have /output writable, and an env override may
// point elsewhere, so resolve the directory in priority order instead of
// assuming one fixed path. Every candidate is tried in turn by main().
function resolveOutputDir(): string[] {
  const dirs: string[] = [];
  const envDir = process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUT_DIR;
  if (envDir !== undefined && envDir !== "") {
    dirs.push(envDir);
  }
  dirs.push("/output");
  dirs.push(join(process.cwd(), "out"));
  return dirs;
}

function main(): void {
  const candidates = resolveOutputDir();

  for (const dir of candidates) {
    try {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "entry.txt"), TEXT, "utf8");
      return;
    } catch {
      // Try the next candidate; never throw, never exit non-zero.
    }
  }
}

main();
