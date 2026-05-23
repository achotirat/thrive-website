# Complete SITE-TRACKER Blog Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ทยอย migrate และ publish บทความ blog ให้ครบตาม `SITE-TRACKER.md` โดยรักษา slug, content HTML, FAQ, doctor section, image, และ redirect ให้ใกล้เคียงต้นฉบับที่สุด.

**Architecture:** Use the existing HTML-to-Sanity importer to create or replace Sanity `blogPost` documents with structured metadata plus sanitized `legacyHtml`. Astro fetches published Sanity posts at build time, renders `/blog/[slug]`, and keeps old `/post/[slug]` URLs as 301 redirects.

**Tech Stack:** Node importer, Sanity project `fc8ot1td`, Astro 6 content collections, Netlify deploy previews, `SITE-TRACKER.md` as migration order source.

---

## Current Checkpoint

- 20 posts are published in Sanity.
- Continue from `SITE-TRACKER.md` row #23: `blog-probiotic-foods.html`.
- Skip rows that are explicitly 404/no HTML, deleted, or merged into another canonical post.
- Keep each batch small enough to review: 10 posts per batch is the default.

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Read | `SITE-TRACKER.md` | Source of truth for post order, source HTML file names, canonical slug, backlink priority, and skip/merge notes |
| Read | `new html from vkasama/**/blog-*.html` | Source HTML articles for import |
| Modify | `tools/import-blog-html-to-sanity.mjs` | Add filename overrides, image overrides, category rules, or sanitizer fixes discovered during each batch |
| Modify | `docs/blog-import-report.md` | Record the latest imported batch and warnings |
| Modify | `astro/src/pages/post/[slug].astro` | Maintain old `/post/*` redirects when slug behavior changes |
| Modify | `astro/src/styles/global.css` | Fix rendering gaps for preserved legacy HTML |
| Modify | `master_plan.md` | Keep the Phase 5 checkpoint current after meaningful milestones |

---

### Task 1: Build The Next Batch From SITE-TRACKER

**Files:**
- Read: `SITE-TRACKER.md`
- Read: `docs/blog-import-report.md`

- [ ] **Step 1: Identify the next 10 eligible posts**

Start at row #23 and select the next 10 rows whose notes include `✅ HTML พร้อม`.

Skip these row types:
- `404 on Wix`
- `no HTML file`
- `DELETE / DO NOT MIGRATE`
- `Merged into`
- duplicates whose canonical target is already imported

Expected next batch:

| SITE-TRACKER row | Source HTML |
| ---: | --- |
| 23 | `blog-probiotic-foods.html` |
| 24 | `blog-vitamin-a.html` |
| 25 | `blog-l-carnitine.html` |
| 26 | `blog-menstrual-pain.html` |
| 27 | `blog-urticaria-hives.html` |
| 28 | `blog-triglyceride.html` |
| 29 | `blog-chromium.html` |
| 30 | `blog-clogged-arteries.html` |
| 31 | `blog-love-neurotransmitter.html` |
| 35 | `blog-immune-system.html` |

- [ ] **Step 2: Confirm files exist**

Run:

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
for f in \
  blog-probiotic-foods.html \
  blog-vitamin-a.html \
  blog-l-carnitine.html \
  blog-menstrual-pain.html \
  blog-urticaria-hives.html \
  blog-triglyceride.html \
  blog-chromium.html \
  blog-clogged-arteries.html \
  blog-love-neurotransmitter.html \
  blog-immune-system.html
do
  find "new html from vkasama" -name "$f" -print
done
```

Expected: each filename prints one matching path.

- [ ] **Step 3: Dry-run the batch**

Run one dry-run command per found source path:

```bash
node tools/import-blog-html-to-sanity.mjs --source "new html from vkasama/blog-tierB-bucket1/blog-probiotic-foods.html" --dry-run
```

Expected for each file:
- body blocks are non-zero
- FAQ count matches the tracker when available
- image is detected
- category is reasonable
- warnings are either empty or explainable

- [ ] **Step 4: Patch importer overrides before writing**

If dry-run reveals a bad slug, missing image basename, or wrong category, modify `tools/import-blog-html-to-sanity.mjs` before writing to Sanity.

- [ ] **Step 5: Import as published**

Run one write command per approved source path:

```bash
set -a
source .env.local
set +a
node tools/import-blog-html-to-sanity.mjs --source "new html from vkasama/blog-tierB-bucket1/blog-probiotic-foods.html" --target published
```

Expected: each command writes one `blogPost.*` document and updates `docs/blog-import-report.md`.

- [ ] **Step 6: Replace the report with the full batch summary**

If the importer report only shows the last source file, update `docs/blog-import-report.md` so it lists all 10 imported posts in the batch.

---

### Task 2: Verify Sanity And Astro After Each Batch

**Files:**
- Read: `astro/src/content.config.ts`
- Read: `docs/blog-import-report.md`

- [ ] **Step 1: Query Sanity published count**

Run with `.env.local` loaded:

```bash
set -a
source .env.local
set +a
node -e "import('@sanity/client').then(({createClient})=>{const c=createClient({projectId:process.env.PUBLIC_SANITY_PROJECT_ID,dataset:process.env.PUBLIC_SANITY_DATASET,token:process.env.SANITY_API_TOKEN,apiVersion:'2024-01-01',useCdn:false}); return c.fetch('count(*[_type==\"blogPost\" && !(_id in path(\"drafts.**\"))])').then(console.log)})"
```

Expected after the next batch: `30`.

- [ ] **Step 2: Run Astro check**

```bash
cd astro
npm run check
```

Expected: `0 errors`, `0 warnings`.

- [ ] **Step 3: Run Astro build with Sanity env**

```bash
cd astro
set -a
source ../.env.local
set +a
npm run build
```

Expected:
- the build completes
- the page count increases by the imported posts
- Thai slug redirects do not throw `ByteString` errors

- [ ] **Step 4: Spot-check rendered pages**

Open at least 3 posts from the batch in the deploy preview or local build:
- highest-traffic post in the batch
- one Thai-slug post
- one post with tables or dense FAQ

Check:
- hero image visible
- bullet lists visible
- tables readable on desktop and mobile
- FAQ appears once at the bottom
- doctor image visible
- old `/post/[slug]` redirects to `/blog/[slug]`

---

### Task 3: Commit And Deploy Each Batch

**Files:**
- Modify: `docs/blog-import-report.md`
- Modify as needed: `tools/import-blog-html-to-sanity.mjs`
- Modify as needed: Astro rendering/CSS files
- Modify milestone-only: `master_plan.md`

- [ ] **Step 1: Review local diff**

```bash
git diff --stat
git diff -- docs/blog-import-report.md tools/import-blog-html-to-sanity.mjs master_plan.md
```

Expected: only batch-related files changed.

- [ ] **Step 2: Commit**

```bash
git add docs/blog-import-report.md tools/import-blog-html-to-sanity.mjs master_plan.md
git commit -m "feat: import tracker blog batch 3"
```

If Astro rendering files changed, include those exact files in `git add`.

- [ ] **Step 3: Push**

```bash
git push
```

Expected: Netlify deploy preview starts for the branch.

- [ ] **Step 4: Update the checkpoint**

After deploy verification, update the Current Checkpoint section in this plan and the Phase 5 note in `master_plan.md`:

```markdown
Current checkpoint: 30 published posts in Sanity; continue from `SITE-TRACKER.md` row #36.
```

Use the actual next row after skipped and merged entries.

---

### Task 4: Repeat Until SITE-TRACKER Is Exhausted

**Files:**
- Read: `SITE-TRACKER.md`
- Modify: `docs/blog-import-report.md`
- Modify: `master_plan.md`

- [ ] Repeat Task 1 through Task 3 for rows after #35.
- [ ] Preserve canonical slugs for rows with backlinks.
- [ ] Add 301 redirects for deleted, merged, or old Wix URLs.
- [ ] Stop importing when all HTML-ready Bucket 1 and Bucket 2 posts are either published or intentionally redirected.
- [ ] Mark Phase 5 blog migration complete only after a crawl confirms every meaningful Wix URL has a live page or redirect.

