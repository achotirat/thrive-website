# Design Spec: /check-up/[program] Pages
**Date:** 2026-05-28  
**Branch:** `feature/services-page`  
**Status:** Approved — ready for implementation planning

---

## Overview

Build out 13 individual check-up program pages under `/check-up/[slug]` using a new Astro content collection, dynamic route, and shared template. Redesign the `/check-up` index to display all 13 programs grouped by category. Pricing is fully decoupled from content — managed via `pricing.json`.

---

## The 13 Programs

| # | Program | Slug | Category | Status |
|---|---------|------|----------|--------|
| 1 | Young Balance™ | `young-balance` | balance | New content |
| 2 | Healthy Balance™ | `healthy-balance` | balance | New content |
| 3 | Optimum Balance™ | `optimum-balance` | balance | New content |
| 4 | Iconic Balance™ | `iconic-balance` | balance | New content |
| 5 | Food Intolerance IgG | `food-intolerance` | specialty | Mirror of `/food-intolerance` |
| 6 | Hormone Check-up | `hormones` | specialty | Mirror of `/hormones-quiz` |
| 7 | DNA for Health & Life | `dna-health-life` | specialty | Mirror of `/dna-test` |
| 8 | Vitamins & Micronutrients | `vitamins-and-micronutrients` | specialty | Mirror of existing |
| 9 | Urine Organic Profile | `urine-organic-test` | specialty | Mirror of existing |
| 10 | Heavy Metal & Trace Elements | `heavy-metal-trace-elements` | specialty | New content |
| 11 | Acne Solution | `acne-solution` | specialty | New content |
| 12 | Special Test | `special-test` | specialty | New content |
| 13 | Immune Check-up | `immune-check-up` | specialty | New content (missing from Wix too) |

**Mirror pages** get their own MDX + SEO/GEO stack. Canonical points to `/check-up/[slug]`. The original top-level page (`/food-intolerance` etc.) stays untouched.

---

## Architecture

### New content collection
```
astro/src/content/check-up/
  young-balance.mdx
  healthy-balance.mdx
  optimum-balance.mdx
  iconic-balance.mdx
  food-intolerance.mdx
  hormones.mdx
  dna-health-life.mdx
  vitamins-and-micronutrients.mdx
  urine-organic-test.mdx
  heavy-metal-trace-elements.mdx
  acne-solution.mdx
  special-test.mdx
  immune-check-up.mdx
```

### Content config (`content.config.ts`)
Add a `checkUpPrograms` collection with Zod schema (mirrors existing `services` collection pattern).

### Dynamic route
```
astro/src/pages/check-up/[slug].astro
```
- Calls `getCollection('checkUpPrograms')` and generates static paths
- Calls `getServicePricing('check-up/' + slug)` for pricing block
- Renders with shared section order (see Template Sections below)

### Index page
`astro/src/pages/check-up.astro` — kept in place (Astro handles `check-up.astro` + `check-up/[slug].astro` without conflict). Redesigned body to show:
- Hero stays the same
- New section: "โปรแกรมของเรา" — two groups:
  - **Balance Check-up Programs** (4 cards, tiered/visual pricing ladder)
  - **Specialty Tests** (9 cards in a grid)
- Existing "Why Thrive", "Who should check-up", "Process", FAQ, CTA sections stay

---

## MDX Frontmatter Schema

```yaml
---
title: string                      # Display name e.g. "Young Balance™"
category: "balance" | "specialty"  # Controls grouping on index
tagline: string                    # 1-line sub-heading shown under hero headline
targetAudience: string[]           # Shown as chips in hero/summary card
keyTests: string[]                 # Bullet list in summary card

seo:
  seoTitle: string
  description: string
  canonicalPath: string            # Always "/check-up/[slug]"
  ogImage: string
  ogLocale: "th_TH"
  noIndex: false
  hreflang:
    - { lang: "th-TH", href: "https://www.thrivewellnessth.com/check-up/[slug]" }
    - { lang: "en",    href: "https://www.thrivewellnessth.com/check-up/[slug]" }
    - { lang: "x-default", href: "https://www.thrivewellnessth.com/check-up/[slug]" }
  geo:
    region: "TH-10"
    placename: "Bangkok, Lat Phrao, Thailand"
    position: "13.8207;100.5736"
    icbm: "13.8207, 100.5736"
  publishedAt: string              # ISO date
  updatedAt: string
  lastMedicalReview: string
  reviewedBy: "พญ. ชนากานต์ ตระหง่านศรี"
  medicalSpecialty: "Preventive Medicine"

hero:
  headline: string
  subline: string
  image: string
  primaryBtn: { label: string, href: string }
  secondaryBtn: { label: string, href: string }

doctor:                            # Optional — defaults to Dr. Chanakan
  name: string
  title: string
  image: string
  imageAlt: string
  bio: string
  specializations: string[]

faqs:
  - q: string
    a: string

cta:
  headline: string
  subline: string
  primaryBtn: { label: string, href: string }
  secondaryBtn: { label: string, href: string }

relatedPrograms:                   # Links to other /check-up/[slug] pages
  - title: string
    href: string
    icon: string
    description: string

jsonLd: object[]                   # Full JSON-LD graph (see JSON-LD section)
---
```

**No price fields in frontmatter.** Pricing is loaded at render time from `pricing.json`.

---

## Pricing Integration

Each slug gets an entry in `pricing.json`:
```json
"check-up/young-balance": {
  "from": "TBD",
  "note": "ราคากำลังรอ review",
  "updatedAt": "2026-05-28",
  "draft": true,
  "priceReviewRequiredBy": "apanit-pueng"
}
```

The `[slug].astro` template calls `getServicePricing('check-up/' + slug)`. If `draft: true`, the price block is hidden (same behaviour as existing service pages). When Satemshi approves pricing, flip `draft: false` — no MDX changes needed.

---

## Template Sections (render order)

1. **Hero** — reuse `<ServiceHero>` component
2. **Key tests summary card** — new `<CheckUpSummary>` component showing `keyTests[]` bullets + `targetAudience[]` chips
3. **MDX body** — rich content (what it tests, what results mean, who it's for)
4. **Pricing block** — rendered only when `getServicePricing()` returns non-draft data
5. **Doctor attribution** — reuse `<DoctorAttribution>`
6. **FAQ** — reuse `<FAQSection>`
7. **Related programs grid** — links within `/check-up/` using `relatedPrograms[]`
8. **CTA + Lead form** — reuse `<CTASection>` + `<LeadForm serviceSlug="check-up/[slug]">`

---

## JSON-LD Graph (per page)

Every `/check-up/[slug]` page includes:
- `MedicalClinic` — Thrive Wellness Clinic `@id`
- `Person` — Dr. Chanakan `@id`
- `MedicalTest` — program name + description + `relevantSpecialty`
- `FAQPage` — from `faqs[]` frontmatter
- `BreadcrumbList` — 3 levels: หน้าแรก → ตรวจสุขภาพ Check-up → [Program Title]

---

## SEO/GEO Stack

Every page ships with:
- Full OG + Twitter Card meta
- `hreflang` (th-TH, en, x-default)
- GEO meta tags (`region`, `placename`, `position`, `ICBM`)
- `publishedAt` / `updatedAt` / `lastMedicalReview` / `reviewedBy`
- `medicalSpecialty` for E-E-A-T
- JSON-LD graph above
- Content written via `thrive-content-writer` skill: 5+ medical citations, Thai/English source research, plain-language gate, anti-clickbait, AI search optimisation

---

## Content Sources (for MDX writing phase)

| Program | Source |
|---------|--------|
| Young Balance™ | https://www.thrivewellnessth.com/young-balance-check-up |
| Healthy Balance™ | https://www.thrivewellnessth.com/healthy-balance-check-up |
| Optimum Balance™ | https://www.thrivewellnessth.com/optimum-balance-check-up |
| Iconic Balance™ | https://www.thrivewellnessth.com/iconic-balance-check-up |
| Food Intolerance | https://www.thrivewellnessth.com/food-intolerance + existing `/food-intolerance` MDX |
| Hormones | https://www.thrivewellnessth.com/hormones-quiz + existing `/hormones-quiz` MDX |
| DNA | https://www.thrivewellnessth.com/dna-health-life + existing `/dna-test` MDX |
| Vitamins & Micronutrients | https://www.thrivewellnessth.com/vitamins-and-micronutrients + existing MDX |
| Urine Organic | https://www.thrivewellnessth.com/urine-organic-test + existing MDX |
| Heavy Metal | https://www.thrivewellnessth.com/heavy-metal-trace-elements-test |
| Acne Solution | https://www.thrivewellnessth.com/acne-solution |
| Special Test | https://www.thrivewellnessth.com/special-test |
| Immune Check-up | https://www.thrivewellnessth.com/package-immune-screening (CD Profile, CBC, Vitamin D3) |

---

## Out of Scope

- Modifying existing top-level service pages (`/food-intolerance`, `/hormones-quiz`, etc.)
- Adding 301 redirects (keep-both decision)
- Sanity CMS migration for check-up programs
- Pricing values (all start as `draft: true`, unlocked separately by Satemshi)
- Images — hero images per program need to be supplied or created separately
