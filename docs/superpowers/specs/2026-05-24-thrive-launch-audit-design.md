# Thrive Launch Audit Skill — Design Spec
Date: 2026-05-24
Status: Approved

---

## Overview

A Claude Code skill (`thrive-launch-audit`) that performs a comprehensive pre-launch content audit of the Thrive Wellness Astro site. The skill audits 8 dimensions per page — SEO, GEO, meta tags, schema/FAQ, images, E-E-A-T, and originality — using parallel sub-agents and toprank skills, then writes results to a persistent master scorecard.

**Primary goal:** Ensure every page can be found and trusted by both humans (Google) and AI engines (ChatGPT, Perplexity, Claude) before the Wix→Astro cutover in Oct–Nov 2026.

---

## Invocation

```
/thrive-launch-audit                        # full site sweep
/thrive-launch-audit https://new.thrivewellnessth.com/blog/new-post   # single page (incremental)
```

Default site URL: `https://new.thrivewellnessth.com/`

---

## Two Modes

### Mode 1: Full Site Sweep

Triggered when no page URL is passed. Runs the complete audit across all discovered pages.

Flow:
1. Fetch `{site}/sitemap.xml` to enumerate all pages
2. Group pages into Tier A (service pages) and Tier B (blog posts)
3. Present confirmation summary to user: URL, page count per tier, dimensions, estimated scope
4. Wait for explicit user approval ("go" / "yes" / "start")
5. Dispatch 4 parallel sub-agents
6. Merge agent outputs into `docs/audits/master-audit.md`
7. Print executive summary to terminal

### Mode 2: Incremental (Single Page)

Triggered when a specific page URL is passed. Audits only that page.

Flow:
1. Show page URL and dimensions to be checked
2. Wait for user confirmation
3. Run all 4 audit agents against the single page (not parallel — too few pages to justify overhead)
4. Load existing `docs/audits/master-audit.md`
5. Update or append the row for that page with new scores and `last_audited` date
6. Print the page's scorecard to terminal

---

## Page Discovery and Tiering

### Tier A — Service and Info Pages (~24 pages)
Full 8-dimension audit. These are SEO-critical and carry the highest migration risk.

Pages: `/`, `/food-intolerance`, `/adrenal-fatigue`, `/hormones-quiz`, `/hbot`, `/iv-drip`, `/gluta`, `/chelation`, `/personalized-vitamins`, `/nad`, `/nk-cell`, `/allergy-ige`, `/urine-organic-test`, `/vitamin-d`, `/vitamins-and-micronutrients`, `/check-up`, `/about`, `/oligoscan`, `/cancer-screening`, `/dna-test`, `/contact`, `/doctors`, `/thank-you`

### Tier B — Blog Posts (`/blog/*`)
Abbreviated 6-dimension audit (skip deep `toprank:seo-page` call; use lighter WebFetch-based SEO check instead). Focus on meta, schema, images, FAQ, E-E-A-T, originality.

Tier B pages are processed in traffic priority order (high-traffic posts first, as tracked in SITE-TRACKER.md).

---

## Sub-Agent Architecture

Four agents run in parallel during full site sweep. Each agent processes all pages within its dimension set and writes a structured JSON results block to a temp file.

### Agent 1: SEO + GEO Agent

**Dimensions:** SEO /10, GEO /10

**Tools:**
- `toprank:seo-page` — invoke for each Tier A page (deep on-page audit: title, headings, keyword density, search intent alignment, internal links, Core Web Vitals signals)
- `toprank:geo-optimizer` — invoke for top 10 pages by traffic: `/food-intolerance`, `/adrenal-fatigue`, `/hormones-quiz`, `/hbot`, `/iv-drip`, `/gluta`, `/chelation`, `/personalized-vitamins`, `/nad`, `/nk-cell` (AI search optimization: cited claims, structured answers, entity coverage, AI snippet eligibility)
- WebFetch — for remaining Tier B pages: manual check of title tag, H1, keyword in URL, meta description, internal link count

**Output per page:** SEO score /10, GEO score /10, up to 3 issues flagged per dimension

---

### Agent 2: Meta Tags + Schema Agent

**Dimensions:** Meta /10, Schema /10

**Tools:**
- WebFetch — fetch raw HTML of each page
- `toprank:meta-tags-optimizer` — spot-check on Tier A pages: title length (50–60 chars), meta description length (140–160 chars), OG title/description/image, Twitter card, canonical URL, hreflang
- Manual JSON-LD validation — parse all `<script type="application/ld+json">` blocks and verify:
  - `FAQPage` present with ≥5 Q&A pairs
  - `BreadcrumbList` present
  - Medical schema present where applicable (`MedicalProcedure`, `MedicalTest`, `MedicalCondition`, or `MedicalClinic`)
  - `Person` schema for doctor attribution (Dr. Chanakan)
  - No schema errors (missing required fields, wrong `@type`)

**Output per page:** Meta score /10, Schema score /10, flagged issues

---

### Agent 3: Images + FAQ Agent

**Dimensions:** Images /10, FAQ /10

**Tools:**
- WebFetch — fetch raw HTML of each page

**Image checks:**
- Every `<img>` has a non-empty, descriptive `alt` attribute (not just filename)
- Hero image filename follows convention (descriptive slug, not `IMG_001.jpg`)
- Hero image is 1200×630 (or OG image tag references a 1200×630 image)
- OG `og:image` tag present and points to an accessible URL
- Images have `loading="lazy"` where appropriate (non-hero images)
- No broken image URLs (HTTP 200 check on `src` values)

**FAQ checks:**
- Page contains a visible FAQ section with ≥5 questions
- `FAQPage` JSON-LD is present and question text matches visible FAQ questions (no hidden FAQ only in schema)
- Questions cover user intent (e.g. price, safety, procedure, suitability) not just generic filler
- FAQ answers are substantive (≥2 sentences each)

**Output per page:** Images score /10, FAQ score /10, flagged issues

---

### Agent 4: Originality + E-E-A-T Agent

**Dimensions:** Originality /10, E-E-A-T /10

**Tools:**
- WebFetch — fetch page content, extract 3 key paragraphs or factual claims per page
- WebSearch — search for exact or near-exact matches of 2–3 sentences per page to detect copy-paste from other health sites, Wikipedia, or PubMed abstracts

**Originality checks:**
- Key sentences return no direct matches on other domains
- Content is phrased in Thrive's voice, not a generic rewrite of a competitor page
- Flag any section with >30 words matching a known source verbatim

**E-E-A-T checks (Experience, Expertise, Authoritativeness, Trustworthiness):**
- Doctor attribution section present: Dr. Chanakan Trangansri named with credentials
- Scientific references section present with ≥4 PubMed or peer-reviewed citations
- Clinic contact info present in footer (phone, LINE@, address, hours)
- PDPA/consent notice present on any form page
- No medical claims without supporting reference (flag unsupported superlatives)
- Hreflang tags present (th-TH, en, x-default)

**Output per page:** Originality score /10, E-E-A-T score /10, flagged issues

---

## Scoring Rubric

All dimensions use the same 10-point scale:

| Score | Meaning |
|-------|---------|
| 9–10 | Excellent — no significant issues |
| 7–8 | Good — minor issues, not blocking |
| 5–6 | Needs work — multiple issues, fix before launch |
| <5 | Critical — blocking launch for SEO/compliance risk |

**Overall page score** = average of all dimensions (8 dimensions for Tier A, 6 for Tier B).

Pages with overall score <7.0 are flagged as **needs attention** in the executive summary.

---

## Master Report Format

Written to: `docs/audits/master-audit.md`

This file is persistent and updated incrementally. Never overwritten in full — only rows are added or updated.

### Executive Summary (regenerated on each full sweep)

```markdown
# Thrive Launch Audit — Master Scorecard
Last full sweep: 2026-05-24
Site: https://new.thrivewellnessth.com/

## Site-Wide Averages
| SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Originality | Overall |
|-----|-----|------|--------|--------|-----|---------|-------------|---------|
| 7.8 | 6.9 | 8.2  | 7.5    | 8.6    | 7.1 | 7.0     | 8.8         | **7.7** |

## Pages Needing Attention (score < 7.0)
- /contact — 5.2 — missing FAQ, no schema
- /doctors — 6.1 — no doctor JSON-LD, missing OG image

## Top 5 Site-Wide Issues
1. GEO score low across all pages — answers not structured for AI snippet extraction
2. FAQPage schema missing on 4 pages
3. 12 images missing alt text across blog posts
4. E-E-A-T: 6 pages missing PubMed references
5. Meta descriptions exceed 160 chars on 8 pages
```

### Per-Page Scorecard Table

```markdown
## Page Scorecards

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall | Last Audited |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|--------------|
| /food-intolerance | 8 | 7 | 9 | 8 | 9 | 8 | 7 | 9 | 8.1 | 2026-05-24 |
| /adrenal-fatigue  | 8 | 7 | 8 | 8 | 8 | 8 | 7 | 9 | 7.9 | 2026-05-24 |
| /new-blog-post    | — | — | — | — | — | — | — | — | pending | — |
```

Scores older than 30 days are flagged `[stale]` in the table.

### Per-Page Detail Blocks

Each page also gets a detail block below the table (collapsed under a `<details>` tag in markdown):

```markdown
<details>
<summary>/food-intolerance — 8.1/10 — 2026-05-24</summary>

**Priority Actions:**
1. GEO: Add a direct-answer paragraph under the hero answering "what is food intolerance testing?" in 2–3 sentences — improves AI snippet eligibility
2. E-E-A-T: Add doctor's medical license number or clinic registration to Person JSON-LD
3. FAQ: Q5 answer is only 1 sentence — expand to ≥2 sentences for schema eligibility

**Full Dimension Scores:**
SEO 8/10 · GEO 7/10 · Meta 9/10 · Schema 8/10 · Images 9/10 · FAQ 8/10 · E-E-A-T 7/10 · Originality 9/10

</details>
```

---

## Confirmation Step (both modes)

Before any audit work begins, the skill prints:

```
THRIVE LAUNCH AUDIT
───────────────────
Site:    https://new.thrivewellnessth.com/
Mode:    Full site sweep
Scope:   24 Tier A pages + 80 Tier B blog posts
Agents:  4 parallel (SEO+GEO · Meta+Schema · Images+FAQ · Originality+E-E-A-T)
Output:  docs/audits/master-audit.md

Ready to start? (yes/no)
```

The skill does no fetching, searching, or analysis until the user confirms.

---

## Toprank Skills Used

| Toprank Skill | When Used | Pages |
|---|---|---|
| `toprank:seo-page` | Deep on-page SEO | All Tier A pages |
| `toprank:geo-optimizer` | AI search optimization | Top 10 pages by traffic |
| `toprank:meta-tags-optimizer` | Meta tag quality + OG | Tier A pages spot-check |
| `toprank:schema-markup-generator` | Schema validation + generation | Pages with missing/broken schema |

---

## Constraints and Guardrails

- The skill never modifies any source files in `astro/src/` — audit only, no auto-fixes
- Recommendations are written to the master report; the user applies them manually
- Plagiarism WebSearch uses 2–3 sentences per page maximum to stay within rate limits
- On rate-limit errors, the agent retries once then skips and flags the page as `plagiarism-check-skipped`
- The master file is committed to git after each run so audit history is preserved

---

## File Locations

| File | Purpose |
|---|---|
| `docs/audits/master-audit.md` | Living master scorecard (updated incrementally) |
| `docs/audits/YYYY-MM-DD-full-sweep.md` | Snapshot of each full sweep (never overwritten) |
| `.claude/skills/thrive-launch-audit/SKILL.md` | The skill instructions |

---

## Out of Scope

- Auto-fixing issues (skill is read-only)
- Auditing the live Wix site (`www.thrivewellnessth.com`)
- Performance / Core Web Vitals testing (separate Phase 6 checklist item)
- Broken link crawling (handled by `toprank:broken-link-checker` separately)
- Lead form functional testing (handled by Phase 6 manual checklist)
