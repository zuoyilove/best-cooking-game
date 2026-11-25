// Sizzle & Serve — the entry program (Node 22, standard library only).
//
// What it does, in order: resolve the repository root from this file's own
// location, pick the output directory (the grader's /output, or
// MAKEFUN_OUTPUT_DIR when run by hand), copy the playable game and the
// screenshots into it, and write dossier.json with the vendored make.fun
// library, using exactly the caps the bounty's gate scores with. The run is
// deterministic: the same repository always writes the same output bytes,
// because the copy is a plain file copy and buildDossier sorts its inputs.
//
// Run it by hand like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The caps the scorer's gate applies to this bounty (see RULES.txt, "The gate").
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn(repoRoot: string, outDir: string): void {
  // Start from a clean output directory so a stale file from an earlier
  // run can never leak into this entry.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const shotsDir = join(repoRoot, 'screenshots');

  // Fail loudly (instead of writing a half entry) when a hand-in input is
  // missing: the gate would refuse the entry anyway, and a clear error here
  // is cheaper than a rejected submission.
  if (!existsSync(join(repoRoot, 'game', 'index.html'))) {
    throw new Error('hand-in refused: game/index.html is missing from the repository');
  }
  if (!existsSync(shotsDir)) {
    throw new Error('hand-in refused: screenshots/ is missing from the repository');
  }

  // The playable game: plain static files, loaded offline by game/index.html.
  cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });

  // The maker's screenshots of the game, first by name is the cover.
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
  }

  // The dossier the judge reads: byte for byte what the vendored library
  // writes from the game and screenshots just copied.
  const dossier = buildDossier(outDir, DOSSIER_CAPS);
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
handIn(repoRoot, outDir);
