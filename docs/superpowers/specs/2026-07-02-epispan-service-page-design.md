# EpiSpan Service Page — Design Spec

**Date:** 2026-07-02
**Status:** Approved by user, ready for implementation plan
**Type:** New Tier A service page (manual MDX, per CLAUDE.md — no bulk generation)

---

## 1. Summary

Add a new Tier A service page for **EpiSpan** — an epigenetic / biological age test
(brand by GENFOSIS, underlying lab technology by TruDiagnostic, developed with
Harvard, Yale, and Duke research partners). The page covers both "epigenetic testing"
and "longevity testing" as a single offering, since the actual EpiSpan panel already
spans both concepts (OMICm Age = overall biological age, SYMPHONY Age = 11-organ
longevity breakdown, DunedinPACE = rate of aging). Two separate pages were considered
and rejected — see §2.

URL: **`/epispan`**

## 2. Decisions made during brainstorming

| Decision | Choice | Reason |
|---|---|---|
| One page or two (epigenetic vs longevity)? | **One page** | The test itself already produces both an overall biological-age score and an 11-organ longevity breakdown — splitting would fragment one product across two pages and dilute SEO/keyword equity |
| Use brand name "EpiSpan" or generic name? | **Use "EpiSpan" explicitly** | Thrive is presenting this as a named, branded test (GENFOSIS/TruDiagnostic) — using the real name supports truth-gate (no vague marketing-speak) and captures brand-name search traffic |
| Slug | **`/epispan`** | Branded slug, consistent with treating this as a specific named diagnostic product (distinct from generic-keyword slugs like `/dna-test`) |
| Pricing | **Not yet available** — use "สอบถามราคา" (ask for pricing) CTA instead of a number | No confirmed price from clinic at spec time |
| Source material | **Real** — provided by user | 73-page TruDiagnostic sample clinical report (Jane Doe sample, English) + 9 GENFOSIS Thai marketing/education slides (mechanism diagrams, FAQs, clock history, disease-risk model) |

## 3. Source material inventory

- `SAMPLE_REPORT_Epispan_TH_Update(1).pdf` — 73-page TruDiagnostic sample report. Confirms panel components: **OMICm Age** (Harvard), **SYMPHONY Age** (Yale, 11 organ systems: Blood, Brain, Inflammation, Heart, Hormone, Immune, Kidney, Liver, Metabolic, Lung, Musculoskeletal), **DunedinPACE of Aging** (Duke, rate-of-aging score), **Telomere Length**, **Immune Health** (cell subset percentages), **Inflammation** (CRP, IL-6 methylation), **OMICm FitAge** (grip strength, VO2max, gait speed, FEV1), smoking/alcohol epigenetic risk predictors, and ~40 additional actionable epigenetic biomarkers each with a function note + lifestyle/nutrient recommendation.
- GENFOSIS Thai slides (9 images) — confirmed usable content:
  - Epigenetics mechanism (DNA Methylation, Histone Modification, Non-coding RNA)
  - Chronological vs Biological Age visual concept
  - "Epigenome เปลี่ยนได้" — changeable factors: medications, pollution, family history, toxins, diet, alcohol, smoking, infection, exercise
  - Epigenetic clock history timeline (Horvath 2013, Hannum 2013, Zief-Piekarska 2015, Skin & Blood 2018, PhenoAge 2018, GrimAge 2019, DunedinPACE 2020) — **citation: Li Piani L, et al. Front Cell Dev Biol. 2023**
  - Disease-risk bucket model (genetic risk + aging + environment/lifestyle vs. disease threshold) — **citation: Hall A, et al. Int J Mol Sci. 2020**
  - FAQ: cancer patients (can test, but not recommended for blood cancers; solid-tumor CTCs don't affect result)
  - FAQ: patients who received blood transfusion (wait 8–12 weeks) or IV Mesenchymal stem cells (wait 4 weeks) before testing
  - FAQ: retest cadence — recommended every 6 months after a lifestyle change/intervention
  - FAQ: no need to stop medications/supplements before testing (limited current data on drug effects on methylation pattern)

No pricing, no sample-collection-method confirmation (blood draw vs. saliva), no lab turnaround time was provided — these are explicitly flagged as open items in §6, not guessed.

## 4. Page structure (content order, matching existing Tier A pattern e.g. `dna-test.mdx`)

1. **Key Takeaways box** (5 bullets) — what EpiSpan measures, how it differs from a DNA test, who should test
2. **Epigenetics คืออะไร** — plain-language explanation of the 3 mechanisms (DNA Methylation, Histone Modification, Non-coding RNA), each jargon term glossed on first use per plain-language gate
3. **อายุตามบัตร vs อายุเซลล์ (Biological Age)** — two-column comparison + the "epigenome เปลี่ยนได้" changeable-factors list (medications, pollution, diet, exercise, smoking, alcohol, stress, family history)
4. **EpiSpan วัดอะไรบ้าง** — card grid (same visual pattern as `dna-test.mdx`'s 3-panel grid): OMICm Age, SYMPHONY Age (11 organs), DunedinPACE, Telomere Length, Immune Health & Inflammation
5. **ทำไมต้องรู้อายุชีวภาพ** — genetic risk + aging + environment → disease-threshold model, citing Hall A, et al. 2020; emphasizes lifestyle change lowers risk
6. **ใครเหมาะตรวจ** — audience-fit cards: anti-aging/wellness enthusiasts, family history of chronic disease, existing NAD+/HBOT patients wanting to measure outcomes, biohackers
7. **ขั้นตอนการตรวจ** — 4 steps (consult doctor → sample collection → lab analysis → doctor interprets results). Turnaround time and sample method marked `[ยืนยันกับคลินิกก่อนเผยแพร่]` — not guessed.
8. **FAQ (5 questions)** — sourced directly from GENFOSIS slides: (1) EpiSpan vs. DNA test difference, (2) need to stop meds/supplements?, (3) can cancer patients test?, (4) wait time after blood transfusion/stem cell IV, (5) retest cadence
9. **CTA** — "สอบถามราคา EpiSpan" (phone + LINE), not a price figure
10. **References** — Li Piani L, et al. Front Cell Dev Biol. 2023; Hall A, et al. Int J Mol Sci. 2020; TruDiagnostic clinical methodology (source for OMICm Age / SYMPHONY Age / DunedinPACE panel description); plus at least 1 additional Thai-institution source to be added during content writing per thrive-content-writer skill's citation requirement (≥5 sources, ≥1 Thai)

## 5. Technical implementation

- **Content file:** `astro/src/content/services/epispan.mdx` — frontmatter must satisfy the `servicesCollection` Zod schema in `astro/src/content.config.ts` (seo, hero, doctor, faqs, cta, relatedServices, jsonLd — all required fields per existing schema, no new schema fields needed)
- **Page wrapper:** `astro/src/pages/epispan.astro` — thin wrapper following the exact `dna-test.astro` pattern: `getEntry('services', 'epispan')` → `BaseLayout` + `SEO` + `Header` + `Breadcrumbs` + `ServiceHero` + MDX `<Content />` + `FAQSection` + `DoctorAttribution` + related-services grid (`ServiceCard`) + `CTASection` + `LeadForm serviceSlug="epispan"` + `Footer`
- **Breadcrumb:** หน้าแรก → ตรวจสุขภาพเชิงลึก (`/check-up`) → ตรวจ EpiSpan (`/epispan`) — same convention as `dna-test.astro`
- **Doctor:** พญ. ชนากานต์ ตระหง่านศรี (หมอนุ่น) — reuse existing bio/photo assets and JSON-LD `@id` (`https://www.thrivewellnessth.com/#dr-chanakan`); **must add a row to the "Doctor on File" table in `SITE-TRACKER.md`** per that file's stated rule ("ทุกครั้งที่สร้างหรืออัปเดตหน้าที่มีโปรไฟล์หมอนุ่น ต้องอัปเดตตารางนี้ทันที ก่อน commit")
- **JSON-LD:** reuse existing `MedicalClinic` + `Person` (หมอนุ่น) `@id` references (no duplicate entities); add one new `MedicalTest` node for EpiSpan + `FAQPage` + `BreadcrumbList`, following the exact structure used in `dna-test.mdx`
- **Hero image:** new asset `epispan-hero-1200x630.jpg` needed (not yet in `astro/public/`) — flagged as an open item, not blocking the MDX/page code itself
- **Build verification:** `npx astro check` and `npm run build` must pass with 0 errors before commit, per CLAUDE.md

## 6. SEO / content-policy compliance (cross-checked against `.claude/skills/thrive-content-writer/SKILL.md`)

| Requirement | How this page satisfies it |
|---|---|
| Anti-clickbait / no absolute cure or anti-aging overclaims | No "ย้อนวัย", "หยุดแก่", "รักษาหาย" — use "อาจช่วยชะลอ", "มีความสัมพันธ์กับ" instead. This category (biological-age/anti-aging) is a common source of overclaiming, so extra care applied here specifically |
| 5+ citations, ≥1 Thai source | Li Piani 2023 + Hall 2020 + TruDiagnostic methodology confirmed; writer must source at least 1 additional Thai-institution citation during the writing pass to hit the 5-source / 1-Thai-source minimum |
| Plain-language gate | "Methylation", "epigenome", "biomarker" etc. glossed in Thai plain language on first use, matching the `dna-test.mdx` precedent for "SNPs" |
| "Consult a doctor" disclaimer | Included explicitly in the cancer-patient and post-transfusion/stem-cell FAQ answers, where there is a real clinical safety consideration |
| CTA map (Tier A service page table in thrive-content-writer skill) | Add a new row: keywords `epigenetic, biological age, epigenetic clock, aging test, methylation` → `/epispan`, so future blog posts route their CTA here correctly |
| URL preservation rule | `/epispan` is a brand-new slug — no collision with any legacy static-site URL |

## 7. Open items (must resolve before publish, do not block MDX/code authoring)

- [ ] Confirm EpiSpan pricing with clinic — replace CTA-only approach once available
- [ ] Confirm sample collection method (finger-prick blood spot vs. other) and lab turnaround time with clinic/GENFOSIS before publishing Section 7 (testing process)
- [ ] Source hero image (`epispan-hero-1200x630.jpg`) — lifestyle/editorial style per Thrive image brand guidelines, not a lab/clinical photo
- [ ] Confirm official Thai company/distributor name (GENFOSIS) is correct as displayed on marketing slides before citing it as the source in any customer-facing copy
- [ ] Add ≥1 Thai-institution citation during content writing pass to satisfy 5-source/1-Thai-source minimum
