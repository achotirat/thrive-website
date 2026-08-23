# Crystal Quiz Express — Design Spec

**Date:** 2026-08-23
**Context:** The existing `/crystal-quiz` (live on `main`, 6-domain branching quiz, ~43 questions) is being kept as-is. This spec is for a second, separate, much simpler booth page requested as a "cleaner version" — a single multi-select question instead of a branching quiz.

## 1. Goal

One page: a single question with 6 checkboxes (pick any that apply) → name + phone → submit → booth voucher-claim thank-you screen. No branching, no scoring, no per-domain result text — this quiz intentionally has none of `/crystal-quiz`'s complexity.

## 2. Why not reuse the quiz engine

`QuizEngine.astro` / `quizEngine.mjs` / `crystalBoothQuiz.mjs` exist to solve branching and score-based result selection. This page has neither — it's a checklist plus a contact form. Building it on the quiz engine would mean coercing a single-select state machine into multi-select (real added complexity) to get a capability (branching/scoring) this page doesn't use. Simpler and more honest to build it as its own self-contained form, adapting `LeadForm.astro`'s already-proven submission logic (attribution capture, Turnstile, `/api/leads` POST, redirect to `/thank-you`) rather than the quiz runtime.

## 3. Page

**Route:** `astro/src/pages/crystal-quiz-express.astro`
**Layout:** `BaseLayout` → `Header` → short intro → the form (see §4) → `Footer`. `noIndex: true` (temporary campaign page, same as `/crystal-quiz`), excluded from the sitemap filter in `astro.config.mjs` alongside `/crystal-quiz`.

## 4. The form (one section, one submit)

Visually two groups, but a single `<form>` with one submit button — no multi-step wizard.

**Group 1 — symptom checklist** (checkboxes, name=`concerns`, value = each option's slug):

| value | label |
|---|---|
| `hormone` | ฮอร์โมนแปรปรวน รอบเดือนไม่ปกติ หรือสงสัยวัยทอง |
| `metabolism` | เผาผลาญพัง น้ำหนักขึ้นง่าย ลดยาก |
| `liver` | กังวลเรื่องตับ เหนื่อยง่าย ดื่ม/ใช้ยาบ่อย |
| `skin` | ผิวแห้ง คัน หรือมีผื่นแพ้ |
| `vitamin` | สงสัยว่าขาดวิตามินหรือแร่ธาตุ |
| `stress` | เครียดสะสม นอนไม่หลับ |

(Verbatim reuse of the original `top-concern` question's 6 labels/order from `crystalBoothQuiz.mjs`.)

Client-side validation: **at least 1 checkbox required** before submit — show an inline error, don't submit silently.

**Group 2 — contact fields** (same shape as `LeadForm.astro`): ชื่อ-นามสกุล\* (`name`), เบอร์โทรศัพท์\* (`phone`), LINE ID (`line_id`, optional), consent checkbox (required). No message textarea, no age/preferred_date — those aren't relevant here.

## 5. Submit payload

POST to `/api/leads` (existing endpoint, no backend changes needed — `ALLOWED_FIELDS` already covers everything used here):

| Field | Value |
|---|---|
| `name`, `phone`, `line_id` | from form |
| `service_interest` | `crystal-quiz-express` |
| `source_page` | `crystal-quiz-express` |
| `message` | Thai sentence composed from checked labels, e.g. `สนใจ: ฮอร์โมน, ผิว, เครียด/นอนไม่หลับ` — human-readable for booth staff / CRM |
| `quiz_id` | `crystal-quiz-express` |
| `quiz_answers` | JSON array of the checked `concerns` values, e.g. `["hormone","skin","stress"]` — structured, for later filtering |
| `nurture_segment` | `booth-express` (fixed — no per-domain segmentation, unlike `/crystal-quiz`) |
| attribution fields, `consent`, `consent_at`, `consent_version` | same as every other lead form on the site |

No `quiz_result_id` / `quiz_result_title` / `quiz_scores` — there is no result.

## 6. Thank-you / voucher claim

Redirect to `/thank-you?quiz=crystal-booth-checkup&service=crystal-quiz-express` on success. This reuses the **exact same booth banner** already live on `/thank-you` (added for `/crystal-quiz` in the last round — the banner triggers on `quiz=crystal-booth-checkup` specifically, not on which page sent the visitor there) — no changes needed to `thank-you.astro`.

## 7. Out of scope / unchanged

- `crystalBoothQuiz.mjs`, `QuizEngine.astro`, `quizEngine.mjs`, `quizRuntime.mjs` — untouched.
- `/crystal-quiz` — untouched, stays live as the deeper branching version.
- `/api/leads` (netlify function) — untouched, already accepts every field this form sends.
- `/thank-you` — untouched, its existing `quiz=crystal-booth-checkup` banner condition already covers this page's redirect.
