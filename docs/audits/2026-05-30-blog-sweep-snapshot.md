# Blog Sweep Snapshot — 2026-05-30

Site: https://new.thrivewellnessth.com/blog/
Audited by: 4 parallel agents (batch_1 posts 1–16, batch_2 posts 17–32, batch_3 posts 33–48, batch_4 posts 49–63)
Pages audited: 63 Tier B blog posts
Audit method: WebFetch per page, all 5 dimensions scored (Meta, Schema, Images, FAQ, E-E-A-T); SEO+GEO reference-only

---

## Summary

| Metric | Value |
|--------|-------|
| Tier B average | **5.1/10** |
| Posts live (HTTP 200) | **63 of 63** ✅ (was 0 of 63 on 2026-05-26) |
| Posts passing (≥ 7.0) | **0 of 63** |
| Posts critical (< 4.5) | **8 of 63** |
| Best score | syncope 6.8/10 |
| Worst score | ashwagandha 3.8/10, growth-factor 3.8/10 |

---

## Key Findings

### What changed since 2026-05-26
- **Blog deployment FIXED** — all 63 posts now live (Satemshi fixed Netlify env vars)
- Audit reflects live pages for the first time

### Universal issues (all 63 posts)
1. **Schema 0/10** for 57/63 posts — no FAQPage, no Article, no MedicalWebPage JSON-LD in current live code
   - `feature/blog-tierb-seo` branch (ready to merge) will fix this → Schema expected to jump to 7+
2. **Meta description absent** on most posts — `seoDescription` field empty in Sanity for most
3. **hreflang not rendering** — BlogPostLayout.astro passes hreflang to SEO.astro but tags absent from rendered HTML
4. **og:description missing** on all — tied to seoDescription issue
5. **twitter:card missing** — investigate SEO.astro output
6. **canonical tag missing** on most posts
7. **No price/cost FAQ** on any post — universal content gap
8. **No "who is suitable" FAQ** on any post

### What's working well
- **E-E-A-T 6–9/10** — Doctor Chanakan attribution present on most posts, contact info present everywhere
- **Images 6–10/10** — hero images generally have descriptive alt text, og:image present
- **FAQ 5–7/10** — visible FAQ sections present on 62/63 posts with ≥5 questions on most
- **GEO 7–10/10** — strong direct-answer paragraphs throughout, medical specificity good
- **Syncope outlier** — has Article + BreadcrumbList JSON-LD, canonical, og: tags; best post by far — use as template

---

## Full Scores Table

| Page | Meta | Schema | Images | FAQ | E-E-A-T | Overall |
|------|------|--------|--------|-----|---------|---------|
| /blog/_gaba | 0 | 0 | 8 | 7 | 9 | **4.8** |
| /blog/_pcos | 2 | 0 | 8 | 7 | 8 | **5.0** |
| /blog/6_benefits_kombucha | 2 | 0 | 7 | 5 | 8 | **4.4** |
| /blog/8-ลักษณะสุขภาพดี | 1 | 0 | 8 | 6 | 6 | **4.2** |
| /blog/abnormal-period | 2 | 0 | 8 | 7 | 9 | **5.2** |
| /blog/adrenal-fatigue-post | 2 | 0 | 8 | 7 | 9 | **5.2** |
| /blog/apple-benefit | 2 | 0 | 6 | 7 | 8 | **4.6** |
| /blog/ashwagandha | 2 | 0 | 10 | 0 | 7 | **3.8** ⚠️ |
| /blog/bromelain | 2 | 0 | 8 | 7 | 9 | **5.2** |
| /blog/check-immune-system | 2 | 0 | 8 | 7 | 8 | **5.0** |
| /blog/chili | 2 | 0 | 10 | 7 | 9 | **5.6** |
| /blog/chromium | 2 | 0 | 10 | 7 | 9 | **5.6** |
| /blog/cloggedarteries | 2 | 0 | 10 | 7 | 9 | **5.6** |
| /blog/coenzyme-q10 | 2 | 0 | 7 | 7 | 8 | **4.8** |
| /blog/femaleshormones | 2 | 0 | 9 | 6 | 8 | **5.0** |
| /blog/food-allergy-ige | 5 | 1 | 9 | 7 | 9 | **6.2** |
| /blog/glutathione | 2 | 0 | 10 | 7 | 9 | **5.6** |
| /blog/growth-factor | 0 | 0 | 6 | 6 | 7 | **3.8** ⚠️ |
| /blog/growth-hormone-2 | 1 | 1 | 9 | 7 | 9 | **5.4** |
| /blog/herbal-compress-massage | 1 | 0 | 10 | 7 | 7 | **5.0** |
| /blog/how-to-overcome-burn-out-syndrome | 2 | 1 | 7 | 7 | 6 | **4.6** |
| /blog/human-growth-hormone | 1 | 1 | 9 | 7 | 8 | **5.2** |
| /blog/immunesystem | 3 | 0 | 10 | 7 | 7 | **5.4** |
| /blog/immunity | 2 | 0 | 8 | 6 | 8 | **4.8** |
| /blog/insulin | 2 | 0 | 7 | 7 | 8 | **4.8** |
| /blog/l-carnitine | 2 | 0 | 7 | 5 | 8 | **4.4** |
| /blog/magnesium | 1 | 0 | 8 | 7 | 9 | **5.0** |
| /blog/menorrhagia | 1 | 1 | 9 | 7 | 9 | **5.4** |
| /blog/menstrual-pain | 2 | 0 | 8 | 6 | 7 | **4.6** |
| /blog/mental-health | 2 | 0 | 8 | 5 | 8 | **4.6** |
| /blog/minerals | 2 | 0 | 9 | 6 | 8 | **5.0** |
| /blog/mood-swings | 1 | 0 | 10 | 7 | 9 | **5.4** |
| /blog/neurotransmitter | 2 | 0 | 10 | 7 | 8 | **5.4** |
| /blog/neurotransmitters | 1 | 0 | 8 | 6 | 7 | **4.4** |
| /blog/nkcell | 1 | 1 | 9 | 7 | 8 | **5.2** |
| /blog/omega-3 | 2 | 0 | 8 | 5 | 7 | **4.4** |
| /blog/pelvicinflammatorydisease | 3 | 1 | 9 | 7 | 9 | **5.8** |
| /blog/periodpain | 2 | 0 | 8 | 6 | 9 | **5.0** |
| /blog/pms-premenstrualsyndrome | 2 | 0 | 8 | 7 | 8 | **5.0** |
| /blog/postbiotic | 1 | 1 | 9 | 7 | 9 | **5.4** |
| /blog/preservatives | 3 | 1 | 9 | 7 | 7 | **5.4** |
| /blog/progesterone | 1 | 1 | 9 | 7 | 8 | **5.2** |
| /blog/silica | 0 | 0 | 10 | 7 | 9 | **5.2** |
| /blog/sleepwalking | 1 | 1 | 9 | 7 | 8 | **5.2** |
| /blog/smiling-depression | 2 | 0 | 9 | 7 | 8 | **5.2** |
| /blog/syncope | 5 | 5 | 9 | 7 | 8 | **6.8** ⭐ |
| /blog/testosterone-woman | 1 | 1 | 9 | 7 | 8 | **5.2** |
| /blog/triglyceride | 1 | 0 | 10 | 7 | 7 | **5.0** |
| /blog/tryptophan | 0 | 0 | 10 | 7 | 9 | **5.2** |
| /blog/vitamin-a | 3 | 0 | 9 | 7 | 9 | **5.6** |
| /blog/vitamin-b3 | 1 | 1 | 9 | 7 | 9 | **5.4** |
| /blog/vitamin-b6 | 5 | 1 | 9 | 7 | 9 | **6.2** |
| /blog/vitamin-d-immune | 1 | 0 | 7 | 6 | 6 | **4.0** |
| /blog/zinc-checklist | 2 | 0 | 8 | 6 | 8 | **4.8** |
| /blog/คู่มือทานวิตามินซี | 3 | 0 | 9 | 7 | 9 | **5.6** |
| /blog/ตรวจภูมิแพ้อาหารแฝง-igg | 2 | 0 | 8 | 7 | 8 | **5.0** |
| /blog/ปัญหาสิวประจำเดือน | 2 | 0 | 9 | 7 | 8 | **5.2** |
| /blog/ผื่นลมพิษ | 1 | 0 | 9 | 7 | 7 | **4.8** |
| /blog/ภูมิคุ้มกันพัง | 3 | 0 | 8 | 7 | 9 | **5.4** |
| /blog/ลำไส้อักเสบ | 2 | 0 | 8 | 6 | 8 | **4.8** |
| /blog/สเตียรอยด์ | 2 | 1 | 7 | 7 | 9 | **5.2** |
| /blog/อาหารที่มี-probiotic | 2 | 0 | 7 | 6 | 8 | **4.6** |
| /blog/ฮอร์โมนวัยทอง | 2 | 0 | 6 | 7 | 8 | **4.6** |

---

## Projected Scores After Feature Branch Merge

Merging `feature/blog-tierb-seo` (MedicalWebPage JSON-LD) + fixing seoDescription in Sanity + fixing SEO.astro hreflang/twitter output:

| Fix | Schema impact | Meta impact | Projected new avg |
|-----|--------------|-------------|-------------------|
| Merge feature/blog-tierb-seo | +7 pts (0→7) | — | +1.4 overall |
| Populate seoDescription in Sanity | — | +3 pts (meta desc + og:desc) | +0.6 overall |
| Fix hreflang + twitter:card in SEO.astro | — | +3 pts | +0.6 overall |
| **Total projected gain** | | | **~5.1 → ~7.7/10** |

---

## Audit Methodology

- **Tier B** (63 pages): 5-dimension audit (Meta, Schema, Images, FAQ, E-E-A-T); SEO+GEO reference-only
- **Scoring**: 1–10 per dimension; Overall = average of Meta + Schema + Images + FAQ + E-E-A-T
- **Agents**: 4 parallel agents split by URL batch (~16 pages each), each auditing all 5 dimensions
- **Source**: Live HTTP fetches from new.thrivewellnessth.com via WebFetch
- **Originality**: Skipped (WebSearch rate limit concerns at 63-page scale)
