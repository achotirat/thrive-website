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
