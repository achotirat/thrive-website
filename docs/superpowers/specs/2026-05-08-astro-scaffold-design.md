# Astro Scaffold — Design Spec

**Date:** 2026-05-08
**Branch:** `feature/astro-scaffold`
**Owner:** Satemshi (final approver)
**Implementer:** AI (Claude)
**Source plan:** `plan_08052026.md` §10 Phase 1
**Phase:** Phase 1 — Astro Project Bootstrap

---

## 1. Goal

Create the foundation of the Astro project under `astro/` so subsequent feature branches (Tier A pages, lead form, SEO components, GTM, redirects) have a working shell to build on.

This is the first of several PRs that together complete Phase 1. This PR delivers exit criterion: *"Astro staging can render homepage shell and shared components."*

## 2. Decisions Locked

| Decision | Choice | Reason |
|---|---|---|
| Project location | `astro/` subdirectory in existing repo | Static HTML at root remains as design/content reference per plan §1 |
| Styling | Port `thrive-styles.css` to `astro/src/styles/global.css` | 1753-line design system already paid; faithful port = lowest visual-parity risk |
| TypeScript | Strict (Astro default) | Astro `.astro` files near-zero TS overhead; catches errors as component count grows |
| Package manager | npm | Already used elsewhere in repo |
| Node | v20 LTS | Astro 5 baseline |
| Branch name | `feature/astro-scaffold` | Matches plan §4 naming convention |
| Netlify deploy | Not in this branch | Root `netlify.toml` stays untouched; Astro Netlify site = separate later branch |
| CLAUDE.md | Included this branch, at repo root | Future Claude sessions get repo context immediately after merge |

## 3. Scope This Branch

### In scope
- `npm create astro` minimal scaffold under `astro/`
- TypeScript strict (`astro/tsconfig.json` extends `astro/tsconfigs/strict`)
- Port `thrive-styles.css` → `astro/src/styles/global.css`
- Copy fonts + brand assets (`logo.png`, `og-image.jpg`, `favicon-192.png`) into `astro/public/`
- `BaseLayout.astro` — `<html>`, `<head>` slot, font preload, global CSS import, body `<slot/>`
- `Header.astro` — port `.topbar` + `.navbar` markup from existing static pages (no JS interactions)
- `Footer.astro` — port footer markup from existing static pages
- `index.astro` — homepage shell using BaseLayout + Header + Footer + 1–2 hero sections proving visual parity
- `CLAUDE.md` at repo root — pointer doc, ~80–120 lines

### Out of scope (separate branches)
- CTA component, lead form, SEO component, JSON-LD helpers
- GTM script integration
- `robots.txt` / `llms.txt` / sitemap config in Astro
- Redirect strategy file
- Sanity schema + Sanity client integration
- Tier A content pages (`/food-intolerance`, `/adrenal-fatigue`, etc.)
- Mobile nav JS interaction (markup only this branch)
- Astro Netlify site configuration / deployment
- Touching root `netlify.toml`
- Touching root static HTML files

## 4. Repo Layout After Merge

```
thrive-website/
├── astro/                       NEW
│   ├── src/
│   │   ├── layouts/
│   │   │   └── BaseLayout.astro
│   │   ├── components/
│   │   │   ├── Header.astro
│   │   │   └── Footer.astro
│   │   ├── pages/
│   │   │   └── index.astro
│   │   └── styles/
│   │       └── global.css       (copy of thrive-styles.css)
│   ├── public/
│   │   ├── logo.png
│   │   ├── og-image.jpg
│   │   └── favicon-192.png
│   ├── astro.config.mjs
│   ├── tsconfig.json
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
├── CLAUDE.md                    NEW
├── (existing static HTML at root — unchanged)
├── (existing thrive-styles.css — unchanged)
└── netlify.toml                 UNCHANGED
```

## 5. Astro Config

```js
// astro/astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://new.thrivewellnessth.com',
  output: 'static',
});
```

No adapter installed in this branch. Adapter (`@astrojs/netlify`) added in the deploy branch.

## 6. CLAUDE.md Content (root)

Pointer doc, not duplicate of plan. Sections:

- What this repo
- Stack (Astro / Sanity / Netlify / Supabase) — locked per plan §3
- Repo layout
- Branch + PR rules (per plan §4)
- Roles (Satemshi / facadexth / vkasama / AI)
- Working rules for AI (read plan first, Tier A = MDX, Tier B = Sanity, never expose creds/PMS data, preserve URLs, port CSS faithful)
- Current phase pointer
- Common commands (`cd astro && npm install`, `npm run dev`, `npm run build`, `npx astro check`)
- Don't do list (no main push, no touching root netlify.toml, no deleting static HTML, no Tailwind, no Next.js dashboard rebuild)

Authoritative source for plan stays `plan_08052026.md` — CLAUDE.md links to it.

## 7. Component Specifications

### BaseLayout.astro

**Props:** `title: string`, `description: string`, `ogImage?: string`

**Responsibilities:**
- Render `<html lang="th">` with proper `<meta charset>`, viewport
- `<head>` includes title, description, Google Fonts preconnect + Noto Sans Thai stylesheet link, global CSS import, OG/Twitter base tags (just title + description + image, full SEO component is later branch)
- `<body>` renders `<slot />`

**Does NOT include in this branch:** GTM, JSON-LD, full canonical/SEO logic — those are later branches.

### Header.astro

**Source:** Copy markup verbatim from `index.html` (canonical reference) `.topbar` + `.navbar` blocks.

**Constraint:** Use exact same class names. Do not refactor markup. JS interactivity (mobile nav toggle) deferred — markup ready, behavior empty.

### Footer.astro

**Source:** Copy markup verbatim from `index.html` (canonical reference) footer block.

**Constraint:** Same — exact class names, no refactor.

### index.astro

**Content:** Use BaseLayout + Header + Footer. Body contains hero section + 1 secondary section copied from existing `index.html` to demonstrate visual parity. Not a full homepage rebuild — proof of shell.

## 8. Verification (Done Definition)

PR mergeable only when ALL true:

- [ ] `cd astro && npm install` succeeds with no critical audit issues
- [ ] `cd astro && npm run build` succeeds with no errors
- [ ] `cd astro && npx astro check` reports zero errors
- [ ] `astro/dist/index.html` renders Header + hero + Footer
- [ ] Side-by-side visual comparison with static `index.html` shows no obvious break (fonts, colors, layout match)
- [ ] Noto Sans Thai loads (verify in browser DevTools network tab)
- [ ] No browser console errors on `npm run preview`
- [ ] `CLAUDE.md` exists at repo root
- [ ] `git diff main -- '*.html' '*.css'` produces empty output (root unchanged)
- [ ] `git diff main -- netlify.toml` produces empty output
- [ ] Satemshi has visually approved by checking out the branch locally

## 9. Risks + Mitigations

| Risk | Mitigation |
|---|---|
| Ported CSS selectors depend on static-HTML class structure not reproduced in Astro components | Header/Footer copy markup verbatim with same class names; visual check before merge |
| Font path break (Noto Sans Thai) | Google Fonts `<link>` in BaseLayout `<head>` matching static page; verify in DevTools |
| Asset path break (logo, OG image, favicon) | Copy assets to `astro/public/`; reference with root-relative paths (`/logo.png`) |
| TypeScript strict noise on `.astro` files | Use Astro starter `tsconfig.json` extending `astro/tsconfigs/strict`; do not add stricter rules |
| Scope creep mid-PR (CTA / form / SEO / GTM) | Hard stop: only Header / Footer / BaseLayout / index this PR |
| Merge conflict with parallel Sanity-schema branch | Different paths (`astro/` vs Sanity tooling); zero overlap expected |

## 10. Parallel Work (informational, not part of this branch)

Separate branches/work owned by Satemshi running concurrently:

- `feature/sanity-service-schema` — define Sanity `service` content type per plan §5 fields. Unblocks vkasama (content entry) and future facadexth UI binding.
- `chore/supabase-leads-table` — run `supabase/leads_schema.sql` against Supabase project; configure Netlify env vars.
- Admin tasks: GitHub invite for facadexth (Write), Sanity invites (facadexth Viewer/Developer, vkasama Editor), Wix renewal through Dec 2026, Google Ads admin access request.

Do **not** start Tier A page branches (e.g. `feature/food-intolerance-page`) until both this scaffold branch AND the Sanity schema branch have merged.

## 11. Branch + PR Workflow

Commit sequence on `feature/astro-scaffold`:

1. `chore: scaffold astro project`
2. `chore: port thrive-styles.css to astro global.css`
3. `feat: BaseLayout with font preload and global css`
4. `feat: Header component`
5. `feat: Footer component`
6. `feat: index.astro homepage shell`
7. `docs: add CLAUDE.md`
8. `chore: tsconfig strict, astro check passes`

PR description includes: link to this spec, the §8 verification checklist, and a static-vs-astro screenshot pair.

Review: Satemshi checks out branch locally, runs `cd astro && npm install && npm run dev`, verifies homepage shell visually, then squash-merges. Branch deleted after merge.

## 12. After This Branch

Suggested next branches in order:

1. `feature/sanity-service-schema` (parallel, owned by Satemshi)
2. `chore/supabase-leads-table` (parallel, owned by Satemshi)
3. `chore/netlify-astro-site` — configure new Netlify site pointing at `astro/`, attach `new.thrivewellnessth.com` with noindex
4. `feature/seo-component` + `feature/gtm-integration` + `feature/redirect-strategy-file` (any order)
5. `feature/lead-form-component` + `netlify/functions/leads` wiring
6. `feature/food-intolerance-page` (Tier A first, per plan §6) — only after scaffold + Sanity schema merged
