# Chao content required before release

Confirmed by the owner: publisher **Ian Ramos**; support/privacy contact
**hello@ianramospr.com**. Test mailbox delivery before App Store submission.
The website intentionally has no invented App Store link, price, launch date,
privacy guarantee, or binding legal terms.

## Source and brand review

The adjacent Chao app repository was inspected read-only on October 11, 2026:
`README.md`, `UIUX.md`, `docs/Architecture.md`, `docs/AppStoreRelease.md`,
`Chao/Views/BrutalistTheme.swift`, and the color asset catalogs. These describe
swipe-right keep, swipe-left queue, queue review, and iOS-confirmed deletion.
The copied `Chao-Light.svg` wordmark is stored locally as `public/assets/chao.svg`;
only its transparent canvas is trimmed (viewBox); the original artwork paths remain
unchanged. The website uses the app's exact light Display P3 palette (with sRGB
fallbacks), system monospace headings, square controls, and onboarding copy.

The landing page is a single text composition with two static SVG swipe arrows
and a red brush underline copied from the app's `SplashUnderline` artwork. The
underline's transparent canvas is trimmed for web placement; its paths are
unchanged. No screenshots, preview selector, client scripts, remote fonts, or
additional dependencies are included.

Run `node --test apps/chao/tests/*.test.mjs` for source checks and `npm test` for
the repository build/routing/security checks. Browser QA should cover 320px,
390px, 768px, and desktop widths and all legal/support routes. No dependency on
the adjacent app checkout is needed for deployment.

## Privacy information to confirm

Source documentation is evidence for drafting, not a signed-off release policy.
Confirm these against the final production archive and publishing practices:

- Legal publisher/contact details and effective date; any address required for
  intended distribution markets.
- What photo-library content and metadata are accessed and why, including photo
  identifiers, dates, and embedded locations. The current app does not request
  device location, but this must be verified for release.
- Local session storage: identifiers, decisions/timestamps, shuffle seed, current
  asset, and deleted count. Confirm persistence duration, backup handling and how
  users can remove/reset this data. Do not promise a reset feature that is absent.
- PhotoKit/iCloud downloads and Apple reverse geocoding can use the network.
  Confirm service handling and disclosures; do not claim that the app is entirely
  offline or that no data ever leaves the device.
- Final SDK/dependency inventory, analytics, diagnostics, ads, tracking, purchase
  services, and any future backend. The inspected source documents no app-owned
  upload service, analytics, or third-party dependencies; verify the archive.
- Retention/deletion and privacy requests, including support email processing,
  providers, retention period and recipient access. Photo deletion uses Apple's
  system confirmation and recovery behavior; do not promise permanent erasure.
- Website hosting request logs, enabled Cloudflare features, and provider handling.
  Absence of website JavaScript does not prove that hosting collects no data.
- Applicable privacy rights, children's eligibility and distribution regions.

Replace the publication notice in `public/privacy.html` with the reviewed policy,
including its effective date. Remove its `noindex` tag once finalized. Align the
App Store Connect privacy answers and the app's privacy link with that policy.

## Terms information to confirm

- Apple standard EULA versus a custom license agreement. If choosing the standard
  EULA, confirm that choice in App Store Connect and link the official agreement;
  do not silently invent an additional custom license.
- Price, purchase/subscription model (if any), refunds and eligibility.
- Any additional terms the publisher actually adopts, with reviewed jurisdiction,
  liability, termination and dispute provisions where applicable.
- Legal identity/contact information and effective date.

Replace `public/terms.html` with the approved terms or a precise explanation/link
to the selected license. Remove `noindex` after finalization. Custom license
agreements may also require entry in App Store Connect; a website alone does not
configure the app's license.

## Final listing content

Provide the actual App Store product URL after an app record is available and
confirm availability before adding a download button. Review marketing copy,
screenshots and localizations against the final app. No release availability
claim is currently made on the landing page.

See [deployment and App Store URL checklist](../../docs/deployment.md).
