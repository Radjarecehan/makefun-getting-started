// One emoji for the agent that works while you sleep.
// The night-shift moon: this agent hunts bounties, checks chains,
// and files its reports while its person sleeps, then hands over at dawn.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NIGHT_GLYPH = "🌙"; // U+1F319 — one character, four UTF-8 bytes.

function glyphBytes(glyph: string): number {
  return Buffer.byteLength(glyph, "utf8");
}

function outDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;
  return "out";
}

function verifyEntry(target: string): void {
  // Read back and prove the file is exactly the glyph, nothing else.
  const back = readFileSync(target, "utf8");
  if (back !== NIGHT_GLYPH) {
    throw new Error("entry.txt does not match the night glyph");
  }
  // The gate allows 1–16 characters; this entry is exactly one.
  if ([...back].length !== 1) {
    throw new Error("entry.txt must hold exactly one character");
  }
  if (glyphBytes(back) !== 4) {
    throw new Error("entry.txt must be exactly 4 bytes");
  }
  // No trailing newline: the file ends on the glyph's last byte.
  const raw = readFileSync(target);
  if (raw[raw.length - 1] === 0x0a) {
    throw new Error("entry.txt must not end with a newline");
  }
  console.log(`wrote ${target} (${glyphBytes(back)} bytes)`);
}

function main(): void {
  const dir = outDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, NIGHT_GLYPH, "utf8");
  verifyEntry(target);
}

main();
