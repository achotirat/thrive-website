# Thrive Launch Audit Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/thrive-launch-audit` Claude Code skill that audits the Thrive Astro site across 8 dimensions (SEO, GEO, meta, schema, images, FAQ, E-E-A-T, originality) using 4 parallel sub-agents, writing a persistent master scorecard.

**Architecture:** A single SKILL.md instructs Claude to detect invocation mode (full sweep vs single page), confirm scope with the user, then dispatch 4 parallel sub-agents via the Agent tool. Each agent processes all pages within its dimension set, returns structured JSON results, and the orchestrator merges outputs into `docs/audits/master-audit.md`.

**Tech Stack:** Claude Code skills (SKILL.md), Agent tool (parallel sub-agents), toprank skills (`seo-page`, `geo-optimizer`, `meta-tags-optimizer`, `schema-markup-generator`), WebFetch, WebSearch.

**Spec:** `docs/superpowers/specs/2026-05-24-thrive-launch-audit-design.md`

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md` | The complete skill instructions |
| Create | `docs/audits/master-audit.md` | Persistent master scorecard (template, all Tier A pages pre-populated as `pending`) |

---

## Task 1: Create Skill Scaffold (Frontmatter + Overview)

**Files:**
- Create: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Create the skills directory**

```bash
mkdir -p /Users/kook/.claude/skills/thrive-launch-audit
```

- [ ] **Step 2: Write the skill file with frontmatter and overview**

Create `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md` with this exact content:

```markdown
---
name: thrive-launch-audit
description: >
  Pre-launch content audit for the Thrive Wellness Astro site. Audits 8 dimensions —
  SEO, GEO, meta tags, schema/FAQ, images, E-E-A-T, and originality — across all pages
  using 4 parallel sub-agents and toprank skills. Produces a persistent master scorecard
  at docs/audits/master-audit.md. Use for full site sweep before cutover or single-page
  incremental audits after adding new pages.
---

# Thrive Launch Audit

You are running a comprehensive pre-launch content audit for the Thrive Wellness Astro site.

Site: `https://new.thrivewellnessth.com/`
Master scorecard: `docs/audits/master-audit.md` (in the thrive-website repo)
```

- [ ] **Step 3: Verify file was created and frontmatter parses cleanly**

```bash
head -20 /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

Expected output: frontmatter block followed by the title and opening paragraph.

- [ ] **Step 4: Commit scaffold**

```bash
cd /Users/kook/.claude && git add skills/thrive-launch-audit/SKILL.md && git commit -m "feat: scaffold thrive-launch-audit skill"
```

---

## Task 2: Write Mode Detection Section

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append the mode detection section**

Append to the end of the SKILL.md:

```markdown

## Step 1: Detect Mode

Check what argument was provided when the skill was invoked:

- **No argument** → **Full Site Sweep mode.** Audit all pages on the site. Continue to Step 2.
- **A URL was provided** (e.g. `https://new.thrivewellnessth.com/blog/my-post`) → **Incremental mode.** Audit only that one page. Skip to the "Incremental Mode" section at the bottom of this skill.
```

- [ ] **Step 2: Verify the section was appended correctly**

```bash
grep -n "Mode" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

Expected: lines referencing "Detect Mode", "Full Site Sweep mode", "Incremental mode".

---

## Task 3: Write Page Discovery Section

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append the page discovery section**

Append to the end of SKILL.md:

```markdown

## Step 2: Discover Pages (Full Sweep Mode)

Fetch the sitemap to enumerate all pages:

```
WebFetch: https://new.thrivewellnessth.com/sitemap.xml
```

Parse all `<loc>` values. Group into two tiers:

**Tier A — Service and Info Pages** (full 8-dimension audit):
All URLs that do NOT contain `/blog/` in the path. This includes:
`/`, `/food-intolerance`, `/adrenal-fatigue`, `/hormones-quiz`, `/hbot`, `/iv-drip`,
`/gluta`, `/chelation`, `/personalized-vitamins`, `/nad`, `/nk-cell`, `/allergy-ige`,
`/urine-organic-test`, `/vitamin-d`, `/vitamins-and-micronutrients`, `/check-up`,
`/about`, `/oligoscan`, `/cancer-screening`, `/dna-test`, `/contact`, `/doctors`,
`/thank-you`

**Tier B — Blog Posts** (6-dimension audit, no deep seo-page call):
All URLs containing `/blog/` in the path. Process in traffic priority order — higher-traffic
posts first. Traffic order reference: SITE-TRACKER.md in the repo.

If the sitemap fetch fails or returns no URLs, fall back to the Tier A list above plus
fetch `https://new.thrivewellnessth.com/blog/` and parse all blog post links from the HTML.

Record the total page count per tier. You will need this for the confirmation prompt.
```

- [ ] **Step 2: Verify by reading back the section**

```bash
grep -n "Tier A\|Tier B\|sitemap" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

Expected: references to sitemap fetch, Tier A, Tier B, and the fallback logic.

---

## Task 4: Write Confirmation Prompt Section

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append the confirmation section**

Append to the end of SKILL.md:

```markdown

## Step 3: Confirm Scope with User

Before doing ANY auditing, print the following confirmation block and wait for the user
to reply "yes", "go", "start", or similar confirmation. Do NOT proceed until confirmed.

```
THRIVE LAUNCH AUDIT
───────────────────
Site:    https://new.thrivewellnessth.com/
Mode:    Full site sweep
Scope:   [N] Tier A pages (full 8-dimension audit)
         [N] Tier B blog posts (6-dimension audit)
Agents:  4 parallel
         · Agent 1 — SEO + GEO  (uses toprank:seo-page + toprank:geo-optimizer on all Tier A)
         · Agent 2 — Meta + Schema  (HTML analysis + toprank:meta-tags-optimizer spot-checks)
         · Agent 3 — Images + FAQ  (HTML analysis, alt text, JSON-LD FAQ validation)
         · Agent 4 — Originality + E-E-A-T  (WebSearch plagiarism + doctor/reference checks)
Output:  docs/audits/master-audit.md (updated in place)
         docs/audits/[YYYY-MM-DD]-full-sweep-snapshot.md (new snapshot)

Ready to start? (yes/no)
```

Fill in `[N]` with the actual page counts discovered in Step 2.
If the user says no or asks to change scope, adjust and re-confirm before proceeding.
```

- [ ] **Step 2: Verify the section was added**

```bash
grep -n "THRIVE LAUNCH AUDIT\|Ready to start" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

Expected: both lines found.

---

## Task 5: Write Sub-Agent Dispatch Section

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append the dispatch section**

Append to the end of SKILL.md:

```markdown

## Step 4: Dispatch Parallel Sub-Agents

After the user confirms, use the Agent tool to dispatch all 4 agents in a **single message**
(parallel dispatch). Pass the full Tier A page list and Tier B page list to each agent
in their prompt. Each agent must return a JSON block as its final output — do not accept
prose-only responses.

Dispatch all four agents simultaneously by including all four Agent tool calls in one
response. Wait for all four to complete before proceeding to Step 5.

The exact prompts for each agent are defined in the "Agent Prompts" section below.
Substitute `[TIER_A_URLS]` and `[TIER_B_URLS]` with the actual comma-separated URL lists
from Step 2.
```

- [ ] **Step 2: Verify section was added**

```bash
grep -n "Dispatch\|parallel\|TIER_A_URLS" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

---

## Task 6: Write Agent 1 Prompt (SEO + GEO)

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append Agent 1 prompt to SKILL.md**

Append to the end of SKILL.md:

```markdown

## Agent Prompts

### Agent 1: SEO + GEO

Use this exact prompt when dispatching Agent 1:

---
You are running the SEO + GEO audit for the Thrive Wellness website pre-launch review.

**Tier A pages to audit (full depth):** [TIER_A_URLS]
**Tier B pages to audit (light check):** [TIER_B_URLS]

**For each Tier A page**, do the following in order:

1. Use the Skill tool to invoke `toprank:seo-page` with the page URL. Extract:
   - Overall SEO score (convert to /10 if not already)
   - Top 3 SEO issues identified

2. Use the Skill tool to invoke `toprank:geo-optimizer` with the page URL. Extract:
   - Overall GEO/AI-search score (convert to /10)
   - Top 3 GEO issues (e.g. "no direct-answer paragraph", "entities not explicit", "no FAQ structured for AI snippet")

**For each Tier B page**, do the following (lighter check):
1. Use WebFetch to retrieve the page HTML
2. Check manually:
   - Title tag present, 50–60 characters, contains primary keyword
   - H1 present and matches title intent
   - Primary keyword appears in URL slug
   - Meta description present, 140–160 characters
   - At least 3 internal links to related service pages
3. Score SEO manually /10:
   - 9–10: all 5 checks pass
   - 7–8: 4/5 pass
   - 5–6: 3/5 pass
   - <5: ≤2 pass
4. GEO score for Tier B: check if the page contains at least one paragraph that directly
   answers a "what is X" or "how does X work" question in 2–3 sentences. Score:
   - Present and clear: 8/10
   - Present but vague: 6/10
   - Missing: 4/10

**Return your results as a JSON block at the end of your response**, in this exact format:

```json
{
  "agent": "seo_geo",
  "results": [
    {
      "url": "https://new.thrivewellnessth.com/food-intolerance",
      "tier": "A",
      "seo_score": 8,
      "geo_score": 7,
      "seo_issues": ["issue 1", "issue 2", "issue 3"],
      "geo_issues": ["issue 1", "issue 2", "issue 3"],
      "top_actions": ["action 1", "action 2", "action 3"]
    }
  ]
}
```

`top_actions` should be the 3 highest-priority fixes across both SEO and GEO for that page,
written as specific actionable recommendations (not generic advice).
---
```

- [ ] **Step 2: Verify Agent 1 prompt was appended**

```bash
grep -n "Agent 1\|seo_geo\|toprank:seo-page" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

Expected: all three lines found.

---

## Task 7: Write Agent 2 Prompt (Meta + Schema)

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append Agent 2 prompt**

Append to the end of SKILL.md:

```markdown

### Agent 2: Meta Tags + Schema

Use this exact prompt when dispatching Agent 2:

---
You are running the Meta Tags + Schema audit for the Thrive Wellness website pre-launch review.

**All pages to audit (Tier A + Tier B):** [TIER_A_URLS] and [TIER_B_URLS]

**For each page**, use WebFetch to retrieve the raw HTML, then check:

**Meta Tag Checks (score /10):**
- `<title>` present, 50–60 characters (+2 points)
- `<meta name="description">` present, 140–160 characters (+2 points)
- `og:title`, `og:description`, `og:image` all present (+2 points)
- `twitter:card`, `twitter:title` present (+1 point)
- `<link rel="canonical">` present and correct (+1 point)
- `hreflang` tags present: th-TH, en, x-default (+2 points)

**Schema/JSON-LD Checks (score /10):**
Parse all `<script type="application/ld+json">` blocks. Check:
- `FAQPage` schema present with ≥5 Q&A pairs (+3 points)
- `BreadcrumbList` schema present (+1 point)
- At least one medical schema present: `MedicalProcedure`, `MedicalTest`,
  `MedicalCondition`, or `MedicalClinic` (+3 points)
- `Person` schema with `name: "Chanakan Trangansri"` or "ชนากานต์ ตระหง่านศรี" (+2 points)
- No schema errors: required fields present, correct `@type` values (+1 point)

For Tier A pages with Meta score <8, also invoke `toprank:meta-tags-optimizer` via the
Skill tool and include its top recommendation in the issues list.

**Return results as JSON at the end of your response:**

```json
{
  "agent": "meta_schema",
  "results": [
    {
      "url": "https://new.thrivewellnessth.com/food-intolerance",
      "tier": "A",
      "meta_score": 9,
      "schema_score": 8,
      "meta_issues": ["og:image missing", "hreflang x-default absent"],
      "schema_issues": ["FAQPage has only 4 Q&A pairs"],
      "top_actions": ["action 1", "action 2", "action 3"]
    }
  ]
}
```
---
```

- [ ] **Step 2: Verify Agent 2 prompt was appended**

```bash
grep -n "Agent 2\|meta_schema\|FAQPage" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

---

## Task 8: Write Agent 3 Prompt (Images + FAQ)

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append Agent 3 prompt**

Append to the end of SKILL.md:

```markdown

### Agent 3: Images + FAQ

Use this exact prompt when dispatching Agent 3:

---
You are running the Images + FAQ audit for the Thrive Wellness website pre-launch review.

**All pages to audit (Tier A + Tier B):** [TIER_A_URLS] and [TIER_B_URLS]

**For each page**, use WebFetch to retrieve the raw HTML, then check:

**Image Checks (score /10):**
- Every `<img>` tag has a non-empty `alt` attribute that describes the image content
  (not just the filename). Missing or filename-only alts: -1 point each, max -4 points.
- Hero image filename is descriptive (contains topic keywords, e.g.
  `food-intolerance-igg-hero-1200x630.jpg`). Generic filename (img001.jpg etc): -2 points.
- `og:image` meta tag is present and the URL resolves (HTTP 200). Verify with WebFetch.
  Missing or broken: -2 points.
- Non-hero images have `loading="lazy"` attribute. Missing on >3 images: -1 point.
- No `<img>` tags with broken `src` URLs (verify top 3 images per page with WebFetch).
  Broken image: -1 point each.
Start from 10 and deduct. Floor at 0.

**FAQ Checks (score /10):**
- Page contains a visible FAQ section in the HTML body (not just in JSON-LD): +3 points
- FAQ section has ≥5 questions: +2 points (if 3–4 questions: +1 point)
- Questions cover practical user intent: at least one question about price/cost, one about
  who is suitable, one about the procedure or safety: +2 points
- All FAQ answers are ≥2 sentences long: +2 points
- FAQ questions in the visible HTML match the FAQPage JSON-LD questions (no hidden FAQ):
  +1 point

**Return results as JSON at the end of your response:**

```json
{
  "agent": "images_faq",
  "results": [
    {
      "url": "https://new.thrivewellnessth.com/food-intolerance",
      "tier": "A",
      "images_score": 9,
      "faq_score": 8,
      "images_issues": ["3 imgs missing alt text", "og:image returns 404"],
      "faq_issues": ["FAQ has only 4 questions", "no price/cost question"],
      "top_actions": ["action 1", "action 2", "action 3"]
    }
  ]
}
```
---
```

- [ ] **Step 2: Verify Agent 3 prompt was appended**

```bash
grep -n "Agent 3\|images_faq\|loading=\"lazy\"" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

---

## Task 9: Write Agent 4 Prompt (Originality + E-E-A-T)

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append Agent 4 prompt**

Append to the end of SKILL.md:

```markdown

### Agent 4: Originality + E-E-A-T

Use this exact prompt when dispatching Agent 4:

---
You are running the Originality + E-E-A-T audit for the Thrive Wellness website
pre-launch review.

**All pages to audit (Tier A + Tier B):** [TIER_A_URLS] and [TIER_B_URLS]

**For each page**, use WebFetch to retrieve the page content, then:

**Originality Check (score /10):**
1. Extract 3 distinctive sentences or factual claims from the page body (not headings,
   not footer). Choose sentences that make specific claims (not generic wellness statements).
2. For each sentence, use WebSearch to search for it in quotes. Check if it appears
   verbatim or near-verbatim on other websites.
3. Scoring:
   - 0 matches found for all 3: 10/10
   - 1 partial match found: 8/10
   - 1 exact match found OR 2 partial matches: 6/10
   - 2+ exact matches OR copied from a known health/medical site: 4/10
   - Clear copy-paste from another source (3 matches): 2/10
4. If rate limiting occurs, mark the page as `originality_check_skipped` and move on.
   Do not retry more than once per page.

**E-E-A-T Check (score /10):**
Inspect the page HTML for the following signals:
- Doctor attribution section present: Dr. Chanakan Trangansri (ชนากานต์ ตระหง่านศรี)
  named with specialty/credentials (+2 points)
- Scientific references section present with ≥4 citations (PubMed, peer-reviewed journals,
  or named studies) (+2 points)
- Clinic contact information present in footer or contact section: phone, LINE@, address,
  opening hours (+2 points)
- No unsupported superlative medical claims (e.g. "guaranteed to cure", "100% effective"
  without citation) (+2 points)
- Hreflang tags present in HTML head (+1 point)
- PDPA / consent notice present on any page with a form or data collection (+1 point,
  or N/A if no form)

**Return results as JSON at the end of your response:**

```json
{
  "agent": "originality_eeat",
  "results": [
    {
      "url": "https://new.thrivewellnessth.com/food-intolerance",
      "tier": "A",
      "originality_score": 9,
      "eeat_score": 7,
      "originality_issues": [],
      "eeat_issues": ["no medical license number in Person JSON-LD", "PDPA notice missing on lead form"],
      "top_actions": ["action 1", "action 2", "action 3"],
      "originality_check_skipped": false
    }
  ]
}
```
---
```

- [ ] **Step 2: Verify Agent 4 prompt was appended**

```bash
grep -n "Agent 4\|originality_eeat\|E-E-A-T" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

---

## Task 10: Write Report Merge + Master File Update

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append the merge and write section**

Append to the end of SKILL.md:

```markdown

## Step 5: Merge Results and Write Master Report

After all 4 agents complete, merge their JSON outputs by URL key.

**For each page**, combine results from all agents into one row:

```
url | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Originality | Overall | Last Audited
```

`Overall` = average of all dimension scores (8 dimensions for Tier A, 6 for Tier B —
omit SEO and GEO from Tier B average since those used the lighter check).

**Merge algorithm:**
1. Build a dictionary keyed by URL from each agent's results array
2. For each URL, pull each score from the matching agent result
3. Calculate overall as mean of all dimension scores, rounded to 1 decimal place
4. If `originality_check_skipped: true`, mark originality as `?` and exclude from average

**Write two files:**

### File 1: docs/audits/master-audit.md (update in place)

Load the existing file. For each audited URL:
- If the URL already has a row in the scorecard table: replace the entire row and update
  its `<details>` block
- If the URL is new: append a new row and `<details>` block

Update the Executive Summary section at the top with fresh site-wide averages and
recalculate "Pages Needing Attention" (overall score < 7.0).

### File 2: docs/audits/[YYYY-MM-DD]-full-sweep-snapshot.md (create new)

Write a full snapshot of this sweep. Same format as master-audit.md but named with
today's date. Never overwrite an existing snapshot.

**Print to terminal after writing:**

```
AUDIT COMPLETE
──────────────
Pages audited: [N] Tier A + [N] Tier B
Site average:  [X.X]/10
Needs attention (< 7.0): [N pages, list URLs]
Master scorecard: docs/audits/master-audit.md
Snapshot: docs/audits/[YYYY-MM-DD]-full-sweep-snapshot.md
```

**Commit both files:**
```bash
git add docs/audits/
git commit -m "audit: full site sweep [YYYY-MM-DD] — [N] pages, avg [X.X]/10"
```
```

- [ ] **Step 2: Verify merge section was appended**

```bash
grep -n "Merge Results\|master-audit\|AUDIT COMPLETE" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

---

## Task 11: Write Incremental Mode Section

**Files:**
- Modify: `/Users/kook/.claude/skills/thrive-launch-audit/SKILL.md`

- [ ] **Step 1: Append incremental mode section**

Append to the end of SKILL.md:

```markdown

---

## Incremental Mode (Single Page)

This mode runs when a URL was provided as an argument to the skill invocation.

### Step I-1: Confirm Scope

Print:

```
THRIVE LAUNCH AUDIT — Single Page
──────────────────────────────────
Page:  [URL provided]
Mode:  Incremental (updates master-audit.md for this page only)
Audit: 8 dimensions (Tier A) or 6 dimensions (Tier B, auto-detected)
       SEO · GEO · Meta · Schema · Images · FAQ · E-E-A-T · Originality

Ready to start? (yes/no)
```

Auto-detect tier: if the URL contains `/blog/`, it is Tier B (6 dimensions).
Otherwise it is Tier A (8 dimensions).

### Step I-2: Run All 4 Audits Sequentially (single page, no parallel needed)

Run each of the 4 audit sets described above, but for only the one page.
For toprank skill invocations, pass the single page URL.

**For Agent 1 (SEO+GEO):** Run `toprank:seo-page` and `toprank:geo-optimizer`
directly (not via sub-agent). Parse scores and issues as defined in Agent 1 prompt above.

**For Agent 2 (Meta+Schema):** Use WebFetch + manual JSON-LD checks as defined above.
Run `toprank:meta-tags-optimizer` if Meta score < 8.

**For Agent 3 (Images+FAQ):** Use WebFetch + manual checks as defined above.

**For Agent 4 (Originality+E-E-A-T):** Use WebFetch + WebSearch as defined above.

### Step I-3: Update Master File

1. Load `docs/audits/master-audit.md`
2. Find the row for this URL in the scorecard table
3. Replace the row with updated scores and today's date as `last_audited`
4. Replace the `<details>` block for this URL with fresh priority actions
5. Recalculate site-wide averages in the Executive Summary
6. Save the file

### Step I-4: Print Result and Commit

```
SINGLE-PAGE AUDIT COMPLETE
───────────────────────────
Page:    [URL]
Overall: [X.X]/10
SEO [N] · GEO [N] · Meta [N] · Schema [N] · Images [N] · FAQ [N] · E-E-A-T [N] · Orig [N]

Priority Actions:
1. [action]
2. [action]
3. [action]

Master scorecard updated: docs/audits/master-audit.md
```

```bash
git add docs/audits/master-audit.md
git commit -m "audit: single-page [slug] [YYYY-MM-DD] — [X.X]/10"
```
```

- [ ] **Step 2: Verify incremental section was appended**

```bash
grep -n "Incremental Mode\|Step I-1\|Step I-2" /Users/kook/.claude/skills/thrive-launch-audit/SKILL.md
```

- [ ] **Step 3: Commit the complete skill file**

```bash
cd /Users/kook/.claude && git add skills/thrive-launch-audit/SKILL.md && git commit -m "feat: complete thrive-launch-audit skill — full sweep + incremental modes"
```

---

## Task 12: Create Master Audit Template

**Files:**
- Create: `docs/audits/master-audit.md` (in the thrive-website repo)

- [ ] **Step 1: Create the docs/audits directory and template file**

```bash
mkdir -p /Users/kook/Documents/Claude/Projects/thrive-website/docs/audits
```

Create `docs/audits/master-audit.md` with this exact content:

```markdown
# Thrive Launch Audit — Master Scorecard

Last full sweep: _not yet run_
Site: https://new.thrivewellnessth.com/

---

## Executive Summary

_Run `/thrive-launch-audit` to populate this section._

---

## Page Scorecards

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall | Last Audited |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|--------------|
| /food-intolerance | — | — | — | — | — | — | — | — | pending | — |
| /adrenal-fatigue | — | — | — | — | — | — | — | — | pending | — |
| /hormones-quiz | — | — | — | — | — | — | — | — | pending | — |
| /hbot | — | — | — | — | — | — | — | — | pending | — |
| /iv-drip | — | — | — | — | — | — | — | — | pending | — |
| / (homepage) | — | — | — | — | — | — | — | — | pending | — |
| /gluta | — | — | — | — | — | — | — | — | pending | — |
| /chelation | — | — | — | — | — | — | — | — | pending | — |
| /personalized-vitamins | — | — | — | — | — | — | — | — | pending | — |
| /nad | — | — | — | — | — | — | — | — | pending | — |
| /nk-cell | — | — | — | — | — | — | — | — | pending | — |
| /allergy-ige | — | — | — | — | — | — | — | — | pending | — |
| /urine-organic-test | — | — | — | — | — | — | — | — | pending | — |
| /vitamin-d | — | — | — | — | — | — | — | — | pending | — |
| /vitamins-and-micronutrients | — | — | — | — | — | — | — | — | pending | — |
| /check-up | — | — | — | — | — | — | — | — | pending | — |
| /about | — | — | — | — | — | — | — | — | pending | — |
| /oligoscan | — | — | — | — | — | — | — | — | pending | — |
| /cancer-screening | — | — | — | — | — | — | — | — | pending | — |
| /dna-test | — | — | — | — | — | — | — | — | pending | — |
| /contact | — | — | — | — | — | — | — | — | pending | — |
| /doctors | — | — | — | — | — | — | — | — | pending | — |
| /thank-you | — | — | — | — | — | — | — | — | pending | — |

_Blog posts will be appended here after the first full sweep._

---

## Page Detail Blocks

_Populated by `/thrive-launch-audit` after each run._
```

- [ ] **Step 2: Verify file was created**

```bash
grep -c "pending" /Users/kook/Documents/Claude/Projects/thrive-website/docs/audits/master-audit.md
```

Expected output: `23` (one "pending" per Tier A page).

- [ ] **Step 3: Commit the template**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website && git add docs/audits/master-audit.md && git commit -m "feat: add master-audit.md template with all Tier A pages pre-populated"
```

---

## Task 13: Verify the Skill Works on One Page

This is a dry-run verification. Invoke the skill on a single known page and confirm it
produces correctly structured output.

- [ ] **Step 1: Invoke the skill in incremental mode**

In the Claude Code CLI within the thrive-website repo:

```
/thrive-launch-audit https://new.thrivewellnessth.com/food-intolerance
```

- [ ] **Step 2: Confirm the confirmation prompt appears correctly**

Expected: the skill prints the "THRIVE LAUNCH AUDIT — Single Page" block with the URL
and 8 dimensions listed, then pauses and waits for "yes/no".

Do NOT proceed past this point automatically — wait for user confirmation in the actual
skill invocation.

- [ ] **Step 3: After user confirms, verify audit runs through all 4 dimensions**

Expected sequence:
1. SEO check via `toprank:seo-page` on the food-intolerance page
2. GEO check via `toprank:geo-optimizer` on the same page
3. Meta/Schema check via WebFetch + JSON-LD parsing
4. Images/FAQ check via WebFetch
5. Originality/E-E-A-T check via WebFetch + 2-3 WebSearch calls

- [ ] **Step 4: Verify master-audit.md was updated**

```bash
grep "food-intolerance" /Users/kook/Documents/Claude/Projects/thrive-website/docs/audits/master-audit.md
```

Expected: the `/food-intolerance` row now has actual scores instead of `—`.

- [ ] **Step 5: Verify a git commit was created**

```bash
git log --oneline -3
```

Expected: most recent commit message starts with `audit: single-page food-intolerance`.

---

## Self-Review

**Spec coverage check:**

| Spec Requirement | Task |
|---|---|
| Full site sweep mode | Tasks 2–5, 10 |
| Incremental (single page) mode | Task 11 |
| Confirmation before auditing | Task 4 |
| Agent 1: SEO + GEO, toprank:seo-page + toprank:geo-optimizer on all Tier A | Task 6 |
| Agent 2: Meta tags + Schema, JSON-LD validation | Task 7 |
| Agent 3: Images + FAQ, alt text, 1200×630, FAQPage | Task 8 |
| Agent 4: Originality (WebSearch) + E-E-A-T | Task 9 |
| Parallel dispatch via Agent tool | Task 5 |
| Master scorecard at docs/audits/master-audit.md | Tasks 10, 12 |
| Snapshot file per full sweep | Task 10 |
| Tier A: 8 dimensions; Tier B: 6 dimensions | Tasks 3, 6, 11 |
| Stale flag for scores >30 days old | Not yet in SKILL.md — add to Task 10 merge logic |
| toprank:schema-markup-generator for pages with broken schema | Task 7 |

**Fix — stale flag missing:** Add to the merge logic in Task 10:

In the master-audit.md scorecard table, any row where `last_audited` is more than 30
days before today's date should have `[stale]` appended to the date cell. The skill
should check dates when loading the master file and add the flag during the update step.

Add this note to Task 10, Step 1, under the "update in place" bullet:
> When loading the existing master-audit.md, scan all `last_audited` dates. Any date
> more than 30 days before today: append ` [stale]` to that cell if not already marked.

This is a self-review fix — it's included here and should be added to the SKILL.md
during execution of Task 10.
