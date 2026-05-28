# thrive-keyword-scout Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `thrive-keyword-scout` project skill that takes a rough topic idea, expands it into keyword variations, scores them via SERP analysis, and outputs a ranked table + content brief ready for `/thrive-content-writer`.

**Architecture:** Single `SKILL.md` file written to `.claude/skills/thrive-keyword-scout/` (where Claude Code loads it) and mirrored to `skills/thrive-keyword-scout/` (team browsable copy). No scripts, no APIs — Claude runs `WebSearch` at runtime following the skill's instructions.

**Tech Stack:** Markdown + YAML frontmatter (skill format), WebSearch tool at runtime.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `.claude/skills/thrive-keyword-scout/SKILL.md` | Active skill — Claude Code loads from here |
| Create | `skills/thrive-keyword-scout/SKILL.md` | Team copy — identical content, browsable in repo |

---

## Task 1: Write the active skill file

**Files:**
- Create: `.claude/skills/thrive-keyword-scout/SKILL.md`

- [ ] **Step 1: Verify the skill directory doesn't already exist**

```bash
ls .claude/skills/
```
Expected: `lead-quiz-designer  thrive-content-writer  thrive-launch-audit` — no `thrive-keyword-scout`.

- [ ] **Step 2: Create the skill file**

Create `.claude/skills/thrive-keyword-scout/SKILL.md` with this exact content:

```markdown
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
| **Services to link** | check-up, food-intolerance, adrenal-fatigue, hbot, iv-drip, chelation, nk-cell, dna-test, hormones-quiz, oligoscan, personalized-vitamins, vitamins-and-micronutrients, urine-organic-test |
| **Blog URL pattern** | `/post/[slug]` on new.thrivewellnessth.com |

---

## Step 1 — Seed Expansion

Generate 8–10 keyword variations from the input topic across 4 angles:

| Angle | Purpose | Examples for LDL topic |
|---|---|---|
| Thai informational | "What is X", "X vs Y" | `LDL คืออะไร`, `LDL กับ HDL ต่างกันอย่างไร` |
| Thai concern/symptom | "Is X dangerous", "What causes X" | `LDL สูงอันตรายไหม`, `LDL สูงเกิดจากอะไร` |
| Thai actionable | "How to fix X naturally", "X foods" | `วิธีลด LDL ตามธรรมชาติ`, `อาหารลด LDL` |
| English expat | Topic + Bangkok/Thailand modifier | `lower LDL naturally Bangkok`, `LDL test Thailand` |

Present the full list before moving to Step 2.

---

## Step 2 — SERP Snapshot

Select the **4 most promising candidates** from Step 1 (highest relevance + actionable intent). Run `WebSearch` on each and record:

| Signal | What to look for |
|---|---|
| Content type dominating | Hospital, pharma, Wikipedia, clinic blog, YouTube |
| Thai content presence | Sparse Thai = ranking opportunity |
| Featured snippet | Empty position zero = win |
| People Also Ask | Note 3–5 questions — real user intent + FAQ material |
| Clinic competition | Any wellness clinic ranking = direct competition for Thrive |

---

## Step 3 — Score All Keywords

Score all 8–10 keywords on 5 dimensions (1–3 each, max 15):

| Dimension | 1 | 2 | 3 |
|---|---|---|---|
| **Volume signal** (SERP density + ads) | Sparse, no ads | Moderate | Dense, multiple ads |
| **Thai content gap** (less Thai = easier) | Lots of strong Thai content | Some Thai content | Almost none |
| **Intent fit** (informational = blog) | Transactional/navigational | Mixed | Pure informational |
| **Thrive service link** (leads to service?) | No clear link | Loose link | Direct link |
| **Ranking feasibility** (clinic blog vs competition) | Hospital/pharma dominates | Mix of authority + blogs | Thin/generic content |

**Rules:**
- Tie-breaking: equal scores → prefer stronger Thrive service link
- Minimum threshold: do not recommend a keyword below 8/15 — flag as "not worth pursuing" and suggest a reformulated alternative
- Expat English keywords: cap "Thai content gap" at 2 (always more English content)

Present the full scored table sorted by total score descending.

---

## Step 4 — Output

### Part A: Ranked Table

```
| # | Keyword (TH/EN)              | Intent   | Thai gap | Thrive link       | Feasibility | Score |
|---|------------------------------|----------|----------|-------------------|-------------|-------|
| 1 | วิธีลด LDL ตามธรรมชาติ       | info ✅   | medium   | check-up, chelation | medium    | 12/15 |
| 2 | LDL สูงอันตรายไหม             | info ✅   | low gap  | check-up          | easy        | 11/15 |
| 3 | LDL คืออะไร                   | info ✅   | high comp| —                 | hard        |  7/15 |
```

### Part B: Winner Declaration + Content Brief

```
✅ WINNER: [keyword]
Rationale: [one sentence — why this keyword, what gap it fills, which Thrive service it feeds]

────────────────────────────────────────────────
CONTENT BRIEF — paste into /thrive-content-writer
────────────────────────────────────────────────
TARGET KEYWORD:      [winner keyword]
SECONDARY KEYWORDS:  [3–5 related terms to weave naturally into the post]
SUGGESTED H1:        "[Thai headline — compelling, includes keyword, ≤70 chars]"
META DESCRIPTION:    "[Thai, ≤155 chars, includes keyword, not clickbait]"
CONTENT LENGTH:      1,600–2,200 words
SLUG:                [kebab-case, Thai or English]

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
CTA:                  "[Thai CTA — references service, includes LINE or phone]"
────────────────────────────────────────────────
```

Paste the content brief directly into `/thrive-content-writer` to begin writing.
```

- [ ] **Step 3: Verify YAML frontmatter parses**

```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('.claude/skills/thrive-keyword-scout/SKILL.md', 'utf8');
const match = content.match(/^---\n([\s\S]*?)\n---/);
console.log(match ? 'YAML block found ✅' : 'YAML block missing ❌');
console.log('name present:', content.includes('name: thrive-keyword-scout') ? '✅' : '❌');
console.log('description present:', content.includes('description:') ? '✅' : '❌');
"
```
Expected:
```
YAML block found ✅
name present: ✅
description present: ✅
```

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/thrive-keyword-scout/SKILL.md
git commit -m "feat(keyword-scout): add thrive-keyword-scout skill to .claude/skills"
```

---

## Task 2: Copy to team skills folder

**Files:**
- Create: `skills/thrive-keyword-scout/SKILL.md`

- [ ] **Step 1: Verify the team skills folder exists and check existing pattern**

```bash
ls skills/
```
Expected: `thrive-content-writer  thrive-launch-audit`

- [ ] **Step 2: Copy the file**

```bash
mkdir -p skills/thrive-keyword-scout
cp .claude/skills/thrive-keyword-scout/SKILL.md skills/thrive-keyword-scout/SKILL.md
```

- [ ] **Step 3: Verify the copy is identical**

```bash
diff .claude/skills/thrive-keyword-scout/SKILL.md skills/thrive-keyword-scout/SKILL.md
```
Expected: no output (files are identical).

- [ ] **Step 4: Commit**

```bash
git add skills/thrive-keyword-scout/SKILL.md
git commit -m "feat(keyword-scout): add thrive-keyword-scout to team skills/ folder"
```

---

## Task 3: Smoke-test with LDL example

This task validates the skill actually works before declaring done. Skills load at session start, so this requires starting a fresh Claude Code session after Task 2 is committed.

- [ ] **Step 1: Confirm skill appears in new session**

Start a new Claude Code session in this project directory. Check the available skills list in the system prompt — `thrive-keyword-scout` must appear.

Expected line in skills list:
```
- thrive-keyword-scout: Keyword research skill for Thrive Wellness Thailand blog...
```

- [ ] **Step 2: Run the smoke test**

In the new session, invoke:
```
/thrive-keyword-scout LDL นั้นสำคัญไฉน
```

- [ ] **Step 3: Verify Step 1 output (seed expansion)**

The skill must produce at least 8 keyword variations across the 4 angles:
- At least 2 Thai informational keywords
- At least 2 Thai concern/symptom keywords
- At least 2 Thai actionable keywords
- At least 1 English expat keyword

- [ ] **Step 4: Verify Step 2 output (SERP snapshot)**

The skill must run `WebSearch` on at least 3 of the top candidates and report:
- Content type observed
- Thai content presence
- At least 3 "People Also Ask" questions extracted

- [ ] **Step 5: Verify Step 3 output (scored table)**

The skill must produce a ranked table with all 5 scoring dimensions populated for each keyword. Minimum 6 keywords in the table.

- [ ] **Step 6: Verify Step 4 output (brief)**

The skill must produce:
- A `✅ WINNER:` declaration with one-line rationale
- A content brief with all required fields: TARGET KEYWORD, SECONDARY KEYWORDS, SUGGESTED H1, META DESCRIPTION, CONTENT LENGTH, SLUG, H2 OUTLINE (6 sections), PEOPLE ALSO ASK, THRIVE SERVICE LINK, CTA

- [ ] **Step 7: Save smoke test notes**

Note any issues observed (missing fields, wrong format, workflow skipped a step). If any step failed verification, fix the SKILL.md and repeat from Step 1.

- [ ] **Step 8: Commit smoke test confirmation**

No code change needed if the test passed. Just confirm the implementation is complete:

```bash
git log --oneline -3
```
Expected: the two commits from Tasks 1 and 2 at the top.
