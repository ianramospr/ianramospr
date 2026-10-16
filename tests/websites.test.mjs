import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { before, test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const build = resolve(root, 'scripts/build.mjs');
before(() => {
  for (const site of ['portfolio', 'chao']) execFileSync(process.execPath, [build, site]);
});

/** @param {string} path @returns {Promise<string>} UTF-8 deployment file. */
const read = (path) => readFile(resolve(root, path), 'utf8');

test('portfolio artifact preserves existing assets and contains only deployable files', async () => {
  assert.deepEqual((await readdir(resolve(root, 'dist/portfolio'))).sort(),
    ['Assets', 'index.html', 'main.js', 'site.webmanifest', 'style.css'].sort());
  for (const file of ['index.html', 'style.css', 'main.js', 'site.webmanifest']) {
    assert.equal(await read(`dist/portfolio/${file}`), await read(file));
  }
  const assets = await readdir(resolve(root, 'Assets'));
  for (const file of assets) {
    assert.deepEqual(await readFile(resolve(root, 'dist/portfolio/Assets', file)),
      await readFile(resolve(root, 'Assets', file)));
  }
  assert.doesNotMatch(await read('dist/portfolio/index.html'), /projects-heading|https:\/\/chao\.ianramospr\.com/);
});

test('Chao routes are separate HTML documents with working local links and anchors', async () => {
  const redirects = await read('dist/chao/_redirects');
  for (const route of ['', 'privacy', 'terms', 'support', '404']) {
    const file = `${route || 'index'}.html`;
    const html = await read(`dist/chao/${file}`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${file}: one primary heading`);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<main\b[^>]*\bid="main"/);
    assert.match(html, /href="https:\/\/ianramospr\.com"/);
    assert.match(
      html,
      new RegExp(`<link\\b(?=[^>]*rel="canonical")(?=[^>]*href="https://chao\\.ianramospr\\.com/${route}")[^>]*>`),
    );
    assert.doesNotMatch(html, /<script\b|<style\b|\s(?:on\w+|style)="/i);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (value.startsWith('#')) {
        assert.ok(html.includes(`id="${value.slice(1)}"`), `${file}: missing anchor ${value}`);
      } else if (value.startsWith('/')) {
        if (value === '/download') {
          assert.match(redirects, /^\/download https:\/\/apple\.co\/4ytNjAW 302$/m);
          continue;
        }
        const path = value === '/' ? 'index.html' : value.includes('.') ? value.slice(1) : `${value.slice(1)}.html`;
        await access(resolve(root, 'dist/chao', path));
      } else {
        assert.match(value, /^(https:\/\/|mailto:)/, `${file}: unexpected URL ${value}`);
      }
    }
  }
  assert.match(await read('dist/chao/support.html'), /mailto:hello@ianramospr\.com\?subject=Chao%20support/);
});

test('published legal pages include their effective date and contact information', async () => {
  for (const file of ['privacy.html', 'terms.html']) {
    const html = await read(`dist/chao/${file}`);
    assert.match(html, /Effective October 11, 2026/i);
    assert.match(html, /hello@ianramospr\.com/);
    assert.doesNotMatch(html, /name="robots" content="noindex"/);
  }
});

test('Chao artifact is isolated, script-free, and has security headers and a real 404', async () => {
  const files = await readdir(resolve(root, 'dist/chao'));
  assert.ok(files.includes('404.html'));
  assert.ok(!files.includes('main.js'));
  assert.ok(!files.includes('Assets'));
  const headers = await read('dist/chao/_headers');
  assert.match(headers, /default-src 'none'/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  const css = await read('dist/chao/style.css');
  assert.doesNotMatch(css, /@import|url\(https?:/);
  const weight = await Promise.all(['index.html', 'style.css', 'assets/chao.svg', 'assets/app-store-black.svg'].map(
    async (file) => (await stat(resolve(root, 'dist/chao', file))).size,
  ));
  assert.ok(weight.reduce((a, b) => a + b, 0) < 140_000, 'landing assets exceed 140 KB');
});

test('invalid build targets fail without deleting valid output', async () => {
  const original = await read('dist/chao/index.html');
  for (const target of ['../chao', '/tmp', '.', 'chao/../../portfolio', 'unknown-app']) {
    const result = spawnSync(process.execPath, [build, target]);
    assert.notEqual(result.status, 0, `should reject ${target}`);
  }
  assert.equal(await read('dist/chao/index.html'), original);
});
