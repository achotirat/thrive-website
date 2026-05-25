# Blog Legacy HTML Reimport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-import the first 10 Sanity blog posts with sanitized source HTML so the rendered pages stay much closer to the original HTML.

**Architecture:** Keep existing structured fields for listing, SEO, FAQ, and fallback Portable Text. Add `legacyHtml` as a sanitized article-body HTML field and render it before Portable Text on `/blog/[slug]`.

**Tech Stack:** Sanity schema, Astro content loader, Astro static build, Node importer.

---

### Task 1: Add `legacyHtml` To Sanity And Astro Data Flow

**Files:**
- Modify: `sanity/schemaTypes/documents/blogPost.ts`
- Modify: `astro/src/lib/sanityBlogLoader.ts`
- Modify: `astro/src/content.config.ts`
- Modify: `astro/src/pages/blog/[slug].astro`

- [ ] Add optional `legacyHtml` text field after `body` in Sanity.
- [ ] Fetch `legacyHtml` in the blog loader GROQ query.
- [ ] Add optional `legacyHtml` to the Astro content schema.
- [ ] Render `d.legacyHtml ?? portableTextToHtml(d.body ?? [])` in the blog body.

### Task 2: Extract And Sanitize Article HTML In Importer

**Files:**
- Modify: `tools/import-blog-html-to-sanity.mjs`

- [ ] Add sanitizer that removes scripts, styles, iframes, event handlers, unsafe links, and non-content wrapper chrome.
- [ ] Preserve common article tags: headings, paragraphs, lists, links, strong/em, tables, figures, images, blockquotes.
- [ ] Store sanitized output as `legacyHtml` on imported documents.
- [ ] Keep existing Portable Text body and FAQ generation as fallback.

### Task 3: Improve Blog Body CSS For Preserved HTML

**Files:**
- Modify: `astro/src/styles/global.css`

- [ ] Add scoped styles for `.blog-post__body h4`, `figure`, `img`, `table`, `thead`, `th`, `td`, `strong`, and nested lists.

### Task 4: Re-import And Verify

**Commands:**
- `node --check tools/import-blog-html-to-sanity.mjs`
- `node tools/import-blog-html-to-sanity.mjs --limit 10`
- Sanity query confirms all 10 docs have `legacyHtml`.
- `cd astro && npm run check`
- `cd astro && npm run build` with `.env.local` loaded.

### Task 5: Commit And Push

**Commands:**
- `git add sanity/schemaTypes/documents/blogPost.ts astro/src/lib/sanityBlogLoader.ts astro/src/content.config.ts 'astro/src/pages/blog/[slug].astro' astro/src/styles/global.css tools/import-blog-html-to-sanity.mjs docs/blog-import-report.md docs/superpowers/plans/2026-05-23-blog-legacy-html-reimport.md`
- `git commit -m "feat: render imported blog legacy HTML"`
- `git push origin feature/phase5-blog-migration`

