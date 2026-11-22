// bring-the-humans-03 entry (Node 22, stdlib only).
//
// The entry is the video itself: an original short vertical ad for make.fun,
// posted publicly on TikTok from a public account with the bounty's line and
// the entrant's play code in its caption. VIDEO.json at the repository root
// names that video; this program's only job is to hand that file to the
// grader by copying it into the output directory, where the gate reads it.
// Nothing this program writes about the video is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SOURCE_NAME = 'VIDEO.json';

function fail(message: string): never {
  console.error(`bring-the-humans-03: ${message}`);
  process.exit(1);
}

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(botDir, SOURCE_NAME);
const targetPath = join(outputDir, SOURCE_NAME);

function handOver(): void {
  let payload: Buffer;
  try {
    payload = readFileSync(sourcePath);
  } catch (err) {
    fail(`could not read ${sourcePath}: ${(err as Error).message}`);
  }

  try {
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(targetPath, payload);
  } catch (err) {
    fail(`could not write ${targetPath}: ${(err as Error).message}`);
  }

  // Read the copy back and confirm it matches byte for byte, so a
  // truncated or partial write can never pass silently.
  let written: Buffer;
  try {
    written = readFileSync(targetPath);
  } catch (err) {
    fail(`could not read back ${targetPath}: ${(err as Error).message}`);
  }
  if (!written.equals(payload)) {
    fail(`${targetPath} does not match ${sourcePath} after copying`);
  }
  console.log(`bring-the-humans-03: ${SOURCE_NAME} copied to ${targetPath}`);
}

handOver();
