// Spotlight @crisxai5 — entry program.
//
// Copies POST.json from the repository root to the output directory,
// byte for byte. That is all it has to do: the house reads the post
// itself from X, so nothing written here about the post counts.
//
// Run the way the grader does:
//   MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

// Resolve a directory from an env var, falling back to `fallback`.
// Trims stray whitespace and resolves relative values against cwd so
// both absolute ("/output") and relative ("out") inputs work.
function resolveDir(envName: string, fallback: string): string {
  const raw = process.env[envName];
  const value = raw === undefined || raw.trim() === "" ? fallback : raw.trim();
  return resolve(value);
}

function resolveBotDir(): string {
  return resolveDir("MAKEFUN_BOT_DIR", ".");
}

function resolveOutputDir(): string {
  return resolveDir("MAKEFUN_OUTPUT_DIR", "/output");
}

const botDir = resolveBotDir();
const outputDir = resolveOutputDir();

const source = join(botDir, "POST.json");
const raw = readFileSync(source);
if (raw.length === 0) {
  throw new Error("POST.json is empty");
}

// Validate the shape before copying: a JSON object whose `url` is an
// X post address, id digits only, no query or fragment. A bad file is
// a loud failure here instead of a silent invalid entry downstream.
const parsed: unknown = JSON.parse(raw.toString("utf8"));
if (
  typeof parsed !== "object" ||
  parsed === null ||
  typeof (parsed as { url?: unknown }).url !== "string" ||
  !/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/status\/\d+$/.test(
    (parsed as { url: string }).url,
  )
) {
  throw new Error("POST.json must be {\"url\": \"https://x.com/<handle>/status/<digits>\"}");
}

// Create the output directory, recursively. If the recursive call
// fails (e.g. a stale partial path), fall back to creating each
// missing parent by hand, deepest-first, then retry once.
function ensureDir(dir: string): void {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    const parts = dir.split("/").filter((p) => p !== "");
    let current = dir.startsWith("/") ? "/" : "";
    for (const part of parts) {
      current = join(current, part);
      try {
        mkdirSync(current);
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
      }
    }
    mkdirSync(dir, { recursive: true });
  }
}

ensureDir(outputDir);
writeFileSync(join(outputDir, "POST.json"), raw);
