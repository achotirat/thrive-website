# Crystal Quiz Express Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/crystal-quiz-express` — a single-page multi-select symptom checklist + name/phone lead form for the booth event, as a simpler alternative to the existing branching `/crystal-quiz`.

**Architecture:** One new self-contained Astro page with its own form and inline submit script (adapted from `LeadForm.astro`'s proven `/api/leads` submission logic), not built on the quiz engine. No backend changes — `/api/leads` already accepts every field this form sends.

**Tech Stack:** Astro 6, plain inline `<script>` (no new JS modules), existing `thrive-styles.css` classes only (`.lead-form`, `.lead-form__consent`, `.section`, `.section-container`, `.btn`).

## Global Constraints

- Only reuse existing CSS classes — no new styles, no Tailwind.
- `noIndex: true` on the new page, and it must be excluded from the sitemap filter in `astro/astro.config.mjs`, matching how `/crystal-quiz` is already excluded there.
- Run `npx astro check` and `npm run build` (from `astro/`) before every commit that touches files under `astro/`.
- Never push to `main`; this work happens on `feature/crystal-quiz-express`.
- Redirect target on successful submit is `/thank-you?quiz=crystal-booth-checkup&service=crystal-quiz-express` — reuses the existing booth banner condition on `/thank-you` verbatim, no changes to that file.
- The 6 checkbox labels/order must exactly match the original `top-concern` question in `astro/src/data/crystalBoothQuiz.mjs` (do not paraphrase).

---

## Task 1: Create the `/crystal-quiz-express` page

**Files:**
- Create: `astro/src/pages/crystal-quiz-express.astro`
- Modify: `astro/astro.config.mjs`

**Interfaces:**
- Consumes: `/api/leads` (existing Netlify function, unchanged) — accepts `name`, `phone`, `line_id`, `service_interest`, `source_page`, `message`, `quiz_id`, `quiz_answers`, `nurture_segment`, attribution fields, `consent`, `consent_at`, `consent_version`.
- Produces: nothing consumed by later tasks — this is the whole feature.

- [ ] **Step 1: Create the page**

Create `astro/src/pages/crystal-quiz-express.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SEO from '../components/SEO.astro';

const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;

const concerns = [
  { value: 'hormone', label: 'ฮอร์โมนแปรปรวน รอบเดือนไม่ปกติ หรือสงสัยวัยทอง' },
  { value: 'metabolism', label: 'เผาผลาญพัง น้ำหนักขึ้นง่าย ลดยาก' },
  { value: 'liver', label: 'กังวลเรื่องตับ เหนื่อยง่าย ดื่ม/ใช้ยาบ่อย' },
  { value: 'skin', label: 'ผิวแห้ง คัน หรือมีผื่นแพ้' },
  { value: 'vitamin', label: 'สงสัยว่าขาดวิตามินหรือแร่ธาตุ' },
  { value: 'stress', label: 'เครียดสะสม นอนไม่หลับ' },
];
---

<BaseLayout>
  <SEO
    slot="head"
    seoTitle="เช็กสุขภาพเบื้องต้น | Thrive Wellness Clinic"
    description="เลือกอาการที่กังวล ฝากเบอร์ติดต่อ รับของรางวัลที่บูธ Thrive Wellness Clinic"
    canonicalPath="/crystal-quiz-express"
    ogImage="/og-image.jpg"
    noIndex={true}
  />
  <Header />
  <main class="crystal-quiz-page">
    <section class="section">
      <div class="section-container" style="text-align: center;">
        <span class="section-label">Crystal Park Booth Check</span>
        <h1>เช็กสุขภาพเบื้องต้นกับ Thrive Wellness</h1>
        <p>เลือกอาการที่กังวล (เลือกได้หลายข้อ) แล้วฝากเบอร์ติดต่อ รับของรางวัลที่บูธได้เลย</p>
      </div>
    </section>

    <section class="section lead-form-section" id="express-form">
      <div class="section-container lead-form-card">
        <form class="lead-form" id="express-lead-form" data-service-slug="crystal-quiz-express">
          <input type="hidden" name="service_interest" value="crystal-quiz-express" />
          <input type="hidden" name="source_page" value="crystal-quiz-express" />
          <input type="hidden" name="landing_page" />
          <input type="hidden" name="referrer" />
          <input type="hidden" name="utm_source" />
          <input type="hidden" name="utm_medium" />
          <input type="hidden" name="utm_campaign" />
          <input type="hidden" name="utm_term" />
          <input type="hidden" name="utm_content" />
          <input type="hidden" name="gclid" />
          <input type="hidden" name="fbclid" />
          <input type="hidden" name="wbraid" />
          <input type="hidden" name="gbraid" />
          <input type="hidden" name="consent_version" value="crystal-quiz-express-2026-08" />
          <input type="hidden" name="quiz_id" value="crystal-quiz-express" />
          <input type="hidden" name="nurture_segment" value="booth-express" />
          <input type="hidden" name="message" id="express-message" />
          <input type="hidden" name="quiz_answers" id="express-quiz-answers" />

          <h2>ตอนนี้อะไรกวนใจคุณบ้าง?</h2>
          <p>เลือกได้มากกว่า 1 ข้อ</p>
          <div class="express-concerns" data-concerns>
            {concerns.map((c) => (
              <label class="lead-form__consent">
                <input type="checkbox" name="concerns" value={c.value} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
          <p class="lead-form__status" data-concerns-error aria-live="polite" hidden>กรุณาเลือกอาการอย่างน้อย 1 ข้อ</p>

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
            <span>ยินยอมให้ Thrive Wellness Clinic ติดต่อกลับตามข้อมูลที่ให้ไว้เพื่อการนัดหมายและให้คำปรึกษา</span>
          </label>

          {turnstileSiteKey && <div class="cf-turnstile" data-sitekey={turnstileSiteKey}></div>}
          <p class="lead-form__status" data-submit-status aria-live="polite"></p>
          <button type="submit" class="btn btn-primary">ฝากเบอร์รับของรางวัล</button>
        </form>
      </div>
    </section>
  </main>
  <Footer />
</BaseLayout>

{turnstileSiteKey && <script is:inline src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>}

<script is:inline>
  (function captureAttributionImmediate() {
    const attributionKeys = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gclid', 'fbclid', 'wbraid', 'gbraid',
    ];
    const url = new URL(window.location.href);
    if (!sessionStorage.getItem('landing_page')) {
      sessionStorage.setItem('landing_page', window.location.href);
    }
    attributionKeys.forEach((key) => {
      const value = url.searchParams.get(key);
      if (value) sessionStorage.setItem(key, value);
    });
  })();
</script>

<script>
  type DataLayerWindow = Window & { dataLayer?: Array<Record<string, unknown>> };

  const CONCERN_LABELS: Record<string, string> = {
    hormone: 'ฮอร์โมน',
    metabolism: 'เผาผลาญ/น้ำหนัก',
    liver: 'ตับ',
    skin: 'ผิว',
    vitamin: 'วิตามิน/แร่ธาตุ',
    stress: 'เครียด/นอนไม่หลับ',
  };

  (function captureAttribution() {
    const attributionKeys = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'gclid', 'fbclid', 'wbraid', 'gbraid',
    ];
    const url = new URL(window.location.href);
    if (!sessionStorage.getItem('landing_page')) {
      sessionStorage.setItem('landing_page', window.location.href);
    }
    attributionKeys.forEach((key) => {
      const value = url.searchParams.get(key);
      if (value) sessionStorage.setItem(key, value);
    });
  })();

  const form = document.getElementById('express-lead-form');
  if (form instanceof HTMLFormElement) {
    const attributionKeys = [
      'landing_page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign',
      'utm_term', 'utm_content', 'gclid', 'fbclid', 'wbraid', 'gbraid',
    ];
    let started = false;

    const fillAttribution = () => {
      attributionKeys.forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input instanceof HTMLInputElement) input.value = sessionStorage.getItem(key) || '';
      });
    };

    form.addEventListener('focusin', () => {
      if (started) return;
      started = true;
      const dataLayerWindow = window as DataLayerWindow;
      dataLayerWindow.dataLayer = dataLayerWindow.dataLayer || [];
      dataLayerWindow.dataLayer.push({
        event: 'form_start',
        service: 'crystal-quiz-express',
        page_path: window.location.pathname,
      });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const checked = Array.from(
        form.querySelectorAll('input[name="concerns"]:checked'),
      ) as HTMLInputElement[];
      const errorEl = form.querySelector('[data-concerns-error]');

      if (checked.length === 0) {
        if (errorEl instanceof HTMLElement) errorEl.hidden = false;
        checked[0]?.focus();
        return;
      }
      if (errorEl instanceof HTMLElement) errorEl.hidden = true;

      const values = checked.map((el) => el.value);
      const labels = values.map((v) => CONCERN_LABELS[v] || v);

      const messageInput = form.querySelector('#express-message');
      const answersInput = form.querySelector('#express-quiz-answers');
      if (messageInput instanceof HTMLInputElement) messageInput.value = `สนใจ: ${labels.join(', ')}`;
      if (answersInput instanceof HTMLInputElement) answersInput.value = JSON.stringify(values);

      fillAttribution();

      const status = form.querySelector('[data-submit-status]');
      const button = form.querySelector('button[type="submit"]');
      const formData = new FormData(form);
      formData.set('consent_at', new Date().toISOString());

      if (button instanceof HTMLButtonElement) button.disabled = true;
      if (status instanceof HTMLElement) {
        status.textContent = 'กำลังส่งข้อมูล...';
        status.dataset.state = 'loading';
      }

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });

        if (!response.ok) throw new Error('Lead submission failed');
        const dataLayerWindow = window as DataLayerWindow;
        dataLayerWindow.dataLayer = dataLayerWindow.dataLayer || [];
        dataLayerWindow.dataLayer.push({
          event: 'lead_submit',
          service: 'crystal-quiz-express',
          page_path: window.location.pathname,
        });
        window.location.href = '/thank-you?quiz=crystal-booth-checkup&service=crystal-quiz-express';
      } catch (error) {
        if (status instanceof HTMLElement) {
          status.textContent = 'ยังส่งข้อมูลไม่ได้ กรุณาติดต่อผ่าน LINE หรือโทร 095-934-9640';
          status.dataset.state = 'error';
        }
        const turnstile = (window as { turnstile?: { reset: (el: Element) => void } }).turnstile;
        const widget = form.querySelector('.cf-turnstile');
        if (turnstile && widget) turnstile.reset(widget);
      } finally {
        if (button instanceof HTMLButtonElement) button.disabled = false;
      }
    });
  }
</script>
```

Notes on this code:
- `.lead-form__consent` (an existing class from `LeadForm.astro`'s consent checkbox) is reused for every symptom checkbox row — gives native checkbox+label styling with zero new CSS.
- `message` and `quiz_answers` are hidden inputs populated just before submit (not on every checkbox change) — simplest correct approach, no extra change-event wiring needed.
- The min-1-checkbox validation blocks submission and reveals `[data-concerns-error]` rather than relying on HTML5 `required` (checkboxes with the same `name` can't use `required` to mean "at least one" — that would require every box checked, not any one of them).
- `og-image.jpg` reuses the same generic asset already used by `/crystal-quiz` and `/thank-you` (confirmed present at `astro/public/og-image.jpg`).

- [ ] **Step 2: Exclude the page from the sitemap**

In `astro/astro.config.mjs`, the sitemap filter currently reads (per the comment, already covers `/thank-you`, `/lp/*`, and `/crystal-quiz`):

```js
filter: (page) => !page.includes('/thank-you') && !page.includes('/lp/') && !page.includes('/crystal-quiz'),
```

Note that `!page.includes('/crystal-quiz')` **already matches** `/crystal-quiz-express` too, since it's a substring match, not an exact-path match — `/crystal-quiz-express` contains `/crystal-quiz`. Verify this is actually true by reading the current file (do not assume the exact wording above is still accurate — re-read `astro/astro.config.mjs` first). If the filter already covers it via that substring match, no code change is needed for this step — just confirm and note it in the commit/report. If the filter has since changed to an exact match, add `!page.includes('/crystal-quiz-express')` explicitly.

- [ ] **Step 3: Type-check**

Run: `cd astro && npx astro check`
Expected: 0 errors.

- [ ] **Step 4: Manual browser smoke test**

Run: `cd astro && npm run dev`

Open `http://localhost:4321/crystal-quiz-express` and verify:
- Page loads with the H1, intro text, and all 6 checkboxes with correct Thai labels in the correct order.
- Click submit with zero checkboxes checked → inline error "กรุณาเลือกอาการอย่างน้อย 1 ข้อ" appears, form does not submit.
- Check 2-3 boxes, fill name + phone, check consent → do NOT click submit (submitting POSTs to the real production `/api/leads` endpoint and creates a real row in the production Supabase leads table — same caution as every other quiz page in this repo). Confirm the button and fields are present and interactive.
- Open browser dev tools Network tab, and (only if you're comfortable creating one clearly-fake test lead, e.g. name "TEST DELETE ME", phone "0000000000") submit once to confirm the POST body contains `message` formatted as `สนใจ: ...` and `quiz_answers` as a JSON array string — then flag to the user that a test lead was created and should be removed/ignored in the CRM.

Stop the dev server (Ctrl+C) when done.

- [ ] **Step 5: Build**

Run: `cd astro && npm run build`
Expected: build succeeds. Confirm `astro/dist/crystal-quiz-express/index.html` exists.

Run: `ls astro/dist/crystal-quiz-express/index.html`

- [ ] **Step 6: Check the built sitemap excludes the new page**

Run: `grep -c "crystal-quiz-express" astro/dist/sitemap-0.xml`
Expected: `0` (not present).

- [ ] **Step 7: Commit**

```bash
cd astro
git add src/pages/crystal-quiz-express.astro astro.config.mjs
git commit -m "feat(quiz): add /crystal-quiz-express — simple multi-select booth form"
```

(If Step 2 required no code change because the substring filter already covered it, `astro.config.mjs` won't appear in the diff — that's fine, just commit the new page file.)

---

## Task 2: Final verification and handoff

**Files:** none (verification only)

- [ ] **Step 1: Full regression check**

Run: `cd astro && npx astro check && npm run build`
Expected: 0 errors, build succeeds, no regressions to any other page (spot check `astro/dist/crystal-quiz/index.html` and `astro/dist/thank-you/index.html` still exist and are unaffected).

- [ ] **Step 2: Report to the user**

Summarize: page live at `/crystal-quiz-express` locally, all 6 checkboxes present and correctly labeled, min-1 validation works, sitemap correctly excludes it, build clean. Note explicitly that no lead was actually submitted during verification (per Step 4's caution above) unless the user asked for a live end-to-end test.

- [ ] **Step 3: Push and open PR** (manual/user-confirmed step — do not do this automatically)

```bash
git push -u origin feature/crystal-quiz-express
gh pr create --title "Add /crystal-quiz-express — simple multi-select booth form" --body "$(cat <<'EOF'
## Summary
- New simpler booth page at /crystal-quiz-express: single multi-select symptom checklist (same 6 concerns as /crystal-quiz's first question) + name/phone, no branching/scoring
- Not built on the quiz engine — self-contained form adapted from LeadForm.astro's submission logic
- Reuses the existing /thank-you booth banner (same quiz=crystal-booth-checkup redirect param) — no changes to thank-you.astro
- /crystal-quiz (the original branching version) is untouched and stays live
- Design spec: docs/superpowers/specs/2026-08-23-crystal-quiz-express-design.md

## Test plan
- [ ] npx astro check clean
- [ ] npm run build succeeds
- [ ] Manual walkthrough: all 6 checkboxes present, min-1 validation works, submit reaches /thank-you booth banner
- [ ] Confirm /crystal-quiz-express excluded from sitemap
- [ ] Satemshi review/approval per repo rules
EOF
)"
```
