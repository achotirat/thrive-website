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

### /food-intolerance — 7.5/10 — Audited 2026-05-24

**Scores:** SEO 7.3 · GEO 5.0 · Meta 8.5 · Schema 6.5 · Images 9.0 · FAQ 7.0 · E-E-A-T 8.0 · Orig 9.0

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Satemshi | **Remove `robots.txt Disallow: /` before launch.** Currently blocks all Google bots and AI crawlers (GPTBot, ClaudeBot, PerplexityBot). Also update `astro.config.mjs` `site:` from `https://new.thrivewellnessth.com` → `https://www.thrivewellnessth.com` at DNS cutover. |
| 2 | 🔴 Critical | Facade | **Fix FAQPage JSON-LD — add all 5 Q&A pairs.** File: `astro/src/content/services/food-intolerance.mdx`, `jsonLd[].@graph[FAQPage].mainEntity`. Currently only 1 of 5 questions is in the schema; all 5 must be there for Google FAQ rich results. Also add a 6th FAQ: "ราคาตรวจ IgG 216 ชนิดที่ Thrive เท่าไหร่?" |
| 3 | 🟡 High | Facade | **Add PDPA consent checkbox to LeadForm.** File: `astro/src/components/LeadForm.astro`. Add: `"ยินยอมให้เก็บข้อมูลส่วนบุคคลเพื่อติดต่อนัดหมาย ตาม พ.ร.บ. PDPA พ.ศ. 2562"` + link to `/privacy-policy`. Thai PDPA 2019 requires this on any form that collects name/phone/email. |
| 4 | 🟡 High | Content (vkasama) | **Add 2 named expert quotes to page body.** Quote Shakoor Z et al. directly from their Annals of Saudi Medicine abstract. Add a second citation from Thai Ministry of Public Health or ACAAI (American College of Allergy) for source-type diversity. This is the single biggest GEO improvement (+41% AI citation lift). |
| 5 | 🟡 High | Facade | **Add TL;DR Key Takeaways box after the hero section.** Insert a short box (2–3 bullet points) answering "what is food sensitivity, how does the test work, and what do you get" in the first 150 words of page content. Improves AI search citations (Perplexity, ChatGPT). |
| 6 | 🟢 Medium | Content (vkasama) | **Expand FAQ answers Q4 and Q5 to ≥2 sentences.** Q4 (symptoms) and Q5 (who should test) are each a single long sentence. Split each into 2 sentences for better readability and FAQ schema validity. |
| 7 | 🟢 Medium | Content (vkasama) | **Add 2 more scientific references** (currently only 2; need ≥4 for full E-E-A-T score). Add recent PubMed citations on IgG food sensitivity — preferably 2020 or later. |

<details>
<summary>Dimension notes (expand for full detail)</summary>

- **Meta (8.5):** All OG + Twitter tags present ✅. Meta description at 118 chars (target 140–160) — add a CTA phrase like "— โทรนัดหมายวันนี้" to lengthen. Title ~62 chars (slightly over 60 but acceptable for Thai pixel width).
- **Schema (6.5):** MedicalTest + MedicalClinic + Person + BreadcrumbList all present ✅. FAQPage incomplete (1/5 Q&A — see action #2). Add `author.sameAs` to Person schema (LinkedIn URL for Dr. Chanakan). Add `Article` schema for GEO baseline.
- **Images (9.0):** All 3 images have descriptive alt text ✅. Hero filename keyword-rich ✅. Verify `loading="lazy"` on logo and doctor images inside their component files.
- **FAQ (7.0):** 5 visible questions ✅. Q4 and Q5 are single-sentence answers (see action #6). No price/cost FAQ — add one (see action #2).
- **E-E-A-T (8.0):** Doctor attribution ✅. Contact info ✅. No unsupported superlatives ✅. Hreflang ✅. Only 2 scientific references (see action #7). PDPA missing on lead form (see action #3).
- **Originality (9.0):** 3 sentences tested via web search, 0 exact matches found. Thai wellness phrasing on leaky gut is a common topic but Thrive's specific phrasing is distinct.
- **GEO (5.0):** Entire site blocked to AI crawlers via robots.txt (see action #1). Once unblocked, the IgE vs IgG comparison table and numbered testing steps are strong AI extraction targets. Missing: expert quotes (action #4), TL;DR box (action #5), `Article` schema.

</details>
