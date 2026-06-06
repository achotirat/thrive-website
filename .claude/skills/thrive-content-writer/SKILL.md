---
name: thrive-content-writer
description: >
  Use when writing any content for Thrive Wellness Thailand (Bangkok wellness clinic) —
  blog posts, landing pages, service pages, or content rewrites. Applies when content
  needs medical citations (5+ sources), Thai/English source research, plain-language
  gate for non-medical readers, anti-clickbait verification, highlight formatting, and
  AI search optimisation layered on top of the standard SEO content workflow.
---

# Thrive Content Writer

## Overview

This skill wraps `notfair:content-writer` with Thrive-specific requirements.
Run the base skill first, then apply every Thrive layer in order before delivering.

**REQUIRED BASE SKILL:** Invoke `notfair:content-writer` to complete the standard
SEO content workflow (intent → research → outline → write → quality gate).
This skill adds layers on top — it does not replace the base.

---

## Thrive Context

| | |
|---|---|
| **Business** | Thrive Wellness Center, Bangkok, Thailand |
| **Audience** | Thai nationals and expats in Bangkok, aged 30–55. Health-conscious, not medically trained. Most read both Thai and English. |
| **Services** | Functional medicine, IV therapy, HBOT, food intolerance testing, adrenal fatigue treatment, hormonal wellness |
| **Brand voice** | Warm, authoritative, science-backed. Never alarmist. Never salesy. |
| **Site URL** | thrivewellnessth.com |

---

## Step T0 — Blog Post Structure Template

Every Thrive blog post **must follow this exact skeleton**, in this order. Do not reorder sections.

```
1.  Hero image + H1 (keyword-optimised, max 65 characters)
2.  Quick Summary box (TL;DR — 3–5 bullets)
3.  Table of Contents ("In this article" — links to every H2)
4.  CTA Block — Top (within first 3 visible elements after the intro paragraph)
5.  Direct-answer intro paragraph (2 sentences answering the target question — GEO signal)
6.  Body H2 sections (each with at least one callout box and one bold key finding)
7.  "What Thrive's Doctors Say" section (practitioner voice — GEO signal)
8.  FAQ section (3+ questions)
9.  CTA Block — Bottom
10. References
```

### Table of Contents format

```markdown
**In this article**
- [What is LDL cholesterol?](#what-is-ldl)
- [Why LDL rises — root causes](#root-causes)
- [8 natural ways to lower LDL](#natural-methods)
- [What Thrive's doctors say](#doctors-say)
- [FAQ](#faq)
```

---

## Step T0.1 — CTA Identification (MANDATORY before writing)

Before writing any content, identify the correct CTA link by matching the blog topic to
the closest Tier A service page below. If multiple pages match, pick the single most
relevant one. If none match, use the fallback.

### Tier A service page map

| Topic keywords | Service page | CTA label |
|---|---|---|
| food intolerance, food sensitivity, IgG, trigger foods, elimination diet, gut reaction, bloating, eczema from food | `/food-intolerance` | "Test your food intolerances at Thrive →" |
| adrenal fatigue, cortisol, stress hormone, HPA axis, burnout, chronic fatigue, tired all the time | `/adrenal-fatigue` | "Get your adrenal health assessed at Thrive →" |
| hormones, testosterone, estrogen, progesterone, DHEA, PMS, menopause, hormonal balance, PCOS | `/hormones-quiz` | "Take Thrive's hormone health quiz →" |
| HBOT, hyperbaric oxygen, oxygen therapy, pressurised chamber, wound healing, brain fog (oxygen), long COVID | `/hbot` | "Learn about HBOT at Thrive →" |
| IV drip, IV therapy, intravenous vitamins, drip, infusion, hydration drip, vitamin C IV | `/iv-drip` | "Explore IV drip therapy at Thrive →" |
| glutathione, gluta, skin brightening, antioxidant, whitening, detox skin | `/gluta` | "Learn about Glutathione therapy at Thrive →" |
| chelation, heavy metals, lead, mercury, arsenic, detox metals | `/chelation` | "Find out about chelation therapy at Thrive →" |
| personalized vitamins, custom supplements, micronutrient, nutrient deficiency, supplement plan | `/personalized-vitamins` | "Get your personalized vitamin plan at Thrive →" |
| NAD+, NAD plus, cellular energy, anti-aging, longevity, mitochondria | `/nad` | "Discover NAD+ therapy at Thrive →" |
| NK cell, natural killer cell, immunity, cancer prevention, immune boost | `/nk-cell` | "Learn about NK Cell therapy at Thrive →" |
| allergy, IgE, allergic reaction, histamine, allergy test | `/allergy-ige` | "Get an allergy IgE test at Thrive →" |
| organic acids, OAT, urine test, metabolic health, gut bacteria, yeast overgrowth | `/urine-organic-test` | "Book an organic acids test at Thrive →" |
| vitamin D, sun exposure, bone health, immune vitamin, D3 | `/vitamin-d` | "Check your vitamin D levels at Thrive →" |
| vitamins, micronutrients, minerals, B12, magnesium, zinc, iron deficiency | `/vitamins-and-micronutrients` | "Explore micronutrient testing at Thrive →" |
| health check, check-up, annual screening, blood panel, preventive health | `/check-up` | "Book a health check-up at Thrive →" |
| OligoScan, mineral scan, tissue minerals, heavy metal scan | `/oligoscan` | "Learn about OligoScan at Thrive →" |
| cancer screening, tumour marker, early detection, cancer risk | `/cancer-screening` | "Learn about cancer screening at Thrive →" |
| DNA test, genetic test, gene, genome, MTHFR, genetic risk | `/dna-test` | "Explore DNA testing at Thrive →" |
| LDL, cholesterol, triglycerides, cardiovascular, heart health, lipid panel | `/check-up` | "Check your cholesterol with a Thrive health check-up →" |

**Fallback (no matching service):**
> CTA label: "Book your consultation at Thrive →"
> CTA link: `/contact`

### CTA block format

Use this exact format for both the Top CTA (position 4 in skeleton) and Bottom CTA (position 9):

```markdown
---
**Ready to take the next step?**
[Book your consultation at Thrive →](/contact)
*Bangkok's functional medicine clinic — personalised care, science-backed.*
---
```

Replace the label and link with the matched service page where applicable.

### Sticky CTA note (Astro build — separate task)

The sticky floating CTA that follows the reader while scrolling, and the responsive
behaviour across mobile / tablet / desktop, is handled by an **Astro component** —
not by this skill. When delivering the blog post, include this note at the top of
the deliverable:

> **Dev note:** This post uses CTA link `[matched link]` with label `[matched label]`.
> Wire to the sticky CTA component. Component must be responsive (mobile / iPad / desktop)
> and visible within the first 3 viewport-heights on page load.

---

## Step T1 — Topic Fit Check

Before writing anything, confirm:
- Is the topic relevant to a service Thrive offers or a wellness condition it treats?
- Is the angle educational (builds trust) rather than purely promotional?

If the keyword has zero connection to Thrive's services, flag it and ask the user
whether to reframe it or skip it.

---

## Step T2 — Citation Research (MANDATORY — minimum 5 sources)

Every piece of Thrive content **must include at least 5 citations.** No exceptions.
Missing citations = incomplete deliverable.

### Source hierarchy (use in this order)

1. **Peer-reviewed journals** — PubMed, JAMA, The Lancet, BMJ, NEJM, Frontiers
2. **Thai medical / government sources** — Royal College of Physicians of Thailand,
   Thai FDA (อย.), Mahidol University / Chulalongkorn research, Department of Medical Sciences
3. **WHO / international health bodies**
4. **Functional medicine institutions** — IFM (Institute for Functional Medicine),
   Cleveland Clinic Functional Medicine
5. **High-credibility health media with primary source link** — BBC Health, Reuters Health,
   Harvard Health Publishing (only if direct journal link is also included)

### What to avoid
- Supplement brand sites, wellness influencers, unverified blogs
- "Studies show…" with no linked study
- Animal-only research applied to humans without explicit caveat

### Citation format

Use numbered inline citations `[1]` and list at end of article:

```
## References

[1] Author, A. B. (Year). Title of article. Journal Name, volume(issue), pages. https://doi.org/...
[2] ผู้แต่ง ก. ข. (ปี). ชื่อบทความ [Title in English]. ชื่อวารสาร, เล่ม(ฉบับ), หน้า. URL
```

Thai-language sources: include the original Thai title, then an English translation in parentheses.

---

## Step T3 — Plain-Language Gate

Target readability: **Thai high-school graduate level** (Flesch-Kincaid Grade 8 or below
for English content).

### Rules
- Replace every medical term with a plain equivalent on first use: `cortisol (the stress hormone)`
- Average sentence length ≤ 20 words
- No paragraph longer than 4 sentences
- Analogies welcome — explain body mechanisms with everyday comparisons
- After writing, re-read each paragraph: would a non-medical Bangkok reader
  understand every sentence without Googling?

### Common jargon substitutions

| Medical term | Plain substitute |
|---|---|
| Cortisol | stress hormone (cortisol) |
| Adrenal glands | small glands that sit above your kidneys |
| Dysbiosis | imbalance in gut bacteria |
| Immunoglobulin G (IgG) | a type of antibody your immune system produces |
| Hyperbaric oxygen / HBOT | pressurised oxygen therapy (HBOT) |
| Intravenous | delivered directly into the bloodstream (IV) |
| Inflammation | your immune system's "on" switch — helpful short-term, harmful when chronic |
| Bioavailability | how much of a nutrient your body actually absorbs and uses |

---

## Step T4 — Anti-Clickbait & Truth Gate

### Forbidden patterns (rewrite or remove)
- Superlatives without citation: "the most powerful", "the fastest recovery"
- Fear-based urgency: "if you ignore this…", "dangerous levels of…"
- Absolute cure claims: "cures", "eliminates", "reverses"
  → Use instead: "may help support", "associated with improvement in", "shown to reduce"
- Unquantified statistics: "most people have this" without source and number

### Required qualifiers for medical claims
- "Research suggests…" / "Studies have found…" / "Evidence indicates…"
- "May help" / "associated with" / "may support"
- Add "consult your doctor before starting any new treatment" wherever clinically appropriate

### Truth gate — apply to every claim before delivering
1. Can I cite a primary source? → cite it with `[n]`
2. No primary source — is it established clinical consensus? → note that explicitly
3. Neither → **remove the claim entirely**

---

## Step T5 — Highlight & Scannability Structure

Readers scan before they read. AI engines pull from clearly structured content.
Every piece must include:

| Element | Requirement |
|---|---|
| **TL;DR box** | At the very top (skeleton position 2) — 3–5 plain-language bullet points summarising the article |
| **Table of Contents** | Immediately after TL;DR (skeleton position 3) — links to every H2 section. Required on ALL posts regardless of length. |
| **Bold key finding** | The single most important sentence per major section, in bold |
| **Callout box** | At least 1 — use for statistics, definitions, or clinical warnings |
| **Summary table** | Required if article compares options (e.g., food intolerance vs allergy) |
| **FAQ section** | Minimum 3 questions — include questions patients are actually hesitant to ask |

### Callout box format (markdown)

```markdown
> **Key finding:** Elevated cortisol for more than 3 months is linked to fatigue,
> weight gain, and sleep disruption in otherwise healthy adults [1].
```

### TL;DR box format

```markdown
**Quick summary**
- Food intolerances are delayed reactions (hours to days), not immediate allergies
- An IgG blood test can identify your specific trigger foods
- Removing trigger foods for 6–8 weeks often significantly reduces symptoms [3]
- Thrive's food intolerance panel tests for 200+ foods common in Thai diets
- Always confirm findings with a doctor before eliminating food groups long-term
```

---

## Step T6 — GEO Layer (AI Search Optimisation)

After completing standard SEO deliverables from `notfair:content-writer`, apply GEO:

**REQUIRED SKILL:** Use `notfair:geo-optimizer` for the full GEO workflow.

### Thrive-specific GEO priorities

- **Direct-answer paragraph:** First 2 sentences must directly answer the target question.
  AI engines quote the clearest definition or answer they find.
- **Citable statement structure:** "According to [source], [specific claim with number]" —
  this pattern is frequently pulled into AI-generated answers.
- **Practitioner voice section:** Include a "What Thrive's doctors say" or
  "Clinical perspective at Thrive" section. First-person clinical voice is a strong
  GEO citation signal.
- **Entity consistency:** Use "Thrive Wellness Center", "Bangkok", and the primary
  service name (e.g., "HBOT therapy", "food intolerance testing") in every piece
  to reinforce entity associations across AI training data.

---

## Step T7 — Originality Checkpoint

Before delivering:
- No sentence should be a light paraphrase of a citation — synthesise, don't restate
- **Unique angle rule:** Every article must contain at least one insight not found in
  the top 5 Google results: a first-hand clinical perspective, Thai-specific data,
  or a local context angle (Bangkok lifestyle, Thai diet, etc.)
- If web access is available, spot-check 2–3 top-ranking pages and verify the
  Thrive article offers something different in angle, depth, or perspective

---

## Final Deliverables

Deliver everything from `notfair:content-writer`, plus append:

```
## Thrive QA Checklist
- [ ] Blog post follows skeleton order (T0): Hero → TL;DR → TOC → CTA-Top → Intro →
      Body H2s → Doctors Say → FAQ → CTA-Bottom → References
- [ ] CTA identified (T0.1): matched service page OR fallback /contact confirmed
- [ ] Dev note included at top of deliverable: CTA link + label + sticky component reminder
- [ ] TL;DR summary box at top (3–5 bullets)
- [ ] Table of Contents included ("In this article") linking to every H2
- [ ] CTA block appears in Top position (within first 3 visible elements)
- [ ] CTA block appears in Bottom position (after FAQ, before References)
- [ ] 5+ citations, full references listed (include at least 1 Thai-language or
      Thai-institution source where applicable)
- [ ] All jargon explained in plain language on first use
- [ ] Bold key finding in each major section
- [ ] At least 1 callout box (stat, definition, or warning)
- [ ] FAQ section with 3+ realistic patient questions
- [ ] Anti-clickbait gate passed (no unverified superlatives, no fear-based urgency)
- [ ] All absolute cure claims removed or qualified
- [ ] Direct-answer paragraph in first 2 sentences (GEO signal)
- [ ] "What Thrive's doctors say" section included
- [ ] Unique angle confirmed — not a rehash of what's currently ranking
- [ ] "Consult a doctor" disclaimer added where clinically appropriate
```

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Citing WebMD / Healthline as primary source | Trace to the original study they reference and cite that instead |
| "Studies show…" without a link | Find and link the actual study on PubMed |
| Writing for medically-literate readers | Re-read every paragraph as if you're a worried patient who just Googled this |
| FAQ that only answers safe, easy questions | Include what patients are afraid to ask ("Is this safe?", "Will it hurt?", "How much does it cost?") |
| Skipping the GEO layer | Run `notfair:geo-optimizer` — AI search is now Thrive's primary growth channel |
| Thai-only citations skipped | Thai-institution sources build local authority; include at least one per article |
| Superlative left in without a source | Every "most", "best", "fastest" needs a citation or must be removed |
| CTA not identified before writing | Run T0.1 first — match the topic to a service page so the CTA is woven in naturally, not bolted on |
| Missing dev note for sticky CTA | Always include the dev note with the matched CTA link — the Astro component needs this to wire up |
| TOC skipped for "short" posts | TOC is required on ALL posts — length is not a condition |
| Skeleton order not followed | Deliverable must match the T0 skeleton exactly — reviewers check this before accepting |
