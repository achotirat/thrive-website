# Crystal Park Booth Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a standalone, mobile-first self-assessment quiz at `/crystal-quiz` covering 6 symptom domains (hormones incl. menopause, metabolism/weight, liver, skin, vitamins, stress/sleep), for QR-scan use at the Crystal Park booth (26–30 Aug 2026). Every visitor answers a domain-picker question, then a 6-8 question linear-scoring mini-quiz for that domain, lands on one of 3 severity-tiered results (no outbound links), submits name+phone via the existing lead form, and is redirected to a booth-specific voucher-claim banner on `/thank-you`.

**Architecture:** Reuses the existing quiz engine wholesale (`QuizEngine.astro`, `quizEngine.mjs`, `quizRuntime.mjs`, `/api/leads`) — the same pattern already powering 6 live quizzes in `quizDefinitions.mjs` plus the standalone `lp-adrenal-fatigue-quiz.ts`. New quiz content lives in its own file (`src/data/crystalBoothQuiz.mjs`), NOT added to the shared `campaignQuizzes` map (that map has an existing test asserting its exact key list — adding to it would break that test and misrepresents this as a "paid campaign LP" quiz, which it isn't). One shared-engine fix is required: the progress bar (`ข้อ X จาก Y`) currently divides by the flat count of every question in the quiz object, which breaks once one quiz object contains 6 independent domains.

**Tech Stack:** Astro 6, plain `.mjs` data/logic modules (no framework), Node's built-in `node:test` + `node:assert/strict` test runner (`npm test` → `node --test "tests/**/*.test.mjs"`), existing `thrive-styles.css` classes only (no new CSS, no Tailwind).

## Global Constraints

- Never push to `main`; this work happens on `feature/crystal-booth-quiz` (already created from `origin/main`).
- Port faithful: reuse existing CSS classes from `thrive-styles.css` (`section`, `section-container`, `section-label`, `btn btn-primary`, `btn btn-secondary`) — no new styles, no Tailwind.
- Run `npx astro check` and `npm run build` before every commit that touches files under `astro/` (repo rule, CLAUDE.md).
- Do not add the new quiz to `campaignQuizzes` in `quizDefinitions.mjs` — it has its own file and its own test coverage.
- Every quiz result's `cta` must point to `#quiz-lead-form` (in-page scroll, never an outbound link to another page) — confirmed design decision, not a placeholder.
- Score keys must be domain-namespaced (`scoreHormone`, `scoreMetabolism`, `scoreLiver`, `scoreSkin`, `scoreVitamin`, `scoreStress`) so that `getQuizResult`'s cross-result threshold matching can't accidentally match a result from a domain the visitor never entered.
- **Every domain's "early" (catch-all) result must use a threshold keyed on a domain-entry marker, never `{}` or `{ scoreX: 0 }`.** `meetsThreshold` treats both `{}` and `{ scoreX: 0 }` as unconditionally true for *any* session, including sessions from a completely different domain (a missing key reads as `0`, and `0 >= 0` passes) — so a catch-all with either of those thresholds is not actually scoped to its own domain and can win another domain's session on tie-break. The fix applied throughout this plan: each domain's first question adds a domain-specific marker key (e.g. `enteredHormone: 1`) to the `scores` object of **all three** of its answers, and that domain's "early" result requires `{ enteredX: 1 }` — a session that never entered the domain has that marker key undefined (reads as `0`, fails `>= 1`), while a session that did enter the domain always has `1` there no matter which answer was picked. This marker is intentionally decoupled from the domain's symptom-severity score (`scoreX`): the first question's `scoreX` values are the original, clinician-reviewed values (lowest-severity answer scores `0`, same as every other question in the domain), so isolation is achieved without silently shifting anyone's severity tier. Only "early" uses the marker key — "moderate"/"high" thresholds stay on `scoreX` since a foreign-domain session never touches that key at all.
- All commits are small, one per task, with descriptive messages (repo rule, CLAUDE.md).

---

## Task 1: Fix quiz progress calculation to be path-aware

**Files:**
- Modify: `astro/src/lib/quizEngine.mjs`
- Modify: `astro/src/lib/quizRuntime.mjs`
- Test: `astro/tests/quizEngine.test.mjs`

**Interfaces:**
- Produces: `getQuizProgress(quiz, session) -> { current: number, total: number }`, exported from `quizEngine.mjs`, consumed by `quizRuntime.mjs`'s `render()`.

- [ ] **Step 1: Write the failing tests**

`astro/tests/quizEngine.test.mjs` currently starts with:

```js
import {
  createQuizSession,
  answerCurrentQuestion,
  getCurrentQuestion,
  getQuizResult,
  buildQuizLeadPayload,
} from '../src/lib/quizEngine.mjs';
```

Edit that one import statement to add `getQuizProgress` to the named imports (do not touch anything else in the file — no other import, and no existing code, changes):

```js
import {
  createQuizSession,
  answerCurrentQuestion,
  getCurrentQuestion,
  getQuizResult,
  getQuizProgress,
  buildQuizLeadPayload,
} from '../src/lib/quizEngine.mjs';
```

Then append this new `describe` block at the very end of the file, after the existing `describe('quiz engine', ...)` block's closing `});`:

```js
describe('getQuizProgress', () => {
  const linearQuiz = {
    id: 'linear-progress-test',
    startQuestionId: 'q1',
    questions: [
      { id: 'q1', text: 'Q1', answers: [{ id: 'a', label: 'A', nextQuestionId: 'q2' }] },
      { id: 'q2', text: 'Q2', answers: [{ id: 'a', label: 'A', nextQuestionId: 'q3' }] },
      { id: 'q3', text: 'Q3', answers: [{ id: 'a', label: 'A' }] },
    ],
    results: [{ id: 'r', title: 'R', summary: 'S' }],
  };

  it('reports 1 of 3 at the start of a 3-question linear quiz', () => {
    const session = createQuizSession(linearQuiz);
    assert.deepEqual(getQuizProgress(linearQuiz, session), { current: 1, total: 3 });
  });

  it('advances current while total stays fixed for a linear quiz', () => {
    let session = createQuizSession(linearQuiz);
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    assert.deepEqual(getQuizProgress(linearQuiz, session), { current: 2, total: 3 });
  });

  it('reports current === total when the quiz is complete', () => {
    let session = createQuizSession(linearQuiz);
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    session = answerCurrentQuestion(linearQuiz, session, 'a');
    assert.equal(session.completed, true);
    assert.deepEqual(getQuizProgress(linearQuiz, session), { current: 3, total: 3 });
  });

  const branchingQuiz = {
    id: 'branching-progress-test',
    startQuestionId: 'pick',
    questions: [
      {
        id: 'pick',
        text: 'Pick a path',
        answers: [
          { id: 'short', label: 'Short', nextQuestionId: 'short-1' },
          { id: 'long', label: 'Long', nextQuestionId: 'long-1' },
        ],
      },
      { id: 'short-1', text: 'Short 1', answers: [{ id: 'a', label: 'A' }] },
      { id: 'long-1', text: 'Long 1', answers: [{ id: 'a', label: 'A', nextQuestionId: 'long-2' }] },
      { id: 'long-2', text: 'Long 2', answers: [{ id: 'a', label: 'A' }] },
    ],
    results: [{ id: 'r', title: 'R', summary: 'S' }],
  };

  it('reflects the chosen branch length, not the flat total question count', () => {
    let session = createQuizSession(branchingQuiz);
    session = answerCurrentQuestion(branchingQuiz, session, 'short');
    // Chosen path is pick -> short-1 = 2 questions total, NOT
    // branchingQuiz.questions.length (4).
    assert.deepEqual(getQuizProgress(branchingQuiz, session), { current: 2, total: 2 });
  });

  it('reflects a longer chosen branch independently of a shorter sibling branch', () => {
    let session = createQuizSession(branchingQuiz);
    session = answerCurrentQuestion(branchingQuiz, session, 'long');
    // Chosen path is pick -> long-1 -> long-2 = 3 questions total.
    assert.deepEqual(getQuizProgress(branchingQuiz, session), { current: 2, total: 3 });
    session = answerCurrentQuestion(branchingQuiz, session, 'a');
    assert.deepEqual(getQuizProgress(branchingQuiz, session), { current: 3, total: 3 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd astro && npm test`
Expected: FAIL — `getQuizProgress is not a function` (or similar import error), since it doesn't exist yet.

- [ ] **Step 3: Implement `getQuizProgress` in `quizEngine.mjs`**

Add this new exported function to `astro/src/lib/quizEngine.mjs`, placed after the existing `getQuizResult` function (i.e., after the function that ends around line 52 in the current file, before `buildQuizLeadPayload`):

```js
export function getQuizProgress(quiz, session) {
  const answered = session.answers.length;
  const current = getCurrentQuestion(quiz, session);

  if (!current) {
    return { current: answered, total: answered };
  }

  let total = answered + 1;
  let cursor = current;
  while (cursor.answers[0]?.nextQuestionId) {
    cursor = findQuestion(quiz, cursor.answers[0].nextQuestionId);
    total += 1;
  }

  return { current: answered + 1, total };
}
```

This walks forward from the current question via each question's first answer's `nextQuestionId` until it hits a question with none — which is safe for quizzes where a domain, once chosen, has no further branching (every answer in a question shares the same `nextQuestionId`, as is the case for every quiz added in this plan). Before the first question is answered, it estimates total using the first-listed answer's branch; this self-corrects to the real total on the very next render once the visitor actually picks a branch.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd astro && npm test`
Expected: PASS — all tests including the 4 new `getQuizProgress` tests and all pre-existing tests in the file.

- [ ] **Step 5: Wire the fix into `quizRuntime.mjs`**

In `astro/src/lib/quizRuntime.mjs`, change the import at the top from:

```js
import {
  answerCurrentQuestion,
  buildQuizLeadPayload,
  createQuizSession,
  getCurrentQuestion,
  getQuizResult,
} from './quizEngine.mjs';
```

to:

```js
import {
  answerCurrentQuestion,
  buildQuizLeadPayload,
  createQuizSession,
  getCurrentQuestion,
  getQuizProgress,
  getQuizResult,
} from './quizEngine.mjs';
```

Then replace this block inside `render()`:

```js
  const render = () => {
    const question = getCurrentQuestion(quiz, session);
    const currentIndex = question
      ? quiz.questions.findIndex((candidate) => candidate.id === question.id) + 1
      : quiz.questions.length;

    if (progressEl) {
      progressEl.textContent = `ข้อ ${Math.min(currentIndex, quiz.questions.length)} จาก ${quiz.questions.length}`;
      progressEl.style.setProperty(
        '--quiz-progress',
        `${Math.round((Math.min(currentIndex, quiz.questions.length) / quiz.questions.length) * 100)}%`,
      );
    }
```

with:

```js
  const render = () => {
    const question = getCurrentQuestion(quiz, session);
    const { current, total } = getQuizProgress(quiz, session);

    if (progressEl) {
      progressEl.textContent = `ข้อ ${current} จาก ${total}`;
      progressEl.style.setProperty('--quiz-progress', `${Math.round((current / total) * 100)}%`);
    }
```

(The rest of `render()` — the `if (!question) { ... }` block and everything below it — stays exactly as-is.)

- [ ] **Step 6: Run full test suite and Astro checks**

Run: `cd astro && npm test && npx astro check && npm run build`
Expected: all PASS, 0 type errors, build succeeds.

- [ ] **Step 7: Commit**

```bash
cd astro
git add src/lib/quizEngine.mjs src/lib/quizRuntime.mjs tests/quizEngine.test.mjs
git commit -m "fix(quiz): make progress bar path-aware instead of counting all quiz questions"
```

---

## Task 2: Create crystalBoothQuiz.mjs — meta, domain selector, and ฮอร์โมน domain

**Files:**
- Create: `astro/src/data/crystalBoothQuiz.mjs`
- Create: `astro/tests/crystalBoothQuiz.test.mjs`

**Interfaces:**
- Consumes: `createQuizSession`, `answerCurrentQuestion`, `getCurrentQuestion`, `getQuizResult` from `../src/lib/quizEngine.mjs` (already implemented, Task 1 doesn't change their signatures).
- Produces: `export const crystalBoothQuiz` from `astro/src/data/crystalBoothQuiz.mjs`, consumed by Task 8 (the new page) and Tasks 3-7 (which extend this same file/object).

- [ ] **Step 1: Write the failing test**

Create `astro/tests/crystalBoothQuiz.test.mjs`:

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createQuizSession,
  answerCurrentQuestion,
  getCurrentQuestion,
  getQuizResult,
} from '../src/lib/quizEngine.mjs';
import { crystalBoothQuiz } from '../src/data/crystalBoothQuiz.mjs';

function runPath(quiz, answerIds) {
  let session = createQuizSession(quiz);
  for (const answerId of answerIds) {
    session = answerCurrentQuestion(quiz, session, answerId);
  }
  return session;
}

describe('crystalBoothQuiz — top-concern selector', () => {
  it('starts at the top-concern question with 6 domain choices', () => {
    const session = createQuizSession(crystalBoothQuiz);
    const question = getCurrentQuestion(crystalBoothQuiz, session);
    assert.equal(question.id, 'top-concern');
    assert.deepEqual(
      question.answers.map((a) => a.id).sort(),
      ['hormone', 'liver', 'metabolism', 'skin', 'stress', 'vitamin'],
    );
  });
});

describe('crystalBoothQuiz — ฮอร์โมน domain', () => {
  it('routes the "hormone" choice into the hormone-cycle question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'hormone');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'hormone-cycle');
  });

  it('resolves hormone-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'hormone', 'menopause', 'frequent', 'volatile', 'clear-change',
      'always-tired', 'clear-gain', 'disrupted', 'high',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'hormone-high');
    assert.equal(result.nurtureSegment, 'booth-hormone-high');
    assert.equal(result.cta.href, '#quiz-lead-form');
  });

  it('resolves hormone-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'hormone', 'regular', 'none', 'stable', 'no-change',
      'steady', 'no-change', 'rested', 'low',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'hormone-early');
    assert.equal(result.nurtureSegment, 'booth-hormone-early');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro && npm test`
Expected: FAIL — `Cannot find module '../src/data/crystalBoothQuiz.mjs'`.

- [ ] **Step 3: Create the quiz data file**

Create `astro/src/data/crystalBoothQuiz.mjs`:

```js
const boothCta = { label: 'ฝากเบอร์รับของรางวัล', href: '#quiz-lead-form' };

const topConcernQuestion = {
  id: 'top-concern',
  text: 'ตอนนี้อะไรกวนใจคุณมากที่สุด?',
  helper: 'เลือกข้อที่ตรงกับคุณที่สุด',
  answers: [
    { id: 'hormone', label: 'ฮอร์โมนแปรปรวน รอบเดือนไม่ปกติ หรือสงสัยวัยทอง', nextQuestionId: 'hormone-cycle' },
    { id: 'metabolism', label: 'เผาผลาญพัง น้ำหนักขึ้นง่าย ลดยาก', nextQuestionId: 'metabolism-weight' },
    { id: 'liver', label: 'กังวลเรื่องตับ เหนื่อยง่าย ดื่ม/ใช้ยาบ่อย', nextQuestionId: 'liver-alcohol' },
    { id: 'skin', label: 'ผิวแห้ง คัน หรือมีผื่นแพ้', nextQuestionId: 'skin-dryness' },
    { id: 'vitamin', label: 'สงสัยว่าขาดวิตามินหรือแร่ธาตุ', nextQuestionId: 'vitamin-fatigue' },
    { id: 'stress', label: 'เครียดสะสม นอนไม่หลับ', nextQuestionId: 'stress-wake' },
  ],
};

const hormoneQuestions = [
  {
    id: 'hormone-cycle',
    text: 'รอบเดือนช่วง 2-4 สัปดาห์ที่ผ่านมาเป็นอย่างไร?',
    helper: 'ถ้าหมดประจำเดือนแล้วหรือไม่มีรอบเดือน ให้เลือกข้อสุดท้าย',
    answers: [
      { id: 'regular', label: 'มาสม่ำเสมอตามปกติ', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-hotflash' },
      { id: 'irregular', label: 'เริ่มมาไม่สม่ำเสมอ ห่างขึ้นหรือถี่ขึ้น', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-hotflash' },
      { id: 'menopause', label: 'ขาดหรือหมดไปแล้ว หรือมีอาการก่อนวัยทองชัดเจน', scores: { scoreHormone: 3 }, nextQuestionId: 'hormone-hotflash' },
    ],
  },
  {
    id: 'hormone-hotflash',
    text: 'มีอาการร้อนวูบวาบ เหงื่อออกกลางคืน หรือใจสั่นไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-mood' },
      { id: 'occasional', label: 'มีบ้างเป็นครั้งคราว', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-mood' },
      { id: 'frequent', label: 'มีบ่อยจนรบกวนการนอนหรือชีวิตประจำวัน', scores: { scoreHormone: 3 }, nextQuestionId: 'hormone-mood' },
    ],
  },
  {
    id: 'hormone-mood',
    text: 'อารมณ์ช่วงนี้เป็นอย่างไร?',
    answers: [
      { id: 'stable', label: 'ค่อนข้างคงที่', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-skin' },
      { id: 'pms', label: 'หงุดหงิดง่ายขึ้น หรือมี PMS ชัดก่อนมีประจำเดือน', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-skin' },
      { id: 'volatile', label: 'อารมณ์แปรปรวนมาก ควบคุมยาก', scores: { scoreHormone: 3 }, nextQuestionId: 'hormone-skin' },
    ],
  },
  {
    id: 'hormone-skin',
    text: 'ผิวหรือผมช่วงนี้เปลี่ยนไปไหม?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-energy' },
      { id: 'mild-change', label: 'ผิวแห้งขึ้นหรือผมร่วงเล็กน้อย', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-energy' },
      { id: 'clear-change', label: 'ผิวหมองคล้ำ ผมร่วงเยอะ หรือสิวฮอร์โมนเป็นรอบ', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-energy' },
    ],
  },
  {
    id: 'hormone-energy',
    text: 'พลังงานระหว่างวันเป็นแบบไหน?',
    answers: [
      { id: 'steady', label: 'ค่อนข้างคงที่', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-weight' },
      { id: 'afternoon-crash', label: 'บ่ายแล้วหมดแรง ต้องพึ่งกาแฟ', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-weight' },
      { id: 'always-tired', label: 'เหนื่อยตลอดวันทั้งที่นอนพอ', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-weight' },
    ],
  },
  {
    id: 'hormone-weight',
    text: 'น้ำหนักหรือรอบเอวช่วงนี้เปลี่ยนไปไหม ทั้งที่กินไม่ต่างจากเดิม?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-sleep' },
      { id: 'slight-gain', label: 'ขึ้นเล็กน้อย โดยเฉพาะรอบเอว', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-sleep' },
      { id: 'clear-gain', label: 'ขึ้นชัดเจน ลดยากกว่าเดิมมาก', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-sleep' },
    ],
  },
  {
    id: 'hormone-sleep',
    text: 'การนอนหลับช่วงนี้เป็นอย่างไร?',
    answers: [
      { id: 'rested', label: 'หลับสนิท ตื่นมาสดชื่น', scores: { scoreHormone: 0 }, nextQuestionId: 'hormone-impact' },
      { id: 'harder', label: 'หลับยากขึ้นหรือตื่นกลางดึกบ้าง', scores: { scoreHormone: 1 }, nextQuestionId: 'hormone-impact' },
      { id: 'disrupted', label: 'หลับไม่ลึก ตื่นบ่อย หรือบางคืนไม่หลับเลย', scores: { scoreHormone: 2 }, nextQuestionId: 'hormone-impact' },
    ],
  },
  {
    id: 'hormone-impact',
    text: 'อาการเหล่านี้กระทบชีวิตประจำวันแค่ไหน?',
    answers: [
      { id: 'low', label: 'ไม่ค่อยกระทบ', scores: { scoreHormone: 0 } },
      { id: 'some', label: 'กระทบบ้างแต่ยังจัดการได้', scores: { scoreHormone: 1 } },
      { id: 'high', label: 'กระทบชัดเจน ทั้งงาน อารมณ์ หรือความสัมพันธ์', scores: { scoreHormone: 3 } },
    ],
  },
];

const hormoneResults = [
  {
    id: 'hormone-high',
    title: 'สัญญาณฮอร์โมน/วัยทองค่อนข้างชัดเจน',
    summary: 'คำตอบของคุณชี้ไปทางฮอร์โมนที่อาจไม่สมดุลค่อนข้างชัด ทั้งฮอร์โมนเพศและสัญญาณวัยทอง ควรให้แพทย์ประเมินเพิ่มเติม',
    threshold: { scoreHormone: 10 },
    nurtureSegment: 'booth-hormone-high',
    recommendedSteps: [
      'จดอาการและรอบเดือน (ถ้ามี) ไว้เล่าให้แพทย์ฟัง',
      'ปรึกษาทีมแพทย์เรื่องการตรวจฮอร์โมนเพศและฮอร์โมนวัยทอง',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
  {
    id: 'hormone-moderate',
    title: 'เริ่มมีสัญญาณฮอร์โมนไม่สมดุล',
    summary: 'บางคำตอบของคุณสอดคล้องกับภาวะฮอร์โมนไม่สมดุล การตรวจเพิ่มเติมจะช่วยให้รู้แน่ชัดและวางแผนดูแลได้ตรงจุด',
    threshold: { scoreHormone: 5 },
    nurtureSegment: 'booth-hormone-moderate',
    recommendedSteps: [
      'สังเกตอาการต่อเนื่องอีก 1-2 สัปดาห์',
      'ปรึกษาทีมแพทย์ที่บูธเพื่อประเมินเบื้องต้น',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
  {
    id: 'hormone-early',
    title: 'ภาพรวมยังค่อนข้างสมดุล แต่ควรติดตามสัญญาณเล็ก ๆ',
    summary: 'คำตอบยังไม่ชี้ไปที่กลุ่มอาการเด่นชัด เหมาะกับการดูแลพื้นฐานและติดตามอาการเมื่อเริ่มรบกวนชีวิตประจำวัน',
    threshold: { scoreHormone: 1 },
    nurtureSegment: 'booth-hormone-early',
    recommendedSteps: [
      'ดูแล sleep routine และโปรตีนในแต่ละมื้อ',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];

export const crystalBoothQuiz = {
  id: 'crystal-booth-checkup',
  serviceSlug: 'crystal-quiz',
  title: 'เช็กสุขภาพเบื้องต้น',
  eyebrow: 'Crystal Park Booth Check',
  intro: 'ตอบคำถามสั้น ๆ เพื่อดูว่าตอนนี้ร่างกายคุณส่งสัญญาณอะไร แล้วฝากเบอร์ติดต่อรับของรางวัลที่บูธได้เลย',
  startQuestionId: 'top-concern',
  leadFormTitle: 'ฝากเบอร์ติดต่อ รับของรางวัลที่บูธได้เลย',
  questions: [
    topConcernQuestion,
    ...hormoneQuestions,
  ],
  results: [
    ...hormoneResults,
  ],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd astro && npm test`
Expected: PASS — all 4 new tests in `crystalBoothQuiz.test.mjs`, plus every pre-existing test in the suite still passing.

- [ ] **Step 5: Type-check and build**

Run: `cd astro && npx astro check && npm run build`
Expected: 0 errors, build succeeds (this file isn't imported by any page yet, so build just needs to not break).

- [ ] **Step 6: Commit**

```bash
cd astro
git add src/data/crystalBoothQuiz.mjs tests/crystalBoothQuiz.test.mjs
git commit -m "feat(quiz): add crystal booth quiz — domain selector and hormone domain"
```

---

## Task 3: Add เผาผลาญ/น้ำหนัก (metabolism) domain

**Files:**
- Modify: `astro/src/data/crystalBoothQuiz.mjs`
- Modify: `astro/tests/crystalBoothQuiz.test.mjs`

**Interfaces:**
- Consumes: same as Task 2.
- Produces: adds `metabolism-*` question chain and `metabolism-high/moderate/early` results to the same `crystalBoothQuiz` export.

- [ ] **Step 1: Write the failing test**

Add to `astro/tests/crystalBoothQuiz.test.mjs`, after the `describe('crystalBoothQuiz — ฮอร์โมน domain', ...)` block:

```js
describe('crystalBoothQuiz — เผาผลาญ/น้ำหนัก domain', () => {
  it('routes the "metabolism" choice into the metabolism-weight question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'metabolism');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'metabolism-weight');
  });

  it('resolves metabolism-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'metabolism', 'stuck', 'clear', 'daily', 'always-tired', 'no-result', 'frequent', 'chronic',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'metabolism-high');
    assert.equal(result.nurtureSegment, 'booth-metabolism-high');
  });

  it('resolves metabolism-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'metabolism', 'stable', 'no-change', 'rare', 'steady', 'as-expected', 'none', 'new',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'metabolism-early');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro && npm test`
Expected: FAIL — quiz throws `Unknown quiz question "metabolism-weight"` (the `top-concern` question already points there from Task 2, but the question doesn't exist yet).

- [ ] **Step 3: Add the metabolism domain content**

In `astro/src/data/crystalBoothQuiz.mjs`, add these two new consts after `hormoneResults` and before `export const crystalBoothQuiz`:

```js
const metabolismQuestions = [
  {
    id: 'metabolism-weight',
    text: 'น้ำหนักช่วง 2-3 เดือนที่ผ่านมาเปลี่ยนไปอย่างไร ทั้งที่กินไม่ต่างจากเดิม?',
    answers: [
      { id: 'stable', label: 'ค่อนข้างคงที่', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-waist' },
      { id: 'slight-gain', label: 'ขึ้นเล็กน้อย', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-waist' },
      { id: 'stuck', label: 'ขึ้นชัดเจน หรือลดยากมากแม้พยายามคุมอาหาร/ออกกำลังกาย', scores: { scoreMetabolism: 3 }, nextQuestionId: 'metabolism-waist' },
    ],
  },
  {
    id: 'metabolism-waist',
    text: 'รอบเอวหรือไขมันหน้าท้องเป็นอย่างไร?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-cravings' },
      { id: 'slight', label: 'เพิ่มขึ้นเล็กน้อย', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-cravings' },
      { id: 'clear', label: 'เพิ่มขึ้นชัดเจน ทั้งที่น้ำหนักตัวโดยรวมไม่ได้ขึ้นมาก', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-cravings' },
    ],
  },
  {
    id: 'metabolism-cravings',
    text: 'อยากของหวานหรือแป้งบ่อยแค่ไหน?',
    answers: [
      { id: 'rare', label: 'แทบไม่เลย', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-energy' },
      { id: 'some-days', label: 'บางวัน โดยเฉพาะตอนเครียดหรือบ่าย', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-energy' },
      { id: 'daily', label: 'อยากเกือบทุกวัน หิวแกว่งจนหงุดหงิด', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-energy' },
    ],
  },
  {
    id: 'metabolism-energy',
    text: 'พลังงานระหว่างวันเป็นแบบไหน?',
    answers: [
      { id: 'steady', label: 'ค่อนข้างคงที่', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-effort' },
      { id: 'afternoon-crash', label: 'บ่ายแล้วหมดแรง ต้องพึ่งกาแฟ/ของหวาน', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-effort' },
      { id: 'always-tired', label: 'เหนื่อยตลอดวันทั้งที่นอนพอ', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-effort' },
    ],
  },
  {
    id: 'metabolism-effort',
    text: 'ออกกำลังกายหรือคุมอาหารแล้วเห็นผลไหม?',
    answers: [
      { id: 'as-expected', label: 'เห็นผลตามที่ควรจะเป็น', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-digestion' },
      { id: 'slower', label: 'เห็นผลช้ากว่าที่เคย', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-digestion' },
      { id: 'no-result', label: 'แทบไม่เห็นผลเลย ทั้งที่พยายามมาก', scores: { scoreMetabolism: 3 }, nextQuestionId: 'metabolism-digestion' },
    ],
  },
  {
    id: 'metabolism-digestion',
    text: 'มีอาการท้องอืด บวมง่าย หรือขับถ่ายผิดปกติร่วมด้วยไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreMetabolism: 0 }, nextQuestionId: 'metabolism-duration' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreMetabolism: 1 }, nextQuestionId: 'metabolism-duration' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreMetabolism: 2 }, nextQuestionId: 'metabolism-duration' },
    ],
  },
  {
    id: 'metabolism-duration',
    text: 'อาการเหล่านี้เป็นมานานแค่ไหนแล้ว?',
    answers: [
      { id: 'new', label: 'ไม่ถึงเดือน', scores: { scoreMetabolism: 0 } },
      { id: 'months', label: '1-6 เดือน', scores: { scoreMetabolism: 1 } },
      { id: 'chronic', label: 'มากกว่า 6 เดือน หรือเรื้อรัง', scores: { scoreMetabolism: 2 } },
    ],
  },
];

const metabolismResults = [
  {
    id: 'metabolism-high',
    title: 'มีสัญญาณเผาผลาญ/น้ำหนักที่ควรตรวจเพิ่มเติม',
    summary: 'น้ำหนัก รอบเอว และพลังงานที่เปลี่ยนไปค่อนข้างชัด อาจเกี่ยวกับระบบเผาผลาญ ไทรอยด์ หรือน้ำตาลในเลือด ควรตรวจเช็กเพื่อหาสาเหตุที่แท้จริง',
    threshold: { scoreMetabolism: 8 },
    nurtureSegment: 'booth-metabolism-high',
    recommendedSteps: [
      'จดพฤติกรรมการกินและน้ำหนัก 2 สัปดาห์',
      'ปรึกษาทีมแพทย์เรื่องตรวจระบบเผาผลาญและไทรอยด์',
      'ไม่ควรลดน้ำหนักแบบหักโหมเองก่อนตรวจหาสาเหตุ',
    ],
    cta: boothCta,
  },
  {
    id: 'metabolism-moderate',
    title: 'เริ่มมีสัญญาณเผาผลาญเปลี่ยนแปลง',
    summary: 'บางคำตอบชี้ไปที่ระบบเผาผลาญที่เริ่มทำงานเปลี่ยนไป ควรสังเกตต่อเนื่องและปรึกษาแพทย์หากไม่ดีขึ้น',
    threshold: { scoreMetabolism: 4 },
    nurtureSegment: 'booth-metabolism-moderate',
    recommendedSteps: [
      'จดอาหารและน้ำหนักไว้เทียบ 1-2 สัปดาห์',
      'ปรึกษาทีมแพทย์ที่บูธเพื่อประเมินเบื้องต้น',
      'ไม่ควรลดน้ำหนักแบบหักโหมเองก่อนตรวจหาสาเหตุ',
    ],
    cta: boothCta,
  },
  {
    id: 'metabolism-early',
    title: 'ภาพรวมเผาผลาญยังค่อนข้างปกติ',
    summary: 'คำตอบยังไม่ชี้ไปที่ความผิดปกติชัดเจน เหมาะกับการดูแลอาหารและการออกกำลังกายต่อเนื่อง',
    threshold: { scoreMetabolism: 1 },
    nurtureSegment: 'booth-metabolism-early',
    recommendedSteps: [
      'รักษาสมดุลอาหารและการออกกำลังกายต่อเนื่อง',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];
```

Then update the `crystalBoothQuiz` export's `questions` and `results` arrays to include them:

```js
  questions: [
    topConcernQuestion,
    ...hormoneQuestions,
    ...metabolismQuestions,
  ],
  results: [
    ...hormoneResults,
    ...metabolismResults,
  ],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd astro && npm test`
Expected: PASS — all metabolism tests plus every previous test.

- [ ] **Step 5: Type-check and build**

Run: `cd astro && npx astro check && npm run build`
Expected: 0 errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
cd astro
git add src/data/crystalBoothQuiz.mjs tests/crystalBoothQuiz.test.mjs
git commit -m "feat(quiz): add metabolism/weight domain to crystal booth quiz"
```

---

## Task 4: Add ตับ (liver) domain

**Files:**
- Modify: `astro/src/data/crystalBoothQuiz.mjs`
- Modify: `astro/tests/crystalBoothQuiz.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `astro/tests/crystalBoothQuiz.test.mjs`, after the metabolism `describe` block:

```js
describe('crystalBoothQuiz — ตับ domain', () => {
  it('routes the "liver" choice into the liver-alcohol question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'liver');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'liver-alcohol');
  });

  it('resolves liver-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'liver', 'frequent', 'regular', 'frequent', 'clear', 'clearly-high', 'frequent', 'well-over',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'liver-high');
    assert.equal(result.nurtureSegment, 'booth-liver-high');
  });

  it('resolves liver-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'liver', 'rare', 'none', 'rare', 'none', 'never-or-normal', 'none', 'normal',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'liver-early');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro && npm test`
Expected: FAIL — `Unknown quiz question "liver-alcohol"`.

- [ ] **Step 3: Add the liver domain content**

In `astro/src/data/crystalBoothQuiz.mjs`, add after `metabolismResults`:

```js
const liverQuestions = [
  {
    id: 'liver-alcohol',
    text: 'คุณดื่มแอลกอฮอล์บ่อยแค่ไหน?',
    answers: [
      { id: 'rare', label: 'ไม่ดื่มเลยหรือดื่มน้อยมาก', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-meds' },
      { id: 'occasional', label: 'ดื่มเป็นครั้งคราว (1-2 ครั้ง/สัปดาห์)', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-meds' },
      { id: 'frequent', label: 'ดื่มบ่อย หรือดื่มปริมาณมากเมื่อดื่ม', scores: { scoreLiver: 3 }, nextQuestionId: 'liver-meds' },
    ],
  },
  {
    id: 'liver-meds',
    text: 'ใช้ยา อาหารเสริม หรือสมุนไพรต่อเนื่องเป็นประจำไหม?',
    answers: [
      { id: 'none', label: 'ไม่ได้ใช้', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-fatigue' },
      { id: 'occasional', label: 'ใช้บางตัวเป็นครั้งคราว', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-fatigue' },
      { id: 'regular', label: 'ใช้หลายอย่างต่อเนื่องเป็นประจำ', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-fatigue' },
    ],
  },
  {
    id: 'liver-fatigue',
    text: 'รู้สึกเหนื่อยง่าย อ่อนเพลียโดยไม่มีสาเหตุชัดเจนไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-skin' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-skin' },
      { id: 'frequent', label: 'มีบ่อย เพลียง่ายผิดปกติ', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-skin' },
    ],
  },
  {
    id: 'liver-skin',
    text: 'ผิวหน้ามันมาก สิวขึ้นง่าย หรือผิวคล้ำผิดปกติไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-labs' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-labs' },
      { id: 'clear', label: 'มีชัดเจน', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-labs' },
    ],
  },
  {
    id: 'liver-labs',
    text: 'เคยตรวจเลือดแล้วค่าตับ (SGOT/SGPT) สูงกว่าปกติไหม?',
    answers: [
      { id: 'never-or-normal', label: 'ไม่เคยตรวจ หรือตรวจแล้วปกติ', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-digestion' },
      { id: 'slightly-high', label: 'เคยสูงเล็กน้อย', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-digestion' },
      { id: 'clearly-high', label: 'เคยสูงชัดเจน หรือหมอแจ้งว่าต้องติดตาม', scores: { scoreLiver: 4 }, nextQuestionId: 'liver-digestion' },
    ],
  },
  {
    id: 'liver-digestion',
    text: 'มีอาการท้องอืด แน่นใต้ชายโครงขวา หรือเบื่ออาหารไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreLiver: 0 }, nextQuestionId: 'liver-weight' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreLiver: 1 }, nextQuestionId: 'liver-weight' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreLiver: 2 }, nextQuestionId: 'liver-weight' },
    ],
  },
  {
    id: 'liver-weight',
    text: 'น้ำหนักตัวตอนนี้เป็นอย่างไร?',
    answers: [
      { id: 'normal', label: 'อยู่ในเกณฑ์ปกติ', scores: { scoreLiver: 0 } },
      { id: 'slightly-over', label: 'เกินเกณฑ์เล็กน้อย', scores: { scoreLiver: 1 } },
      { id: 'well-over', label: 'เกินเกณฑ์ค่อนข้างมาก (เสี่ยงไขมันพอกตับ)', scores: { scoreLiver: 2 } },
    ],
  },
];

const liverResults = [
  {
    id: 'liver-high',
    title: 'มีสัญญาณที่ควรตรวจการทำงานของตับ',
    summary: 'พฤติกรรมและอาการของคุณค่อนข้างชัดว่าอาจส่งผลต่อตับ เช่น การดื่ม การใช้ยา/อาหารเสริมต่อเนื่อง หรือค่าตับที่เคยสูง ควรตรวจเพิ่มเติม',
    threshold: { scoreLiver: 9 },
    nurtureSegment: 'booth-liver-high',
    recommendedSteps: [
      'ตรวจการทำงานของตับ (Liver Function Test)',
      'ปรึกษาทีมแพทย์เรื่องกลูต้าไธโอนดริปเพื่อดีท็อกซ์ตับ',
      'ลดหรือเว้นแอลกอฮอล์ระหว่างรอผลตรวจ',
    ],
    cta: boothCta,
  },
  {
    id: 'liver-moderate',
    title: 'เริ่มมีปัจจัยเสี่ยงต่อตับที่ควรจับตา',
    summary: 'บางคำตอบชี้ไปที่ปัจจัยเสี่ยงต่อตับ เช่น การดื่มหรือการใช้ยาต่อเนื่อง ควรติดตามและตรวจเช็กเป็นระยะ',
    threshold: { scoreLiver: 4 },
    nurtureSegment: 'booth-liver-moderate',
    recommendedSteps: [
      'ลดความถี่การดื่มแอลกอฮอล์',
      'ปรึกษาทีมแพทย์ที่บูธเรื่องการตรวจตับเบื้องต้น',
      'สังเกตอาการเหนื่อยง่ายหรือท้องอืดต่อเนื่อง',
    ],
    cta: boothCta,
  },
  {
    id: 'liver-early',
    title: 'ภาพรวมตับยังไม่มีสัญญาณเสี่ยงชัดเจน',
    summary: 'คำตอบยังไม่ชี้ไปที่ปัจจัยเสี่ยงต่อตับ เหมาะกับการดูแลพื้นฐานต่อเนื่อง',
    threshold: { scoreLiver: 1 },
    nurtureSegment: 'booth-liver-early',
    recommendedSteps: [
      'ดูแลการดื่มแอลกอฮอล์และการใช้ยาให้อยู่ในปริมาณที่เหมาะสม',
      'ตรวจสุขภาพประจำปีตามปกติ',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];
```

Update the export:

```js
  questions: [
    topConcernQuestion,
    ...hormoneQuestions,
    ...metabolismQuestions,
    ...liverQuestions,
  ],
  results: [
    ...hormoneResults,
    ...metabolismResults,
    ...liverResults,
  ],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd astro && npm test`
Expected: PASS.

- [ ] **Step 5: Type-check and build**

Run: `cd astro && npx astro check && npm run build`
Expected: 0 errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
cd astro
git add src/data/crystalBoothQuiz.mjs tests/crystalBoothQuiz.test.mjs
git commit -m "feat(quiz): add liver domain to crystal booth quiz"
```

---

## Task 5: Add ผิว (skin) domain

**Files:**
- Modify: `astro/src/data/crystalBoothQuiz.mjs`
- Modify: `astro/tests/crystalBoothQuiz.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `astro/tests/crystalBoothQuiz.test.mjs`, after the liver `describe` block:

```js
describe('crystalBoothQuiz — ผิว domain', () => {
  it('routes the "skin" choice into the skin-dryness question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'skin');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'skin-dryness');
  });

  it('resolves skin-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'skin', 'very-dry', 'frequent', 'confident', 'cyclical', 'clearly', 'high', 'chronic',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'skin-high');
    assert.equal(result.nurtureSegment, 'booth-skin-high');
  });

  it('resolves skin-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'skin', 'normal', 'none', 'unsure', 'none', 'no', 'low', 'new',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'skin-early');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro && npm test`
Expected: FAIL — `Unknown quiz question "skin-dryness"`.

- [ ] **Step 3: Add the skin domain content**

In `astro/src/data/crystalBoothQuiz.mjs`, add after `liverResults`:

```js
const skinQuestions = [
  {
    id: 'skin-dryness',
    text: 'ผิวคุณช่วงนี้เป็นอย่างไร?',
    answers: [
      { id: 'normal', label: 'ปกติดี', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-rash' },
      { id: 'drier', label: 'แห้งขึ้น ตึงบ่อย', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-rash' },
      { id: 'very-dry', label: 'แห้งมาก ลอก หรือคันร่วมด้วย', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-rash' },
    ],
  },
  {
    id: 'skin-rash',
    text: 'มีผื่นแดง คัน หรือลมพิษขึ้นบ่อยไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-trigger' },
      { id: 'occasional', label: 'มีบ้างเป็นครั้งคราว', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-trigger' },
      { id: 'frequent', label: 'มีบ่อย เป็นๆ หายๆ หาสาเหตุไม่เจอ', scores: { scoreSkin: 3 }, nextQuestionId: 'skin-trigger' },
    ],
  },
  {
    id: 'skin-trigger',
    text: 'ผื่นหรืออาการคันสัมพันธ์กับอาหาร ฝุ่น หรือสิ่งแวดล้อมบางอย่างไหม?',
    answers: [
      { id: 'unsure', label: 'ไม่แน่ใจ/ไม่เกี่ยว', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-acne' },
      { id: 'suspect', label: 'สงสัยว่าเกี่ยว แต่ไม่รู้ตัวกระตุ้นแน่ชัด', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-acne' },
      { id: 'confident', label: 'มั่นใจว่าเกี่ยวกับบางอย่าง แต่ยังไม่เคยตรวจ', scores: { scoreSkin: 3 }, nextQuestionId: 'skin-acne' },
    ],
  },
  {
    id: 'skin-acne',
    text: 'สิวหรือผิวมันขึ้นเป็นรอบ ๆ (สัมพันธ์กับฮอร์โมน) ไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-dullness' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-dullness' },
      { id: 'cyclical', label: 'มีชัดเจนเป็นรอบ', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-dullness' },
    ],
  },
  {
    id: 'skin-dullness',
    text: 'ผิวหมองคล้ำ ไม่สดใสเหมือนก่อนไหม?',
    answers: [
      { id: 'no', label: 'ไม่รู้สึก', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-impact' },
      { id: 'somewhat', label: 'รู้สึกบ้าง', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-impact' },
      { id: 'clearly', label: 'รู้สึกชัดเจน', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-impact' },
    ],
  },
  {
    id: 'skin-impact',
    text: 'อาการทางผิวกระทบความมั่นใจหรือชีวิตประจำวันแค่ไหน?',
    answers: [
      { id: 'low', label: 'ไม่ค่อยกระทบ', scores: { scoreSkin: 0 }, nextQuestionId: 'skin-duration' },
      { id: 'some', label: 'กระทบบ้าง', scores: { scoreSkin: 1 }, nextQuestionId: 'skin-duration' },
      { id: 'high', label: 'กระทบค่อนข้างมาก', scores: { scoreSkin: 2 }, nextQuestionId: 'skin-duration' },
    ],
  },
  {
    id: 'skin-duration',
    text: 'เป็นมานานแค่ไหนแล้ว?',
    answers: [
      { id: 'new', label: 'ไม่ถึงเดือน', scores: { scoreSkin: 0 } },
      { id: 'months', label: '1-6 เดือน', scores: { scoreSkin: 1 } },
      { id: 'chronic', label: 'มากกว่า 6 เดือนหรือเรื้อรัง', scores: { scoreSkin: 2 } },
    ],
  },
];

const skinResults = [
  {
    id: 'skin-high',
    title: 'มีสัญญาณผิวที่ควรให้แพทย์ตรวจแยกให้ชัดเจน',
    summary: 'ผื่น อาการคัน หรือผิวแห้งของคุณค่อนข้างชัดเจน อาจเป็นผิวแห้งขาดความชุ่มชื้น หรือมีสารก่อภูมิแพ้ร่วมด้วย ควรให้แพทย์ตรวจแยกให้แน่ชัด',
    threshold: { scoreSkin: 8 },
    nurtureSegment: 'booth-skin-high',
    recommendedSteps: [
      'ปรึกษาทีมแพทย์เพื่อแยกว่าเป็นผิวแห้งขาดความชุ่มชื้นหรือมีสารก่อภูมิแพ้ร่วมด้วย',
      'พิจารณาตรวจภูมิแพ้ IgE ถ้าสงสัยตัวกระตุ้น',
      'เสริมความชุ่มชื้นและสารต้านอนุมูลอิสระจากภายในถ้าเน้นผิวแห้งหมองคล้ำ',
    ],
    cta: boothCta,
  },
  {
    id: 'skin-moderate',
    title: 'เริ่มมีสัญญาณผิวที่ควรจับตา',
    summary: 'บางคำตอบชี้ไปที่ผิวแห้งหรือผื่นที่เริ่มรบกวน ควรสังเกตต่อเนื่องและปรึกษาแพทย์หากไม่ดีขึ้น',
    threshold: { scoreSkin: 4 },
    nurtureSegment: 'booth-skin-moderate',
    recommendedSteps: [
      'จดว่าผื่นหรือผิวแห้งเกิดขึ้นหลังสัมผัสอะไรบ้าง',
      'ปรึกษาทีมแพทย์ที่บูธเพื่อประเมินเบื้องต้น',
      'เสริมความชุ่มชื้นผิวสม่ำเสมอ',
    ],
    cta: boothCta,
  },
  {
    id: 'skin-early',
    title: 'ภาพรวมผิวยังค่อนข้างปกติ',
    summary: 'คำตอบยังไม่ชี้ไปที่ความผิดปกติทางผิวชัดเจน เหมาะกับการดูแลผิวพื้นฐานต่อเนื่อง',
    threshold: { scoreSkin: 1 },
    nurtureSegment: 'booth-skin-early',
    recommendedSteps: [
      'ดูแลความชุ่มชื้นผิวและกันแดดสม่ำเสมอ',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];
```

Update the export:

```js
  questions: [
    topConcernQuestion,
    ...hormoneQuestions,
    ...metabolismQuestions,
    ...liverQuestions,
    ...skinQuestions,
  ],
  results: [
    ...hormoneResults,
    ...metabolismResults,
    ...liverResults,
    ...skinResults,
  ],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd astro && npm test`
Expected: PASS.

- [ ] **Step 5: Type-check and build**

Run: `cd astro && npx astro check && npm run build`
Expected: 0 errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
cd astro
git add src/data/crystalBoothQuiz.mjs tests/crystalBoothQuiz.test.mjs
git commit -m "feat(quiz): add skin domain to crystal booth quiz"
```

---

## Task 6: Add วิตามิน/แร่ธาตุ (vitamin) domain

**Files:**
- Modify: `astro/src/data/crystalBoothQuiz.mjs`
- Modify: `astro/tests/crystalBoothQuiz.test.mjs`

- [ ] **Step 1: Write the failing test**

Add to `astro/tests/crystalBoothQuiz.test.mjs`, after the skin `describe` block:

```js
describe('crystalBoothQuiz — วิตามิน/แร่ธาตุ domain', () => {
  it('routes the "vitamin" choice into the vitamin-fatigue question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'vitamin');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'vitamin-fatigue');
  });

  it('resolves vitamin-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'vitamin', 'frequent', 'clear', 'frequent', 'repetitive', 'frequent', 'frequent', 'tested-deficient',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'vitamin-high');
    assert.equal(result.nurtureSegment, 'booth-vitamin-high');
  });

  it('resolves vitamin-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'vitamin', 'rare', 'none', 'rare', 'varied', 'rare', 'rare', 'tested-normal',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'vitamin-early');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd astro && npm test`
Expected: FAIL — `Unknown quiz question "vitamin-fatigue"`.

- [ ] **Step 3: Add the vitamin domain content**

In `astro/src/data/crystalBoothQuiz.mjs`, add after `skinResults`:

```js
const vitaminQuestions = [
  {
    id: 'vitamin-fatigue',
    text: 'รู้สึกอ่อนเพลีย เพลียง่ายไหม ทั้งที่พักผ่อนพอ?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-hairnails' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-hairnails' },
      { id: 'frequent', label: 'มีบ่อย เพลียง่ายผิดปกติ', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-hairnails' },
    ],
  },
  {
    id: 'vitamin-hairnails',
    text: 'ผมร่วง เล็บเปราะ หรือแผลหายช้าไหม?',
    answers: [
      { id: 'none', label: 'ไม่มี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-aches' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-aches' },
      { id: 'clear', label: 'มีชัดเจน', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-aches' },
    ],
  },
  {
    id: 'vitamin-aches',
    text: 'ปวดเมื่อยกล้ามเนื้อ ตะคริว หรือปวดกระดูกบ่อยไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-diet' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-diet' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-diet' },
    ],
  },
  {
    id: 'vitamin-diet',
    text: 'กินผัก ผลไม้ หรืออาหารหลากหลายครบ 5 หมู่สม่ำเสมอไหม?',
    answers: [
      { id: 'varied', label: 'ครบและหลากหลายดี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-immunity' },
      { id: 'somewhat', label: 'พอได้ แต่ไม่ค่อยหลากหลาย', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-immunity' },
      { id: 'repetitive', label: 'กินซ้ำๆ ไม่ค่อยหลากหลาย หรือกินไม่ตรงเวลา', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-immunity' },
    ],
  },
  {
    id: 'vitamin-immunity',
    text: 'มีภูมิแพ้ง่าย ป่วยบ่อย หรือแผลในปากขึ้นบ่อยไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-focus' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-focus' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-focus' },
    ],
  },
  {
    id: 'vitamin-focus',
    text: 'สมองล้า ความจำหรือสมาธิลดลงไหม?',
    answers: [
      { id: 'rare', label: 'ไม่ค่อยมี', scores: { scoreVitamin: 0 }, nextQuestionId: 'vitamin-history' },
      { id: 'some', label: 'มีบ้าง', scores: { scoreVitamin: 1 }, nextQuestionId: 'vitamin-history' },
      { id: 'frequent', label: 'มีบ่อย', scores: { scoreVitamin: 2 }, nextQuestionId: 'vitamin-history' },
    ],
  },
  {
    id: 'vitamin-history',
    text: 'เคยตรวจระดับวิตามิน/แร่ธาตุมาก่อนไหม?',
    answers: [
      { id: 'tested-normal', label: 'เคยตรวจแล้วปกติ', scores: { scoreVitamin: 0 } },
      { id: 'never-tested', label: 'ไม่เคยตรวจ อยากรู้ระดับตัวเอง', scores: { scoreVitamin: 2 } },
      { id: 'tested-deficient', label: 'เคยตรวจแล้วพบว่าขาดบางตัว', scores: { scoreVitamin: 3 } },
    ],
  },
];

const vitaminResults = [
  {
    id: 'vitamin-high',
    title: 'มีสัญญาณที่ควรตรวจระดับวิตามิน/แร่ธาตุ',
    summary: 'อาการอ่อนเพลีย ผม เล็บ หรือภูมิคุ้มกันของคุณค่อนข้างชัดเจน อาจเกี่ยวข้องกับการขาดวิตามินหรือแร่ธาตุบางตัว ควรตรวจเพื่อรู้ระดับที่แน่ชัด',
    threshold: { scoreVitamin: 8 },
    nurtureSegment: 'booth-vitamin-high',
    recommendedSteps: [
      'พิจารณาตรวจ OligoScan (ไม่เจาะเลือด รู้ผลไว เหมาะกับวันนี้ที่บูธ)',
      'ปรึกษาทีมแพทย์เรื่องอาหารเสริมที่เหมาะกับผลตรวจ',
      'ปรับอาหารให้หลากหลายระหว่างรอผลตรวจ',
    ],
    cta: boothCta,
  },
  {
    id: 'vitamin-moderate',
    title: 'เริ่มมีสัญญาณที่ควรจับตา',
    summary: 'บางคำตอบชี้ไปที่ความเป็นไปได้ที่จะขาดวิตามินหรือแร่ธาตุบางตัว ควรสังเกตต่อเนื่องและพิจารณาตรวจเช็ก',
    threshold: { scoreVitamin: 4 },
    nurtureSegment: 'booth-vitamin-moderate',
    recommendedSteps: [
      'ปรับอาหารให้หลากหลายและครบ 5 หมู่มากขึ้น',
      'ปรึกษาทีมแพทย์ที่บูธเรื่อง OligoScan เบื้องต้น',
      'สังเกตอาการอ่อนเพลียหรือภูมิคุ้มกันต่อเนื่อง',
    ],
    cta: boothCta,
  },
  {
    id: 'vitamin-early',
    title: 'ภาพรวมยังไม่มีสัญญาณขาดวิตามินชัดเจน',
    summary: 'คำตอบยังไม่ชี้ไปที่การขาดวิตามินหรือแร่ธาตุชัดเจน เหมาะกับการดูแลอาหารพื้นฐานต่อเนื่อง',
    threshold: { scoreVitamin: 1 },
    nurtureSegment: 'booth-vitamin-early',
    recommendedSteps: [
      'รักษาความหลากหลายของอาหารต่อเนื่อง',
      'ทำแบบประเมินซ้ำเมื่ออาการเปลี่ยน',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์',
    ],
    cta: boothCta,
  },
];
```

Update the export:

```js
  questions: [
    topConcernQuestion,
    ...hormoneQuestions,
    ...metabolismQuestions,
    ...liverQuestions,
    ...skinQuestions,
    ...vitaminQuestions,
  ],
  results: [
    ...hormoneResults,
    ...metabolismResults,
    ...liverResults,
    ...skinResults,
    ...vitaminResults,
  ],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd astro && npm test`
Expected: PASS.

- [ ] **Step 5: Type-check and build**

Run: `cd astro && npx astro check && npm run build`
Expected: 0 errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
cd astro
git add src/data/crystalBoothQuiz.mjs tests/crystalBoothQuiz.test.mjs
git commit -m "feat(quiz): add vitamin/mineral domain to crystal booth quiz"
```

---

## Task 7: Add เครียด/นอนไม่หลับ (stress) domain and full integration tests

**Files:**
- Modify: `astro/src/data/crystalBoothQuiz.mjs`
- Modify: `astro/tests/crystalBoothQuiz.test.mjs`

This domain's questions and score progression are reused from the already-live `astro/src/data/lp-adrenal-fatigue-quiz.ts` (questions `q1`-`q6`), renamed with a `stress-` id prefix and `scoreStress` score key to fit this quiz's namespacing rule, and with `cta` changed to the shared `#quiz-lead-form` target instead of the `tel:` links used on that quiz's own page.

- [ ] **Step 1: Write the failing tests**

Add to `astro/tests/crystalBoothQuiz.test.mjs`, after the vitamin `describe` block:

```js
describe('crystalBoothQuiz — เครียด/นอนไม่หลับ domain', () => {
  it('routes the "stress" choice into the stress-wake question', () => {
    let session = createQuizSession(crystalBoothQuiz);
    session = answerCurrentQuestion(crystalBoothQuiz, session, 'stress');
    assert.equal(getCurrentQuestion(crystalBoothQuiz, session).id, 'stress-wake');
  });

  it('resolves stress-high when every answer is the highest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'stress', 'exhausted', 'severe-slump', 'daily', 'stuck-or-up', 'high', 'over-6-months',
    ]);
    assert.equal(session.completed, true);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'stress-high');
    assert.equal(result.nurtureSegment, 'booth-stress-high');
  });

  it('resolves stress-early when every answer is the lowest-severity choice', () => {
    const session = runPath(crystalBoothQuiz, [
      'stress', 'rested', 'normal', 'rare', 'no-change', 'low', 'new',
    ]);
    const result = getQuizResult(crystalBoothQuiz, session);
    assert.equal(result.id, 'stress-early');
  });
});

describe('crystalBoothQuiz — full quiz integration', () => {
  it('has unique question ids across every domain', () => {
    const ids = crystalBoothQuiz.questions.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('has exactly 6 domain choices and 18 results (3 tiers x 6 domains)', () => {
    assert.equal(crystalBoothQuiz.questions[0].answers.length, 6);
    assert.equal(crystalBoothQuiz.results.length, 18);
  });

  it('resolves a same-domain result for every domain, with in-page CTA and a booth nurture segment', () => {
    const domainAnswerIds = crystalBoothQuiz.questions[0].answers.map((a) => a.id);

    domainAnswerIds.forEach((domainAnswerId) => {
      let session = createQuizSession(crystalBoothQuiz);
      session = answerCurrentQuestion(crystalBoothQuiz, session, domainAnswerId);
      while (!session.completed) {
        const question = getCurrentQuestion(crystalBoothQuiz, session);
        session = answerCurrentQuestion(crystalBoothQuiz, session, question.answers[0].id);
      }
      const result = getQuizResult(crystalBoothQuiz, session);
      assert.ok(
        result?.id?.startsWith(`${domainAnswerId}-`),
        `${domainAnswerId} should resolve to a same-domain result, got ${result?.id}`,
      );
      assert.equal(result.cta.href, '#quiz-lead-form');
      assert.ok(result.nurtureSegment.startsWith('booth-'), `${domainAnswerId} result should have a booth-* nurture segment`);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd astro && npm test`
Expected: FAIL — `Unknown quiz question "stress-wake"`, and the integration tests fail on the `stress`/other not-yet-wired domains.

- [ ] **Step 3: Add the stress domain content**

In `astro/src/data/crystalBoothQuiz.mjs`, add after `vitaminResults`:

```js
const stressQuestions = [
  {
    id: 'stress-wake',
    text: 'ตื่นนอนตอนเช้ารู้สึกอย่างไร?',
    helper: 'เลือกข้อที่ใกล้เคียงที่สุดในช่วงนี้',
    answers: [
      { id: 'rested', label: 'สดชื่น พร้อมเริ่มวันได้เลย', scores: { scoreStress: 1 }, nextQuestionId: 'stress-afternoon' },
      { id: 'slow-start', label: 'พอไปได้ ต้องใช้เวลาหน่อยกว่าจะตื่นตัว', scores: { scoreStress: 1 }, nextQuestionId: 'stress-afternoon' },
      { id: 'exhausted', label: 'เหนื่อยตั้งแต่ตื่น รู้สึกว่าไม่ได้นอนเลย', scores: { scoreStress: 3 }, nextQuestionId: 'stress-afternoon' },
    ],
  },
  {
    id: 'stress-afternoon',
    text: 'ช่วงบ่าย 14:00–16:00 รู้สึกอย่างไร?',
    answers: [
      { id: 'normal', label: 'มีพลังงานปกติ ทำงานได้ตามปกติ', scores: { scoreStress: 0 }, nextQuestionId: 'stress-cravings' },
      { id: 'mild-slump', label: 'ง่วงเล็กน้อย แต่พอสู้ต่อได้', scores: { scoreStress: 1 }, nextQuestionId: 'stress-cravings' },
      { id: 'severe-slump', label: 'ง่วงมากจนทำงานต่อแทบไม่ได้ ต้องพึ่งกาแฟหรือของหวาน', scores: { scoreStress: 3 }, nextQuestionId: 'stress-cravings' },
    ],
  },
  {
    id: 'stress-cravings',
    text: 'อยากของหวานหรือของเค็มบ่อยแค่ไหน?',
    answers: [
      { id: 'rare', label: 'แทบไม่เลย', scores: { scoreStress: 0 }, nextQuestionId: 'stress-weight' },
      { id: 'some-days', label: 'บางวันอยาก โดยเฉพาะตอนเครียดหรือตอนบ่าย', scores: { scoreStress: 1 }, nextQuestionId: 'stress-weight' },
      { id: 'daily', label: 'อยากเกือบทุกวัน ถ้าไม่ได้กินจะหงุดหงิดหรืออ่อนแรง', scores: { scoreStress: 2 }, nextQuestionId: 'stress-weight' },
    ],
  },
  {
    id: 'stress-weight',
    text: 'น้ำหนักเปลี่ยนแปลงทั้งที่คุมอาหาร / ออกกำลังกายอยู่?',
    answers: [
      { id: 'no-change', label: 'ไม่เปลี่ยน ปกติดี', scores: { scoreStress: 0 }, nextQuestionId: 'stress-level' },
      { id: 'slight-change', label: 'เปลี่ยนเล็กน้อย รู้สึกว่าร่างกายตอบสนองช้าลง', scores: { scoreStress: 1 }, nextQuestionId: 'stress-level' },
      { id: 'stuck-or-up', label: 'ลดไม่ลงเลย หรือขึ้นทั้งที่พยายามมาก', scores: { scoreStress: 2 }, nextQuestionId: 'stress-level' },
    ],
  },
  {
    id: 'stress-level',
    text: 'ความเครียดสะสมในชีวิตตอนนี้อยู่ระดับไหน?',
    answers: [
      { id: 'low', label: 'น้อย จัดการได้ดี', scores: { scoreStress: 0 }, nextQuestionId: 'stress-duration' },
      { id: 'moderate', label: 'ปานกลาง มีบ้างแต่ผ่านได้', scores: { scoreStress: 1 }, nextQuestionId: 'stress-duration' },
      { id: 'high', label: 'สูงมาก รู้สึกหนักและเหนื่อยตลอดเวลา', scores: { scoreStress: 2 }, nextQuestionId: 'stress-duration' },
    ],
  },
  {
    id: 'stress-duration',
    text: 'อาการเหล่านี้เป็นมานานแค่ไหนแล้ว?',
    answers: [
      { id: 'new', label: 'ไม่ถึงเดือน เพิ่งเริ่มสังเกตเห็น', scores: { scoreStress: 0 } },
      { id: '1-6-months', label: '1–6 เดือน เป็นๆ หายๆ', scores: { scoreStress: 2 } },
      { id: 'over-6-months', label: 'มากกว่า 6 เดือน หรือรู้สึกว่าเป็นปัญหาเรื้อรัง', scores: { scoreStress: 3 } },
    ],
  },
];

const stressResults = [
  {
    id: 'stress-high',
    title: 'ต่อมหมวกไตน่าจะต้องการความช่วยเหลือแล้ว',
    summary: 'ผลประเมินแสดงระดับความเสี่ยงสูง อาการที่คุณมีสอดคล้องกับภาวะต่อมหมวกไตล้าในระยะที่ควรได้รับการดูแล ยิ่งเริ่มรักษาเร็วเท่าไหร่ ระยะเวลาฟื้นตัวยิ่งสั้นลง',
    threshold: { scoreStress: 9 },
    nurtureSegment: 'booth-stress-high',
    recommendedSteps: [
      'ตรวจระดับ Cortisol และ DHEA ด้วยการเจาะเลือด',
      'วางแผนการรักษาเฉพาะบุคคลกับแพทย์',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
    ],
    cta: boothCta,
  },
  {
    id: 'stress-moderate',
    title: 'ฮอร์โมนเริ่มไม่สมดุล — ควรตรวจ Cortisol & DHEA',
    summary: 'ผลประเมินชี้ว่าอาการของคุณตรงกับหลายสัญญาณของภาวะต่อมหมวกไตล้า การตรวจเลือดเพื่อวัดระดับฮอร์โมนโดยตรงจะช่วยยืนยันและวางแผนการรักษาเฉพาะบุคคลได้',
    threshold: { scoreStress: 4 },
    nurtureSegment: 'booth-stress-moderate',
    recommendedSteps: [
      'ตรวจระดับ Cortisol และ DHEA เพื่อยืนยัน',
      'ปรึกษาแพทย์เรื่องการปรับวิถีชีวิตและอาหารเสริม',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
    ],
    cta: boothCta,
  },
  {
    id: 'stress-early',
    title: 'เริ่มมีสัญญาณเตือน — ดูแลก่อนสาย',
    summary: 'ผลประเมินแสดงว่าคุณมีอาการบางส่วนที่อาจบ่งชี้ถึงภาวะเริ่มต้น การพูดคุยกับแพทย์เพื่อตรวจระดับ Cortisol และ DHEA จะช่วยให้รู้แน่ชัดและป้องกันได้ตั้งแต่เนิ่นๆ',
    threshold: { scoreStress: 1 },
    nurtureSegment: 'booth-stress-early',
    recommendedSteps: [
      'พูดคุยกับแพทย์เพื่อประเมินความเสี่ยงเบื้องต้น',
      'ตรวจระดับ Cortisol และ DHEA เพื่อรู้แน่ชัด',
      'แบบประเมินนี้ไม่ใช่การวินิจฉัยทางการแพทย์ — ควรพบแพทย์เพื่อการประเมินอย่างถูกต้อง',
    ],
    cta: boothCta,
  },
];
```

Update the export to its final, complete form:

```js
  questions: [
    topConcernQuestion,
    ...hormoneQuestions,
    ...metabolismQuestions,
    ...liverQuestions,
    ...skinQuestions,
    ...vitaminQuestions,
    ...stressQuestions,
  ],
  results: [
    ...hormoneResults,
    ...metabolismResults,
    ...liverResults,
    ...skinResults,
    ...vitaminResults,
    ...stressResults,
  ],
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd astro && npm test`
Expected: PASS — every test in `crystalBoothQuiz.test.mjs` (all 6 domains + integration tests) and every pre-existing test in the suite.

- [ ] **Step 5: Type-check and build**

Run: `cd astro && npx astro check && npm run build`
Expected: 0 errors, build succeeds.

- [ ] **Step 6: Commit**

```bash
cd astro
git add src/data/crystalBoothQuiz.mjs tests/crystalBoothQuiz.test.mjs
git commit -m "feat(quiz): add stress/sleep domain, completing crystal booth quiz content"
```

---

## Task 8: Create the `/crystal-quiz` page

**Files:**
- Create: `astro/src/pages/crystal-quiz.astro`

**Interfaces:**
- Consumes: `crystalBoothQuiz` from `../data/crystalBoothQuiz.mjs` (Task 7's final state), `QuizEngine` from `../components/QuizEngine.astro` (unchanged), `BaseLayout`, `Header`, `Footer`, `SEO` (all unchanged existing components).

- [ ] **Step 1: Create the page**

Create `astro/src/pages/crystal-quiz.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SEO from '../components/SEO.astro';
import QuizEngine from '../components/QuizEngine.astro';
import { crystalBoothQuiz } from '../data/crystalBoothQuiz.mjs';
---

<BaseLayout>
  <SEO
    slot="head"
    seoTitle="เช็กสุขภาพเบื้องต้น | Thrive Wellness Clinic"
    description="ทำแบบทดสอบสุขภาพเบื้องต้น ฝากเบอร์ติดต่อรับของรางวัลที่บูธ Thrive Wellness Clinic"
    canonicalPath="/crystal-quiz"
    ogImage="/og-image.jpg"
    noIndex={true}
  />
  <Header />
  <main class="crystal-quiz-page">
    <section class="section">
      <div class="section-container" style="text-align: center;">
        <span class="section-label">Crystal Park Booth Check</span>
        <h1>เช็กสุขภาพเบื้องต้นกับ Thrive Wellness</h1>
        <p>สแกนจากบูธแล้วตอบคำถามสั้น ๆ เพื่อดูว่าตอนนี้ร่างกายคุณส่งสัญญาณอะไร</p>
      </div>
    </section>
    <QuizEngine quiz={crystalBoothQuiz} />
  </main>
  <Footer />
</BaseLayout>
```

There is no `og-image.jpg`-specific asset required for this campaign page — it reuses the site's existing generic `/og-image.jpg` (already used the same way by `astro/src/pages/thank-you.astro`, confirmed present in `astro/public/`).

- [ ] **Step 2: Verify the og-image asset exists**

Run: `ls astro/public/og-image.jpg`
Expected: file exists (already used by `thank-you.astro`). If it doesn't exist, use whatever generic OG image `thank-you.astro` actually references instead — check with `grep ogImage astro/src/pages/thank-you.astro`.

- [ ] **Step 3: Type-check**

Run: `cd astro && npx astro check`
Expected: 0 errors.

- [ ] **Step 4: Manual smoke test in the browser**

Run: `cd astro && npm run dev`

Open `http://localhost:4321/crystal-quiz` and verify:
- Page loads with the "เช็กสุขภาพเบื้องต้นกับ Thrive Wellness" heading and the quiz's 6-option first question below it.
- Click through one full domain path (e.g. pick "ฮอร์โมนแปรปรวน...", answer all 8 follow-up questions) — confirm the progress indicator advances sensibly (not "ข้อ 2 จาก 45"), and a result screen with a "ฝากเบอร์รับของรางวัล" button appears, which scrolls to the lead form on the same page (does not navigate away).
- Confirm the lead form is visible with name, phone, and LINE ID fields — do not submit it (submitting POSTs to the real `/api/leads` endpoint and creates a real row in the production Supabase leads table; that should only happen intentionally, e.g. once during final device testing at the actual booth, not casually during dev smoke-testing).

Stop the dev server (Ctrl+C) when done.

- [ ] **Step 5: Build**

Run: `cd astro && npm run build`
Expected: build succeeds, `crystal-quiz` appears among the built pages in `astro/dist/`.

- [ ] **Step 6: Commit**

```bash
cd astro
git add src/pages/crystal-quiz.astro
git commit -m "feat(quiz): add /crystal-quiz page for the Crystal Park booth event"
```

---

## Task 9: Add booth voucher-claim banner to `/thank-you`

**Files:**
- Modify: `astro/src/pages/thank-you.astro`

- [ ] **Step 1: Add the booth-specific markup and toggle script**

In `astro/src/pages/thank-you.astro`, replace the `<main class="thank-you-page">` block:

```astro
  <main class="thank-you-page">
    <section class="section">
      <div class="section-container thank-you-card">
        <span class="section-label">Thank you</span>
        <h1>ส่งข้อมูลเรียบร้อยแล้ว</h1>
        <p>ทีมงาน Thrive Wellness Clinic จะติดต่อกลับเร็ว ๆ นี้เพื่อช่วยดูแลขั้นตอนถัดไป</p>
        <div class="cta-section__actions">
          <a href="https://line.me/R/ti/p/@thrivewellnessth" class="btn btn-primary" data-gtm-event="line_click">คุยกับเราทาง LINE</a>
          <a href="/" class="btn btn-secondary">กลับหน้าแรก</a>
        </div>
      </div>
    </section>
  </main>
```

with:

```astro
  <main class="thank-you-page">
    <section class="section">
      <div class="section-container thank-you-card" data-thank-you-default>
        <span class="section-label">Thank you</span>
        <h1>ส่งข้อมูลเรียบร้อยแล้ว</h1>
        <p>ทีมงาน Thrive Wellness Clinic จะติดต่อกลับเร็ว ๆ นี้เพื่อช่วยดูแลขั้นตอนถัดไป</p>
        <div class="cta-section__actions">
          <a href="https://line.me/R/ti/p/@thrivewellnessth" class="btn btn-primary" data-gtm-event="line_click">คุยกับเราทาง LINE</a>
          <a href="/" class="btn btn-secondary">กลับหน้าแรก</a>
        </div>
      </div>
      <div class="section-container thank-you-card" data-thank-you-booth hidden>
        <span class="section-label">Thank you</span>
        <h1>ทำแบบทดสอบสำเร็จ ✅</h1>
        <p>แสดงหน้าจอนี้ให้พนักงานที่บูธ Thrive Wellness เพื่อรับของรางวัลได้เลย</p>
        <div class="cta-section__actions">
          <a href="https://line.me/R/ti/p/@thrivewellnessth" class="btn btn-primary" data-gtm-event="line_click">คุยกับเราทาง LINE</a>
          <a href="/" class="btn btn-secondary">กลับหน้าแรก</a>
        </div>
      </div>
    </section>
  </main>
```

Then, in the existing `<script is:inline>` block at the bottom of the same file, add the toggle logic right after the existing `const params = new URLSearchParams(window.location.search);` line:

```js
  <script is:inline>
    window.dataLayer = window.dataLayer || [];
    const params = new URLSearchParams(window.location.search);

    if (params.get('quiz') === 'crystal-booth-checkup') {
      document.querySelector('[data-thank-you-default]')?.setAttribute('hidden', '');
      document.querySelector('[data-thank-you-booth]')?.removeAttribute('hidden');
    }

    window.dataLayer.push({
      event: 'lead_submit',
      service: params.get('service') || '',
      page_path: window.location.pathname,
    });
    // Google Ads conversion — fires when thank-you page loads after successful lead form submit
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        'send_to': 'AW-18181967822/dzvQCKLTorkcEM6f691D',
        'value': 1.0,
        'currency': 'THB'
      });
    }
  </script>
```

(Only the `if (params.get('quiz') === ...)` block is new; everything else in the script is unchanged.)

- [ ] **Step 2: Type-check**

Run: `cd astro && npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Manual smoke test**

Run: `cd astro && npm run dev`

Open `http://localhost:4321/thank-you` (no query params) — confirm the default "ส่งข้อมูลเรียบร้อยแล้ว" card shows.

Open `http://localhost:4321/thank-you?quiz=crystal-booth-checkup` — confirm the "ทำแบบทดสอบสำเร็จ ✅" booth card shows instead, and the default card is hidden.

Stop the dev server (Ctrl+C) when done.

- [ ] **Step 4: Build**

Run: `cd astro && npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
cd astro
git add src/pages/thank-you.astro
git commit -m "feat(quiz): show booth voucher-claim banner on thank-you page for crystal booth quiz"
```

---

## Task 10: Final full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full automated test suite**

Run: `cd astro && npm test`
Expected: PASS — every test across `quizEngine.test.mjs` and `crystalBoothQuiz.test.mjs`.

- [ ] **Step 2: Run full type-check**

Run: `cd astro && npx astro check`
Expected: 0 errors.

- [ ] **Step 3: Run full production build**

Run: `cd astro && npm run build`
Expected: build succeeds; confirm `astro/dist/crystal-quiz/index.html` and `astro/dist/thank-you/index.html` exist.

Run: `ls astro/dist/crystal-quiz/index.html astro/dist/thank-you/index.html`

- [ ] **Step 4: End-to-end manual walkthrough (all 6 domains)**

Run: `cd astro && npm run dev`

For each of the 6 domain choices on `/crystal-quiz`, click through the full path once and confirm: the progress bar behaves sensibly, the result screen text reads correctly (no broken Thai text, no leftover template artifacts), and the lead form appears. Do not submit the form (see Task 8 Step 4 note on why). Stop the dev server when done.

- [ ] **Step 5: Update SITE-TRACKER.md**

Per repo convention (CLAUDE.md / `SITE-TRACKER.md`), add a row noting the new `/crystal-quiz` page — its purpose (Crystal Park booth event, 26–30 Aug 2026, noIndex), and that it's a temporary campaign asset rather than a permanent Tier A/B page. Follow the existing table format already used in `SITE-TRACKER.md` for other pages.

- [ ] **Step 6: Final commit (if the tracker update produced changes)**

```bash
git add SITE-TRACKER.md
git commit -m "docs: note /crystal-quiz booth campaign page in site tracker"
```

- [ ] **Step 7: Push and open PR**

This is a manual/user-confirmed step, not automatic — per CLAUDE.md, Satemshi (achotirat@gmail.com) is the final approver before any merge to `main`, and PRs should not be created without explicit user go-ahead. When the user is ready:

```bash
git push -u origin feature/crystal-booth-quiz
gh pr create --title "Add Crystal Park booth quiz (/crystal-quiz)" --body "$(cat <<'EOF'
## Summary
- New combined 6-domain self-assessment quiz at /crystal-quiz for the Crystal Park booth event (26-30 Aug 2026), QR-scan/mobile-first, no outbound links mid-quiz
- Reuses the existing quiz engine; adds a path-aware progress-bar fix needed now that one quiz object spans 6 independent domains
- Adds a booth-specific voucher-claim banner on /thank-you when arriving from this quiz
- Design spec: docs/superpowers/specs/2026-08-20-crystal-booth-quiz-design.md

## Test plan
- [ ] `npm test` passes (quiz engine + all 6 domains + integration tests)
- [ ] `npx astro check` clean
- [ ] `npm run build` succeeds
- [ ] Manual walkthrough of all 6 domains on a phone via the actual QR code before the event
- [ ] Satemshi review/approval per repo rules
EOF
)"
```
