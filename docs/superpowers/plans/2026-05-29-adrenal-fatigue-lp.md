# /lp/adrenal-fatigue Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a conversion-focused landing page at `/lp/adrenal-fatigue` — no nav/footer, Google Search Ads traffic, 6-question symptom quiz → 3 personalized result categories → phone CTA.

**Architecture:** Standalone Astro page using `BaseLayout` (for GTM/fonts/PDPA) but no `Header`/`Footer`. Quiz powered by existing `QuizEngine.astro` + `quizRuntime.mjs` with a new `showLeadForm={false}` prop to suppress the lead form. LP-specific components live in `astro/src/components/lp/`. Quiz data defined in `astro/src/data/lp-adrenal-fatigue-quiz.ts`.

**Tech Stack:** Astro 6, TypeScript, existing `QuizEngine.astro` + `quizRuntime.mjs` (unchanged logic), Thrive CSS design tokens from `global.css`, no new JS dependencies.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `astro/src/components/QuizEngine.astro` | Add `showLeadForm` prop |
| Create | `astro/src/data/lp-adrenal-fatigue-quiz.ts` | Quiz questions, scoring, results |
| Create | `astro/src/components/lp/LpStickyBar.astro` | Logo + phone sticky bar |
| Create | `astro/src/components/lp/LpHero.astro` | Headline, symptom bullets, quiz CTA |
| Create | `astro/src/components/lp/LpContextStrip.astro` | 2-line GEO / context hook |
| Create | `astro/src/components/lp/LpDoctorTrust.astro` | Dr. Chanakan trust block |
| Create | `astro/src/components/lp/LpFooter.astro` | Address, hours, phone (no nav) |
| Create | `astro/src/styles/lp.css` | LP-specific layout styles |
| Create | `astro/src/pages/lp/adrenal-fatigue.astro` | LP page (noindex, no nav) |

---

## Task 1: Add `showLeadForm` prop to QuizEngine.astro

**Files:**
- Modify: `astro/src/components/QuizEngine.astro`

The runtime already handles a missing `<form>` gracefully (`if (leadForm instanceof HTMLFormElement)`). We only need to conditionally render it in the Astro template.

- [ ] **Step 1: Update the Props interface and conditionally render the form**

Replace the entire file content with:

```astro
---
export interface Props {
  quiz: {
    id: string;
    title: string;
    eyebrow?: string;
    intro?: string;
    serviceSlug: string;
    leadFormTitle?: string;
    [key: string]: unknown;
  };
  showLeadForm?: boolean;
}

const { quiz, showLeadForm = true } = Astro.props;
const quizJson = JSON.stringify(quiz).replaceAll('</script', '<\\/script');
---

<section class="section quiz-engine-section" id="quiz">
  <div class="section-container">
    <div class="quiz-engine" data-quiz-root>
      <script is:inline type="application/json" data-quiz-json set:html={quizJson}></script>
      <div class="quiz-engine__intro">
        <span class="section-label">{quiz.eyebrow || 'Quiz'}</span>
        <h2>{quiz.title}</h2>
        {quiz.intro && <p>{quiz.intro}</p>}
      </div>

      <div class="quiz-engine__panel">
        <div class="quiz-engine__progress" data-quiz-progress></div>
        <div class="quiz-engine__question" data-quiz-question></div>
        <div class="quiz-engine__answers" data-quiz-answers></div>
        <div class="quiz-engine__result" data-quiz-result hidden></div>
      </div>

      {showLeadForm && (
        <form class="quiz-engine__lead-form" id="quiz-lead-form" data-quiz-lead-form hidden>
          <h3>{quiz.leadFormTitle || 'ส่งผลแบบทดสอบให้ทีม Thrive ช่วยดูต่อ'}</h3>
          <p>ทีมงานจะติดต่อกลับเพื่อแนะนำขั้นตอนถัดไปตามผลแบบทดสอบของคุณ</p>
          <input type="hidden" name="quiz_result_id" />
          <input type="hidden" name="nurture_segment" />
          <label>
            ชื่อ-นามสกุล *
            <input name="name" type="text" autocomplete="name" required maxlength="120" />
          </label>
          <label>
            เบอร์โทรศัพท์ *
            <input name="phone" type="tel" autocomplete="tel" required maxlength="32" />
          </label>
          <label>
            LINE ID
            <input name="line_id" type="text" autocomplete="off" maxlength="80" />
          </label>
          <label class="lead-form__consent">
            <input name="consent" type="checkbox" value="yes" required />
            <span>ยินยอมให้ Thrive Wellness Center ติดต่อกลับตามข้อมูลที่ให้ไว้เพื่อการนัดหมายและให้คำปรึกษา</span>
          </label>
          <p class="lead-form__status" data-quiz-status aria-live="polite"></p>
          <button type="submit" class="btn btn-primary">ส่งผลแบบทดสอบ</button>
        </form>
      )}
    </div>
  </div>
</section>

<script>
  import { mountQuizEngine } from '../lib/quizRuntime.mjs';

  document.querySelectorAll('[data-quiz-root]').forEach((root) => {
    mountQuizEngine(root);
  });
</script>
```

- [ ] **Step 2: Verify existing quiz pages still work**

Run:
```bash
cd astro && npx astro check
```
Expected: 0 errors. (Existing pages pass `quiz` without `showLeadForm` → defaults to `true`, no change in behaviour.)

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/QuizEngine.astro
git commit -m "feat(quiz): add showLeadForm prop to QuizEngine — defaults true, LP uses false"
```

---

## Task 2: Create the quiz definition

**Files:**
- Create: `astro/src/data/lp-adrenal-fatigue-quiz.ts`

Uses the same data shape as `quizDefinitions.mjs`. Single `score` dimension — simpler and sufficient for 3 result categories. Each result's `cta` drives the phone button in `renderResult()`.

- [ ] **Step 1: Create `astro/src/data/lp-adrenal-fatigue-quiz.ts`**

```typescript
const PHONE_HREF = 'tel:+66959349640';

export const adrenalFatigueLpQuiz = {
  id: 'adrenal-fatigue-lp',
  serviceSlug: 'adrenal-fatigue',
  title: 'ประเมินอาการต่อมหมวกไตล้า',
  eyebrow: 'Adrenal Fatigue · symptom check · 6 ข้อ',
  intro: 'ตอบตามที่รู้สึกจริงในช่วง 2–4 สัปดาห์ที่ผ่านมา — ใช้เวลาไม่ถึง 2 นาที',
  startQuestionId: 'q1',
  questions: [
    {
      id: 'q1',
      text: 'ตื่นนอนตอนเช้ารู้สึกอย่างไร?',
      helper: 'เลือกข้อที่ใกล้เคียงที่สุดในช่วงนี้',
      answers: [
        { id: 'q1a', label: 'สดชื่น พร้อมเริ่มวันได้เลย', scores: {}, nextQuestionId: 'q2' },
        { id: 'q1b', label: 'พอไปได้ ต้องใช้เวลาหน่อยกว่าจะตื่นตัว', scores: { score: 1 }, nextQuestionId: 'q2' },
        { id: 'q1c', label: 'เหนื่อยตั้งแต่ตื่น รู้สึกว่าไม่ได้นอนเลย', scores: { score: 3 }, nextQuestionId: 'q2' },
      ],
    },
    {
      id: 'q2',
      text: 'ช่วงบ่าย 14:00–16:00 รู้สึกอย่างไร?',
      answers: [
        { id: 'q2a', label: 'มีพลังงานปกติ ทำงานได้ตามปกติ', scores: {}, nextQuestionId: 'q3' },
        { id: 'q2b', label: 'ง่วงเล็กน้อย แต่พอสู้ต่อได้', scores: { score: 1 }, nextQuestionId: 'q3' },
        { id: 'q2c', label: 'ง่วงมากจนทำงานต่อแทบไม่ได้ ต้องพึ่งกาแฟหรือของหวาน', scores: { score: 3 }, nextQuestionId: 'q3' },
      ],
    },
    {
      id: 'q3',
      text: 'อยากของหวานหรือของเค็มบ่อยแค่ไหน?',
      answers: [
        { id: 'q3a', label: 'แทบไม่เลย', scores: {}, nextQuestionId: 'q4' },
        { id: 'q3b', label: 'บางวันอยาก โดยเฉพาะตอนเครียดหรือตอนบ่าย', scores: { score: 1 }, nextQuestionId: 'q4' },
        { id: 'q3c', label: 'อยากเกือบทุกวัน ถ้าไม่ได้กินจะหงุดหงิดหรืออ่อนแรง', scores: { score: 2 }, nextQuestionId: 'q4' },
      ],
    },
    {
      id: 'q4',
      text: 'น้ำหนักเปลี่ยนแปลงทั้งที่คุมอาหาร / ออกกำลังกายอยู่?',
      answers: [
        { id: 'q4a', label: 'ไม่เปลี่ยน ปกติดี', scores: {}, nextQuestionId: 'q5' },
        { id: 'q4b', label: 'เปลี่ยนเล็กน้อย รู้สึกว่าร่างกายตอบสนองช้าลง', scores: { score: 1 }, nextQuestionId: 'q5' },
        { id: 'q4c', label: 'ลดไม่ลงเลย หรือขึ้นทั้งที่พยายามมาก', scores: { score: 2 }, nextQuestionId: 'q5' },
      ],
    },
    {
      id: 'q5',
      text: 'ความเครียดสะสมในชีวิตตอนนี้อยู่ระดับไหน?',
      answers: [
        { id: 'q5a', label: 'น้อย จัดการได้ดี', scores: {}, nextQuestionId: 'q6' },
        { id: 'q5b', label: 'ปานกลาง มีบ้างแต่ผ่านได้', scores: { score: 1 }, nextQuestionId: 'q6' },
        { id: 'q5c', label: 'สูงมาก รู้สึกหนักและเหนื่อยตลอดเวลา', scores: { score: 2 }, nextQuestionId: 'q6' },
      ],
    },
    {
      id: 'q6',
      text: 'อาการเหล่านี้เป็นมานานแค่ไหนแล้ว?',
      answers: [
        { id: 'q6a', label: 'ไม่ถึงเดือน เพิ่งเริ่มสังเกตเห็น', scores: {} },
        { id: 'q6b', label: '1–6 เดือน เป็นๆ หายๆ', scores: { score: 2 } },
        { id: 'q6c', label: 'มากกว่า 6 เดือน หรือรู้สึกว่าเป็นปัญหาเรื้อรัง', scores: { score: 3 } },
      ],
    },
  ],
  results: [
    {
      id: 'high',
      title: 'ต่อมหมวกไตน่าจะต้องการความช่วยเหลือแล้ว',
      summary: 'ผลประเมินแสดงระดับความเสี่ยงสูง อาการที่คุณมีสอดคล้องกับภาวะต่อมหมวกไตล้าในระยะที่ควรได้รับการดูแล ยิ่งเริ่มรักษาเร็วเท่าไหร่ ระยะเวลาฟื้นตัวยิ่งสั้นลง',
      threshold: { score: 9 },
      nurtureSegment: 'adrenal-high',
      recommendedSteps: [
        'ตรวจระดับ Cortisol และ DHEA ด้วยการเจาะเลือด',
        'วางแผนการรักษาเฉพาะบุคคลกับแพทย์',
        'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
      ],
      cta: { label: 'โทรด่วน — นัดได้วันนี้ 095-934-9640', href: PHONE_HREF },
    },
    {
      id: 'moderate',
      title: 'ฮอร์โมนเริ่มไม่สมดุล — ควรตรวจ Cortisol & DHEA',
      summary: 'ผลประเมินชี้ว่าอาการของคุณตรงกับหลายสัญญาณของภาวะต่อมหมวกไตล้า การตรวจเลือดเพื่อวัดระดับฮอร์โมนโดยตรงจะช่วยยืนยันและวางแผนการรักษาเฉพาะบุคคลได้',
      threshold: { score: 4 },
      nurtureSegment: 'adrenal-moderate',
      recommendedSteps: [
        'ตรวจระดับ Cortisol และ DHEA เพื่อยืนยัน',
        'ปรึกษาแพทย์เรื่องการปรับวิถีชีวิตและอาหารเสริม',
        'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
      ],
      cta: { label: 'โทรนัดตรวจ 095-934-9640', href: PHONE_HREF },
    },
    {
      id: 'early',
      title: 'เริ่มมีสัญญาณเตือน — ดูแลก่อนสาย',
      summary: 'ผลประเมินแสดงว่าคุณมีอาการบางส่วนที่อาจบ่งชี้ถึงภาวะเริ่มต้น การพูดคุยกับแพทย์เพื่อตรวจระดับ Cortisol และ DHEA จะช่วยให้รู้แน่ชัดและป้องกันได้ตั้งแต่เนิ่นๆ',
      threshold: {},
      nurtureSegment: 'adrenal-early',
      recommendedSteps: [
        'พูดคุยกับแพทย์เพื่อประเมินความเสี่ยงเบื้องต้น',
        'ตรวจระดับ Cortisol และ DHEA เพื่อรู้แน่ชัด',
        'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
      ],
      cta: { label: 'โทรขอคำแนะนำฟรี 095-934-9640', href: PHONE_HREF },
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add astro/src/data/lp-adrenal-fatigue-quiz.ts
git commit -m "feat(lp): add adrenal fatigue LP quiz definition — 6q, 3 result categories, phone CTAs"
```

---

## Task 3: Create LP components

**Files:**
- Create: `astro/src/components/lp/LpStickyBar.astro`
- Create: `astro/src/components/lp/LpHero.astro`
- Create: `astro/src/components/lp/LpContextStrip.astro`
- Create: `astro/src/components/lp/LpDoctorTrust.astro`
- Create: `astro/src/components/lp/LpFooter.astro`

- [ ] **Step 1: Create `astro/src/components/lp/LpStickyBar.astro`**

```astro
---
export interface Props {
  phone?: string;
}
const { phone = '095-934-9640' } = Astro.props;
const tel = `tel:+66${phone.replace(/^0/, '').replace(/-/g, '')}`;
---

<div class="lp-sticky-bar">
  <a href="/" class="lp-sticky-bar__logo" aria-label="Thrive Wellness Clinic">
    <img src="/logo.svg" alt="Thrive" width="32" height="32" />
    <span>Thrive Wellness</span>
  </a>
  <a href={tel} class="lp-sticky-bar__phone" data-gtm-event="lp_phone_click" data-gtm-label="sticky-bar">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.29 6.29l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
    {phone}
  </a>
</div>
```

- [ ] **Step 2: Create `astro/src/components/lp/LpHero.astro`**

```astro
---
export interface Props {
  quizAnchor?: string;
}
const { quizAnchor = '#quiz' } = Astro.props;
---

<section class="lp-hero">
  <div class="lp-hero__inner">
    <div class="lp-hero__copy">
      <p class="lp-hero__eyebrow">Adrenal Fatigue · Bangkok</p>
      <h1 class="lp-hero__headline">
        อ่อนเพลียทุกเช้า<br />
        <span>แม้นอนหลับพอ?</span>
      </h1>
      <p class="lp-hero__subline">
        ร่างกายคุณอาจกำลังส่งสัญญาณ <strong>Adrenal Fatigue</strong> —
        ภาวะที่ฮอร์โมน Cortisol และ DHEA ไม่สมดุลจากความเครียดสะสม
      </p>

      <ul class="lp-hero__symptoms" aria-label="อาการที่พบบ่อย">
        <li>ตื่นนอนแล้วยังเหนื่อย ต้องใช้เวลานานกว่าจะตื่นตัว</li>
        <li>ช่วงบ่ายง่วงหนักจนทำงานต่อไม่ได้</li>
        <li>อยากของหวาน / กาแฟตลอดวัน</li>
        <li>น้ำหนักลดไม่ลง ทั้งที่คุมอาหารและออกกำลังกายอยู่</li>
      </ul>

      <a href={quizAnchor} class="lp-hero__cta btn btn-primary">
        ประเมินอาการตัวเอง 6 ข้อ → รู้ผลทันที
      </a>

      <p class="lp-hero__trust">
        ออกแบบโดย <strong>พญ. ชนากานต์ ตระหง่านศรี</strong>
        · แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ · Thrive Wellness Clinic
      </p>
    </div>

    <div class="lp-hero__image" aria-hidden="true">
      <img
        src="/adrenal-fatigue-hero-1200x630.jpg"
        alt="ภาวะต่อมหมวกไตล้า Adrenal Fatigue Thrive Wellness Clinic กรุงเทพ"
        width="560"
        height="420"
        loading="eager"
      />
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create `astro/src/components/lp/LpContextStrip.astro`**

```astro
---
// GEO hook — direct-answer paragraph for AI search
---

<section class="lp-context-strip">
  <div class="lp-context-strip__inner">
    <p>
      <strong>ภาวะต่อมหมวกไตล้า (Adrenal Fatigue)</strong> เกิดจากฮอร์โมนความเครียด
      Cortisol และ DHEA สะสมไม่สมดุลเป็นเวลานาน ตรวจได้ด้วยการเจาะเลือดเพียงครั้งเดียว
      และฟื้นฟูได้ภายใน 2–3 เดือนด้วยการดูแลเฉพาะบุคคล
    </p>
    <p class="lp-context-strip__cue">ทำแบบประเมินด้านล่าง — ใช้เวลาไม่ถึง 2 นาที</p>
  </div>
</section>
```

- [ ] **Step 4: Create `astro/src/components/lp/LpDoctorTrust.astro`**

```astro
---
// Static — always Dr. Chanakan for adrenal-fatigue LP
---

<section class="lp-doctor-trust">
  <div class="lp-doctor-trust__inner">
    <img
      src="/dr-chanakan-trangansri-thrive-400x400.jpg"
      alt="พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์ Thrive Wellness Clinic"
      width="96"
      height="96"
      class="lp-doctor-trust__photo"
      loading="lazy"
    />
    <div class="lp-doctor-trust__copy">
      <p class="lp-doctor-trust__name">พญ. ชนากานต์ ตระหง่านศรี (หมอนุ่น)</p>
      <p class="lp-doctor-trust__title">แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ</p>
      <p class="lp-doctor-trust__bio">
        ผู้เชี่ยวชาญด้านสมดุลฮอร์โมนและเวชศาสตร์ชะลอวัย ดูแลผู้ป่วยภาวะต่อมหมวกไตล้าที่
        Thrive Wellness Clinic กรุงเทพ ด้วยแนวทาง Anti-aging · Hormone Balance · Functional Medicine
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Create `astro/src/components/lp/LpFooter.astro`**

```astro
---
// Minimal footer — address + hours + phone only, no site nav
---

<footer class="lp-footer">
  <div class="lp-footer__inner">
    <address class="lp-footer__address">
      <strong>Thrive Wellness Clinic</strong><br />
      The Crystal Park ชั้น 2 อาคาร B เลขที่ 199 ถนนประดิษฐ์มนูธรรม กรุงเทพฯ 10230
    </address>
    <div class="lp-footer__contact">
      <span>เปิดทุกวัน 10:00–19:00</span>
      <a href="tel:+66959349640" data-gtm-event="lp_phone_click" data-gtm-label="footer">☎ 095-934-9640</a>
      <a href="https://line.me/R/ti/p/@thrivewellnessth" target="_blank" rel="noopener">LINE @thrivewellnessth</a>
    </div>
  </div>
  <p class="lp-footer__disclaimer">
    แบบประเมินบนหน้านี้ไม่ใช่การวินิจฉัยทางการแพทย์ ผลที่ได้เป็นเพียงการคัดกรองเบื้องต้นเท่านั้น
    ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง
  </p>
</footer>
```

- [ ] **Step 6: Commit**

```bash
git add astro/src/components/lp/LpStickyBar.astro \
        astro/src/components/lp/LpHero.astro \
        astro/src/components/lp/LpContextStrip.astro \
        astro/src/components/lp/LpDoctorTrust.astro \
        astro/src/components/lp/LpFooter.astro
git commit -m "feat(lp): add adrenal fatigue LP components — StickyBar, Hero, ContextStrip, DoctorTrust, Footer"
```

---

## Task 4: Add LP styles

**Files:**
- Create: `astro/src/styles/lp.css`
- Modify: `astro/src/layouts/BaseLayout.astro` (import lp.css conditionally via page-level import)

Note: LP page will import `lp.css` directly in the page frontmatter using Astro's `import` — no changes to BaseLayout needed.

- [ ] **Step 1: Create `astro/src/styles/lp.css`**

Uses existing CSS design tokens from `global.css` (--navy, --teal, --cream, --sp-*, --text-*, etc.).

```css
/* ─── LP Sticky Bar ──────────────────────────────────────── */
.lp-sticky-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-6);
  background: var(--white);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 8px rgba(0,0,0,.06);
}

.lp-sticky-bar__logo {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  color: var(--navy);
  font-weight: 700;
  text-decoration: none;
  font-size: var(--text-sm);
}

.lp-sticky-bar__logo img {
  width: 32px;
  height: 32px;
  border-radius: var(--r-sm);
}

.lp-sticky-bar__phone {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  background: var(--teal);
  color: var(--white);
  font-weight: 700;
  font-size: var(--text-sm);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--r-pill);
  text-decoration: none;
  transition: background var(--dur-base) var(--ease);
}

.lp-sticky-bar__phone:hover {
  background: var(--teal-d);
}

/* ─── LP Hero ────────────────────────────────────────────── */
.lp-hero {
  background: linear-gradient(135deg, var(--navy-xl) 0%, var(--cream) 100%);
  padding: var(--sp-16) var(--sp-6) var(--sp-12);
}

.lp-hero__inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-12);
  align-items: center;
}

.lp-hero__eyebrow {
  color: var(--teal-d);
  font-size: var(--text-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: var(--sp-3);
}

.lp-hero__headline {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 800;
  color: var(--navy);
  line-height: 1.15;
  margin-bottom: var(--sp-4);
}

.lp-hero__headline span {
  color: var(--teal);
}

.lp-hero__subline {
  font-size: var(--text-lg);
  color: var(--text-2);
  margin-bottom: var(--sp-6);
  line-height: 1.65;
}

.lp-hero__symptoms {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--sp-8);
  display: grid;
  gap: var(--sp-3);
}

.lp-hero__symptoms li {
  position: relative;
  padding-left: var(--sp-6);
  color: var(--text);
  font-size: var(--text-base);
  line-height: 1.5;
}

.lp-hero__symptoms li::before {
  content: "";
  position: absolute;
  left: 0;
  top: .55em;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--teal);
}

.lp-hero__cta {
  display: inline-block;
  font-size: var(--text-lg);
  padding: var(--sp-4) var(--sp-8);
  margin-bottom: var(--sp-4);
}

.lp-hero__trust {
  font-size: var(--text-sm);
  color: var(--text-3);
}

.lp-hero__image img {
  width: 100%;
  height: auto;
  border-radius: var(--r-md);
  box-shadow: var(--sh-lg);
}

/* ─── LP Context Strip ───────────────────────────────────── */
.lp-context-strip {
  background: var(--navy);
  padding: var(--sp-8) var(--sp-6);
}

.lp-context-strip__inner {
  max-width: 820px;
  margin: 0 auto;
  text-align: center;
}

.lp-context-strip__inner p {
  color: rgba(255,255,255,.85);
  font-size: var(--text-base);
  line-height: 1.75;
  margin: 0;
}

.lp-context-strip__cue {
  color: var(--teal) !important;
  font-weight: 700;
  margin-top: var(--sp-3) !important;
  font-size: var(--text-sm) !important;
}

/* ─── LP Doctor Trust ────────────────────────────────────── */
.lp-doctor-trust {
  padding: var(--sp-12) var(--sp-6);
  background: var(--cream);
}

.lp-doctor-trust__inner {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  gap: var(--sp-6);
  align-items: flex-start;
}

.lp-doctor-trust__photo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 3px solid var(--teal);
}

.lp-doctor-trust__name {
  font-weight: 800;
  color: var(--navy);
  font-size: var(--text-lg);
  margin-bottom: var(--sp-1);
}

.lp-doctor-trust__title {
  color: var(--teal-d);
  font-weight: 600;
  font-size: var(--text-sm);
  margin-bottom: var(--sp-3);
}

.lp-doctor-trust__bio {
  color: var(--text-2);
  font-size: var(--text-sm);
  line-height: 1.7;
}

/* ─── LP Footer ──────────────────────────────────────────── */
.lp-footer {
  background: var(--navy);
  padding: var(--sp-8) var(--sp-6);
  text-align: center;
}

.lp-footer__inner {
  max-width: 820px;
  margin: 0 auto var(--sp-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-4);
  justify-content: center;
  align-items: flex-start;
}

.lp-footer__address {
  color: rgba(255,255,255,.7);
  font-size: var(--text-sm);
  line-height: 1.65;
  font-style: normal;
}

.lp-footer__contact {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  color: rgba(255,255,255,.7);
  font-size: var(--text-sm);
}

.lp-footer__contact a {
  color: var(--teal);
  font-weight: 600;
  text-decoration: none;
}

.lp-footer__contact a:hover {
  text-decoration: underline;
}

.lp-footer__disclaimer {
  color: rgba(255,255,255,.4);
  font-size: var(--text-xs);
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 768px) {
  .lp-hero__inner {
    grid-template-columns: 1fr;
  }

  .lp-hero__image {
    order: -1;
  }

  .lp-hero__image img {
    max-height: 260px;
    object-fit: cover;
  }

  .lp-hero {
    padding: var(--sp-8) var(--sp-4) var(--sp-10);
  }

  .lp-doctor-trust__inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .lp-sticky-bar {
    padding: var(--sp-2) var(--sp-4);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add astro/src/styles/lp.css
git commit -m "feat(lp): add LP stylesheet — sticky bar, hero, context strip, doctor trust, footer"
```

---

## Task 5: Create the LP page

**Files:**
- Create: `astro/src/pages/lp/adrenal-fatigue.astro`

- [ ] **Step 1: Create the directory and page**

```bash
mkdir -p astro/src/pages/lp
```

Create `astro/src/pages/lp/adrenal-fatigue.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SEO from '../../components/SEO.astro';
import QuizEngine from '../../components/QuizEngine.astro';
import LpStickyBar from '../../components/lp/LpStickyBar.astro';
import LpHero from '../../components/lp/LpHero.astro';
import LpContextStrip from '../../components/lp/LpContextStrip.astro';
import LpDoctorTrust from '../../components/lp/LpDoctorTrust.astro';
import LpFooter from '../../components/lp/LpFooter.astro';
import { adrenalFatigueLpQuiz } from '../../data/lp-adrenal-fatigue-quiz.ts';
import '../../styles/lp.css';

const seo = {
  seoTitle: 'ประเมินอาการต่อมหมวกไตล้า | Thrive Wellness Clinic กรุงเทพ',
  description: 'ทำแบบประเมินอาการ Adrenal Fatigue 6 ข้อ รู้ผลทันที ปรึกษาแพทย์เฉพาะทาง Thrive Wellness Clinic โทร 095-934-9640',
  canonicalPath: '/adrenal-fatigue',
  ogImage: '/adrenal-fatigue-hero-1200x630.jpg',
  noIndex: true,
};
---

<BaseLayout>
  <SEO slot="head" {...seo} />
  <LpStickyBar />
  <main>
    <LpHero />
    <LpContextStrip />
    <QuizEngine quiz={adrenalFatigueLpQuiz} showLeadForm={false} />
    <LpDoctorTrust />
  </main>
  <LpFooter />
</BaseLayout>
```

- [ ] **Step 2: Run Astro type check**

```bash
cd astro && npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: Build completes with no errors. `dist/lp/adrenal-fatigue/index.html` present.

- [ ] **Step 4: Verify noindex in built HTML**

```bash
grep 'noindex' dist/lp/adrenal-fatigue/index.html
```

Expected: `<meta name="robots" content="noindex, nofollow" />`

- [ ] **Step 5: Commit**

```bash
git add astro/src/pages/lp/adrenal-fatigue.astro
git commit -m "feat(lp): add /lp/adrenal-fatigue landing page — quiz-driven, noindex, phone CTA"
```

---

## Task 6: Manual browser test

- [ ] **Step 1: Start dev server**

```bash
cd astro && npm run dev
```

Open: `http://localhost:4321/lp/adrenal-fatigue`

- [ ] **Step 2: Check sticky bar**
  - Logo visible top-left
  - Phone number visible top-right, tappable (opens tel: on mobile)
  - Bar stays sticky on scroll

- [ ] **Step 3: Check hero**
  - Headline renders in Thai + teal highlight
  - 4 symptom bullets visible
  - CTA button scrolls to `#quiz`

- [ ] **Step 4: Walk through quiz**
  - Progress bar shows "ข้อ 1 จาก 6" → increments on each answer
  - Clicking an answer advances to next question
  - After Q6, result renders immediately — no lead form appears

- [ ] **Step 5: Test all 3 result paths**
  - All worst answers (q1c, q2c, q3c, q4c, q5c, q6c) → score = 3+3+2+2+2+3 = 15 → "ต่อมหมวกไตน่าจะต้องการความช่วยเหลือแล้ว" (high, threshold 9)
  - Mixed moderate (q1b, q2b, q3b, q4b, q5b, q6b) → score = 1+1+1+1+1+2 = 7 → "ฮอร์โมนเริ่มไม่สมดุล" (moderate, threshold 4)
  - All best answers (q1a, q2a, q3a, q4a, q5a, q6a) → score = 0 → "เริ่มมีสัญญาณเตือน" (early, threshold {})

- [ ] **Step 6: Check result CTA**
  - Each result shows the correct phone CTA (label + `tel:` href)
  - No lead form visible anywhere on page

- [ ] **Step 7: Check mobile (resize to 375px)**
  - Hero image appears above copy
  - Quiz panel fills width
  - Sticky bar phone button visible

- [ ] **Step 8: Check nav is absent**
  - No site nav links visible
  - No site footer nav links

- [ ] **Step 9: Final commit if any tweaks made**

```bash
git add -p
git commit -m "fix(lp): visual tweaks from manual browser test"
```

---

## Post-build checks

- [ ] Confirm `dist/lp/adrenal-fatigue/index.html` has `noindex, nofollow`
- [ ] Confirm no internal links point to `/lp/adrenal-fatigue` from the main site
- [ ] Deploy to Netlify preview branch before running paid ads
