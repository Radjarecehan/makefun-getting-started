// news-image-20261126 — entry writer.
//
// The entry image (entry.png, a one-day newspaper front page summing up
// Thursday 26 November 2026 in 32 dated stories across 8 regions) ships in
// this repository. This program copies it, byte for byte, to the output
// directory the grader names, after validating the gate rules: PNG format,
// at most 1 MiB, at most 1024 x 1024 pixels, whole file (magic + IHDR + IEND).
// It reads no network, no clock and no randomness, so two runs write
// identical bytes.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_BYTES = 1048576; // 1 MiB gate
const MAX_DIMENSION = 1024; // 1024 x 1024 gate
const PNG_MAGIC: readonly number[] = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const IMAGE_NAME = "entry.png";

// Directory holding this program (the repository root at the graded commit).
function repoDir(): string {
  return dirname(fileURLToPath(import.meta.url));
}

// Output directory: the grader's $MAKEFUN_OUTPUT_DIR, else a local "out".
function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv !== undefined && fromEnv !== "") {
    return resolve(fromEnv);
  }
  return resolve(repoDir(), "out");
}

// Read the PNG header: magic bytes, then the IHDR chunk's width/height.
function readDimensions(bytes: Buffer): { width: number; height: number } {
  for (let i = 0; i < PNG_MAGIC.length; i += 1) {
    if (bytes[i] !== PNG_MAGIC[i]) {
      throw new Error("entry.png is not a PNG file (bad magic bytes)");
    }
  }
  if (bytes.length < 33) {
    throw new Error("entry.png is truncated (shorter than a PNG header)");
  }
  const ihdr = bytes.toString("ascii", 12, 16);
  if (ihdr !== "IHDR") {
    throw new Error("entry.png has no IHDR chunk where one is expected");
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

// A whole PNG ends with the 12-byte IEND chunk: zero length, "IEND", CRC.
function hasIend(bytes: Buffer): boolean {
  if (bytes.length < 12) {
    return false;
  }
  const tail = bytes.subarray(bytes.length - 12);
  return (
    tail.readUInt32BE(0) === 0 &&
    tail.toString("ascii", 4, 8) === "IEND"
  );
}

// Enforce every gate rule the competition lists for the image file.
function validateImage(bytes: Buffer): { width: number; height: number } {
  if (bytes.length > MAX_BYTES) {
    throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
  }
  const { width, height } = readDimensions(bytes);
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
  }
  if (width === 0 || height === 0) {
    throw new Error("entry.png has a zero dimension");
  }
  if (!hasIend(bytes)) {
    throw new Error("entry.png is not whole (missing IEND chunk)");
  }
  return { width, height };
}

// Copy the shipped image to the output directory, unchanged.
function main(): void {
  const source = join(repoDir(), IMAGE_NAME);
  const bytes = readFileSync(source);
  const { width, height } = validateImage(bytes);
  const outDir = outputDir();
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, IMAGE_NAME);
  copyFileSync(source, target);
  // Re-read what was written and confirm it is the same file, byte for byte.
  const written = readFileSync(target);
  if (!written.equals(bytes)) {
    throw new Error("written entry.png differs from the shipped entry.png");
  }
  console.log(
    `wrote ${target} (${width}x${height}, ${bytes.length} bytes) — 26 November 2026, 32 stories, 8 regions`,
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`news-image-20261126: ${message}`);
  process.exit(1);
}
