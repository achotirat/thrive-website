# Thrive Launch Audit — Master Scorecard

Last full sweep: 2026-05-30
Site: https://new.thrivewellnessth.com/

---

## Executive Summary

**Pages audited:** 22 Tier A + 63 Tier B = 85 pages total
**Tier A average:** 8.0/10 (last audited 2026-05-26)
**Tier B live average:** **5.1/10** — all 63 blog posts are now live ✅ (was 404 on 2026-05-26)
**Site average (all pages):** 6.4/10

**✅ Blog Deployment Blocker — RESOLVED (2026-05-30)**
All 63 blog posts now return HTTP 200 on `new.thrivewellnessth.com`. Env vars fixed on Netlify. Blog index `/blog/` lists all 63 posts. Individual post pages load correctly.

**Critical pages (< 5.0):**
- `/blog/ashwagandha` (3.8) — no FAQ section, citations from non-scientific sources only
- `/blog/growth-factor` (3.8) — minimal OG tags, only 3 FAQ items, no citations, unsupported claims

**Tier B universal issues (affect all 63 blog posts):**
1. **Schema 0–1/10 site-wide** — No `FAQPage` or `Article/MedicalWebPage` JSON-LD in blog layout → fix: merge `feature/blog-tierb-seo` branch
2. **Meta description missing** on most posts — seoDescription field empty in Sanity for most posts → fix: vkasama to populate in CMS
3. **hreflang tags not rendering** — investigate SEO.astro component; hreflang prop is set in BlogPostLayout but not appearing in rendered HTML
4. **og:description missing** on all posts — tied to seoDescription issue above
5. **twitter:card missing** — investigate SEO.astro component
6. **No price/cost FAQ** on any blog post — all FAQs cover what/how/why only
7. **No "who is suitable" FAQ** on any blog post

**Pending code improvement (branch ready, not yet merged):**
- `feature/blog-tierb-seo`: Adds `MedicalWebPage` JSON-LD, sitemap integration, `loading="lazy"` on body images. Merge will raise Schema score from 0→7+ on all 63 posts.

**Universal site-wide issues (Tier A + B):**
1. `hreflang` (th-TH, en, x-default) still missing on all pages — investigate SEO.astro
2. No doctor medical license number displayed anywhere
3. Title tags too long on most service pages (target 50–60 chars)
4. `adrenal-fatigue` and `/nad` pages have near-verbatim content sections — rewrite needed

---

## Page Scorecards

### Tier A — Service & Info Pages

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall | Last Audited |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|--------------|
| / | 6 | 5 | 7 | 6 | 8 | 8 | 6 | 8 | **6.8** | 2026-05-26 [stale] |
| /food-intolerance | 7 | 7 | 8 | 10 | 10 | 8 | 7 | 8 | **8.1** | 2026-05-26 [stale] |
| /adrenal-fatigue | 6 | 7 | 8 | 10 | 10 | 9 | 9 | 8 | **8.4** | 2026-05-26 [stale] |
| /hormones-quiz | 6 | 7 | 8 | 10 | 10 | 8 | 9 | 9 | **8.4** | 2026-05-26 [stale] |
| /hbot | 7 | 7 | 8 | 10 | 10 | 10 | 8 | 9 | **8.6** | 2026-05-26 [stale] |
| /iv-drip | 7 | 7 | 9 | 10 | 10 | 9 | 7 | 7 | **8.3** | 2026-05-26 [stale] |
| /gluta | 6 | 7 | 9 | 10 | 10 | 9 | 7 | 9 | **8.4** | 2026-05-26 [stale] |
| /chelation | 6 | 7 | 8 | 10 | 10 | 9 | 8 | 8 | **8.3** | 2026-05-26 [stale] |
| /personalized-vitamins | 6 | 7 | 8 | 10 | 10 | 8 | 7 | 9 | **8.1** | 2026-05-26 [stale] |
| /nad | 6 | 8 | 9 | 10 | 10 | 9 | 7 | 8 | **8.4** | 2026-05-26 [stale] |
| /nk-cell | 6 | 7 | 8 | 10 | 10 | 10 | 7 | 8 | **8.3** | 2026-05-26 [stale] |
| /allergy-ige | 6 | 8 | 8 | 10 | 10 | 8 | 9 | 9 | **8.5** | 2026-05-26 [stale] |
| /urine-organic-test | 6 | 7 | 8 | 10 | 10 | 8 | 7 | 9 | **8.1** | 2026-05-26 [stale] |
| /vitamin-d | 7 | 7 | 8 | 10 | 10 | 9 | 7 | 9 | **8.4** | 2026-05-26 [stale] |
| /vitamins-and-micronutrients | 6 | 7 | 9 | 6 | 10 | 9 | 7 | 9 | **7.9** | 2026-05-26 [stale] |
| /check-up | 6 | 7 | 8 | 10 | 10 | 9 | 9 | 9 | **8.5** | 2026-05-26 [stale] |
| /about | 5 | 5 | 6 | 7 | 10 | 8 | 4 | 9 | **6.8** | 2026-05-26 [stale] |
| /oligoscan | 6 | 7 | 9 | 10 | 9 | 9 | 8 | 9 | **8.4** | 2026-05-26 [stale] |
| /cancer-screening | 7 | 7 | 8 | 10 | 10 | 8 | 8 | 9 | **8.4** | 2026-05-26 [stale] |
| /dna-test | 6 | 7 | 9 | 10 | 10 | 9 | 8 | 9 | **8.5** | 2026-05-26 [stale] |
| /contact | 5 | 4 | 8 | 5 | 7 | 7 | 4 | 9 | **6.1** | 2026-05-26 [stale] |
| /thank-you | 2 | 2 | 6 | 1 | 7 | 0 | 3 | 9 | **3.8** | 2026-05-26 [stale] |

### Tier B — Blog Posts

_Overall = avg of 5 dimensions: Meta + Schema + Images + FAQ + E-E-A-T. SEO and GEO shown for reference only._
_All 63 posts audited live on 2026-05-30. Deploy status: ✅ all live._

| Page | SEO† | GEO† | Meta | Schema | Images | FAQ | E-E-A-T | Overall | Last Audited |
|------|------|------|------|--------|--------|-----|---------|---------|--------------|
| /blog/_gaba | 5 | 10 | 0 | 0 | 8 | 7 | 9 | **4.8** | 2026-05-30 |
| /blog/_pcos | 8 | 10 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 |
| /blog/6_benefits_kombucha | 7 | 7 | 2 | 0 | 7 | 5 | 8 | **4.4** | 2026-05-30 |
| /blog/8-ลักษณะสุขภาพดี | 6 | 6 | 1 | 0 | 8 | 6 | 6 | **4.2** | 2026-05-30 |
| /blog/abnormal-period | 8 | 10 | 2 | 0 | 8 | 7 | 9 | **5.2** | 2026-05-30 |
| /blog/adrenal-fatigue-post | 8 | 10 | 2 | 0 | 8 | 7 | 9 | **5.2** | 2026-05-30 |
| /blog/apple-benefit | 7 | 9 | 2 | 0 | 6 | 7 | 8 | **4.6** | 2026-05-30 |
| /blog/ashwagandha | 8 | 10 | 2 | 0 | 10 | 0 | 7 | **3.8** ⚠️ | 2026-05-30 |
| /blog/bromelain | 8 | 10 | 2 | 0 | 8 | 7 | 9 | **5.2** | 2026-05-30 |
| /blog/check-immune-system | 8 | 8 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 |
| /blog/chili | 9 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 |
| /blog/chromium | 8 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 |
| /blog/cloggedarteries | 8 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 |
| /blog/coenzyme-q10 | 8 | 10 | 2 | 0 | 7 | 7 | 8 | **4.8** | 2026-05-30 |
| /blog/femaleshormones | 8 | 8 | 2 | 0 | 9 | 6 | 8 | **5.0** | 2026-05-30 |
| /blog/food-allergy-ige | 8 | 10 | 5 | 1 | 9 | 7 | 9 | **6.2** | 2026-05-30 |
| /blog/glutathione | 9 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 |
| /blog/growth-factor | 6 | 7 | 0 | 0 | 6 | 6 | 7 | **3.8** ⚠️ | 2026-05-30 |
| /blog/growth-hormone-2 | 8 | 10 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 |
| /blog/herbal-compress-massage | 6 | 10 | 1 | 0 | 10 | 7 | 7 | **5.0** | 2026-05-30 |
| /blog/how-to-overcome-burn-out-syndrome | 8 | 9 | 2 | 1 | 7 | 7 | 6 | **4.6** | 2026-05-30 |
| /blog/human-growth-hormone | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 |
| /blog/immunesystem | 8 | 10 | 3 | 0 | 10 | 7 | 7 | **5.4** | 2026-05-30 |
| /blog/immunity | 8 | 8 | 2 | 0 | 8 | 6 | 8 | **4.8** | 2026-05-30 |
| /blog/insulin | 8 | 10 | 2 | 0 | 7 | 7 | 8 | **4.8** | 2026-05-30 |
| /blog/l-carnitine | 7 | 7 | 2 | 0 | 7 | 5 | 8 | **4.4** | 2026-05-30 |
| /blog/magnesium | 6 | 10 | 1 | 0 | 8 | 7 | 9 | **5.0** | 2026-05-30 |
| /blog/menorrhagia | 8 | 9 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 |
| /blog/menstrual-pain | 7 | 8 | 2 | 0 | 8 | 6 | 7 | **4.6** | 2026-05-30 |
| /blog/mental-health | 7 | 8 | 2 | 0 | 8 | 5 | 8 | **4.6** | 2026-05-30 |
| /blog/minerals | 8 | 7 | 2 | 0 | 9 | 6 | 8 | **5.0** | 2026-05-30 |
| /blog/mood-swings | 6 | 10 | 1 | 0 | 10 | 7 | 9 | **5.4** | 2026-05-30 |
| /blog/neurotransmitter | 8 | 9 | 2 | 0 | 10 | 7 | 8 | **5.4** | 2026-05-30 |
| /blog/neurotransmitters | 7 | 8 | 1 | 0 | 8 | 6 | 7 | **4.4** | 2026-05-30 |
| /blog/nkcell | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 |
| /blog/omega-3 | 8 | 8 | 2 | 0 | 8 | 5 | 7 | **4.4** | 2026-05-30 |
| /blog/pelvicinflammatorydisease | 8 | 9 | 3 | 1 | 9 | 7 | 9 | **5.8** | 2026-05-30 |
| /blog/periodpain | 8 | 10 | 2 | 0 | 8 | 6 | 9 | **5.0** | 2026-05-30 |
| /blog/pms-premenstrualsyndrome | 8 | 10 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 |
| /blog/postbiotic | 8 | 10 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 |
| /blog/preservatives | 8 | 10 | 3 | 1 | 9 | 7 | 7 | **5.4** | 2026-05-30 |
| /blog/progesterone | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 |
| /blog/silica | 6 | 10 | 0 | 0 | 10 | 7 | 9 | **5.2** | 2026-05-30 |
| /blog/sleepwalking | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 |
| /blog/smiling-depression | 8 | 9 | 2 | 0 | 9 | 7 | 8 | **5.2** | 2026-05-30 |
| /blog/syncope | 8 | 9 | 5 | 5 | 9 | 7 | 8 | **6.8** ⭐ | 2026-05-30 |
| /blog/testosterone-woman | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 |
| /blog/triglyceride | 6 | 10 | 1 | 0 | 10 | 7 | 7 | **5.0** | 2026-05-30 |
| /blog/tryptophan | 6 | 10 | 0 | 0 | 10 | 7 | 9 | **5.2** | 2026-05-30 |
| /blog/vitamin-a | 8 | 10 | 3 | 0 | 9 | 7 | 9 | **5.6** | 2026-05-30 |
| /blog/vitamin-b3 | 8 | 10 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 |
| /blog/vitamin-b6 | 8 | 10 | 5 | 1 | 9 | 7 | 9 | **6.2** | 2026-05-30 |
| /blog/vitamin-d-immune | 6 | 7 | 1 | 0 | 7 | 6 | 6 | **4.0** | 2026-05-30 |
| /blog/zinc-checklist | 8 | 7 | 2 | 0 | 8 | 6 | 8 | **4.8** | 2026-05-30 |
| /blog/คู่มือทานวิตามินซี | 8 | 10 | 3 | 0 | 9 | 7 | 9 | **5.6** | 2026-05-30 |
| /blog/ตรวจภูมิแพ้อาหารแฝง-igg | 8 | 10 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 |
| /blog/ปัญหาสิวประจำเดือน | 8 | 8 | 2 | 0 | 9 | 7 | 8 | **5.2** | 2026-05-30 |
| /blog/ผื่นลมพิษ | 6 | 10 | 1 | 0 | 9 | 7 | 7 | **4.8** | 2026-05-30 |
| /blog/ภูมิคุ้มกันพัง | 8 | 10 | 3 | 0 | 8 | 7 | 9 | **5.4** | 2026-05-30 |
| /blog/ลำไส้อักเสบ | 8 | 8 | 2 | 0 | 8 | 6 | 8 | **4.8** | 2026-05-30 |
| /blog/สเตียรอยด์ | 8 | 10 | 2 | 1 | 7 | 7 | 9 | **5.2** | 2026-05-30 |
| /blog/อาหารที่มี-probiotic | 8 | 7 | 2 | 0 | 7 | 6 | 8 | **4.6** | 2026-05-30 |
| /blog/ฮอร์โมนวัยทอง | 8 | 10 | 2 | 0 | 6 | 7 | 8 | **4.6** | 2026-05-30 |

† SEO and GEO shown for reference; not included in Tier B Overall average.

**Tier B stats (2026-05-30):**
- Average: **5.1/10**
- Best: /blog/syncope (6.8), /blog/vitamin-b6 (6.2), /blog/food-allergy-ige (6.2)
- Critical (< 4.5): /blog/ashwagandha (3.8), /blog/growth-factor (3.8), /blog/vitamin-d-immune (4.0), /blog/8-ลักษณะสุขภาพดี (4.2), /blog/6_benefits_kombucha (4.4), /blog/l-carnitine (4.4), /blog/neurotransmitters (4.4), /blog/omega-3 (4.4)

---

## Page Detail Blocks

---

### / (Homepage) — 6.8/10 — Audited 2026-05-26 [stale]

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

### /food-intolerance — 8.1/10 — Audited 2026-05-26 [stale]

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

### /adrenal-fatigue — 8.4/10 — Audited 2026-05-26 [stale]

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

### /hormones-quiz — 8.4/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 9 · Orig 9

**FAQ note:** 5 questions, answers short (~100–180 chars). No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 3 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question for hormone panel testing. |

---

### /hbot — 8.6/10 ⭐ Best Tier A — Audited 2026-05-26 [stale]

**Scores:** SEO 7 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 10 · E-E-A-T 8 · Orig 9

**FAQ note:** 6 questions, covers what/safety/frequency/contraindications/combination/price. Answers average 230–290 chars. JSON-LD matches HTML perfectly. **Use as template for other pages.**

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 3 | 🟢 Low | Content | Add TL;DR Key Takeaways box for GEO/AI citation improvement (already high scoring). |

---

### /iv-drip — 8.3/10 — Audited 2026-05-26 [stale]

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

### /gluta — 8.4/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions. Answers 150–250 chars, borderline on ≥2 sentences. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ full sentences** and add price/cost question for Glutathione IV. |
| 3 | 🟢 Medium | Content | **Add ≥2 scientific references** for E-E-A-T. |

---

### /chelation — 8.3/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 8

**FAQ note:** 5 questions, answers 60–150 words. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for Chelation Therapy. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /personalized-vitamins — 8.1/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions, answers 50–130 words, mostly single sentences. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question. |
| 3 | 🟢 Medium | Content | **Add ≥2 scientific references** for E-E-A-T. |

---

### /nad — 8.4/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 8 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 8

**FAQ note:** 5 questions, answers 80–150 words. No price question. Near-verbatim content risk flagged by Agent 4.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🔴 Critical | Content | **Rewrite near-verbatim sections** — originality risk flagged; add Thai clinical context. |
| 3 | 🟡 High | Content | **Add price/cost FAQ question** for NAD+ Therapy. |

---

### /nk-cell — 8.3/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 10 · E-E-A-T 7 · Orig 8

**FAQ note:** 7 questions — deepest FAQ on the site alongside HBOT. Covers meaning of low results/vs tumor markers/improvement/frequency/preparation/price/safety. All answers 210–302 chars. **Use as reference alongside /hbot.**

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Facade | **Shorten title tag** to 50–60 chars. |
| 3 | 🟡 High | Content | **Add ≥2 scientific references** for E-E-A-T (7/10). |

---

### /allergy-ige — 8.5/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 8 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 9 · Orig 9

**FAQ note:** 5 questions. Answers 180–320 chars, single-sentence format. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question for IgE allergy test. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** — already high GEO but room to improve. |

---

### /urine-organic-test — 8.1/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions, answers short (85–220 chars), mostly single sentences. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Expand FAQ answers to 2+ sentences** and add price/cost question. |
| 3 | 🟢 Medium | Content | **Add ≥2 more scientific references** for E-E-A-T. |

---

### /vitamin-d — 8.4/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 7 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 9

**FAQ note:** 5 questions, answers 80–180 words. Covers tropical deficiency/range/dosage/calcium/overdose. No price/where-to-test question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/where-to-test FAQ question** ("ตรวจ Vitamin D ราคาเท่าไหร่?"). |
| 3 | 🟢 Medium | Content | **Add ≥2 more scientific references** for E-E-A-T. |

---

### /vitamins-and-micronutrients — 7.9/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 6 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 9

**Schema note:** Schema 6/10 — missing `MedicalProcedure` or `MedicalTest` schema present on other service pages. Needs full structured data alignment.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Fix Schema (6/10)** — add `MedicalProcedure` / `MedicalTest` schema matching other service pages. |
| 2 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 3 | 🟡 High | Content | **Add price/cost FAQ question**. |

---

### /check-up — 8.5/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 9 · Orig 9

**FAQ note:** 5 questions, answers 45–90 words each. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for wellness check-up packages. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /about — 6.8/10 — Audited 2026-05-26 [stale]

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

### /oligoscan — 8.4/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 10 · Images 9 · FAQ 9 · E-E-A-T 8 · Orig 9

**FAQ note:** 5 questions, answers 40–95 words. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for OligoScan. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /cancer-screening — 8.4/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 7 · GEO 7 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 8 · Orig 9

**FAQ note:** 5 questions. No price question, no explicit suitability question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for cancer screening panel. |
| 3 | 🟡 High | Content | **Add 'who should get cancer screening' suitability question** to FAQ. |

---

### /dna-test — 8.5/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 6 · GEO 7 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 9

**FAQ note:** 5 questions, answers 120–180 words each. Good coverage of DNA vs blood/nutrigenomics/permanence/data storage/pharmacogenomics. No price question.

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add hreflang tags**. |
| 2 | 🟡 High | Content | **Add price/cost FAQ question** for DNA testing. |
| 3 | 🟢 Medium | Content | **Add TL;DR Key Takeaways box** for GEO improvement. |

---

### /contact — 6.1/10 — Audited 2026-05-26 [stale]

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

### /thank-you — 3.8/10 — Audited 2026-05-26 [stale]

**Scores:** SEO 2 · GEO 2 · Meta 6 · Schema 1 · Images 7 · FAQ 0 · E-E-A-T 3 · Orig 9

#### Priority Actions

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Facade | **Add `<meta name="robots" content="noindex">` to this page.** Thank-you pages must never be indexed. |
| 2 | 🟡 High | Facade | **Add 2–3 "What happens next?" FAQ items** to reassure new leads (when to expect a call, what to prepare, clinic address). |
| 3 | 🟢 Medium | Facade | **Add basic `MedicalClinic` schema** for brand consistency. |

---

## Blog Section — Universal Actions (All 63 Posts)

> All 63 blog posts confirmed live on `new.thrivewellnessth.com` as of 2026-05-30. ✅

### Code Fixes Required (Facade — branch `feature/blog-tierb-seo` ready)

| # | Severity | Action | Expected Impact |
|---|----------|--------|-----------------|
| 1 | 🔴 Critical | **Merge `feature/blog-tierb-seo`** — adds `MedicalWebPage` JSON-LD, sitemap, `loading="lazy"` | Schema 0→7+ on all 63 posts |
| 2 | 🔴 Critical | **Investigate hreflang rendering** — BlogPostLayout passes hreflang to SEO.astro but tags not appearing in rendered HTML | Meta +2 on all 63 posts |
| 3 | 🔴 Critical | **Investigate twitter:card and og:description** — SEO.astro may not be outputting these | Meta +2 on all 63 posts |
| 4 | 🔴 Critical | **Investigate canonical tag** — not appearing in rendered HTML of most posts | Meta +1 on all 63 posts |

### Content Fixes Required (vkasama — in Sanity CMS)

| # | Severity | Action |
|---|----------|--------|
| 1 | 🔴 Critical | **Populate `seoDescription` field** for all 63 posts in Sanity → fixes meta description + og:description |
| 2 | 🟡 High | **Add price/cost FAQ question** to all posts (e.g., "ตรวจ X ราคาเท่าไหร่? ที่ Thrive") |
| 3 | 🟡 High | **Add "สำหรับใคร" (who is suitable) FAQ question** to all posts |
| 4 | 🟡 High | **Add ≥4 scientific citations** to posts currently showing 0 citations |
| 5 | 🟢 Medium | **Upload hero images** for posts still using generic Sanity CDN hero (no keyword filename) |

---

### /blog/ashwagandha — 3.8/10 ⚠️ CRITICAL — Audited 2026-05-30

**Scores:** SEO 8 · GEO 10 · Meta 2 · Schema 0 · Images 10 · FAQ 0 · E-E-A-T 7

**Critical issue:** No FAQ section in page body. Citations use non-scientific sources (healthline.com, forbes.com). FAQ score 0/10 alone drops this post to 3.8 overall.

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Content (vkasama) | **Add FAQ section with ≥5 Q&A pairs** — ashwagandha benefits, dosage, side effects, contraindications, price. |
| 2 | 🔴 Critical | Content (vkasama) | **Replace citations** — healthline/forbes are not scientific. Add ≥4 PubMed references. |
| 3 | 🔴 Critical | Content (vkasama) | **Add seoDescription** (140–160 chars) in Sanity. |
| 4 | 🔴 Critical | Facade | **Merge feature/blog-tierb-seo** to get MedicalWebPage JSON-LD on this page. |

---

### /blog/growth-factor — 3.8/10 ⚠️ CRITICAL CONTENT RISK — Audited 2026-05-30

**Scores:** SEO 6 · GEO 7 · Meta 0 · Schema 0 · Images 6 · FAQ 6 · E-E-A-T 7

**Critical issues:** No OG tags (og:image, og:title, og:description all absent), only 3 FAQ questions, no scientific citations, logo images missing alt text.

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Content (vkasama) | **Review and remove unsupported medical claims** — Thai FDA advertising compliance risk. |
| 2 | 🔴 Critical | Content (vkasama) | **Add ≥4 scientific citations** for growth factor / placenta therapy. |
| 3 | 🔴 Critical | Content (vkasama) | **Expand FAQ to ≥5 Q&A pairs** including price and who-is-suitable. |
| 4 | 🔴 Critical | Content (vkasama) | **Add seoDescription** in Sanity → fixes og:description, meta description. |
| 5 | 🟡 High | Facade | **Fix logo alt attributes** — 2 logo images have no alt text. |

---

### /blog/syncope — 6.8/10 ⭐ Best Tier B — Audited 2026-05-30

**Scores:** SEO 8 · GEO 9 · Meta 5 · Schema 5 · Images 9 · FAQ 7 · E-E-A-T 8

**Best blog post on the site.** Has Article + BreadcrumbList JSON-LD, canonical tag, og: tags, and meta description. Use as reference for what populated Sanity data should look like.

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🟡 High | Facade | **Add FAQPage JSON-LD** (via feature/blog-tierb-seo branch) |
| 2 | 🟡 High | Content (vkasama) | **Add price/cost and who-is-suitable FAQ questions** |
| 3 | 🟡 High | Content (vkasama) | **Add ≥4 formal journal citations** (currently stats without named sources) |
| 4 | 🟡 High | Facade | **Investigate hreflang and twitter:card** not rendering |

---

_Full detail blocks for remaining 60 blog posts available on request. All share the universal blog actions above._
