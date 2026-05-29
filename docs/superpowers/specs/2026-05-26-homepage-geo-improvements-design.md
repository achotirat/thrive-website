# Homepage GEO Improvements — Design Spec

Date: 2026-05-26
Audit baseline: 2026-05-26 full sweep snapshot
Target page: `/` (homepage) — current GEO score 5/10, overall 6.8/10

---

## Goal

Raise the homepage GEO score from 5/10 to 8+/10 by adding two content additions that give AI search engines (ChatGPT, Perplexity, Google AI Overviews) clear, citable signals about Thrive Wellness Center.

No existing content is removed or rewritten. Both additions are purely additive.

---

## Addition 1 — Key Takeaways Box

### What
A compact summary section placed between the hero section and the services section in `index.astro`. Contains four bullet points that directly answer the implied question "What is Thrive Wellness Center?" — the format AI engines prefer for citation.

### Placement
Between `<section class="hero">` close and `<section class="section section--white" id="services">` in `index.astro`.

### Content

Label: **สรุปภาพรวม**

Bullets:
1. Thrive คือคลินิก Functional Medicine กรุงเทพฯ เชี่ยวชาญ Anti-aging, Hormone Balance และ Regenerative Medicine ดูแลโดยแพทย์เฉพาะทาง
2. ให้บริการตรวจวิเคราะห์เชิงลึก: ภูมิแพ้อาหารแฝง IgG 216 ชนิด, Adrenal Fatigue, ฮอร์โมน, HBOT, IV Drip, DNA Test และอื่นๆ อีก 14+ รายการ
3. ดูแลโดยทีมแพทย์ 3 ท่าน — Dr. Chanakan Trangansri (Anti-aging & Regenerative Medicine), Dr. Pijak Wongvisit (Preventive & Regenerative Medicine) และ Dr. Uravadee Chanchamsang (Regenerative Medicine & Integrative Oncology)
4. เปิดให้บริการทุกวัน 10:00–19:00 ที่ The Crystal Park ลาดพร้าว กรุงเทพฯ โทร 095-934-9640

### Implementation
- Inline HTML in `index.astro` — no new component needed
- CSS class: `tldr-box` — a new rule added to `thrive-styles.css` using the existing design token palette (neutral background, left border accent, matches existing card patterns)

---

## Addition 2 — Dr. Noon Expert Quote

### What
A `<blockquote>` attributed explicitly to Dr. Chanakan with her full name and title, rendered inside `DoctorAttribution.astro` after the bio paragraph. Explicit attribution is the primary signal AI engines use for expert citation.

### Placement
After the `<p>{doctor.bio}</p>` line in `DoctorAttribution.astro`, rendered only when a `quote` prop is passed (optional — other pages using this component are unaffected).

### Content

> "ในการแพทย์แบบ Functional Medicine เราไม่ได้แค่รักษาอาการ — เราหาว่าทำไมร่างกายถึงส่งสัญญาณผิดปกติ เมื่อรู้ต้นเหตุจริง ร่างกายมีศักยภาพฟื้นฟูได้เองในระดับที่ยาแค่ระงับอาการไม่อาจทำได้"
>
> — พญ. ชนากานต์ ตระหง่านศรี, Anti-aging & Regenerative Medicine Physician, Thrive Wellness Center Bangkok

### Implementation
- Add optional `quote?: string` prop to `DoctorAttribution.astro`
- Render as `<blockquote class="doctor-quote">` with `<cite>` for the attribution line
- New `.doctor-quote` rule in `thrive-styles.css`
- Pass quote text from `index.astro` via the existing `DR_NOON` object (add `quote` field)

---

## Files Changed

| File | Change |
|------|--------|
| `astro/src/pages/index.astro` | Add TL;DR box HTML between hero and services; add `quote` field to `DR_NOON` |
| `astro/src/components/DoctorAttribution.astro` | Add optional `quote` prop + conditional blockquote render |
| `astro/src/styles/thrive-styles.css` | Add `.tldr-box` and `.doctor-quote` CSS rules |

---

## Out of Scope

- Title tag shortening (separate SEO task)
- Schema / E-E-A-T improvements (separate task)
- Blog section (not deployed yet)
- Any changes to other Tier A pages
