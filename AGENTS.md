# AGENTS.md — Thrive Website Repo

## What this repo
Public marketing site for Thrive Wellness Center (Bangkok). Migrating from Wix to Astro.
**Source-of-truth plan:** `plan_08052026.md` — read this first if unsure about any decision.

## Stack (locked — do not change without updating plan)
- **Astro** (`astro/` subdir) — new public marketing site, static output, Astro 6
- **Sanity** (project `fc8ot1td`, dataset `production`) — Tier B content (blog, testimonials, doctors)
- **Netlify** — hosting for Astro + serverless `/api/*` functions
- **Supabase** — leads and workflow data only
- **Root static HTML** (`*.html` at root) — legacy reference only, do NOT delete or modify

## Repo layout
```
thrive-website/
├── astro/              Active Astro build (new public site, Astro 6, Node 22)
├── netlify/functions/  Serverless API (leads, health check)
├── supabase/           SQL schema files
├── *.html              Legacy static pages (design/content reference)
├── thrive-styles.css   Design system source (1753 lines — do not delete)
├── plan_08052026.md    Current project plan (authoritative)
├── SITE-TRACKER.md     Page build + SEO progress
└── DOCTOR-NOON-PAGES.md  Doctor attribution tracker
```

## Branch + PR rules (plan §4 — non-negotiable)
- **Never push directly to `main`**
- Branch naming: `feature/<scope>` e.g. `feature/astro-scaffold`, `feature/food-intolerance-page`
- 1 feature = 1 branch = 1 PR
- Netlify deploy preview must pass before merge (once Astro Netlify site is live)
- **Satemshi (achotirat@gmail.com) = final approver** before any merge to `main`

## Team roles (plan §4)
| Person | Role | Git | Sanity |
|---|---|---|---|
| Satemshi | Owner, infra, API, approver | Admin | Admin |
| facadexth | Frontend UI (Astro components, pages) | Write, feature branches only | Viewer/Developer |
| vkasama | Content management | None needed | Editor |
| AI (Codex) | Code, migration, QA, docs | Same as facadexth — branch + PR only | None |

## Working rules for AI (Codex)
1. Read `plan_08052026.md` before starting work — know the current phase.
2. **Tier A pages** (`/food-intolerance`, `/adrenal-fatigue`, `/hbot`, etc.) = manual MDX in `astro/src/content/` — SEO-critical, no bulk generation.
3. **Tier B content** (blog, testimonials, doctors) = Sanity after schema stable.
4. **Never** put credentials, API keys, PMS data, or customer data in the public site.
5. **Preserve URLs** from static site — same slug = same path in Astro.
6. **CSS: port faithful** — use class names from `thrive-styles.css`, do not redesign or add Tailwind.
7. Run `npx astro check` and `npm run build` before every commit in `astro/`.
8. Commit frequently, small commits, descriptive messages.

## Current phase
**Phase 1 — Astro Project Bootstrap** (May 2026)
See `plan_08052026.md §10` for full phase checklist.

Next after Phase 1:
- Phase 2: Tier A pages (`/food-intolerance` first per plan §6)
- Parallel: Sanity `service` schema, Supabase `leads` table

## Common commands
```bash
# From repo root:
cd astro
npm install
npm run dev          # http://localhost:4321
npm run build        # builds to astro/dist/
npm run preview      # preview built output
npx astro check      # type-check all .astro files — must be 0 errors before commit
```

## Hard stops — do NOT do these
- Do NOT push to `main`
- Do NOT touch root `netlify.toml` until a dedicated Astro-deploy branch
- Do NOT delete or modify root `*.html` or `thrive-styles.css`
- Do NOT add Tailwind (decision locked: port `thrive-styles.css`)
- Do NOT rebuild dashboard in Next.js (out of scope — see plan §12)
- Do NOT query PMS/RDS live from dashboard page loads
- Do NOT put service-role Supabase keys in any frontend file
