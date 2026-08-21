# Crystal Park Booth Quiz — Design Spec

**Date:** 2026-08-20
**Event:** Booth at The Crystal Park, 26–30 Aug 2026
**Goal:** A QR-scannable, mobile-first self-assessment quiz that lets booth visitors screen themselves across 6 symptom areas, capture their name+phone as a lead, and claim a physical voucher on-site.

## 1. Why / constraints

- Booth traffic is walk-by — must work standing at a booth on the visitor's own phone (QR scan → quiz, no app, no LP hopping).
- One combined questionnaire covering all 6 areas the clinic wants to screen for: hormones (incl. menopause), metabolism/weight, liver, skin, vitamin/mineral deficiency, stress/sleep (adrenal fatigue).
- Voucher is a physical item handed out at the booth by staff — not a discount code the system needs to generate or verify. Our job stops at "lead captured + confirmation screen shown," staff handle the physical hand-out and any duplicate-claim judgment call themselves.
- Went through several rounds of scope revision during brainstorming — landed on: **6 domains, each a ~7-9 question linear-scoring mini-quiz** (not a 2-question shortcut, not deep multi-outcome branching). See §6 for why.

## 2. Architecture

Reuses 100% of the existing quiz infrastructure (`astro/src/components/QuizEngine.astro`, `astro/src/lib/quizEngine.mjs`, `astro/src/lib/quizRuntime.mjs`, `/api/leads`) — same pattern as the 6 quizzes already live in `quizDefinitions.mjs` (hormones, IV drip, food intolerance, chelation, HBOT, mental health) and the standalone `astro/src/data/lp-adrenal-fatigue-quiz.ts`.

**New pieces:**

1. **One new quiz object** — `crystalBoothQuiz` — added to `quizDefinitions.mjs` (or its own file, implementer's call). Structure: a domain-selector question (`top-concern`, 6 answers) whose `nextQuestionId` routes into one of 6 independent linear question chains. Each chain is self-contained (never crosses into another domain), ending with `completed: true` when its last question has no `nextQuestionId`.
2. **One new lightweight Astro page** — `astro/src/pages/crystal-quiz.astro`. Not a full Tier-A service page (no OfferStack/DoctorAttribution/related-services/FAQ) — just `BaseLayout` → short intro → `<QuizEngine quiz={crystalBoothQuiz} />`. `SEO` component gets `noIndex={true}` (temporary campaign page, not for organic search).
3. **Booth banner on `/thank-you`** — when `?quiz=crystal-booth-checkup` is present in the URL query, show "✅ ทำแบบทดสอบสำเร็จ — แสดงหน้าจอนี้ให้พนักงานที่บูธเพื่อรับของ" instead of the generic "we'll call you back" copy. Existing dataLayer/conversion tracking on that page stays as-is.
4. **Progress-bar fix in `quizRuntime.mjs`** (see §7) — required because this is the first quiz to combine multiple independent question chains in one quiz object.

No changes needed to `/api/leads` (netlify function) — it already accepts `quiz_id`, `quiz_result_id`, `quiz_scores`, `quiz_answers`, `nurture_segment`, `name`, `phone`, `line_id`, and requires name+phone (LINE optional), which matches what was agreed.

**No outbound links to other service pages.** Every result's `cta` points to `#quiz-lead-form` (scrolls down to the lead form already on the same page) — visitors never leave `/crystal-quiz` until after they submit and get redirected to the `/thank-you` claim screen. Recommended next steps mention the relevant Thrive test/service **by name in plain text only** (no link).

## 3. Flow

```
scan QR → /crystal-quiz
  → Q1 "ตอนนี้อะไรกวนใจคุณมากที่สุด?" (6 choices)
  → routes into that domain's question chain (7-9 sequential questions,
    single choice, 3 answers each, answers carry point values)
  → result screen: 1 of 3 severity tiers for that domain
    (early signal / should get checked / should prioritize this)
    + 2-3 recommended next steps (plain text, service name mentioned, no link)
  → lead form (name*, phone*, LINE optional, consent checkbox) — same on-page form
    used by every other quiz on the site
  → submit → POST /api/leads → redirect to /thank-you?quiz=crystal-booth-checkup&...
  → /thank-you shows booth claim banner
```

## 4. Domain → score-key mapping (important implementation detail)

All 6 domains live in **one** `quiz.results` array, evaluated by `getQuizResult()`, which picks the highest-scoring *eligible* result across the **entire** results list — not scoped to the domain the visitor actually went through. If every domain reused the same score key (e.g. generic `score`), a hormone-domain session with `score: 14` could accidentally also satisfy a lower-threshold metabolism-domain result, since `meetsThreshold` only checks whether the named key is present and high enough — it doesn't know which domain the session actually traversed.

**Fix: every domain uses its own namespaced score key.** A session only ever accumulates points under the one key its chain uses, so no other domain's results become eligible.

| Domain | Score key | Questions | Reused from |
|---|---|---|---|
| ฮอร์โมน (incl. วัยทอง) | `scoreHormone` | 8 | new, informed by existing `hormoneBalanceQuiz` |
| เผาผลาญ/น้ำหนัก | `scoreMetabolism` | 7 | new |
| ตับ | `scoreLiver` | 7 | new |
| ผิว (แห้ง/ผื่นแพ้) | `scoreSkin` | 7 | new |
| วิตามิน/แร่ธาตุ | `scoreVitamin` | 7 | new |
| เครียด/นอนไม่หลับ | `scoreStress` | 6 | **reused wholesale** from `astro/src/data/lp-adrenal-fatigue-quiz.ts` |

Each domain: 3 results (early / moderate / high), same shape as the existing adrenal-fatigue quiz — `high` needs a high threshold, `moderate` a mid threshold, `early` acts as the fallback.

> **Amendment (found during implementation, Task 3):** `early`'s threshold cannot actually be `{}` (or `{ scoreX: 0 }`, which is equivalent) — since all 6 domains' results share one `quiz.results` array, an unconditional catch-all is "eligible" for every session regardless of which domain it came from, and can win another domain's session on tie-break. Fix: each domain's first question's lowest-severity answer scores `1` instead of `0`, and `early`'s threshold is `{ scoreX: 1 }` — genuinely scoped to sessions that actually entered that domain. See the implementation plan's Global Constraints for the full explanation.

**วัยทอง (menopause) lives inside the hormone domain**, not as a separate stress-domain branch — the reused adrenal-fatigue content doesn't cover menopause, and hormone-domain questions (cycle changes, hot flashes) already do it more naturally.

## 5. Full quiz content

### Meta

```
id: 'crystal-booth-checkup'
serviceSlug: 'crystal-quiz'
title: 'เช็กสุขภาพเบื้องต้น'
eyebrow: 'Crystal Park Booth Check'
intro: 'ตอบคำถามสั้น ๆ เพื่อดูว่าตอนนี้ร่างกายคุณส่งสัญญาณอะไร แล้วฝากเบอร์ติดต่อรับของรางวัลที่บูธได้เลย'
startQuestionId: 'top-concern'
leadFormTitle: 'ฝากเบอร์ติดต่อ รับของรางวัลที่บูธได้เลย'
```

### Q1 — domain selector (`top-concern`)

"ตอนนี้อะไรกวนใจคุณมากที่สุด?" — helper: "เลือกข้อที่ตรงกับคุณที่สุด"

1. "ฮอร์โมนแปรปรวน รอบเดือนไม่ปกติ หรือสงสัยวัยทอง" → `hormone-q1`
2. "เผาผลาญพัง น้ำหนักขึ้นง่าย ลดยาก" → `metabolism-q1`
3. "กังวลเรื่องตับ เหนื่อยง่าย ดื่ม/ใช้ยาบ่อย" → `liver-q1`
4. "ผิวแห้ง คัน หรือมีผื่นแพ้" → `skin-q1`
5. "สงสัยว่าขาดวิตามินหรือแร่ธาตุ" → `vitamin-q1`
6. "เครียดสะสม นอนไม่หลับ" → `stress-q1` (= adrenal-fatigue quiz's `q1`, reused)

### Domain: ฮอร์โมน (incl. วัยทอง) — `scoreHormone`, threshold high ≥10 / moderate ≥5 / early {}

1. **รอบเดือนช่วง 2-4 สัปดาห์ที่ผ่านมาเป็นอย่างไร?** (helper: ถ้าหมดประจำเดือนแล้วให้เลือกข้อ 3)
   - มาสม่ำเสมอตามปกติ (0)
   - เริ่มมาไม่สม่ำเสมอ ห่างขึ้นหรือถี่ขึ้น (2)
   - ขาดหรือหมดไปแล้ว หรือมีอาการก่อนวัยทองชัดเจน (3)
2. **มีอาการร้อนวูบวาบ เหงื่อออกกลางคืน หรือใจสั่นไหม?**
   - ไม่มี (0) / มีบ้างเป็นครั้งคราว (1) / มีบ่อยจนรบกวนการนอนหรือชีวิตประจำวัน (3)
3. **อารมณ์ช่วงนี้เป็นอย่างไร?**
   - ค่อนข้างคงที่ (0) / หงุดหงิดง่ายขึ้น หรือมี PMS ชัดก่อนมีประจำเดือน (2) / แปรปรวนมาก ควบคุมยาก (3)
4. **ผิวหรือผมช่วงนี้เปลี่ยนไปไหม?**
   - ไม่เปลี่ยน (0) / ผิวแห้งขึ้นหรือผมร่วงเล็กน้อย (1) / ผิวหมองคล้ำ ผมร่วงเยอะ หรือสิวฮอร์โมนเป็นรอบ (2)
5. **พลังงานระหว่างวันเป็นแบบไหน?**
   - ค่อนข้างคงที่ (0) / บ่ายแล้วหมดแรง ต้องพึ่งกาแฟ (1) / เหนื่อยตลอดวันทั้งที่นอนพอ (2)
6. **น้ำหนักหรือรอบเอวช่วงนี้เปลี่ยนไปไหม ทั้งที่กินไม่ต่างจากเดิม?**
   - ไม่เปลี่ยน (0) / ขึ้นเล็กน้อย โดยเฉพาะรอบเอว (1) / ขึ้นชัดเจน ลดยากกว่าเดิมมาก (2)
7. **การนอนหลับช่วงนี้เป็นอย่างไร?**
   - หลับสนิท ตื่นมาสดชื่น (0) / หลับยากขึ้นหรือตื่นกลางดึกบ้าง (1) / หลับไม่ลึก ตื่นบ่อย หรือบางคืนไม่หลับเลย (2)
8. **อาการเหล่านี้กระทบชีวิตประจำวันแค่ไหน?**
   - ไม่ค่อยกระทบ (0) / กระทบบ้างแต่ยังจัดการได้ (1) / กระทบชัดเจน ทั้งงาน อารมณ์ หรือความสัมพันธ์ (3)

Results:
- **high** — "สัญญาณฮอร์โมน/วัยทองค่อนข้างชัดเจน" — steps: จดอาการและรอบเดือนไว้เล่าให้แพทย์ฟัง / ปรึกษาทีมแพทย์เรื่องตรวจฮอร์โมนเพศและฮอร์โมนวัยทอง / แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — nurtureSegment `booth-hormone-high`
- **moderate** — "เริ่มมีสัญญาณฮอร์โมนไม่สมดุล ควรตรวจเพิ่มเติม" — nurtureSegment `booth-hormone-moderate`
- **early** — "ภาพรวมยังค่อนข้างสมดุล แต่ควรติดตามสัญญาณเล็ก ๆ" — nurtureSegment `booth-hormone-early`

### Domain: เผาผลาญ/น้ำหนัก — `scoreMetabolism`, threshold high ≥8 / moderate ≥4 / early {}

1. **น้ำหนักช่วง 2-3 เดือนที่ผ่านมาเปลี่ยนไปอย่างไร ทั้งที่กินไม่ต่างจากเดิม?** — คงที่ (0) / ขึ้นเล็กน้อย (1) / ขึ้นชัดเจนหรือลดยากมาก (3)
2. **รอบเอวหรือไขมันหน้าท้องเป็นอย่างไร?** — ไม่เปลี่ยน (0) / เพิ่มขึ้นเล็กน้อย (1) / เพิ่มขึ้นชัดเจนทั้งที่น้ำหนักตัวไม่ได้ขึ้นมาก (2)
3. **อยากของหวานหรือแป้งบ่อยแค่ไหน?** — แทบไม่เลย (0) / บางวัน โดยเฉพาะตอนเครียด (1) / อยากเกือบทุกวัน หิวแกว่งจนหงุดหงิด (2)
4. **พลังงานระหว่างวันเป็นแบบไหน?** — คงที่ (0) / บ่ายแล้วหมดแรง (1) / เหนื่อยตลอดวันทั้งที่นอนพอ (2)
5. **ออกกำลังกายหรือคุมอาหารแล้วเห็นผลไหม?** — เห็นผลตามที่ควร (0) / เห็นผลช้ากว่าที่เคย (1) / แทบไม่เห็นผลเลยทั้งที่พยายามมาก (3)
6. **มีอาการท้องอืด บวมง่าย หรือขับถ่ายผิดปกติร่วมด้วยไหม?** — ไม่มี (0) / มีบ้าง (1) / มีบ่อย (2)
7. **อาการเหล่านี้เป็นมานานแค่ไหนแล้ว?** — ไม่ถึงเดือน (0) / 1-6 เดือน (1) / มากกว่า 6 เดือนหรือเรื้อรัง (2)

Results (high/moderate/early) — steps mention: จดพฤติกรรมการกินและน้ำหนัก 2 สัปดาห์ / ปรึกษาทีมแพทย์เรื่องตรวจระบบเผาผลาญและไทรอยด์ / ไม่ควรลดน้ำหนักแบบหักโหมเองก่อนตรวจหาสาเหตุ — nurtureSegments `booth-metabolism-{high,moderate,early}`

### Domain: ตับ — `scoreLiver`, threshold high ≥9 / moderate ≥4 / early {}

1. **ดื่มแอลกอฮอล์บ่อยแค่ไหน?** — ไม่ดื่มเลย/น้อยมาก (0) / ดื่มเป็นครั้งคราว (1) / ดื่มบ่อยหรือปริมาณมากเมื่อดื่ม (3)
2. **ใช้ยา อาหารเสริม หรือสมุนไพรต่อเนื่องเป็นประจำไหม?** — ไม่ได้ใช้ (0) / ใช้บางตัวเป็นครั้งคราว (1) / ใช้หลายอย่างต่อเนื่อง (2)
3. **รู้สึกเหนื่อยง่าย อ่อนเพลียโดยไม่มีสาเหตุชัดเจนไหม?** — ไม่ค่อยมี (0) / มีบ้าง (1) / มีบ่อย ผิดปกติ (2)
4. **ผิวหน้ามัน สิวขึ้นง่าย หรือผิวคล้ำผิดปกติไหม?** — ไม่มี (0) / มีบ้าง (1) / มีชัดเจน (2)
5. **เคยตรวจเลือดแล้วค่าตับ (SGOT/SGPT) สูงกว่าปกติไหม?** — ไม่เคย/ปกติ (0) / เคยสูงเล็กน้อย (2) / เคยสูงชัดเจนหรือหมอแจ้งให้ติดตาม (4)
6. **มีอาการท้องอืด แน่นใต้ชายโครงขวา หรือเบื่ออาหารไหม?** — ไม่มี (0) / มีบ้าง (1) / มีบ่อย (2)
7. **น้ำหนักตัวตอนนี้เป็นอย่างไร?** — เกณฑ์ปกติ (0) / เกินเล็กน้อย (1) / เกินค่อนข้างมาก (เสี่ยงไขมันพอกตับ) (2)

Results — steps mention: ตรวจการทำงานของตับ (Liver Function Test) / ปรึกษาทีมแพทย์เรื่องกลูต้าไธโอนดริปเพื่อดีท็อกซ์ตับ / ลดหรือเว้นแอลกอฮอล์ระหว่างรอผลตรวจ — nurtureSegments `booth-liver-{high,moderate,early}`

### Domain: ผิว — `scoreSkin`, threshold high ≥8 / moderate ≥4 / early {}

1. **ผิวคุณช่วงนี้เป็นอย่างไร?** — ปกติดี (0) / แห้งขึ้น ตึงบ่อย (1) / แห้งมาก ลอก หรือคันร่วมด้วย (2)
2. **มีผื่นแดง คัน หรือลมพิษขึ้นบ่อยไหม?** — ไม่มี (0) / มีบ้างเป็นครั้งคราว (2) / มีบ่อย เป็นๆ หายๆ หาสาเหตุไม่เจอ (3)
3. **ผื่นหรืออาการคันสัมพันธ์กับอาหาร ฝุ่น หรือสิ่งแวดล้อมบางอย่างไหม?** — ไม่แน่ใจ/ไม่เกี่ยว (0) / สงสัยว่าเกี่ยวแต่ไม่รู้ตัวกระตุ้น (2) / มั่นใจว่าเกี่ยวแต่ยังไม่เคยตรวจ (3)
4. **สิวหรือผิวมันขึ้นเป็นรอบ (สัมพันธ์กับฮอร์โมน) ไหม?** — ไม่มี (0) / มีบ้าง (1) / มีชัดเจนเป็นรอบ (2)
5. **ผิวหมองคล้ำ ไม่สดใสเหมือนก่อนไหม?** — ไม่รู้สึก (0) / รู้สึกบ้าง (1) / รู้สึกชัดเจน (1)
6. **อาการทางผิวกระทบความมั่นใจหรือชีวิตประจำวันแค่ไหน?** — ไม่ค่อยกระทบ (0) / กระทบบ้าง (1) / กระทบค่อนข้างมาก (2)
7. **เป็นมานานแค่ไหนแล้ว?** — ไม่ถึงเดือน (0) / 1-6 เดือน (1) / มากกว่า 6 เดือนหรือเรื้อรัง (2)

Results — steps mention: ปรึกษาทีมแพทย์เพื่อแยกว่าเป็นผิวแห้งขาดความชุ่มชื้นหรือมีสารก่อภูมิแพ้ร่วมด้วย / พิจารณาตรวจภูมิแพ้ IgE ถ้าสงสัยตัวกระตุ้น / เสริมความชุ่มชื้นและสารต้านอนุมูลอิสระจากภายในถ้าเน้นผิวแห้งหมองคล้ำ — nurtureSegments `booth-skin-{high,moderate,early}`

### Domain: วิตามิน/แร่ธาตุ — `scoreVitamin`, threshold high ≥8 / moderate ≥4 / early {}

1. **รู้สึกอ่อนเพลีย เพลียง่ายไหม ทั้งที่พักผ่อนพอ?** — ไม่ค่อยมี (0) / มีบ้าง (1) / มีบ่อยผิดปกติ (2)
2. **ผมร่วง เล็บเปราะ หรือแผลหายช้าไหม?** — ไม่มี (0) / มีบ้าง (1) / มีชัดเจน (2)
3. **ปวดเมื่อยกล้ามเนื้อ ตะคริว หรือปวดกระดูกบ่อยไหม?** — ไม่ค่อยมี (0) / มีบ้าง (1) / มีบ่อย (2)
4. **กินผัก ผลไม้ หรืออาหารหลากหลายครบ 5 หมู่สม่ำเสมอไหม?** — ครบและหลากหลายดี (0) / พอได้แต่ไม่ค่อยหลากหลาย (1) / กินซ้ำๆ ไม่หลากหลาย หรือไม่ตรงเวลา (2)
5. **มีภูมิแพ้ง่าย ป่วยบ่อย หรือแผลในปากขึ้นบ่อยไหม?** — ไม่ค่อยมี (0) / มีบ้าง (1) / มีบ่อย (2)
6. **สมองล้า ความจำหรือสมาธิลดลงไหม?** — ไม่ค่อยมี (0) / มีบ้าง (1) / มีบ่อย (2)
7. **เคยตรวจระดับวิตามิน/แร่ธาตุมาก่อนไหม?** — เคยตรวจแล้วปกติ (0) / ไม่เคยตรวจ อยากรู้ระดับตัวเอง (2) / เคยตรวจแล้วพบว่าขาดบางตัว (3)

Results — steps mention: พิจารณาตรวจ OligoScan (ไม่เจาะเลือด รู้ผลไว เหมาะกับวันนี้ที่บูธ) / ปรึกษาทีมแพทย์เรื่องอาหารเสริมที่เหมาะกับผลตรวจ / ปรับอาหารให้หลากหลายระหว่างรอผลตรวจ — nurtureSegments `booth-vitamin-{high,moderate,early}`

### Domain: เครียด/นอนไม่หลับ — `scoreStress`, threshold high ≥9 / moderate ≥4 / early {}

**Reused wholesale from `astro/src/data/lp-adrenal-fatigue-quiz.ts`** (questions `q1`-`q6`: ตื่นนอนรู้สึกอย่างไร / ช่วงบ่ายรู้สึกอย่างไร / อยากของหวานหรือเค็มบ่อยแค่ไหน / น้ำหนักเปลี่ยนทั้งที่คุมอาหาร / ความเครียดสะสมอยู่ระดับไหน / อาการเป็นมานานแค่ไหน). Only change: score key renamed `score` → `scoreStress`, result ids/nurtureSegments prefixed `booth-stress-{high,moderate,early}`, and the two existing results' `cta` (currently `tel:` call buttons) replaced with `#quiz-lead-form` to match this quiz's no-outbound-action rule. Copy text otherwise kept as-is (already reviewed, already live).

## 6. Why linear-scoring over branching (context for future readers)

Earlier passes of this design used two different patterns before landing here:
1. **Branching, 2 questions total** (Q1 domain pick → 1 domain-specific follow-up → result) — too shallow, felt pointless since multiple answers converged on the same result.
2. **Branching, 8-10 questions total across the whole quiz** — rejected because the user wanted 8-10 questions *per domain path*, and deep branching trees would require exponentially more unique question/answer copy to avoid feeling repetitive.

Landed on: **linear score-accumulation per domain**, matching the proven pattern already live in `lp-adrenal-fatigue-quiz.ts`. Every visitor in a domain answers the same fixed sequence; only the *chosen answers* (and thus score) vary. This scales linearly (not exponentially) with question count, produces genuinely differentiated tiered results, and let us reuse an entire existing domain's content outright.

## 7. Required engine fix: progress bar

`quizRuntime.mjs`'s `render()` currently computes progress as:

```js
const currentIndex = quiz.questions.findIndex(q => q.id === question.id) + 1;
progressEl.textContent = `ข้อ ${currentIndex} จาก ${quiz.questions.length}`;
```

`quiz.questions.length` is the flat count of **every** question object in the quiz, across all 6 domains (~42 total) — meaningless once a visitor is 3 questions into an 8-question domain path. Needs a path-aware fix. Because every domain chain is linear (no re-branching after the first question — all 3 answers in a domain always share the same `nextQuestionId`), the total length of the *current* path is deterministic and can be computed by walking forward from the current question via `nextQuestionId` until hitting a question with none. Proposed fix: compute `{ current, total }` by walking the chain from `quiz.startQuestionId` through `session.answers` (for `current`) and continuing forward via first-answer `nextQuestionId` from the current question (for `total`), instead of relying on array length. Falls back gracefully for existing single-chain quizzes (their computed total will match the old behavior).

## 8. Open items for whoever reviews this

- **Domain→service copy mentions** (gluta for liver/skin, allergy-ige for skin, oligoscan for vitamin, check-up for metabolism, hormones-quiz mention for hormone) are plain-text only, not links — confirm these are the services staff actually want promoted at the booth.
- **Medical copy review**: this quiz makes symptom-severity claims (e.g., liver enzyme thresholds, menopause signals) more directly than existing marketing pages. Recommend Dr. Pijak or another clinician spot-check the questions/results before go-live, same bar as blog content per [[feedback_blog_doctor_pijak]] convention — even though this isn't a blog post.
- **Voucher physical logistics** — out of scope for this build; booth staff own distribution and any duplicate-claim judgment calls.
- **Timeline**: event starts 2026-08-26. Needs `npx astro check` + `npm run build` clean, a PR, and Satemshi's approval per repo rules before merge — should target code-complete well before the 26th to leave review buffer.
