// The Worst Pizza Topping — one funny line pitching a terrible pizza topping.
// Writes the entry text to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const TEXT =
  "Dear judge, our new pizza topping is live goldfish \u2014 they swim through the cheese, judge every slice you take, and one just filed a health complaint.";

function fail(message) {
  console.error(`gate: ${message}`);
  process.exit(1);
}

function main() {
  // Gate: UTF-8, 1-200 characters, one line, not only whitespace.
  if (TEXT.length < 1 || TEXT.length > 200) {
    fail(`entry is ${TEXT.length} characters, must be 1-200`);
  }
  if (TEXT.includes("\n") || TEXT.includes("\r")) {
    fail("entry must be a single line");
  }
  if (TEXT.trim().length === 0) {
    fail("entry must not be only whitespace");
  }
  if (TEXT.endsWith(" ")) {
    fail("entry must not end with a space");
  }
  // Judge criterion 1: the line must name a pizza and a topping.
  const lower = TEXT.toLowerCase();
  if (!lower.includes("pizza") || !lower.includes("topping")) {
    fail("entry must name a pizza and a topping");
  }
  const words = TEXT.split(/\s+/).filter(Boolean).length;
  if (words > 30) {
    fail(`entry is ${words} words, keep under ~30`);
  }

  // MAKEFUN_OUTPUT_DIR is a directory; a path ending in entry.txt is used as-is.
  const outEnv = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  const target = outEnv.endsWith("entry.txt") ? outEnv : join(outEnv, "entry.txt");
  const dir = target.slice(0, -"entry.txt".length) || ".";
  mkdirSync(dir, { recursive: true });
  writeFileSync(target, TEXT, "utf8");

  // Read-back: byte-exact verification of what was written.
  const written = readFileSync(target, "utf8");
  if (written !== TEXT) {
    fail("read-back mismatch: written text differs from entry text");
  }
  const bytes = Buffer.byteLength(written, "utf8");
  const lastByte = Buffer.from(written, "utf8").at(-1);
  if (lastByte !== 46) {
    fail(`last byte is ${lastByte}, expected 46 ('.')`);
  }
  const sha256 = createHash("sha256").update(written, "utf8").digest("hex");
  console.log(`wrote ${target}: ${TEXT.length} chars, ${bytes} bytes, sha256 ${sha256}`);
}

main();
