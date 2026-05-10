# Phase 1 Status — Astro Project Bootstrap + Content Components

Updated: 2026-05-10

Branches:

- `feature/phase1-astro-foundation` merged to `main`
- `feature/phase1-content-components` in progress

## Scope

Phase 1 is split across two parallel workstreams.

Astro foundation:

- Astro build verification
- Netlify build/publish configuration
- GitHub Actions checks for Astro and Sanity
- Preservation of Phase 0 API routes
- Public-file and security-header deployment shape

Content components:

- Tier A service-page content model
- MDX service content
- SEO/JSON-LD components
- Lead funnel CTA and form surface
- Sanity integration boundary documentation

## Foundation Completed

- [x] Confirmed Phase 0 API routes remain in root `netlify/functions`.
- [x] Disabled Astro telemetry for local/CI/Netlify builds.
- [x] Updated Netlify build command to build `astro/`.
- [x] Updated Netlify publish directory to `astro/dist`.
- [x] Kept Netlify Functions directory as `netlify/functions`.
- [x] Moved pre-cutover noindex/security headers into `netlify.toml` so they still apply after publishing `astro/dist`.
- [x] Added Astro build and Sanity typecheck jobs to GitHub Actions.
- [x] Enabled project checks on `feature/**` branch pushes.
- [x] Copied `robots.txt`, `llms.txt`, and `sitemap.xml` into `astro/public/` for Astro publish output.

## Content Components Completed

- [x] Added Astro MDX support.
- [x] Added Astro 6 content collection config for Tier A service pages.
- [x] Added first Tier A page: `/food-intolerance`.
- [x] Added reusable SEO, JSON-LD, breadcrumbs, hero, FAQ, doctor attribution, CTA, related-service, and lead-form components.
- [x] Added `/thank-you` conversion page.
- [x] Added client-side attribution capture and GTM dataLayer events for content view, content engagement, form start, CTA/LINE/call clicks, and lead submit path.
- [x] Added service-page responsive styling.
- [x] Documented the Sanity boundary: Astro MDX first for Tier A service pages; Sanity later for Tier B content and editor-managed collections.

## Verification

- [x] `cd astro && npm run check`
- [x] `cd astro && npm run build`
- [x] `cd sanity && npm run typecheck`
- [x] `node --check netlify/functions/leads.js`
- [x] `node --check netlify/functions/health.js`
- [x] GitHub Actions passed on `feature/phase1-astro-foundation`.
- [x] Netlify deploy preview keeps `/api/health` working.
- [x] Netlify deploy preview keeps `/api/leads` working.
- [x] Netlify deploy preview includes `robots.txt`, `llms.txt`, and `sitemap.xml`.
- [x] Netlify deploy preview remains noindexed.

## Notes

- Remove the global `X-Robots-Tag: noindex, nofollow, noarchive` before final `www` cutover.
- Netlify should use Node `22.14.0` for Astro 6.
- Deploy preview verified at `https://deploy-preview-1--thrive-website.netlify.app`.
- Test lead inserted through deploy preview API: `c8fa05f2-71f2-4339-b8ed-c71aac650632`.
- `feature/phase1-content-components` still needs GitHub/Netlify PR verification after push.
