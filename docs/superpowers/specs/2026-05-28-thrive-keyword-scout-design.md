# Design Spec: thrive-keyword-scout Skill
**Date:** 2026-05-28
**Branch:** `feature/keyword-research`
**Status:** Approved — ready for implementation

---

## Overview

A project skill (`/thrive-keyword-scout`) that takes a rough topic idea or Thai headline and produces a ranked keyword table plus a content brief ready to paste into `/thrive-content-writer`. Uses WebSearch only — no external API keys required.

**Pipeline position:**
```
Rough idea → [thrive-keyword-scout] → content brief → [thrive-content-writer] → blog MDX
```

---

## Skill File

**Location:** `.claude/skills/thrive-keyword-scout/SKILL.md`

Single file. No helper scripts, no references subfolder. All logic lives in the skill instructions; Claude uses `WebSearch` at runtime.

---

## Workflow (4 steps, run in sequence)

### Step 1 — Seed Expansion

Take the rough topic/headline (Thai or English) and generate 8–10 keyword variations across 4 angles:

| Angle | Examples (LDL topic) |
|---|---|
| Thai informational | `LDL คืออะไร`, `LDL กับ HDL ต่างกันอย่างไร` |
| Thai concern/symptom | `LDL สูงอันตรายไหม`, `LDL สูงเกิดจากอะไร` |
| Thai actionable | `วิธีลด LDL ตามธรรมชาติ`, `อาหารลด LDL` |
| English expat | `lower LDL naturally Bangkok`, `LDL cholesterol test Thailand` |

### Step 2 — SERP Snapshot

Run `WebSearch` on the **top 4 candidates** from Step 1 (highest apparent relevance). For each, record:

- **Content type dominating results** — hospital, pharma, Wikipedia, clinic blog, video
- **Thai-language content presence** — sparse Thai = ranking opportunity
- **Featured snippet present?** — gap = opportunity to capture position zero
- **"People also ask" questions** — reveals related search intent to address in the post
- **Any wellness clinic ranking?** — direct competition proxy for Thrive

### Step 3 — Score Each Keyword

Score all 8–10 keywords on 5 dimensions (1–3 each, max 15):

| Dimension | What it measures | 1 | 2 | 3 |
|---|---|---|---|---|
| **Volume signal** | SERP density + ad presence as demand proxy | sparse results, no ads | moderate results | dense results, multiple ads |
| **Thai content gap** | How little good Thai content exists | lots of Thai content | some Thai content | almost no Thai content |
| **Intent fit** | Informational = blog-appropriate | transactional/navigational | mixed | pure informational |
| **Thrive service link** | Does this lead naturally to a Thrive service? | no clear link | loose link | direct link to service |
| **Ranking feasibility** | Can a new clinic blog realistically compete? | hospital/pharma dominates | mix of authority + blogs | mostly thin/generic content |

Present all 8–10 keywords in a ranked table sorted by total score descending.

### Step 4 — Output

Two parts delivered together:

**Part A — Ranked keyword table**

```
| # | Keyword | Intent | Thai gap | Thrive link | Feasibility | Score |
|---|---------|--------|----------|-------------|-------------|-------|
| 1 | วิธีลด LDL ตามธรรมชาติ | info ✅ | medium | check-up, chelation | medium | 12/15 |
...
```

**Part B — Winner declaration + content brief**

```
✅ WINNER: [keyword] — [one-line rationale]

TARGET KEYWORD: ...
SECONDARY KEYWORDS: ... (3–5 related terms to weave in)
SUGGESTED H1: "..." (Thai, compelling, includes keyword)
META DESCRIPTION: "..." (≤155 chars, Thai)
CONTENT LENGTH: [range] words
H2 OUTLINE:
  1. ...
  2. ...
  3. ...
  4. ...
  5. [Thrive service section]
PEOPLE ALSO ASK: [from SERP snapshot — 3–5 questions]
THRIVE SERVICE LINK: /[service-slug]
CTA: "..." (LINE or phone, links to the relevant service)
```

The brief is formatted so it can be pasted directly into `/thrive-content-writer` as the input.

---

## Scoring Notes

- **Tie-breaking rule:** when two keywords score equally, prefer the one with a stronger Thrive service link (conversion fit wins over raw volume).
- **Minimum viable score:** don't recommend a keyword below 8/15 — flag it as "not worth pursuing" and suggest a reformulation instead.
- **Expat keywords:** English expat keywords score max 2 on Thai content gap (there's always more English content). Keep them in the table but treat them as secondary targets.

---

## Integration with thrive-content-writer

The content brief from Step 4 is the direct input to `/thrive-content-writer`. The brief pre-fills:
- Target keyword → Step T2 source selection
- H2 outline → content structure
- Thrive service link → Step T5 internal linking
- People also ask → FAQ section

No reformatting needed — the scout output is designed to slot in directly.

---

## Out of Scope

- Search volume numbers (no API — use SERP density as proxy)
- Automated triggering of thrive-content-writer (user decides when to proceed)
- Topic discovery from scratch (skill requires a seed topic as input)
- Google Search Console integration (useful after 30+ posts exist)
