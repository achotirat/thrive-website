# Homepage GEO Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise the homepage GEO score from 5/10 by adding a Key Takeaways box and a Dr. Noon expert quote — two additive content changes that give AI search engines clear, citable signals about Thrive.

**Architecture:** Three files change: CSS gets two new rule blocks, `DoctorAttribution.astro` gets an optional `quote` prop, and `index.astro` gets the TL;DR box HTML plus the quote string. No existing content is removed or rewritten.

**Tech Stack:** Astro 6, static CSS (no Tailwind), Node 22. All commands run from `astro/` directory.

---

## Setup: Create feature branch

- [ ] **Create and switch to feature branch**

```bash
git checkout -b feature/homepage-geo-improvements
```

Expected: `Switched to a new branch 'feature/homepage-geo-improvements'`

---

## File Map

| File | Change |
|------|--------|
| `astro/src/styles/global.css` | Append `.tldr-box` and `.doctor-quote` CSS rule blocks |
| `astro/src/components/DoctorAttribution.astro` | Add optional `quote?: string` to Doctor type; render `<blockquote>` when present |
| `astro/src/pages/index.astro` | Add `quote` field to `DR_NOON`; add TL;DR `<section>` between hero and services |

---

## Task 1: Add CSS rules for TL;DR box and doctor quote

**Files:**
- Modify: `astro/src/styles/global.css` (append after line 2710)

- [ ] **Step 1: Append the two new rule blocks to the end of `global.css`**

Add this exactly at the end of the file:

```css

/* ─── TL;DR / Key Takeaways box ─── */
.tldr-section {
  padding-block: var(--sp-8);
}

.tldr-box {
  list-style: none;
  padding: 0;
  margin: var(--sp-4) 0 0;
  display: grid;
  gap: var(--sp-3);
}

.tldr-box li {
  padding: var(--sp-3) var(--sp-4) var(--sp-3) var(--sp-6);
  border-left: 3px solid var(--teal);
  background: var(--white);
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  font-size: var(--text-base);
  color: var(--text);
  line-height: 1.7;
}

/* ─── Doctor expert quote ─── */
.doctor-quote {
  margin: var(--sp-6) 0 0;
  padding: var(--sp-4) var(--sp-5);
  border-left: 3px solid var(--teal);
  background: var(--teal-xl);
  border-radius: 0 var(--r-md) var(--r-md) 0;
}

.doctor-quote p {
  font-size: var(--text-base);
  font-style: italic;
  color: var(--text);
  line-height: 1.8;
  margin: 0 0 var(--sp-2);
}

.doctor-quote cite {
  font-size: var(--text-sm);
  color: var(--text-2);
  font-style: normal;
}
```

- [ ] **Step 2: Verify `npx astro check` passes (0 errors)**

```bash
cd astro && npx astro check
```

Expected: `Found 0 errors`

- [ ] **Step 3: Commit**

```bash
git add astro/src/styles/global.css
git commit -m "style: add tldr-box and doctor-quote CSS rules"
```

---

## Task 2: Add optional `quote` prop to DoctorAttribution component

**Files:**
- Modify: `astro/src/components/DoctorAttribution.astro`

- [ ] **Step 1: Replace the entire file content with the updated version**

```astro
---
type Doctor = {
  name: string;
  title: string;
  image: string;
  imageAlt: string;
  bio: string;
  specializations: string[];
  quote?: string;
};

export interface Props {
  doctor: Doctor;
}

const { doctor } = Astro.props;
---

<section class="section doctor-section">
  <div class="section-container doctor-card">
    <img src={doctor.image} alt={doctor.imageAlt} width="400" height="400" loading="lazy" />
    <div>
      <span class="section-label">Reviewed by</span>
      <h2>{doctor.name}</h2>
      <p class="doctor-card__title">{doctor.title}</p>
      <p>{doctor.bio}</p>
      {doctor.quote && (
        <blockquote class="doctor-quote">
          <p>"{doctor.quote}"</p>
          <cite>— {doctor.name}, {doctor.title}</cite>
        </blockquote>
      )}
      <div class="doctor-card__tags">
        {doctor.specializations.map((item) => <span>{item}</span>)}
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify `npx astro check` passes (0 errors)**

```bash
cd astro && npx astro check
```

Expected: `Found 0 errors`

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/DoctorAttribution.astro
git commit -m "feat: add optional quote prop to DoctorAttribution"
```

---

## Task 3: Add TL;DR box and expert quote to homepage

**Files:**
- Modify: `astro/src/pages/index.astro`

- [ ] **Step 1: Add `quote` field to the `DR_NOON` object**

Find the `DR_NOON` const (lines 11–24). Add `quote` as the last field before the closing `};`:

```ts
const DR_NOON = {
  name: 'พญ. ชนากานต์ ตระหง่านศรี (หมอนุ่น)',
  title: 'Chanakan Trangansri, MD. — Anti-aging & Regenerative Medicine',
  image: '/dr-chanakan-trangansri-thrive-400x400.jpg',
  imageAlt: 'พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์ Anti-aging Thrive Wellness Center Bangkok',
  bio: 'ผู้เชี่ยวชาญด้าน Functional Medicine และ Anti-aging ดูแลสุขภาพเชิงลึกโดยหาต้นเหตุ ไม่ใช่แค่รักษาอาการ เชี่ยวชาญด้านฮอร์โมน ภูมิแพ้ และการฟื้นฟูระดับเซลล์',
  specializations: [
    'Anti-aging & Regenerative Medicine',
    'Nutrition Wellness',
    'Lifestyle Medicine',
    'Hormone Balance',
    'Chelation & Detoxification',
  ],
  quote: 'ในการแพทย์แบบ Functional Medicine เราไม่ได้แค่รักษาอาการ — เราหาว่าทำไมร่างกายถึงส่งสัญญาณผิดปกติ เมื่อรู้ต้นเหตุจริง ร่างกายมีศักยภาพฟื้นฟูได้เองในระดับที่ยาแค่ระงับอาการไม่อาจทำได้',
};
```

- [ ] **Step 2: Add the TL;DR section between the hero close tag and the services section**

Find the comment `<!-- ── Services ──` in `index.astro` and insert the new section immediately before it:

```astro
  <!-- ── Key Takeaways ────────────────────────────────────────────── -->
  <section class="section section--light tldr-section">
    <div class="section-container">
      <span class="section-label">สรุปภาพรวม</span>
      <ul class="tldr-box">
        <li>Thrive คือคลินิก Functional Medicine กรุงเทพฯ เชี่ยวชาญ Anti-aging, Hormone Balance และ Regenerative Medicine ดูแลโดยแพทย์เฉพาะทาง</li>
        <li>ให้บริการตรวจวิเคราะห์เชิงลึก: ภูมิแพ้อาหารแฝง IgG 216 ชนิด, Adrenal Fatigue, ฮอร์โมน, HBOT, IV Drip, DNA Test และอื่นๆ อีก 14+ รายการ</li>
        <li>ดูแลโดยทีมแพทย์ 3 ท่าน — Dr. Chanakan Trangansri (Anti-aging &amp; Regenerative Medicine), Dr. Pijak Wongvisit (Preventive &amp; Regenerative Medicine) และ Dr. Uravadee Chanchamsang (Regenerative Medicine &amp; Integrative Oncology)</li>
        <li>เปิดให้บริการทุกวัน 10:00–19:00 ที่ The Crystal Park ลาดพร้าว กรุงเทพฯ โทร 095-934-9640</li>
      </ul>
    </div>
  </section>

```

- [ ] **Step 3: Verify `npx astro check` passes (0 errors)**

```bash
cd astro && npx astro check
```

Expected: `Found 0 errors`

- [ ] **Step 4: Run dev server and visually confirm both additions render correctly**

```bash
cd astro && npm run dev
```

Open `http://localhost:4321` and check:
- TL;DR box appears between hero and services, teal left-border on each bullet
- DoctorAttribution section shows the blockquote with italic quote text and cite line below it
- No layout breakage on mobile (resize browser to 375px width)

- [ ] **Step 5: Run build to confirm 0 errors**

```bash
cd astro && npm run build
```

Expected: build completes with no errors or warnings about missing types.

- [ ] **Step 6: Commit**

```bash
git add astro/src/pages/index.astro
git commit -m "feat: add homepage GEO improvements — TL;DR box and Dr. Noon expert quote"
```

---

## Done

After all tasks complete, open a PR from `feature/homepage-geo-improvements` → `main` with title:

`feat: homepage GEO improvements — TL;DR box + expert quote`
