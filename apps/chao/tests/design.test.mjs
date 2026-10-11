import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';

const publicRoot = new URL('../public/', import.meta.url);
/** Read a deployable source file without running the repository build. @param {string} path */
const read = (path) => readFile(new URL(path, publicRoot), 'utf8');

test('app preview uses a native mutually exclusive radio group with complete local assets', async () => {
  const html = await read('index.html');
  const ids = [...html.matchAll(/type="radio" name="screen" id="([^"]+)"( checked)?/g)];
  assert.equal(ids.length, 3);
  assert.equal(ids.filter(([, , checked]) => checked).length, 1);
  for (const [, id] of ids) assert.ok(html.includes(`for="${id}"`));
  assert.match(html, /<legend[^>]*>Explore Chao/);
  const images = [...html.matchAll(/src="(\/assets\/screens\/[^"]+)" width="(\d+)" height="(\d+)" alt="([^"]+)"/g)];
  assert.equal(images.length, 3);
  let total = 0;
  for (const [, path, width, height, alt] of images) {
    assert.ok(Number(width) > 0 && Number(height) > 0 && alt.length > 30);
    const bytes = await readFile(new URL(path.slice(1), publicRoot));
    assert.equal(bytes.readUInt16BE(0), 0xffd8, 'must be a real JPEG');
    total += bytes.length;
  }
  assert.ok(total < 450_000, 'all three app screens must fit in 450 KB');
  assert.match(html, /From the app\. Sample photos\./);
  assert.match(html, /iOS asks you to confirm/);
});

test('all existing App Store routes retain accessible local navigation and policy status', async () => {
  for (const name of ['index', 'privacy', 'terms', 'support', '404']) {
    const html = await read(`${name}.html`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.doesNotMatch(html, /<script\b|<style\b|\s(?:on\w+|style)="/i);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (value.startsWith('#')) assert.ok(html.includes(`id="${value.slice(1)}"`));
      if (!value.startsWith('/')) continue;
      const path = value === '/' ? 'index.html' : value.includes('.') ? value.slice(1) : `${value.slice(1)}.html`;
      assert.ok((await stat(new URL(path, publicRoot))).isFile(), `${name}: ${value}`);
    }
  }
  for (const route of ['privacy', 'terms']) {
    const html = await read(`${route}.html`);
    assert.match(html, /pending publication/i);
    assert.match(html, /name="robots" content="noindex"/);
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
    + (await stat(new URL('assets/screens/photos.jpg', publicRoot))).size;
  assert.ok(weight < 250_000, 'initial landing assets must fit in 250 KB');
});
