import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';

const publicRoot = new URL('../public/', import.meta.url);
/** Read a deployable source file without running the repository build. @param {string} path */
const read = (path) => readFile(new URL(path, publicRoot), 'utf8');

test('landing stays static and all decorative vectors resolve locally', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /<fieldset|<input|assets\/screens|\.jpe?g|screen-picker/);
  for (const path of ['assets/Chao-Arrow.svg', 'assets/Keep-Arrow.svg', 'assets/underline.svg']) {
    const svg = await read(path);
    assert.match(svg, /<svg[^>]+viewBox=/);
    assert.doesNotMatch(svg, /<script|<foreignObject|https?:\/\/(?!www.w3.org)/);
  }
  assert.match(html, /Swipe left to queue a photo or right to keep it/);
  assert.doesNotMatch(html, /<span>CHAO<\/span>|<span>KEEP<\/span>/);
  assert.match(html, /assets\/photos\/san-francisco\.png/);
  assert.match(html, /href="https:\/\/ianramospr\.com"><img alt="" height="184" src="\/assets\/IAN\.svg" width="515"/);
  assert.match(await read('assets/IAN.svg'), /<svg[^>]+viewBox=/);
  assert.match(html, /href="\/download"><img alt="Download on the App Store"[^>]*src="\/assets\/app-store-black\.svg"/);
  assert.match(await read('assets/app-store-black.svg'), /Download_on_the_App_Store_Badge/);
  assert.doesNotMatch(html, /review-note|app-signoff|LEFT TO QUEUE|RIGHT TO KEEP/);
});

test('download route redirects to the confirmed App Store product page', async () => {
  const redirects = await read('_redirects');
  assert.match(redirects, /^\/download https:\/\/apple\.co\/4ytNjAW 302$/m);
});

test('all existing App Store routes retain accessible local navigation and policy status', async () => {
  const redirects = await read('_redirects');
  for (const name of ['index', 'privacy', 'terms', 'support', '404']) {
    const html = await read(`${name}.html`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.doesNotMatch(html, /<script\b|<style\b|\s(?:on\w+|style)="/i);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (value.startsWith('#')) assert.ok(html.includes(`id="${value.slice(1)}"`));
      if (!value.startsWith('/')) continue;
      if (value === '/download') {
        assert.match(redirects, /^\/download https:\/\/apple\.co\/4ytNjAW 302$/m);
        continue;
      }
      const path = value === '/' ? 'index.html' : value.includes('.') ? value.slice(1) : `${value.slice(1)}.html`;
      assert.ok((await stat(new URL(path, publicRoot))).isFile(), `${name}: ${value}`);
    }
  }
  for (const route of ['privacy', 'terms']) {
    const html = await read(`${route}.html`);
    assert.match(html, /Effective October 11, 2026/i);
    assert.doesNotMatch(html, /name="robots" content="noindex"/);
  }
});

test('website keeps original app artwork and script-free security protections', async () => {
  const headers = await read('_headers');
  assert.match(headers, /default-src 'none'/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /img-src 'self'/);
  const logo = await read('assets/chao.svg');
  assert.match(logo, /viewBox="80 260 870 510"/);
  assert.doesNotMatch(logo, /<script|<foreignObject|https?:\/\/(?!www.w3.org)/);
  const css = await read('style.css');
  assert.doesNotMatch(css, /@import|url\(https?:/);
  const weight = (await stat(new URL('index.html', publicRoot))).size
    + (await stat(new URL('style.css', publicRoot))).size
    + (await stat(new URL('assets/chao.svg', publicRoot))).size
    + (await stat(new URL('assets/app-store-black.svg', publicRoot))).size
    + (await stat(new URL('assets/underline.svg', publicRoot))).size
    + (await stat(new URL('assets/arrow-left.svg', publicRoot))).size
    + (await stat(new URL('assets/arrow-right.svg', publicRoot))).size;
  assert.ok(weight < 140_000, 'landing assets must fit in 140 KB');
});
