# Full Site Sweep Snapshot — 2026-05-26

Site: https://new.thrivewellnessth.com/
Audited by: 4 parallel agents (SEO+GEO, Meta+Schema, Images+FAQ, E-E-A-T+Originality)
Pages audited: 22 Tier A service pages + 63 Tier B blog posts = 85 pages total

---

## Summary

| Metric | Value |
|--------|-------|
| Tier A average | **8.0/10** |
| Tier B live average | **0/10** (all 404) |
| Tier A pages passing (≥7.0) | **19 of 22** |
| Tier A pages critical (<6.0) | **1** (/thank-you) |
| Blog posts live | **0 of 63** |

---

## Critical Pre-Launch Blockers

1. **All 63 blog posts HTTP 404** — blog section not deployed on new subdomain. `/blog/` shows "ยังไม่มีบทความในขณะนี้". Fix: verify Sanity env vars in Netlify + debug `getStaticPaths()` in blog slug page.
2. **No hreflang tags on any page** — all 85 pages missing th-TH/en/x-default hreflang.
3. **Title tags too long site-wide** — most service pages exceed 60 chars (target 50–60).
4. **No MD license number displayed** — no page shows Dr. Chanakan's medical license number; important for E-E-A-T and Thai medical advertising compliance.
5. **No sitemap.xml** — Astro build has no sitemap integration; Google cannot discover pages programmatically.
6. **/thank-you not noindexed** — must add `<meta name="robots" content="noindex">`.

---

## Tier A Scores by Page

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|
| / | 6 | 5 | 7 | 6 | 8 | 8 | 6 | 8 | 6.8 |
| /food-intolerance | 7 | 7 | 8 | 10 | 10 | 8 | 7 | 8 | 8.1 |
| /adrenal-fatigue | 6 | 7 | 8 | 10 | 10 | 9 | 9 | 8 | 8.4 |
| /hormones-quiz | 6 | 7 | 8 | 10 | 10 | 8 | 9 | 9 | 8.4 |
| /hbot | 7 | 7 | 8 | 10 | 10 | 10 | 8 | 9 | 8.6 |
| /iv-drip | 7 | 7 | 9 | 10 | 10 | 9 | 7 | 7 | 8.3 |
| /gluta | 6 | 7 | 9 | 10 | 10 | 9 | 7 | 9 | 8.4 |
| /chelation | 6 | 7 | 8 | 10 | 10 | 9 | 8 | 8 | 8.3 |
| /personalized-vitamins | 6 | 7 | 8 | 10 | 10 | 8 | 7 | 9 | 8.1 |
| /nad | 6 | 8 | 9 | 10 | 10 | 9 | 7 | 8 | 8.4 |
| /nk-cell | 6 | 7 | 8 | 10 | 10 | 10 | 7 | 8 | 8.3 |
| /allergy-ige | 6 | 8 | 8 | 10 | 10 | 8 | 9 | 9 | 8.5 |
| /urine-organic-test | 6 | 7 | 8 | 10 | 10 | 8 | 7 | 9 | 8.1 |
| /vitamin-d | 7 | 7 | 8 | 10 | 10 | 9 | 7 | 9 | 8.4 |
| /vitamins-and-micronutrients | 6 | 7 | 9 | 6 | 10 | 9 | 7 | 9 | 7.9 |
| /check-up | 6 | 7 | 8 | 10 | 10 | 9 | 9 | 9 | 8.5 |
| /about | 5 | 5 | 6 | 7 | 10 | 8 | 4 | 9 | 6.8 |
| /oligoscan | 6 | 7 | 9 | 10 | 9 | 9 | 8 | 9 | 8.4 |
| /cancer-screening | 7 | 7 | 8 | 10 | 10 | 8 | 8 | 9 | 8.4 |
| /dna-test | 6 | 7 | 9 | 10 | 10 | 9 | 8 | 9 | 8.5 |
| /contact | 5 | 4 | 8 | 5 | 7 | 7 | 4 | 9 | 6.1 |
| /thank-you | 2 | 2 | 6 | 1 | 7 | 0 | 3 | 9 | 3.8 |

**Best performers:** /hbot (8.6), /allergy-ige (8.5), /check-up (8.5), /dna-test (8.5)
**Needs work:** /thank-you (3.8), /contact (6.1), / homepage (6.8), /about (6.8)

---

## Key Findings by Dimension

### SEO (avg 6.1/10)
- Consistent weakness: title tags too long (most service pages 70+ chars, target 50–60)
- No sitemap.xml — Astro build missing sitemap integration
- Good: canonical tags present, URL slugs are clean and keyword-rich

### GEO (avg 6.7/10)
- Strong content on service pages (medical specificity good)
- Homepage GEO weakest (5/10) — needs expert quotes, statistics with sources, TL;DR box
- No hreflang on any page — critical for Thai-language targeting

### Meta (avg 7.9/10)
- Good overall — og:image now present and valid on all Tier A pages ✓
- Weakness: meta descriptions too short on several pages

### Schema (avg 9.0/10 for service pages)
- Excellent: FAQPage + BreadcrumbList + MedicalProcedure/Test + Person JSON-LD on all service pages
- /vitamins-and-micronutrients missing full schema (6/10)
- /thank-you has minimal schema (1/10)
- All blog pages will need Article + FAQPage JSON-LD when deployed

### Images (avg 9.5/10 for service pages)
- Major improvement since 2026-05-24 audit — all service pages now 9–10/10
- Hero images: correct `loading="eager"`, keyword-rich filenames, descriptive alt text
- Secondary images: `loading="lazy"` correctly applied
- Only issues: homepage uses CSS background (not `<img>` tag), contact/thank-you use generic og:image

### FAQ (avg 8.5/10 for service pages)
- All service pages have visible HTML FAQ + matching FAQPage JSON-LD ✓
- Best: /hbot and /nk-cell (10/10) — use as templates
- Most common gap: 15 of 21 service pages missing explicit price/cost FAQ question
- Most common gap: FAQ answers are single Thai compound sentences — need 2+ sentences for rich-snippet eligibility

### E-E-A-T (avg 7.0/10)
- Strongest: /adrenal-fatigue, /hormones-quiz, /check-up, /allergy-ige (all 9/10)
- Weakest: /about (4/10), /contact (4/10), /thank-you (3/10)
- No MD license number displayed on any page — site-wide issue
- Content risk: /adrenal-fatigue and /nad have near-verbatim sections

### Originality (avg 8.7/10)
- Strong overall — Thai-language content naturally differentiates
- Risk pages: /iv-drip (7/10), /adrenal-fatigue (8/10), /nad (8/10)
- Critical: /blog/growth-factor (6/10) — must rewrite before launch

---

## Audit Methodology

- **Tier A** (22 pages): Full 8-dimension audit (SEO, GEO, Meta, Schema, Images, FAQ, E-E-A-T, Orig)
- **Tier B** (63 pages): 6-dimension content audit (Meta, Schema, Images, FAQ, E-E-A-T, Orig); all returned HTTP 404 on live site
- **Scoring**: 1–10 per dimension; Overall = average of all applicable dimensions
- **Agents**: 4 parallel agents, each auditing 2 dimensions across all 85 pages
- **Source**: Live HTTP fetches from new.thrivewellnessth.com; Sanity CMS queries for blog content
