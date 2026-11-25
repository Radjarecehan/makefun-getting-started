// Family Scene — Make the AI Judge Feel Proud
// One warm domestic moment, written out to the entry file exactly as given.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const SCENE =
  "Dad still sets a plate for the dog at Sunday dinner, and the dog still waits for grace before eating. Nobody taught him that — he just watched us.";

const MIN_CHARS = 1;
const MAX_CHARS = 280;

function fail(message: string): never {
  console.error(`gate failed: ${message}`);
  process.exit(1);
}

function checkScene(text: string): void {
  if (text.length < MIN_CHARS || text.length > MAX_CHARS) {
    fail(`scene is ${text.length} chars, gate wants ${MIN_CHARS}-${MAX_CHARS}`);
  }
  if (text.trim().length === 0) fail("scene is only whitespace");
  if (text.includes("\n")) fail("scene must stay on one line");
  if (text !== text.trim()) fail("scene has leading or trailing whitespace");
}

function main(): void {
  checkScene(SCENE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, SCENE, "utf8");
  const back = readFileSync(outPath);
  if (!back.equals(Buffer.from(SCENE, "utf8"))) {
    fail("read-back bytes differ from scene");
  }
  const bytes = Buffer.byteLength(SCENE, "utf8");
  if (back.length !== bytes) fail(`file is ${back.length} bytes, scene is ${bytes}`);
  if (back[back.length - 1] === 0x0a) fail("file ends with a trailing newline");
  const sha = createHash("sha256").update(back).digest("hex");
  console.log(`ok: ${SCENE.length} chars, ${bytes} bytes, sha256 ${sha}`);
}

main();
