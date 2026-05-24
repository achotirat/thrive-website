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

## Step 1: Detect Mode

Check what argument was provided when the skill was invoked:

- **No argument** → **Full Site Sweep mode.** Audit all pages on the site. Continue to Step 2.
- **A URL was provided** (e.g. `https://new.thrivewellnessth.com/blog/my-post`) → **Incremental mode.** Audit only that one page. Skip to the "Incremental Mode" section at the bottom of this skill.

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
