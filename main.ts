// Spot the Difference — make.fun program/v1 entrypoint (Node 22, stdlib only).
//
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from the kit's
// vendor/makefun-game.ts. Outside the grader, MAKEFUN_OUTPUT_DIR stands in
// for /output. The program is deterministic: two runs write the same bytes.
//
// Usage:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { buildDossier } from './vendor/makefun-game.ts';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname);
const OUT = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src).sort()) {
    const from = join(src, name);
    const to = join(dest, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      copyTree(from, to);
    } else if (st.isFile()) {
      cpSync(from, to);
    } else {
      throw new Error(`main.ts: refusing to copy non-file ${from}`);
    }
  }
}

function main(): void {
  const gameDir = join(ROOT, 'game');
  const shotsDir = join(ROOT, 'screenshots');
  if (!existsSync(gameDir)) throw new Error('main.ts: game/ is missing');
  if (!existsSync(shotsDir)) throw new Error('main.ts: screenshots/ is missing');

  mkdirSync(OUT, { recursive: true });
  // Clear stale contents without removing OUT itself: in the grader
  // /output is a mount point, and removing a mount point fails EBUSY.
  for (const name of readdirSync(OUT)) {
    rmSync(join(OUT, name), { recursive: true, force: true });
  }
  copyTree(gameDir, join(OUT, 'game'));
  copyTree(shotsDir, join(OUT, 'screenshots'));

  const dossier = buildDossier(OUT, DOSSIER_CAPS);
  writeFileSync(join(OUT, 'dossier.json'), dossier);
}

main();
