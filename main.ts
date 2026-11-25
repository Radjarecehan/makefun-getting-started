// Famous Last Words: The Funniest Epitaph
// A one-line tombstone epitaph, carved in stone and written to
// $MAKEFUN_OUTPUT_DIR/entry.txt — no stage directions, no explanation.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The epitaph itself: a dying person's last request, guarding the one
// secret everyone in the house wants. Short, quotable, and it lands
// because the twist is the second sentence.
const EPITAPH = "Tell no one the Wi-Fi password. I'm taking it with me.";

// Where the harness expects the entry. Defaults to ./out when the
// variable is unset so the program still runs by hand.
function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "out";
}

// Count characters as code points, the way the scorer counts them
// (an emoji counts as one character, not two UTF-16 units).
function charCount(text: string): number {
  return [...text].length;
}

// The gate wants one line of 1-150 characters. Fail loudly here
// instead of shipping a file the scorer would refuse.
function guardEpitaph(text: string): void {
  const chars = charCount(text);
  if (chars < 1 || chars > 150) {
    throw new Error(`epitaph must be 1-150 characters, got ${chars}`);
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("epitaph must be a single line");
  }
  if (text.trim().length === 0) {
    throw new Error("epitaph must not be only whitespace");
  }
}

// Write the epitaph byte-exact: no trailing newline, UTF-8.
function carveEpitaph(text: string): void {
  guardEpitaph(text);
  const dir = resolveOutputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "entry.txt");
  writeFileSync(target, text, "utf8");
  console.log(`carved ${charCount(text)} characters into ${target}`);
}

carveEpitaph(EPITAPH);
