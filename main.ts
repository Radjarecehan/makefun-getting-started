// Dapur Kilat — hand-in program (Node 22, standard library only).
// Copies the game and its screenshots beside this file into /output and writes
// /output/dossier.json with the vendored make.fun library. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO = fileURLToPath(new URL('.', import.meta.url));
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function requireDir(path, label) {
  if (!existsSync(path) || !statSync(path).isDirectory()) {
    throw new Error(`${label} missing: ${path}`);
  }
}

function copyTree(src, dest) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

requireDir(join(REPO, 'game'), 'game/');
requireDir(join(REPO, 'screenshots'), 'screenshots/');
mkdirSync(OUT, { recursive: true });
copyTree(join(REPO, 'game'), join(OUT, 'game'));
copyTree(join(REPO, 'screenshots'), join(OUT, 'screenshots'));

const dossier = buildDossier(OUT, CAPS);
writeFileSync(join(OUT, 'dossier.json'), dossier);
const shots = readdirSync(join(OUT, 'screenshots')).filter((n) => !n.startsWith('.'));
console.log(`dapur-kilat: ${shots.length} screenshots, dossier ${dossier.length} bytes -> ${OUT}`);
