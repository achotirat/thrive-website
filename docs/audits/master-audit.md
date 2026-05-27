# Thrive Launch Audit — Master Scorecard

Last full sweep: 2026-05-26
Site: https://new.thrivewellnessth.com/

---

## Executive Summary

**Pages audited:** 22 Tier A + 63 Tier B = 85 pages total
**Tier A average:** 8.0/10 ↑ (was 7.2 on 2026-05-24)
**Tier B live average:** 0/10 — ALL 63 blog posts return HTTP 404 on new subdomain
**Site average (live pages only):** 8.0/10 (22 Tier A pages)

**🚨 #1 Pre-Launch Blocker — Blog Section Not Deployed**
All 63 Tier B blog posts return HTTP 404 on `new.thrivewellnessth.com`. The `/blog/` index shows "ยังไม่มีบทความในขณะนี้" (no articles yet). The content exists in Sanity but the Astro blog build is not pulling from Sanity and rendering live pages. This must be resolved before any public launch announcement.

**Critical pages (< 6.0):**
- `/thank-you` (3.8) — no real content, must be noindexed
- `/contact` (6.1) — no FAQ, weak schema, low E-E-A-T
- `/about` (6.8) — weak E-E-A-T signals, no doctor credentials shown

**Universal site-wide issues (affect all or most pages):**
1. **All 63 blog posts HTTP 404** — blog section not deployed on new subdomain
2. `hreflang` (th-TH, en, x-default) missing on all pages
3. No doctor medical license number displayed anywhere
4. Title tags too long on most service pages (target 50–60 chars; most are 70+)
5. No `sitemap.xml` configured in Astro build (no sitemap integration)
6. `adrenal-fatigue` and `/nad` pages have near-verbatim content sections — rewrite needed

**Improvements confirmed since 2026-05-24 audit:**
- `og:image` now present and HTTP 200 on all Tier A pages ✓
- `loading="eager"` on hero images, `loading="lazy"` on secondary images — correctly implemented ✓
- All service page images have descriptive `alt` text and keyword-rich filenames ✓
- `FAQPage` + `BreadcrumbList` + `MedicalProcedure/Test` + `Person` JSON-LD present on all service pages ✓
- FAQ sections present on all service pages with JSON-LD matching visible HTML ✓

---

## Page Scorecards

### Tier A — Service & Info Pages

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall | Last Audited |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|--------------|
| / | 6 | 5 | 7 | 6 | 8 | 8 | 6 | 8 | **6.8** | 2026-05-26 |
| /food-intolerance | 7 | 7 | 8 | 10 | 10 | 8 | 7 | 8 | **8.1** | 2026-05-26 |
| /adrenal-fatigue | 6 | 7 | 8 | 10 | 10 | 9 | 9 | 8 | **8.4** | 2026-05-26 |
| /hormones-quiz | 6 | 7 | 8 | 10 | 10 | 8 | 9 | 9 | **8.4** | 2026-05-26 |
| /hbot | 7 | 7 | 8 | 10 | 10 | 10 | 8 | 9 | **8.6** | 2026-05-26 |
| /iv-drip | 7 | 7 | 9 | 10 | 10 | 9 | 7 | 7 | **8.3** | 2026-05-26 |
| /gluta | 6 | 7 | 9 | 10 | 10 | 9 | 7 | 9 | **8.4** | 2026-05-26 |
| /chelation | 6 | 7 | 8 | 10 | 10 | 9 | 8 | 8 | **8.3** | 2026-05-26 |
| /personalized-vitamins | 6 | 7 | 8 | 10 | 10 | 8 | 7 | 9 | **8.1** | 2026-05-26 |
| /nad | 6 | 8 | 9 | 10 | 10 | 9 | 7 | 8 | **8.4** | 2026-05-26 |
| /nk-cell | 6 | 7 | 8 | 10 | 10 | 10 | 7 | 8 | **8.3** | 2026-05-26 |
| /allergy-ige | 6 | 8 | 8 | 10 | 10 | 8 | 9 | 9 | **8.5** | 2026-05-26 |
| /urine-organic-test | 6 | 7 | 8 | 10 | 10 | 8 | 7 | 9 | **8.1** | 2026-05-26 |
| /vitamin-d | 7 | 7 | 8 | 10 | 10 | 9 | 7 | 9 | **8.4** | 2026-05-26 |
| /vitamins-and-micronutrients | 6 | 7 | 9 | 6 | 10 | 9 | 7 | 9 | **7.9** | 2026-05-26 |
| /check-up | 6 | 7 | 8 | 10 | 10 | 9 | 9 | 9 | **8.5** | 2026-05-26 |
| /about | 5 | 5 | 6 | 7 | 10 | 8 | 4 | 9 | **6.8** | 2026-05-26 |
| /oligoscan | 6 | 7 | 9 | 10 | 9 | 9 | 8 | 9 | **8.4** | 2026-05-26 |
| /cancer-screening | 7 | 7 | 8 | 10 | 10 | 8 | 8 | 9 | **8.4** | 2026-05-26 |
| /dna-test | 6 | 7 | 9 | 10 | 10 | 9 | 8 | 9 | **8.5** | 2026-05-26 |
| /contact | 5 | 4 | 8 | 5 | 7 | 7 | 4 | 9 | **6.1** | 2026-05-26 |
| /thank-you | 2 | 2 | 6 | 1 | 7 | 0 | 3 | 9 | **3.8** | 2026-05-26 |

### Tier B — Blog Posts

> ⚠️ **All 63 blog posts return HTTP 404 on new.thrivewellnessth.com as of 2026-05-26.**
> Scores below reflect content quality (audited from Sanity/source) for when pages are deployed.
> Live score = 0/10 for all dimensions until deployment is fixed.

_Overall = avg of 6 dimensions: Meta, Schema, Images, FAQ, E-E-A-T, Orig (SEO + GEO for reference only)._

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Content Score | Deploy Status |
|------|-----|-----|------|--------|--------|-----|---------|------|---------------|---------------|
| /blog/_gaba | 5 | 8 | 7 | 1 | 6 | 8 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/_pcos | 5 | 8 | 7 | 1 | 4 | 8 | 7 | 8 | **5.8** | ❌ 404 |
| /blog/6_benefits_kombucha | 6 | 8 | 7 | 1 | 5 | 9 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/8-ลักษณะสุขภาพดี | 6 | 8 | 7 | 1 | 6 | 8 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/abnormal-period | 8 | 8 | 8 | 1 | 6 | 9 | 7 | 9 | **6.7** | ❌ 404 |
| /blog/adrenal-fatigue-post | 5 | 8 | 7 | 1 | 7 | 9 | 8 | 9 | **6.8** | ❌ 404 |
| /blog/apple-benefit | 6 | 8 | 7 | 1 | 5 | 9 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/ashwagandha | 7 | 8 | 8 | 1 | 6 | 0 | 4 | 9 | **4.7** | ❌ 404 |
| /blog/bromelain | 6 | 8 | 6 | 1 | 6 | 9 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/check-immune-system | 6 | 8 | 6 | 1 | 5 | 8 | 7 | 8 | **5.8** | ❌ 404 |
| /blog/chili | 7 | 8 | 7 | 1 | 4 | 9 | 8 | 9 | **6.3** | ❌ 404 |
| /blog/chromium | 6 | 8 | 6 | 1 | 6 | 9 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/cloggedarteries | 6 | 8 | 6 | 1 | 6 | 8 | 7 | 9 | **6.2** | ❌ 404 |
| /blog/coenzyme-q10 | 7 | 8 | 8 | 1 | 5 | 8 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/femaleshormones | 6 | 8 | 7 | 1 | 4 | 9 | 8 | 9 | **6.3** | ❌ 404 |
| /blog/food-allergy-ige | 7 | 8 | 8 | 1 | 4 | 9 | 8 | 9 | **6.5** | ❌ 404 |
| /blog/glutathione | 7 | 8 | 7 | 1 | 7 | 9 | 7 | 9 | **6.7** | ❌ 404 |
| /blog/growth-factor | 6 | 8 | 6 | 1 | 5 | 3 | 2 | 6 | **3.8** | ❌ 404 |
| /blog/growth-hormone-2 | 7 | 8 | 7 | 1 | 6 | 8 | 7 | 8 | **6.2** | ❌ 404 |
| /blog/herbal-compress-massage | 7 | 8 | 8 | 1 | 5 | 9 | 7 | 9 | **6.5** | ❌ 404 |
| /blog/how-to-overcome-burn-out-syndrome | 5 | 8 | 7 | 1 | 5 | 8 | 8 | 9 | **6.3** | ❌ 404 |
| /blog/human-growth-hormone | 5 | 8 | 7 | 1 | 5 | 8 | 7 | 8 | **6.0** | ❌ 404 |
| /blog/immunesystem | 5 | 8 | 7 | 1 | 6 | 8 | 6 | 9 | **6.2** | ❌ 404 |
| /blog/immunity | 5 | 8 | 6 | 1 | 6 | 9 | 8 | 9 | **6.5** | ❌ 404 |
| /blog/insulin | 5 | 8 | 7 | 1 | 6 | 8 | 8 | 9 | **6.5** | ❌ 404 |
| /blog/l-carnitine | 7 | 8 | 7 | 1 | 7 | 9 | 7 | 9 | **6.7** | ❌ 404 |
| /blog/magnesium | 7 | 8 | 8 | 1 | 7 | 8 | 7 | 8 | **6.5** | ❌ 404 |
| /blog/menorrhagia | 6 | 8 | 7 | 1 | 7 | 9 | 8 | 9 | **6.8** | ❌ 404 |
| /blog/menstrual-pain | 7 | 8 | 7 | 1 | 6 | 8 | 6 | 8 | **6.0** | ❌ 404 |
| /blog/mental-health | 5 | 8 | 7 | 1 | 6 | 9 | 8 | 9 | **6.7** | ❌ 404 |
| /blog/minerals | 5 | 8 | 7 | 1 | 5 | 9 | 8 | 9 | **6.5** | ❌ 404 |
| /blog/mood-swings | 5 | 8 | 6 | 1 | 6 | 8 | 8 | 9 | **6.3** | ❌ 404 |
| /blog/neurotransmitter | 5 | 8 | 6 | 1 | 7 | 8 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/neurotransmitters | 5 | 8 | 6 | 1 | 6 | 9 | 8 | 8 | **6.3** | ❌ 404 |
| /blog/nkcell | 6 | 8 | 7 | 1 | 6 | 8 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/omega-3 | 5 | 8 | 6 | 1 | 6 | 9 | 8 | 9 | **6.5** | ❌ 404 |
| /blog/pelvicinflammatorydisease | 6 | 8 | 6 | 1 | 6 | 9 | 8 | 9 | **6.5** | ❌ 404 |
| /blog/periodpain | 7 | 8 | 7 | 1 | 7 | 5 | 6 | 9 | **5.8** | ❌ 404 |
| /blog/pms-premenstrualsyndrome | 5 | 8 | 6 | 1 | 6 | 8 | 8 | 9 | **6.3** | ❌ 404 |
| /blog/postbiotic | 5 | 8 | 7 | 1 | 4 | 9 | 8 | 9 | **6.3** | ❌ 404 |
| /blog/preservatives | 6 | 8 | 6 | 1 | 5 | 8 | 7 | 6 | **5.5** | ❌ 404 |
| /blog/progesterone | 5 | 8 | 7 | 1 | 6 | 8 | 8 | 9 | **6.5** | ❌ 404 |
| /blog/silica | 5 | 8 | 6 | 1 | 4 | 8 | 7 | 9 | **5.8** | ❌ 404 |
| /blog/sleepwalking | 5 | 8 | 7 | 1 | 6 | 9 | 7 | 9 | **6.5** | ❌ 404 |
| /blog/smiling-depression | 7 | 8 | 7 | 1 | 5 | 9 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/syncope | 5 | 8 | 6 | 1 | 7 | 9 | 8 | 9 | **6.7** | ❌ 404 |
| /blog/testosterone-woman | 6 | 8 | 6 | 1 | 7 | 8 | 6 | 9 | **6.2** | ❌ 404 |
| /blog/triglyceride | 7 | 8 | 6 | 1 | 6 | 8 | 2 | 9 | **5.3** | ❌ 404 |
| /blog/tryptophan | 5 | 8 | 6 | 1 | 4 | 8 | 8 | 9 | **6.0** | ❌ 404 |
| /blog/vitamin-a | 7 | 8 | 8 | 1 | 6 | 9 | 5 | 9 | **6.3** | ❌ 404 |
| /blog/vitamin-b3 | 5 | 8 | 6 | 1 | 6 | 8 | 5 | 9 | **5.8** | ❌ 404 |
| /blog/vitamin-b6 | 7 | 8 | 7 | 1 | 7 | 9 | 8 | 9 | **6.8** | ❌ 404 |
| /blog/vitamin-d-immune | 6 | 8 | 6 | 1 | 6 | 8 | 4 | 9 | **5.7** | ❌ 404 |
| /blog/zinc-checklist | 5 | 8 | 7 | 1 | 4 | 9 | 8 | 9 | **6.3** | ❌ 404 |
| /blog/คู่มือทานวิตามินซี | 7 | 8 | 7 | 1 | 6 | 9 | 7 | 8 | **6.3** | ❌ 404 |
| /blog/ตรวจภูมิแพ้อาหารแฝง-igg | 5 | 8 | 6 | 1 | 6 | 9 | 7 | 9 | **6.3** | ❌ 404 |
| /blog/ปัญหาสิวประจำเดือน | 5 | 8 | 7 | 1 | 7 | 9 | 8 | 9 | **6.8** | ❌ 404 |
| /blog/ผื่นลมพิษ | 5 | 6 | 6 | 1 | 7 | 8 | 6 | 9 | **6.2** | ❌ 404 |
| /blog/ภูมิคุ้มกันพัง | 7 | 8 | 8 | 1 | 7 | 8 | 7 | 9 | **6.7** | ❌ 404 |
| /blog/ลำไส้อักเสบ | 5 | 8 | 6 | 1 | 6 | 8 | 7 | 8 | **6.0** | ❌ 404 |
| /blog/สเตียรอยด์ | 5 | 8 | 7 | 1 | 6 | 9 | 8 | 9 | **6.7** | ❌ 404 |
| /blog/อาหารที่มี-probiotic | 5 | 8 | 6 | 1 | 7 | 9 | 8 | 9 | **6.7** | ❌ 404 |
| /blog/ฮอร์โมนวัยทอง | 5 | 8 | 7 | 1 | 7 | 9 | 8 | 8 | **6.7** | ❌ 404 |
| /blog/ashwagandha | 7 | 8 | 8 | 1 | 6 | 0 | 4 | 9 | **4.7** | ❌ 404 |
| /blog/growth-factor | 6 | 8 | 6 | 1 | 5 | 3 | 2 | 6 | **3.8** | ❌ 404 |

---

## Page Detail Blocks

---

### / (Homepage) — 6.8/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 5 · Meta 7 · Schema 6 · Images 8 · FAQ 8 · E-E-A-T 6 · Orig 8

**Image note:** Hero section uses CSS `background-image` instead of `<img>` tag — not crawlable by Google Images, not accessible to screen readers.
**FAQ note:** 5 FAQ items present and matching JSON-LD. Answers are all single sentences — expand to 2+ for richer rich-snippet eligibility.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags** (th-TH, en, x-default) to `<head>`. Missing site-wide. |
| 2 | 🔴 Critical | Facade | **Shorten title tag** — current title is too long (target 50–60 chars). |
| 3 | 🟡 High | Facade | **Replace CSS background hero with `<img>` tag** with descriptive alt text for screen reader and Google Images accessibility. |
| 4 | 🟡 High | Facade | **Add `MedicalClinic` + `LocalBusiness` schema** — current homepage schema lacks key structured data. |
| 5 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** each for richer FAQ rich-snippet eligibility. |
| 6 | 🟢 Medium | Content | **Strengthen GEO signals (5/10)** — add first-person expert quotes from Dr. Chanakan, key statistics with source, and a TL;DR box. |

---

### /food-intolerance — 8.1/10 — Audited 2026-05-26

**Scores:** SEO 7 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 7 · Orig 8

**Image note:** All images pass — descriptive alts, keyword filenames, og:image valid, loading strategy correct.
**FAQ note:** 5 questions, answers are single Thai sentences (~130–230 chars). No explicit price/cost question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags** (th-TH, en, x-default). |
| 2 | 🔴 Critical | Facade | **Shorten title tag** to 50–60 chars. |
| 3 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** each for richer snippet eligibility. |
| 4 | 🟡 High | Content | **Add explicit price/cost FAQ question** (e.g., "ตรวจภูมิแพ้อาหารแฝงราคาเท่าไหร่?") to capture commercial intent. |
| 5 | 🟢 Medium | Content | **Add 2 named expert quotes** and a second scientific citation from Thai MoPH or ACAAI. |

---

### /adrenal-fatigue — 8.4/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 9 · Orig 8

**Image note:** All images pass. Best-practice implementation.
**FAQ note:** 5 questions with long paragraph answers (150–280 words each). No price question. Near-verbatim content risk flagged by Agent 4.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🔴 Critical | Content | **Rewrite near-verbatim sections** — Orig/originality risk flagged; rewrite key sections with Thrive-specific context and Thai clinical experience. |
| 3 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 4 | 🟢 Medium | Content | **Add a price/cost FAQ question** to capture commercial intent. |

---

### /hormones-quiz — 8.4/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 9 · Orig 9

**FAQ note:** 5 questions, answers short (~100–180 chars). No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 3 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question for hormone panel testing. |

---

### /hbot — 8.6/10 ⭐ Best Tier A — Audited 2026-05-26

**Scores:** SEO 7 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 10 · E-E-A-T 8 · Orig 9

**FAQ note:** 6 questions, covers what/safety/frequency/contraindications/combination/price. Answers average 230–290 chars. JSON-LD matches HTML perfectly. **Use as template for other pages.**

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 3 | 🟢 Low | Content | Add TL;DR Key Takeaways box for GEO/AI citation improvement (already high scoring). |

---

### /iv-drip — 8.3/10 — Audited 2026-05-26

**Scores:** SEO 7 · GEO 7 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 7

**FAQ note:** 5 questions, answers 80–180 words each. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for IV Drip packages. |
| 3 | 🟡 High | Content | **Strengthen originality (7/10)** — add Thrive-specific differentiators; some phrasing overlaps with generic IV drip content. |
| 4 | 🟡 High | Content | **Add ≥2 scientific references** for E-E-A-T (7/10). |

---

### /gluta — 8.4/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions. Answers 150–250 chars, borderline on ≥2 sentences. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ full sentences** and add price/cost question for Glutathione IV. |
| 3 | 🟢 Medium | Content | **Add ≥2 scientific references** for E-E-A-T. |

---

### /chelation — 8.3/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 8

**FAQ note:** 5 questions, answers 60–150 words. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for Chelation Therapy. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /personalized-vitamins — 8.1/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions, answers 50–130 words, mostly single sentences. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question. |
| 3 | 🟢 Medium | Content | **Add ≥2 scientific references** for E-E-A-T. |

---

### /nad — 8.4/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 8 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 8

**FAQ note:** 5 questions, answers 80–150 words. No price question. Near-verbatim content risk flagged by Agent 4.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🔴 Critical | Content | **Rewrite near-verbatim sections** — originality risk flagged; add Thai clinical context. |
| 3 | 🟡 High | Content | **Add price/cost FAQ question** for NAD+ Therapy. |

---

### /nk-cell — 8.3/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 10 · E-E-A-T 7 · Orig 8

**FAQ note:** 7 questions — deepest FAQ on the site alongside HBOT. Covers meaning of low results/vs tumor markers/improvement/frequency/preparation/price/safety. All answers 210–302 chars. **Use as reference alongside /hbot.**

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 3 | 🟡 High | Content | **Add ≥2 scientific references** for E-E-A-T (7/10). |

---

### /allergy-ige — 8.5/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 8 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 9 · Orig 9

**FAQ note:** 5 questions. Answers 180–320 chars, single-sentence format. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question for IgE allergy test. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** — already high GEO but room to improve. |

---

### /urine-organic-test — 8.1/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions, answers short (85–220 chars), mostly single sentences. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question. |
| 3 | 🟢 Medium | Content | **Add ≥2 more scientific references** for E-E-A-T. |

---

### /vitamin-d — 8.4/10 — Audited 2026-05-26

**Scores:** SEO 7 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions, answers 80–180 words. Covers tropical deficiency/range/dosage/calcium/overdose. No price/where-to-test question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/where-to-test FAQ question** ("ตรวจ Vitamin D ราคาเท่าไหร่?"). |
| 3 | 🟢 Medium | Content | **Add ≥2 more scientific references** for E-E-A-T. |

---

### /vitamins-and-micronutrients — 7.9/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 6 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 9

**Schema note:** Schema 6/10 — missing `MedicalProcedure` or `MedicalTest` schema present on other service pages. Needs full structured data alignment.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Fix Schema (6/10)** — add `MedicalProcedure` / `MedicalTest` schema matching other service pages. |
| 2 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 3 | 🟡 High | Content | **Add price/cost FAQ question**. |

---

### /check-up — 8.5/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 9 · Orig 9

**FAQ note:** 5 questions, answers 45–90 words each. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for wellness check-up packages. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /about — 6.8/10 — Audited 2026-05-26

**Scores:** SEO 5 · GEO 5 · Meta 6 · Schema 7 · Images 10 · FAQ 8 · E-E-A-T 4 · Orig 9

**Image note:** All images now pass (10/10) — big improvement from previous audit.
**FAQ note:** 5 questions, answers 174–234 chars, single-sentence format. No doctor credentials question.
**E-E-A-T note:** Lowest E-E-A-T on the site (4/10). No MD license number, no board certification, no clinic accreditation.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Content | **Add E-E-A-T signals (4/10)** — add Dr. Chanakan's MD license number, specialty board certifications, clinic accreditations. |
| 2 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 3 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 4 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add a booking/first consultation question. |
| 5 | 🟡 High | Content | **Improve meta description (6/10)** — too short, needs keyword and trust signal. |

---

### /oligoscan — 8.4/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 10 · Images 9 · FAQ 9 · E-E-A-T 8 · Orig 9

**Image note:** 9/10 — WebFetch flagged a possible alt attribute issue on navbar logo; curl confirms alt="Thrive Wellness Center" is present. Score conservatively adjusted.
**FAQ note:** 5 questions, answers 40–95 words. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for OligoScan. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /cancer-screening — 8.4/10 — Audited 2026-05-26

**Scores:** SEO 7 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 8 · Orig 9

**FAQ note:** 5 questions. No price question, no explicit suitability question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for cancer screening panel. |
| 3 | 🟡 High | Content | **Add 'who should get cancer screening' suitability question** to FAQ. |

---

### /dna-test — 8.5/10 — Audited 2026-05-26

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 9

**FAQ note:** 5 questions, answers 120–180 words each. Good coverage of DNA vs blood/nutrigenomics/permanence/data storage/pharmacogenomics. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for DNA testing. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /contact — 6.1/10 — Audited 2026-05-26

**Scores:** SEO 5 · GEO 4 · Meta 8 · Schema 5 · Images 7 · FAQ 7 · E-E-A-T 4 · Orig 9

**Image note:** No hero image (expected for contact page). og:image uses generic `og-image.jpg` instead of clinic-specific image.
**FAQ note:** 5 questions, answers 117–177 chars, all single Thai sentences. Covers booking/hours/walk-in/location/international.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add `LocalBusiness` + `MedicalClinic` schema** — currently only basic schema (5/10). Add address, phone, openingHours, geo coordinates. |
| 2 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 3 | 🟡 High | Content | **Expand FAQ answers to 2+ full sentences** for richer snippet eligibility. |
| 4 | 🟡 High | Facade | **Add PDPA consent checkbox** to any contact/booking form. |
| 5 | 🟢 Medium | Facade | **Use a clinic-specific og:image** instead of the generic og-image.jpg. |
| 6 | 🟢 Medium | Facade | **Add map embed or directions image** with proper alt text. |

---

### /thank-you — 3.8/10 — Audited 2026-05-26

**Scores:** SEO 2 · GEO 2 · Meta 6 · Schema 1 · Images 7 · FAQ 0 · E-E-A-T 3 · Orig 9

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add `<meta name="robots" content="noindex">` to this page.** Thank-you pages must never be indexed. |
| 2 | 🟡 High | Facade | **Add 2–3 "What happens next?" FAQ items** to reassure new leads (when to expect a call, what to prepare, clinic address). |
| 3 | 🟢 Medium | Facade | **Add basic `MedicalClinic` schema** for brand consistency. |

---

## Blog Section — Critical Deployment Blocker

> All 63 blog posts return **HTTP 404** on `new.thrivewellnessth.com` as of 2026-05-26.

### Root Cause
The Astro blog build is not fetching from Sanity or the content collection is not generating static paths. The `/blog/` index page renders "ยังไม่มีบทความในขณะนี้" confirming the blog collection is empty at build time.

### Required Fix (Facade/Satemshi)

| # | Action |
|---|--------|
| 1 | Verify `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `SANITY_API_TOKEN` are set in Netlify environment variables for the `new.` deploy context |
| 2 | Check `astro/src/content/config.ts` — confirm the `blog` collection loader points to Sanity (not a local files loader) |
| 3 | Verify `getStaticPaths()` in `astro/src/pages/blog/[slug].astro` is calling `getCollection('blog')` and getting results |
| 4 | Run `npm run build` locally with `.env.local` to verify blog pages build successfully |
| 5 | After fix: re-audit all 63 blog pages on new subdomain for live scores |

### Content Quality Issues (fix before re-launch after blog is live)

All 63 blog pages share these issues when deployed:
1. **Schema 1/10** — No `Article` or `FAQPage` JSON-LD in blog post layout
2. **FAQ scores vary** — Ashwagandha has 0 FAQ items (critical); Growth-factor has only 3
3. **E-E-A-T 2/10** on growth-factor and triglyceride — missing doctor attribution, unsupported medical claims on growth-factor
4. **growth-factor unsupported claims** — must be reviewed by vkasama before any public exposure

### Blog Universal Actions (apply to ALL 63 pages when deployed)

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add `Article` + `FAQPage` JSON-LD schema template** to blog post layout, dynamically populated from Sanity |
| 2 | 🔴 Critical | Facade | **Add hreflang tags** (th-TH, en, x-default) to blog post layout |
| 3 | 🟡 High | Facade | **Add PDPA/data collection consent notice** to blog post footer or sidebar |
| 4 | 🟡 High | Content | **Add doctor attribution** to all posts missing a byline |

---

### /blog/growth-factor — 3.8/10 ⚠️ CRITICAL CONTENT RISK — Content Score Only

**Scores:** SEO 6 · GEO 8 · Meta 6 · Schema 1 · Images 5 · FAQ 3 · E-E-A-T 2 · Orig 6

**This page makes unsupported medical claims about placenta extract treating migraines and tinnitus. Must be reviewed before any public exposure.**

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Content (vkasama) | **Remove or qualify unsupported medical claims.** Claims not backed by cited research; potential Thai FDA advertising violation. |
| 2 | 🔴 Critical | Content (vkasama) | **Add doctor attribution** — byline missing. |
| 3 | 🔴 Critical | Content (vkasama) | **Add ≥4 scientific citations.** |
| 4 | 🟡 High | Content (vkasama) | **Rewrite FAQ section** — only 3 questions. Expand to ≥5. |
| 5 | 🟡 High | Content (vkasama) | **Check for duplicate content (Orig 6/10)** — overlaps with other placenta/growth factor pages online. |

---

### /blog/ashwagandha — 4.7/10 — Content Score Only

**Scores:** SEO 7 · GEO 8 · Meta 8 · Schema 1 · Images 6 · FAQ 0 · E-E-A-T 4 · Orig 9

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Content (vkasama) | **Add FAQ section (0/10)** — zero FAQ questions. Add ≥5 covering benefits, dosage, safety, who should take it. |
| 2 | 🔴 Critical | Content (vkasama) | **Add doctor attribution** (E-E-A-T 4/10). |
| 3 | 🟡 High | Content (vkasama) | **Add ≥2 more scientific citations.** |

---

_Remaining 60 blog pages all follow the universal blog actions above. Individual detail blocks available on request._
