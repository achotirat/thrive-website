---
name: thrive-keyword-scout
description: >
  Keyword research skill for Thrive Wellness Thailand blog content pipeline.
  Takes a rough topic idea or Thai headline, expands it into keyword variations,
  runs SERP analysis via WebSearch, scores each keyword on 5 dimensions, and
  outputs a ranked table plus a content brief ready for /thrive-content-writer.
  Use before every new blog post to find the sharpest keyword and validate
  search demand before writing.
---

# Thrive Keyword Scout

## Overview

This skill runs before `/thrive-content-writer`. It answers: is this topic worth writing, what is the best keyword formulation, and what should the brief contain?

**Input:** A rough topic or Thai headline (e.g. "LDL นั้นสำคัญไฉน")
**Output:** Ranked keyword table + winning keyword + content brief

---

## Context

| | |
|---|---|
| **Clinic** | Thrive Wellness Center, Bangkok |
| **Audience** | Thai nationals + Bangkok expats, aged 30–55, health-conscious |
| **Blog goal** | Drive organic search traffic that converts to clinic consultations |
| **Services to link** | check-up, food-intolerance, adrenal-fatigue, hbot, iv-drip, chelation, nk-cell, dna-test, hormones-quiz, oligoscan, personalized-vitamins, vitamins-and-micronutrients, urine-organic-test, gluta, nad, cancer-screening, mental-health, allergy-ige, vitamin-d |
| **Blog URL pattern** | `/blog/[slug]` on new.thrivewellnessth.com |
| **Contact for CTA** | LINE @thrivewellnessth \| Tel: 095-934-9640 |

---

## Step 1 — Seed Expansion

Generate 8–10 keyword variations from the input topic across 4 angles (aim for 2–3 per angle):

| Angle | Purpose | Examples for LDL topic |
|---|---|---|
| Thai informational | "What is X", "X vs Y" | `LDL คืออะไร`, `LDL กับ HDL ต่างกันอย่างไร` |
| Thai concern/symptom | "Is X dangerous", "What causes X" | `LDL สูงอันตรายไหม`, `LDL สูงเกิดจากอะไร` |
| Thai actionable | "How to fix X naturally", "X foods" | `วิธีลด LDL ตามธรรมชาติ`, `อาหารลด LDL` |
| English expat | Topic + Bangkok/Thailand modifier | `lower LDL naturally Bangkok`, `LDL test Thailand` |

Present the full list before moving to Step 2.

---

## Step 2 — SERP Snapshot

Select the **top 5 candidates** from Step 1 (highest relevance + actionable intent). Run `WebSearch` on each and record:

| Signal | What to look for |
|---|---|
| Content type dominating | Hospital, pharma, Wikipedia, clinic blog, YouTube |
| Thai content presence | Sparse Thai = ranking opportunity |
| Featured snippet | Empty position zero = win |
| People Also Ask | Note 3–5 questions — real user intent + FAQ material |
| Clinic competition | Any wellness clinic ranking = direct competition for Thrive |

---

## Step 2.5 — Real Search Volume (MANDATORY — Google Ads Keyword Planner)

The owner wants real monthly search numbers in **every** scout, not just SERP-based estimates.

1. Load the `claude-in-chrome` skill and open `https://ads.google.com/aw/keywordplanner/home` in the owner's logged-in Chrome (any account they can open works — volume data does not depend on the account).
2. **Get search volume and forecasts** → paste ALL Step 1 keywords (comma-separated) → *Get started*. Confirm location = Thailand, language = all/Thai, network = Google, last 12 months.
3. Read the table (`[role=row]` innerText via `javascript_tool`; switch *Show rows* to 500 and scroll to collect every row — the table is virtualised).
4. Then **Keyword ideas** with the 1–2 core seeds → collect related queries people actually type. Note any idea with real volume that matches the article's angle — it may be a better target than the Step 1 phrasing.
5. Read-only: never create campaigns, change bids, or add keywords to an ad group. Keyword Planner auto-saves a "Plan from <date>" — mention it to the owner (harmless, deletable).

Record for each keyword: **avg. monthly searches**, 3-month change, YoY change, competition. `—` in Keyword Planner means volume is below Google's reporting threshold (≈ under 10/month) — write it as `<10`.

If Chrome / Google Ads is unavailable, say so explicitly in the output, fall back to SERP-based Volume signal, and mark the column `est.`

---

## Step 3 — Score All Keywords

Score all 8–10 keywords on 5 dimensions (1–3 each, max 15):

| Dimension | 1 | 2 | 3 |
|---|---|---|---|
| **Volume** (Keyword Planner avg. monthly searches, Thailand) | < 100 or `<10` | 100–999 | ≥ 1,000 |
| **Thai content gap** (less Thai = easier) | Lots of strong Thai content | Some Thai content | Almost none |
| **Intent fit** (informational = blog) | Transactional/navigational | Mixed | Pure informational |
| **Thrive service link** (leads to service?) | No clear link | Loose link | Direct link |
| **Ranking feasibility** (clinic blog vs competition) | Hospital/pharma dominates | Mix of authority + blogs | Thin/generic content |

**Rules:**
- Tie-breaking: equal scores → prefer stronger Thrive service link
- Minimum threshold: do not recommend a keyword below 8/15 — flag as "not worth pursuing" and suggest a reformulated alternative
- Expat English keywords: cap "Thai content gap" at **1** — English content is denser so ranking is harder, meaning the gap score is genuinely lower for English-language targets
- Keywords not searched in Step 2: score Intent fit and Thrive service link normally; set Thai content gap and Ranking feasibility to **2 (medium estimate)** (Volume still comes from Keyword Planner) and mark with `*` in the table.

Present the full scored table sorted by total score descending.

---

## Step 4 — Output

### Part A: Ranked Table

```
| # | Keyword (TH/EN)              | Searches/mo | Trend (YoY) | Vol | Thai gap | Intent | Thrive link         | Feasibility | Score |
|---|------------------------------|------------:|-------------|-----|----------|--------|---------------------|-------------|-------|
| 1 | วิธีลด LDL ตามธรรมชาติ       |         590 | +22%        | 2   | 2        | 3      | check-up, chelation | 2           | 11/15 |
| 2 | LDL สูงอันตรายไหม             |         170 | 0%          | 2   | 3        | 3      | check-up            | 3           | 13/15 |
| 3 | LDL คืออะไร                   |       2,400 | -10%        | 3   | 1        | 3      | —                   | 1           |  9/15 |

(Numbers above are illustrative only.) Always show the real **Searches/mo** number next to the 1–3 score — the owner reads the number, not the score.
Add a short "Related queries with volume" list from Keyword ideas under the table.
```

### Part B: Winner Declaration + Content Brief

```
✅ WINNER: [keyword]
Rationale: [one sentence — why this keyword, what gap it fills, which Thrive service it feeds]

────────────────────────────────────────────────
CONTENT BRIEF — paste into /thrive-content-writer
────────────────────────────────────────────────
TARGET KEYWORD:      [winner keyword]
SECONDARY KEYWORDS:  [3–5 terms — draw from positions 2–5 in the ranked table; weave naturally into the post]
SUGGESTED H1:        "[Thai headline — compelling, includes keyword, ≤70 chars]"
META DESCRIPTION:    "[Thai, ≤155 chars, includes keyword, not clickbait]"
CONTENT LENGTH:      1,600–2,200 words
SLUG:                [kebab-case English translation — match site convention, e.g. lower-ldl-naturally]

H2 OUTLINE:
  1. [What is X / establish the topic]
  2. [Why it matters / symptoms / risks]
  3. [Main actionable content — the core of the post]
  4. [Evidence / deeper science]
  5. [When to see a doctor / warning signs]
  6. [How Thrive helps — links to service, natural CTA]

PEOPLE ALSO ASK (from SERP):
  - [Question 1]
  - [Question 2]
  - [Question 3]

THRIVE SERVICE LINK:  /[service-slug]
CTA:                  "[Thai CTA — references service; use LINE @thrivewellnessth or Tel: 095-934-9640]"
────────────────────────────────────────────────
```

Paste the content brief directly into `/thrive-content-writer` to begin writing.
