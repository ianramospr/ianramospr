# Ian Ramos

I build thoughtful digital experiences and independent products.

[Website](https://ianramospr.com) · [GitHub](https://github.com/ianramospr)

## Sites in this repo

Plain static files, no build step. Each folder is its own Cloudflare Pages project,
connected to `main`, with an empty build command:

| Folder | Pages project | Output directory | Domain |
| --- | --- | --- | --- |
| `portfolio/` | `ianramospr` | `portfolio` | ianramospr.com |
| `apps/chao/public/` | `chao-ianramospr` | `apps/chao/public` | chao.ianramospr.com |

Each folder has its own `_headers` (security headers) and `404.html`. Chao's
`_redirects` sends `/download` to the App Store.

Run `npm test` (Node 22+) before pushing. It checks links, page weight, headers
and the legal pages.

To add an app: create `apps/<slug>/public/`, add it to `sites` in
`tests/websites.test.mjs`, and create a new Pages project with that output folder.
