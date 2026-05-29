# Spec: /lp/adrenal-fatigue Landing Page
**Date:** 2026-05-29
**Author:** Claude (brainstorming session)
**Status:** Awaiting user review

---

## Overview

A conversion-focused landing page at `/lp/adrenal-fatigue` for Google Search Ads traffic. No site navigation or footer nav — stripped down to drive one action: complete the symptom quiz → see personalized result → call Thrive.

**Traffic source:** Google Search Ads (keywords: "อ่อนเพลียเรื้อรัง", "ต่อมหมวกไตล้า", "adrenal fatigue กรุงเทพ")
**Primary conversion:** Phone call to 095-934-9640
**Language:** Thai primary, English medical terms as supporting labels
**URL:** `/lp/adrenal-fatigue`

---

## Page Structure

```
1. Sticky Bar
2. Hero Section
3. Context Strip
4. Quiz Section (6 questions, one per screen)
5. Result Section (conditional — 3 categories)
6. Doctor Trust Block
7. Minimal Footer
```

---

## Section Specs

### 1. Sticky Bar
- Left: Thrive logo (SVG)
- Right: `☎ 095-934-9640` — tappable on mobile
- Background: white, subtle drop shadow on scroll
- No nav links

### 2. Hero Section
**Headline (Thai):**
> อ่อนเพลียทุกเช้า แม้นอนหลับพอ?
> ร่างกายคุณอาจกำลังส่งสัญญาณ Adrenal Fatigue

**Subline:**
> ภาวะที่ฮอร์โมน Cortisol และ DHEA ไม่สมดุล — พบบ่อยในคนกรุงเทพที่เครียดสะสม

**4 Symptom Bullets (recognition moment):**
- ตื่นนอนแล้วยังเหนื่อย ต้องใช้เวลานานกว่าจะตื่นตัว
- ช่วงบ่ายง่วงหนักจนทำงานต่อไม่ได้
- อยากของหวาน / กาแฟตลอดวัน
- น้ำหนักลดไม่ลง ทั้งที่คุมอาหารและออกกำลังกายอยู่

**Primary CTA button:**
> ประเมินอาการตัวเอง 6 ข้อ → รู้ผลทันที

**Trust signal below CTA:**
> ออกแบบโดย พญ. ชนากานต์ ตระหง่านศรี · แพทย์เวชศาสตร์ชะลอวัย · Thrive Wellness Clinic

---

### 3. Context Strip
Two-line GEO hook — appears between hero and quiz:

> **ภาวะต่อมหมวกไตล้า (Adrenal Fatigue)** เกิดจากฮอร์โมนความเครียด Cortisol และ DHEA สะสมไม่สมดุลเป็นเวลานาน ตรวจได้ด้วยการเจาะเลือดเพียงครั้งเดียว และรักษาได้ภายใน 2–3 เดือน [1]

Citation: ใช้ข้อมูลจากงานวิจัยจริง (thrive-content-writer skill จะหา citation ระหว่าง implementation)

---

### 4. Quiz Section

**UX:** One question per screen with progress bar (1/6 … 6/6). Smooth slide transition. No back button needed — forward only.

**Scoring model:** Multi-dimension threshold (matches QuizEngine.mjs format).
Each answer adds to named score dimensions. Results trigger based on `threshold` objects.

Dimensions: `severity`, `cortisol`, `urgency`, `chronicity`

| # | Question (TH) | Answer A | Answer B | Answer C |
|---|---|---|---|---|
| 1 | ตื่นนอนตอนเช้ารู้สึกอย่างไร? | สดชื่น พร้อมเริ่มวัน `{}` | พอไปได้ ต้องใช้เวลาหน่อย `{severity:1}` | เหนื่อยตั้งแต่ตื่น อยากนอนต่อ `{severity:3}` |
| 2 | ช่วงบ่าย 14:00–16:00 รู้สึกอย่างไร? | มีพลังงานปกติ `{}` | ง่วงเล็กน้อย พอสู้ได้ `{severity:1}` | ง่วงมากจนทำงานต่อแทบไม่ได้ `{severity:3}` |
| 3 | อยากของหวาน หรือของเค็มบ่อยแค่ไหน? | แทบไม่เลย `{}` | บางวันอยาก `{cortisol:1}` | อยากเกือบทุกวัน `{cortisol:3}` |
| 4 | น้ำหนักเปลี่ยนแปลงทั้งที่คุมอาหาร / ออกกำลังกายอยู่? | ไม่เปลี่ยน ปกติดี `{}` | เปลี่ยนเล็กน้อย `{cortisol:1}` | ลดไม่ลงเลย `{cortisol:3}` |
| 5 | ความเครียดสะสมในชีวิตตอนนี้อยู่ระดับไหน? | น้อย จัดการได้ดี `{}` | ปานกลาง `{urgency:1}` | สูงมาก รู้สึกหนักเหนื่อยตลอด `{urgency:3}` |
| 6 | อาการเหล่านี้เป็นมานานแค่ไหนแล้ว? | ไม่ถึงเดือน `{}` | 1–6 เดือน `{chronicity:2}` | มากกว่า 6 เดือน `{chronicity:3}` |

**Result thresholds:**

| result_id | threshold | title |
|---|---|---|
| `early` | `severity≥1` OR `cortisol≥1` | เริ่มมีสัญญาณเตือน |
| `moderate` | `severity≥3` OR `(cortisol≥3 AND urgency≥1)` | ฮอร์โมนเริ่มไม่สมดุล |
| `high` | `severity≥4` AND `urgency≥1` AND `chronicity≥2` | ต่อมหมวกไตน่าจะต้องการความช่วยเหลือแล้ว |

---

### 5. Result Section (3 Categories)

แสดงทันทีหลังตอบครบ 6 ข้อ ไม่มี gate / ไม่ต้องกรอกอีเมลก่อน

#### Result: `early` (score 0–5)
**Title:** เริ่มมีสัญญาณเตือน — ดูแลก่อนสาย
**Body:** ผลประเมินแสดงว่าคุณมีอาการบางส่วนที่อาจบ่งชี้ถึงภาวะเริ่มต้น การพูดคุยกับแพทย์เพื่อตรวจระดับ Cortisol และ DHEA จะช่วยให้รู้แน่ชัดและป้องกันได้ตั้งแต่เนิ่นๆ
**CTA:** `โทรขอคำแนะนำฟรี 095-934-9640`

#### Result: `moderate` (score 6–11)
**Title:** ฮอร์โมนเริ่มไม่สมดุล — ควรตรวจ Cortisol & DHEA
**Body:** ผลประเมินชี้ว่าอาการของคุณตรงกับหลายสัญญาณของภาวะต่อมหมวกไตล้าในระยะปานกลาง แนะนำให้ตรวจเลือดเพื่อวัดระดับฮอร์โมนโดยตรง และวางแผนการรักษาเฉพาะบุคคลกับแพทย์
**CTA:** `โทรนัดตรวจ 095-934-9640`

#### Result: `high` (score 12–18)
**Title:** ต่อมหมวกไตน่าจะต้องการความช่วยเหลือแล้ว
**Body:** ผลประเมินแสดงระดับความเสี่ยงสูง อาการที่คุณมีสอดคล้องกับภาวะต่อมหมวกไตล้าในระยะที่ควรได้รับการดูแล ยิ่งรักษาเร็วเท่าไหร่ ระยะเวลาฟื้นตัวยิ่งสั้นลง
**CTA:** `โทรด่วน — นัดได้วันนี้ 095-934-9640`

**Disclaimer (ทุก result):**
> แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ ผลที่ได้เป็นเพียงการคัดกรองเบื้องต้นเท่านั้น ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง

---

### 6. Doctor Trust Block
- Photo: `/dr-chanakan-trangansri-thrive-400x400.jpg`
- Name: พญ. ชนากานต์ ตระหง่านศรี (Dr. Chanakan Trangansri)
- Title: แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ
- Specializations: Anti-aging · Hormone Balance · Functional Medicine · Nutrition Wellness
- Short bio: ผู้เชี่ยวชาญด้านสมดุลฮอร์โมนและเวชศาสตร์ชะลอวัย ดูแลผู้ป่วยภาวะต่อมหมวกไตล้าที่ Thrive Wellness Clinic กรุงเทพ

---

### 7. Minimal Footer
- ที่อยู่: The Crystal Park ชั้น 2 อาคาร B เลขที่ 199 ถนนประดิษฐ์มนูธรรม กรุงเทพฯ 10230
- เวลาเปิด: ทุกวัน 10:00–19:00
- โทร: 095-934-9640 (tappable)
- LINE: @thrivewellnessth (tappable)
- ไม่มี site nav links

---

## Technical Architecture

### File Structure
```
astro/src/pages/lp/
└── adrenal-fatigue.astro       ← new LP page (noindex)

astro/src/components/lp/
├── LpStickyBar.astro           ← logo + phone
├── LpHero.astro                ← headline + bullets + CTA
├── LpContextStrip.astro        ← 2-line GEO hook
├── LpQuiz.astro                ← wraps QuizEngine.astro
├── LpResult.astro              ← conditional result display
├── LpDoctorTrust.astro         ← doctor block
└── LpFooter.astro              ← minimal footer

astro/src/data/
└── lp-adrenal-fatigue-quiz.ts  ← quiz questions + scoring + results data
```

### Reuse existing components
- `QuizEngine.astro` — existing quiz engine, pass quiz data as props
- `DoctorAttribution.astro` — reuse for doctor block
- `SEO.astro` — with `noIndex: true` (LP should not rank organically — paid traffic only)

### SEO/noindex
`noIndex: true` on this page — LP is for paid traffic, canonical should point to `/adrenal-fatigue` service page.

### Analytics events (fire via `<script>`)
| Event | Trigger |
|---|---|
| `lp_quiz_start` | User clicks first quiz CTA |
| `lp_quiz_complete` | User reaches result screen |
| `lp_result_view` | Result rendered (include `result_category` param) |
| `lp_cta_click` | Phone CTA clicked (include `result_category`) |

---

## Content Requirements (thrive-content-writer)
- Context strip and result body copy requires minimum 1 citation each
- All medical claims qualified: "อาจบ่งชี้", "ควรพูดคุยกับแพทย์", "แบบประเมินเบื้องต้น"
- No diagnosis language, no cure claims
- Disclaimer on every result screen

---

## Skills Used During Implementation
- `thrive-content-writer` — hero copy, context strip, result body copy, citations
- `lead-quiz-designer` — quiz questions, scoring, result definitions
- `frontend-design` — visual design of LP components (Thrive brand: navy #2d358c, teal #00ab9e, saffron #e9a820, cream #FEF4E8)

---

## Out of Scope
- A/B testing framework
- Email/LINE capture before result (decided: show result freely, phone CTA only)
- Thai-language version of doctor bio on result page (use component default)
- Consultant password gate on LP

---

## Open Questions (resolve before implementation)
- [x] QuizEngine.astro supports one-question-per-screen via JS — confirmed from quizEngine.mjs
- [x] Scoring uses named dimensions (severity, cortisol, urgency, chronicity) — not a single total
- [ ] QuizEngine shows a lead form (name/phone/LINE) after result by default. LP design wants phone CTA only. Decision: add `showLeadForm={false}` prop to QuizEngine, or create `LpQuiz.astro` wrapper that suppresses the form and shows phone CTA button instead. **Needs decision before implementation.**
- [ ] Are `/lp/*` pages excluded from sitemap.xml automatically, or does sitemap.ts need updating?
- [ ] Confirm phone number 095-934-9640 is correct for tracking (vs. a dedicated ads tracking number)
