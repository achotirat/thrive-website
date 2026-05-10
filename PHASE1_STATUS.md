# Phase 1 Status — Astro Project Bootstrap

Updated: 2026-05-10

Branch: `feature/phase1-astro-foundation`

## Scope

This branch owns the Astro foundation work:

- Astro build verification
- Netlify build/publish configuration
- GitHub Actions checks for Astro and Sanity
- Preservation of Phase 0 API routes
- Public-file and security-header deployment shape

Component/content implementation belongs primarily to `feature/phase1-content-components`.

## Completed

- [x] Confirmed Phase 0 API routes remain in root `netlify/functions`.
- [x] Disabled Astro telemetry for local/CI/Netlify builds.
- [x] Updated Netlify build command to build `astro/`.
- [x] Updated Netlify publish directory to `astro/dist`.
- [x] Kept Netlify Functions directory as `netlify/functions`.
- [x] Moved pre-cutover noindex/security headers into `netlify.toml` so they still apply after publishing `astro/dist`.
- [x] Added Astro build and Sanity typecheck jobs to GitHub Actions.
- [x] Enabled project checks on `feature/**` branch pushes.
- [x] Copied `robots.txt`, `llms.txt`, and `sitemap.xml` into `astro/public/` for Astro publish output.

## Verification

- [x] `cd astro && npm run check`
- [x] `cd astro && npm run build`
- [x] `cd sanity && npm run typecheck`
- [x] GitHub Actions passed on `feature/phase1-astro-foundation`.
- [ ] Netlify deploy keeps `/api/health` working.
- [ ] Netlify deploy keeps `/api/leads` working.
- [ ] `new.thrivewellnessth.com` remains noindexed.

## Notes

- Remove the global `X-Robots-Tag: noindex, nofollow, noarchive` before final `www` cutover.
- Netlify should use Node `22.14.0` for Astro 6.
