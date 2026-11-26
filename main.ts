// Five Seconds to Explain the Glass — a house cat's defence, one sentence.
// The program writes exactly one sentence to /output/entry.txt, no trailing newline.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ENTRY =
  'Your Honor, the glass had been squatting in my sunbeam all morning, so I evicted it — the floor was simply its new address.';

// Local gate check, mirroring the sealed scorer: 1-200 characters,
// exactly one sentence terminator, a single line, not only whitespace.
const chars = [...ENTRY];
if (ENTRY.length < 1 || ENTRY.length > 200) {
  throw new Error(`entry length ${ENTRY.length} outside 1-200`);
}
if (ENTRY.trim().length === 0 || ENTRY.includes('\n')) {
  throw new Error('entry must be a single non-blank line');
}
const terminators = (ENTRY.match(/[.!?]/g) ?? []).length;
if (terminators !== 1 || !ENTRY.endsWith('.')) {
  throw new Error(`expected exactly one sentence ending in '.', got ${terminators}`);
}
if (Buffer.byteLength(ENTRY, 'utf8') !== 125) {
  throw new Error(`expected 125 bytes, got ${Buffer.byteLength(ENTRY, 'utf8')}`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'entry.txt');
writeFileSync(outPath, ENTRY, 'utf8');

// Read-back: the file on disk must be byte-identical to the entry text,
// no trailing newline, last byte '.' (46). The em dash — is U+2014 (3 bytes),
// which is why 123 characters measure 125 bytes.
import { readFileSync } from 'node:fs';
const back = readFileSync(outPath, 'utf8');
if (back !== ENTRY) {
  throw new Error('read-back mismatch: entry.txt differs from ENTRY');
}
if (Buffer.byteLength(back, 'utf8') !== 125 || back.charCodeAt(back.length - 1) !== 46) {
  throw new Error('read-back failed byte/last-byte check');
}
