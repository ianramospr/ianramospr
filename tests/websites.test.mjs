import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Each folder is deployed as-is by its own Cloudflare Pages project.
const root = fileURLToPath(new URL('../', import.meta.url));
const sites = {
  portfolio: { dir: resolve(root, 'portfolio'), pages: ['index', '404'], budget: 60_000 },
  chao: { dir: resolve(root, 'apps/chao/public'), pages: ['index', 'privacy', 'terms', 'support', '404'], budget: 500_000 },
};

const read = (dir, path) => readFile(resolve(dir, path), 'utf8');

/** Map a link in `page` to the file Pages would serve. `/privacy` → privacy.html. */
function target(dir, page, link) {
  const path = link.split(/[?#]/)[0];
  const file = path.startsWith('/') ? resolve(dir, `.${path}`) : resolve(dirname(resolve(dir, page)), path);
  if (path.endsWith('/')) return resolve(file, 'index.html');
  return /\.[a-z0-9]+$/i.test(path) ? file : `${file}.html`;
}

/** Every href/src in the HTML plus every url() in the stylesheet it uses. */
async function references(dir, page) {
  const html = await read(dir, page);
  const links = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  const css = await read(dir, 'style.css');
  const cssUrls = [...css.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]);
  return { html, links, cssUrls };
}

for (const [name, site] of Object.entries(sites)) {
  test(`${name}: every local link, image and anchor resolves`, async () => {
    const redirects = await read(site.dir, '_redirects').catch(() => '');
    for (const page of site.pages.map((p) => `${p}.html`)) {
      const { html, links } = await references(site.dir, page);
      for (const link of links) {
        if (link.startsWith('#')) {
          assert.ok(html.includes(`id="${link.slice(1)}"`), `${page}: missing anchor ${link}`);
        } else if (/^(https:\/\/|mailto:)/.test(link)) {
          continue;
        } else if (redirects.includes(`${link} `)) {
          continue;
        } else {
          assert.ok((await stat(target(site.dir, page, link))).isFile(), `${page}: broken ${link}`);
        }
      }
    }
  });

  test(`${name}: home page assets stay under ${site.budget / 1000} KB`, async () => {
    const { links, cssUrls } = await references(site.dir, 'index.html');
    // Assets the page renders with; icons and links to other pages are not counted.
    const assets = [...links, ...cssUrls].filter((l) => /^[^:]+\.(css|js|svg|png|webp|jpe?g)$/i.test(l)
      && !/favicon|apple-touch|android-chrome/.test(l));
    const files = new Set([resolve(site.dir, 'index.html'), ...assets.map((l) => target(site.dir, 'index.html', l))]);
    let total = 0;
    for (const file of files) total += (await stat(file)).size;
    assert.ok(total < site.budget, `${name} home page is ${total} bytes`);
  });

  test(`${name}: security headers and a real 404 page`, async () => {
    const headers = await read(site.dir, '_headers');
    assert.match(headers, /default-src 'none'/);
    assert.match(headers, /frame-ancestors 'none'/);
    assert.match(headers, /X-Content-Type-Options: nosniff/);
    assert.match(await read(site.dir, '404.html'), /name="robots" content="noindex"/);
  });
}

test('portfolio: share previews use absolute URLs', async () => {
  const html = await read(sites.portfolio.dir, 'index.html');
  for (const tag of ['og:image', 'twitter:image', 'og:url']) {
    assert.match(html, new RegExp(`(?:property|name)="${tag}" content="https://ianramospr\\.com/`), tag);
  }
  assert.match(html, /rel="canonical" href="https:\/\/ianramospr\.com\/"/);
});

test('portfolio: content is only hidden when the reveal script runs', async () => {
  const css = await read(sites.portfolio.dir, 'style.css');
  assert.doesNotMatch(css, /^\.reveal\s*\{/m, 'a bare .reveal rule hides content when JS does not run');
  assert.match(await read(sites.portfolio.dir, 'main.js'), /classList\.add\('js'\)/);
});

test('chao: pages are script-free with one h1, a main landmark and a canonical URL', async () => {
  for (const page of sites.chao.pages) {
    const html = await read(sites.chao.dir, `${page}.html`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${page}: one h1`);
    assert.match(html, /<main\b[^>]*\bid="main"/, page);
    assert.doesNotMatch(html, /<script\b|<style\b|\s(?:on\w+|style)="/i, page);
    if (page !== '404') {
      const route = page === 'index' ? '' : page;
      assert.match(html, new RegExp(`href="https://chao\\.ianramospr\\.com/${route}" rel="canonical"`), page);
    }
  }
  assert.doesNotMatch(await read(sites.chao.dir, 'style.css'), /@import|url\(https?:/);
});

test('chao: /download goes to the App Store and legal pages are published', async () => {
  assert.match(await read(sites.chao.dir, '_redirects'), /^\/download https:\/\/apple\.co\/4ytNjAW 302$/m);
  for (const page of ['privacy', 'terms']) {
    const html = await read(sites.chao.dir, `${page}.html`);
    assert.match(html, /Effective October 11, 2026/);
    assert.match(html, /hello@ianramospr\.com/);
    assert.doesNotMatch(html, /name="robots" content="noindex"/);
  }
});

test('deployed folders contain only website files', async () => {
  for (const site of Object.values(sites)) {
    const files = await readdir(site.dir, { recursive: true });
    const stray = files.filter((f) => /\.(md|mjs|json)$/.test(f));
    assert.deepEqual(stray, [], site.dir);
  }
});
