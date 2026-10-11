# Cloudflare Pages deployment

## Confirmed context

The owner confirmed that the portfolio is on Cloudflare Pages. Public inspection
on October 11, 2026 found Cloudflare nameservers and an HTTPS 200 response for the
personal site. The Git remote is `ianramospr/ianramospr`; this checkout previously
contained only static files, with no deployment workflow, CNAME, or Pages settings.
On October 11, 2026, the Cloudflare plugin confirmed the existing portfolio
project is `ianramospr`, connected to GitHub `ianramospr/ianramospr` on `main`.
Its build command, output directory and root directory are blank. Its existing
deployment and DNS records were preserved during Chao setup.

## Chao deployment configured

The separate `chao-ianramospr` Pages project is now connected to the same GitHub
repository and `main` branch, with automatic production and preview deployments.
It uses build command `npm run build:chao`, output `dist/chao`, repository-root
build execution, and `NODE_VERSION=24` for both environments. Analytics is disabled.

- Default deployment URL: `https://chao-ianramospr.pages.dev`
- Custom domain: `https://chao.ianramospr.com`
- DNS: proxied CNAME `chao` → `chao-ianramospr.pages.dev`, TTL Auto.
- Initial production commit: `481ec5caa1b1153510a42ce12384b699a7904336`.

The initial deployment succeeded. Cloudflare reports the custom domain, DNS
verification, and HTTPS validation as **Active**. Public resolvers 1.1.1.1 and
8.8.8.8 resolve the hostname. Clients that cached the previous NXDOMAIN response
may need to wait for that negative DNS cache to expire; the `pages.dev` URL is
available in the meantime.

All four pages and the stylesheet/logo returned
200 over HTTPS when checked against the published DNS address; an unknown path
returned 404. Security headers were present. Existing portfolio and mail records
were preserved. Privacy and terms remain publication notices pending final content.

The instructions below document the configuration for recovery and future apps;
do not create a duplicate Chao project or DNS record.

## Deploy Chao independently

1. Push the reviewed repository changes to GitHub. Run `npm test` first.
2. In Cloudflare **Workers & Pages**, create a new **Pages** project connected to
   `ianramospr/ianramospr`. Suggested project name: `chao-ianramospr`. If that name
   is unavailable, use another name and use its actual `pages.dev` hostname below.
3. Select the branch containing the changes as the production branch and set:

   | Setting | Value |
   | --- | --- |
   | Framework preset | None |
   | Root directory | Repository root (leave blank) |
   | Build command | `npm run build:chao` |
   | Build output directory | `dist/chao` |
   | Environment variable | `NODE_VERSION=24` |

   No bindings, Functions, secrets, or backend are required. Keep Web Analytics
   disabled unless its data handling is reviewed and reflected in the policy.
4. Deploy and check the assigned `pages.dev` URL. Confirm `/`, `/privacy`, `/terms`,
   and `/support` show distinct pages, `/missing-page` returns HTTP 404, and the
   stylesheet and logo load. `_headers` supplies the static security headers.
5. In that **new project's Custom domains**, add `chao.ianramospr.com` first.
   Cloudflare normally creates the record in the same-account Cloudflare zone.
   If manual DNS is requested, add only:

   | Type | Name | Target | TTL |
   | --- | --- | --- | --- |
   | CNAME | `chao` | The new project's actual `<project>.pages.dev` hostname | Auto |

   Associate the domain in Pages before adding a manual CNAME. Use Cloudflare's
   suggested proxy setting. The target has no `https://` prefix or path. If a
   `chao` record already exists, inspect its purpose before replacing it.
6. Wait for the custom domain and TLS certificate to become **Active**. Leave
   existing apex, `www`, MX, TXT, and other production records unchanged. Do not
   add a wildcard subdomain or reuse the personal website's Pages project.
7. Check the public HTTPS URLs without sign-in, Cloudflare Access, or bot challenges.
   If a challenge blocks these pages, narrowly exempt Chao's public routes rather
   than disabling protections for the personal domain.

Pages serves `privacy.html` as `/privacy` (likewise terms/support). No SPA fallback,
Functions, or redirect rules are needed. The top-level `404.html` prevents unknown
routes from returning the landing page with a misleading 200 response.

## Update the existing portfolio

Use its current Pages project and existing domain association. Before the first
deployment of this change, record the existing build settings and, if it currently
uploads the repository root, narrow the artifact to:

| Setting | Value |
| --- | --- |
| Root directory | Repository root (leave blank) |
| Framework preset | None |
| Build command | `npm run build:portfolio` |
| Build output directory | `dist/portfolio` |
| Environment variable | `NODE_VERSION=24` |

This artifact preserves the existing HTML, JS, CSS, manifest and `Assets` paths.
It adds the Chao project listing while excluding application sources, tests, and
documentation from the personal domain. Preview it before promoting it. No DNS
change is needed. If the project already uses an equivalent isolated build,
preserve that configuration and include the updated portfolio files.

## App Store Connect URLs

| Field | URL | Remaining work |
| --- | --- | --- |
| Marketing URL | `https://chao.ianramospr.com/` | Deploy and verify public HTTPS |
| Support URL | `https://chao.ianramospr.com/support` | Deploy; test delivery to the confirmed support mailbox |
| Privacy Policy URL | `https://chao.ianramospr.com/privacy` | Finalize actual policy, deploy, and verify |
| Terms link in app/listing, if applicable | `https://chao.ianramospr.com/terms` | Confirm license approach and publish final content |

Do not submit the pending privacy or terms notices as completed policies. Apple
requires a public privacy policy and actual contact information at the support
URL. The website architecture supplies stable HTTPS paths; Apple acceptance
also depends on the final content, the submitted app and public availability.
Add the final privacy link inside the app as required; this repository does not
modify the iOS app or its App Store Connect record.

After deployment, check each URL with `curl -I` and a browser, confirm security
headers, confirm the policy content matches the release binary, and test the
support mailbox. Keep the previous deployment available for rollback; rollback
each Pages project independently using its deployment history.

## Future applications

Create `apps/<slug>/public`, use build command `node scripts/build.mjs <slug>` and
output `dist/<slug>`, then add a separate Pages project/custom subdomain. Keep
assets, styles, policies, and deployment histories independent. Both projects
may build on a repository push; optional Pages build-watch paths can limit Chao
to `apps/chao/*`, `scripts/*`, and `package.json` without changing architecture.

## References

- [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages HTML routing and 404 behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Pages response headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Apple support and marketing URL fields](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/)
- [Apple app privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple App Review privacy requirements](https://developer.apple.com/app-store/review/guidelines/#privacy)
