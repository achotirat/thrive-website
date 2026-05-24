# Thrive Launch Audit — Master Scorecard

Last full sweep: _not yet run_
Site: https://new.thrivewellnessth.com/

---

## Executive Summary

**Pages audited:** 1 of 23 Tier A pages
**Site average (audited pages):** 7.5/10
**Pages needing attention (< 7.0):** none yet — GEO is the lowest dimension at 5.0 (blocked by robots.txt)

---

## Page Scorecards

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall | Last Audited |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|--------------|
| /food-intolerance | 7.3 | 5.0 | 8.5 | 6.5 | 9.0 | 7.0 | 8.0 | 9.0 | **7.5** | 2026-05-24 |
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

---

<details>
<summary><strong>/food-intolerance</strong> — Overall 7.5/10 — Audited 2026-05-24</summary>

**Scores:** SEO 7.3 · GEO 5.0 · Meta 8.5 · Schema 6.5 · Images 9.0 · FAQ 7.0 · E-E-A-T 8.0 · Orig 9.0

**Priority Actions:**

1. 🔴 **robots.txt `Disallow: /` must be removed before launch** — blocks all Google bots AND all AI crawlers (GPTBot, ClaudeBot, PerplexityBot). Single highest-impact fix. Also update `astro.config.mjs` `site:` from `https://new.thrivewellnessth.com` to `https://www.thrivewellnessth.com` at DNS cutover.

2. 🔴 **FAQPage JSON-LD has only 1 of 5 Q&A pairs** — the visible FAQ section has 5 questions but only 1 is in the schema's `mainEntity` array. All 5 must be in the JSON-LD for Google rich results eligibility. Also add a 6th FAQ on pricing ("ราคาตรวจ IgG 216 ชนิดที่ Thrive เท่าไหร่?") to capture commercial queries.

3. 🟡 **No PDPA consent notice on LeadForm** — the form collects name/phone/email with no consent checkbox. Thai PDPA 2019 requires explicit opt-in. Add checkbox: "ยินยอมให้เก็บข้อมูลส่วนบุคคลเพื่อติดต่อนัดหมาย ตาม พ.ร.บ. PDPA พ.ศ. 2562" + link to privacy policy.

4. 🟡 **GEO: Add 2 named expert quotes + expand citations to ≥4 from ≥3 source types** — currently 0 expert quotes (biggest GEO gap; +41% PAWC lift per Princeton research). Cite Shakoor Z et al. directly from their abstract. Add Thai Ministry of Health or ACAAI reference as a second source type. This moves GEO from 5.0 → ~7.0.

5. 🟡 **GEO: Add TL;DR box with direct answer in first 150 words** — PAWC decay means first sentences are worth 5× later ones. Add a Key Takeaways box immediately after the hero section.

**Dimension notes:**
- **Meta (8.5):** All OG + Twitter tags present ✅. Meta description at 118 chars (target 140–160) — add CTA phrase to lengthen. Title ~62 chars (slightly over 60 but acceptable for Thai pixel width).
- **Schema (6.5):** MedicalTest + MedicalClinic + Person + BreadcrumbList all present ✅. FAQPage incomplete (1/5 Q&A). Add `author.sameAs` to Person schema. Add `Article` schema baseline for GEO.
- **Images (9.0):** All 3 images have descriptive alt text ✅. Hero filename keyword-rich ✅. Verify `loading="lazy"` on logo and doctor images in their components.
- **FAQ (7.0):** 5 visible questions ✅. 2 of 5 answers are single-sentence (FAQ Q4 and Q5 need expansion to ≥2 sentences). No price/cost FAQ — add one.
- **E-E-A-T (8.0):** Doctor attribution ✅. Contact info ✅. No unsupported superlatives ✅. Hreflang ✅. Only 2 scientific references (need ≥4). PDPA missing on lead form.
- **Originality (9.0):** No exact matches on 3 tested sentences. Thai wellness phrasing on leaky gut is common topic but Thrive's phrasing is distinct.
- **GEO (5.0):** Entire site AI-crawler blocked. SSR ✅. IgE vs IgG table and numbered steps are strong extraction targets once crawling is enabled. No expert quotes, no TL;DR box, no `Article` schema.

</details>
