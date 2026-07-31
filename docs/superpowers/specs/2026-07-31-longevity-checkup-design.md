# Design Spec: Longevity Check-Up Page

**Date:** 2026-07-31
**Branch:** `feature/longevity-checkup-page`
**Status:** Approved — ready for implementation planning

---

## Overview

Add a 14th program to the existing `checkUpPrograms` collection: **Longevity Check Up (Hormone Panel and Vitamin & Micronutrients)**, sourced from clinic price sheet `2026_Thrive-Longevity-Check-Up (1).jpg`. Unlike every existing check-up program page, this one ships with a real, reviewed two-tier price (Optimal / Advance) and a full line-item comparison table — no other program page has either of these today.

No schema or shared-component changes: the comparison table is hand-authored HTML in the MDX body, following the `compare-table` markup pattern already used in `adrenal-fatigue.mdx` and `food-intolerance.mdx`.

---

## Page identity

| Field | Value |
|---|---|
| Slug | `/check-up/longevity-check-up` |
| File | `astro/src/content/check-up/longevity-check-up.mdx` |
| Collection | `checkUpPrograms` (existing, no schema change) |
| Category | `specialty` |
| Title | "Longevity Check Up" |
| Tagline | Hormone Panel and Vitamin & Micronutrients — mirrors flyer subtitle |

---

## Test list (transcribed from source image — authoritative)

**Vitamins & Micronutrients** — all rows checked in both Optimal and Advance:
Vitamin A (HPLC), Vitamin C (HPLC), Vitamin E (HPLC), Gamma Tocopherol, Beta Carotene, Alpha Carotene, Coenzyme Q10 (HPLC), Lycopene, Lutein + Zeaxanthin, Beta-cryptoxanthin, Calcium, Magnesium, Vitamin D3, Folic Acid, Vitamin B12, Zinc, Copper, Selenium, Chromium, Iron level.

**Hormone — included in both tiers:**
Free T3, Free T4, TSH, Serum Cortisol, DHEAs, Testosterone, Progesterone, Estradiol (E2), FSH, LH, IGF-1.

**Hormone — Advance tier only** (shaded block in source, matches what makes Advance worth the upsell):
SHBG, Anti-TPO/TG antibodies, Free Testosterone, PTH, IGF-BP3.

**Pricing (from image):**
- Optimal: ~~32,570~~ → **27,900 บาท**
- Advance: ~~36,190~~ → **29,900 บาท**
- Footnotes to carry into page copy: results in 7–10 business days; Body Composition analysis included; fasting/food timing can be confirmed on-site.

---

## Body content structure

1. Key Takeaways box (existing styled-div pattern)
2. Full two-tier comparison table (`compare-table` markup) — two grouped `<tbody>` sections (Vitamins & Micronutrients, Hormone), checkmark columns for Optimal/Advance, price footer row with strikethrough original price → promo price
3. Prose: why hormone + vitamin panels are read together, what each Advance-only marker adds and who needs it, who should test / retest cadence
4. Scientific references (5+ citations per content-writer skill standard)

Content copy (headline, FAQs, doctor bio, prose sections) will be written using the `thrive-content-writer` skill during implementation — plain-language gate, anti-clickbait check, citation requirements all apply as normal.

---

## Pricing config

Add to `astro/src/config/pricing.json`:
```json
"check-up/longevity-check-up": {
  "from": "27,900 บาท",
  "note": "แพ็กเกจ Optimal — หรืออัพเกรดเป็น Advance 29,900 บาท เพิ่ม SHBG, Anti-TPO/TG ab, Free Testosterone, PTH, IGF-BP3",
  "updatedAt": "2026-07-31",
  "draft": false,
  "priceReviewRequiredBy": "apanit-pueng"
}
```
`draft: false` is intentional — several existing entries (`acne-solution`, `urine-organic-test`) have real prices but `draft:true`, which silently overrides the display to "สอบถามราคา" (`getServicePricing` in `astro/src/lib/pricing.ts`). That's a pre-existing inconsistency in those other pages, not something this task fixes — but this new page should not repeat it, since the user confirmed these are reviewed, publishable prices.

---

## Images

| Image | Purpose | Status |
|---|---|---|
| `check-up-longevity-check-up-1200x630.jpg` | Hero + OG/social | ❌ placeholder: reuse `check-up-hero-1200x630.jpg` for now, flag in SITE-TRACKER.md for a real photo swap |
| `dr-chanakan-trangansri-thrive-400x400.jpg` | Doctor section | ✅ exists |

---

## Other required updates (same commit)

- `astro/src/config/pricing.json` — new entry (above)
- `SITE-TRACKER.md` — add row to check-up section + doctor-on-file table (Dr. Chanakan attribution) + note placeholder hero image needs swapping
- No changes to `content.config.ts`, `[slug].astro`, or `check-up.astro` — the existing dynamic route and index page already handle any new `checkUpPrograms` entry automatically (specialty programs render via `specialtyPrograms.map(...)` on `/check-up`)

---

## Out of scope

- No new shared "comparison table" Astro component — this is the first instance of this pattern for `checkUpPrograms`; revisit as a component only if a third page needs the same two-tier layout.
- No retroactive fix to the `draft:true` pricing-display bug on other pages.
- No real hero photography — placeholder only, tracked as follow-up.
