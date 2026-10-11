# Ian Ramos websites

The personal portfolio remains at the repository root. Independent applications
live in `apps/<slug>/public`, each with its own static files, design, hostname,
and Cloudflare Pages project. No runtime code or services are shared.

Requires Node.js 22 or later. No dependencies or package installation are needed.

```sh
npm test
npm run build:portfolio
npm run build:chao
```

The public build command is `node scripts/build.mjs <portfolio|app-slug>`.
It copies deployable files to `dist/<slug>`, cleans only that site's output,
rejects path traversal and source symlinks, and fails for missing input.
Build outputs are ignored by Git. Do not upload the repository itself.

- Portfolio: `dist/portfolio` → `https://ianramospr.com`
- Chao: `dist/chao` → `https://chao.ianramospr.com`

Chao uses standalone HTML pages with extensionless routes on Pages. Its content
works without JavaScript. Privacy and terms are explicit publication notices,
not final legal documents, and remain excluded from search indexing until finalized.

See [deployment instructions](docs/deployment.md) and
[Chao release content checklist](apps/chao/RELEASE.md).

Validation: `npm test` builds both artifacts and checks route/link integrity,
portfolio asset preservation, policy status, artifact isolation, security headers,
an initial landing asset budget of 125 KB, and invalid build targets. The initial
Chao landing assets total 83,162 bytes uncompressed. Local browser review covered
desktop and narrow mobile landing/support layouts, confirmed no horizontal
overflow and no console warnings/errors, and checked the privacy publication notice.
This does not verify Cloudflare edge routing, deployed headers, DNS/TLS, mailbox
delivery, or App Store acceptance; complete the deployment checklist for those.

To add another application, create `apps/<slug>/public/index.html`, its own
assets and policy/support pages, then run `node scripts/build.mjs <slug>`.
Create a separate Pages project with output `dist/<slug>` and add only its
subdomain. Application listings are not included on the personal website.
No portfolio relocation or shared application framework is needed.
