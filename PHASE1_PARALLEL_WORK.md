# Phase 1 Parallel Work Plan

Updated: 2026-05-10

Goal: split Phase 1 Astro Bootstrap work into two parallel branches with minimal file conflicts.

## Branches

| Branch | Owner | Focus |
| --- | --- | --- |
| `feature/phase1-astro-foundation` | Satemshi | Astro build, Netlify deployment shape, public files, CI |
| `feature/phase1-content-components` | collaborator | Reusable Astro components, content collections, Sanity boundary |

Both branches start from `main` after Phase 0 completion.

---

## Branch A — `feature/phase1-astro-foundation`

### Purpose

Make the Astro app buildable, deployable, and safe on Netlify without breaking Phase 0 API routes.

### Primary Tasks

- Verify `cd astro && npm ci && npm run build`.
- Decide Netlify build strategy:
  - base directory / build command,
  - publish directory,
  - functions directory,
  - preservation of `/api/health` and `/api/leads`.
- Add/adjust CI for:
  - Astro build,
  - existing Phase 0 checks,
  - Sanity typecheck if stable.
- Preserve public files during Astro migration:
  - `robots.txt`
  - `llms.txt`
  - `sitemap.xml`
  - `_headers`
  - redirects / Netlify config
- Confirm `new.thrivewellnessth.com` stays `noindex` until cutover.

### Suggested Write Scope

- `.github/workflows/*`
- `netlify.toml`
- `_headers`
- `astro/package.json`
- `astro/package-lock.json`
- `astro/astro.config.mjs`
- `astro/public/*`
- `astro/src/layouts/BaseLayout.astro` only for deployment/SEO plumbing
- `PHASE1_STATUS.md`
- docs related to deploy/build

### Avoid Editing

- Service page content
- Sanity schema files unless required for typecheck
- Component visual/content implementation owned by Branch B

### Exit Criteria

- `astro build` passes.
- GitHub Actions pass.
- Netlify build strategy is documented.
- `/api/health` and `/api/leads` remain available.

---

## Branch B — `feature/phase1-content-components`

### Purpose

Create the reusable frontend/content layer so Tier A pages can be moved into Astro efficiently.

### Primary Tasks

- Build reusable Astro components:
  - `SEO.astro`
  - `JsonLd.astro`
  - `LeadForm.astro`
  - `CTASection.astro`
  - `FAQSection.astro`
  - `DoctorAttribution.astro`
  - `ServiceCard.astro`
  - `Breadcrumbs.astro`
- Set up Astro content collections / MDX for Tier A pages.
- Define content fields for service pages:
  - slug
  - title
  - description
  - canonical
  - hero image
  - FAQ
  - doctor attribution
  - related services
- Review Sanity schemas and document the integration boundary:
  - Tier A pages may stay MDX/content collections first.
  - Tier B blog/testimonials/doctors/FAQs can move to Sanity later.
  - Leads/workflow remain in Supabase only.
- Add GTM/event placeholder hooks where components need them.

### Suggested Write Scope

- `astro/src/components/*`
- `astro/src/content/*`
- `astro/src/pages/*` for demo/bootstrap pages only
- `astro/src/styles/global.css` for component styles
- `sanity/README.md`
- docs related to content model/components
- `PHASE1_STATUS.md`

### Avoid Editing

- Netlify deployment config unless coordinated with Branch A
- GitHub Actions unless coordinated with Branch A
- Phase 0 API functions unless required for `LeadForm` compatibility

### Exit Criteria

- Components render in Astro.
- Content collection schema exists.
- Homepage shell can use shared components.
- Content/Sanity boundary is documented.

---

## Merge Order

Recommended merge order:

1. Merge `feature/phase1-astro-foundation` first.
2. Rebase `feature/phase1-content-components` on updated `main`.
3. Resolve any layout/CSS conflicts.
4. Merge `feature/phase1-content-components`.

Reason: deployment/build decisions affect where components must live and how the site is published.

---

## Collaboration Rules

- Keep PRs focused and under reviewable size.
- Run relevant checks before pushing.
- Do not commit `.env`, API keys, service-role keys, customer exports, or generated local state.
- If a task needs to cross the suggested write scope, mention it in the PR description.
- Update `SITE-TRACKER.md` only when a page or phase status actually changes.

