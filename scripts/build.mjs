import { cp, lstat, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = process.argv[2];

// Public CLI: node scripts/build.mjs <portfolio|app-slug>.
// App slugs map to apps/<slug>/public; output is always dist/<slug>.
// Validate before deleting output so arbitrary paths cannot be removed.
if (process.argv.length !== 3 || !site || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(site)) {
  throw new Error('Usage: node scripts/build.mjs <portfolio|app-slug>');
}

/** @type {string[]} Explicit deployable entries; repository files stay private. */
const entries = site === 'portfolio'
  ? ['index.html', 'style.css', 'main.js', 'site.webmanifest', 'Assets']
  : [`apps/${site}/public`];

// Fail before clearing a previous build when an input does not exist.
for (const entry of entries) await lstat(resolve(root, entry));
const output = resolve(root, 'dist', site);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of entries) {
  await cp(resolve(root, entry), site === 'portfolio' ? resolve(output, entry) : output, {
    recursive: true,
    // Never follow links into files outside the deployable source tree.
    filter: async (source) => {
      if ((await lstat(source)).isSymbolicLink()) throw new Error(`Cannot deploy symlink: ${source}`);
      return true;
    },
  });
}
console.log(`Built ${site}: ${output}`);
