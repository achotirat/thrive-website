# EpiSpan Service Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new Tier A service page at `/epispan` covering EpiSpan (GENFOSIS brand, TruDiagnostic lab technology) — an epigenetic / biological age test, following the same manual-MDX pattern as `/dna-test`.

**Architecture:** One Astro Content Collection entry (`astro/src/content/services/epispan.mdx`) providing frontmatter (seo/hero/doctor/faqs/cta/relatedServices/jsonLd) validated by the existing `servicesCollection` Zod schema, plus a thin page wrapper (`astro/src/pages/epispan.astro`) that composes existing shared components (`ServiceHero`, `FAQSection`, `DoctorAttribution`, `CTASection`, `LeadForm`, `ServiceCard`, `Breadcrumbs`, `SEO`) exactly like `dna-test.astro` does. No new components, no schema changes.

**Tech Stack:** Astro 6 content collections, Zod schema validation (already defined in `content.config.ts`), existing shared components, inline `<style>` per existing Tier A page convention (no Tailwind, no new CSS files).

## Global Constraints

- Never push to `main` — all work happens on `feature/epispan-service-page` (already created, spec already committed there)
- `npx astro check` must show 0 errors before every commit
- `npm run build` must succeed before every commit
- Do not modify root `*.html` or `thrive-styles.css`
- Preserve existing URLs — `/epispan` is a brand-new slug, no collisions
- Reuse existing doctor JSON-LD `@id` (`https://www.thrivewellnessth.com/#dr-chanakan`) and clinic `@id` (`https://www.thrivewellnessth.com/#clinic`) — do not create duplicate entities
- Anti-clickbait gate: no absolute claims ("ย้อนวัย", "หยุดแก่", "รักษาหาย") — use qualified language ("อาจช่วยชะลอ", "มีความสัมพันธ์กับ")
- SITE-TRACKER.md doctor table must be updated in the same change that adds a หมอนุ่น profile to a page (documented rule in that file)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `astro/src/content/services/epispan.mdx` | Frontmatter (SEO/hero/doctor/faqs/cta/related/jsonLd) + page body content |
| Create | `astro/src/pages/epispan.astro` | Thin page wrapper, composes shared components, exposes `/epispan` |
| Modify | `SITE-TRACKER.md` | Add `epispan.mdx` row to "Doctor on File" table |
| Modify | `.claude/skills/thrive-content-writer/SKILL.md` | Add EpiSpan row to Tier A service page CTA map, so future blog posts link here |

---

## Task 1: Create the EpiSpan content entry

**Files:**
- Create: `astro/src/content/services/epispan.mdx`

**Interfaces:**
- Consumes: `servicesCollection` Zod schema from `astro/src/content.config.ts:11-105` (frontmatter shape: `seo`, `hero`, `doctor`, `faqs`, `cta`, `relatedServices`, `jsonLd` — all required except the optional LP blocks which this page does not use)
- Produces: a content-collection entry retrievable via `getEntry('services', 'epispan')`, consumed by Task 2

- [ ] **Step 1: Write the full MDX file**

Create `astro/src/content/services/epispan.mdx` with this exact content:

````mdx
---
seo:
  seoTitle: "ตรวจ EpiSpan อายุชีวภาพ Epigenetic Test | Thrive Wellness Clinic"
  description: "ตรวจ EpiSpan วัดอายุชีวภาพระดับเซลล์ (Biological Age) ด้วยเทคโนโลยี Epigenetics พัฒนาร่วม Harvard, Yale, Duke รู้อัตราการแก่ที่แท้จริง วางแผนชะลอวัยแม่นยำ"
  ogImage: "/epispan-hero-1200x630.jpg"
  ogLocale: "th_TH"
  canonicalPath: "/epispan"
  noIndex: false
  hreflang:
    - lang: "th-TH"
      href: "https://www.thrivewellnessth.com/epispan"
    - lang: "en"
      href: "https://www.thrivewellnessth.com/en/epispan"
    - lang: "x-default"
      href: "https://www.thrivewellnessth.com/epispan"
  geo:
    region: "TH-10"
    placename: "Bangkok, Lat Phrao, Thailand"
    position: "13.7951;100.6100"
    icbm: "13.7951, 100.6100"
  publishedAt: "2026-07-02"
  updatedAt: "2026-07-02"
  lastMedicalReview: "2026-07-02"
  reviewedBy: "พญ. ชนากานต์ ตระหง่านศรี"
  medicalSpecialty: "Anti-aging & Regenerative Medicine"
hero:
  headline: "อายุตามบัตรประชาชน กับ อายุเซลล์จริง ต่างกันแค่ไหน?"
  subline: "EpiSpan วัดอายุชีวภาพระดับเซลล์ด้วยเทคโนโลยี Epigenetics พัฒนาร่วมกับนักวิจัยจาก Harvard, Yale และ Duke รู้อัตราการแก่ที่แท้จริงของร่างกาย ก่อนจะวางแผนชะลอวัยได้ตรงจุด"
  image: "/epispan-hero-1200x630.jpg"
  imageAlt: "ตรวจ EpiSpan อายุชีวภาพ Epigenetic Test ที่ Thrive Wellness Clinic"
  primaryBtn:
    label: "โทรสอบถามราคา 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
  stats:
    - value: "11"
      label: "อวัยวะที่วัดอายุแยกเฉพาะ (Organ Age)"
    - value: "Harvard·Yale·Duke"
      label: "งานวิจัยเบื้องหลังเทคโนโลยี"
    - value: "40+"
      label: "ไบโอมาร์กเกอร์ที่วิเคราะห์"
    - value: "1"
      label: "ตรวจครั้งเดียว รู้อายุชีวภาพทั้งระบบ"
doctor:
  name: "พญ. ชนากานต์ ตระหง่านศรี"
  title: "แพทย์เวชศาสตร์ชะลอวัยและฟื้นฟู"
  image: "/dr-chanakan-trangansri-thrive-400x400.jpg"
  imageAlt: "พญ. ชนากานต์ ตระหง่านศรี ผู้ดูแลการตรวจ EpiSpan"
  bio: "\"อายุตามบัตรประชาชนบอกได้แค่ว่าคุณเกิดมากี่ปีแล้ว แต่อายุชีวภาพจากการตรวจ EpiSpan บอกว่าเซลล์ของคุณแก่เร็วหรือช้ากว่านั้นแค่ไหน และอวัยวะไหนที่ต้องดูแลเป็นพิเศษ ทำให้วางแผนชะลอวัยได้ตรงจุดกว่าการเดา\""
  specializations:
    - "Anti-aging & Regenerative Medicine"
    - "Preventive Medicine"
    - "Nutrition Wellness"
    - "Lifestyle Medicine"
    - "Hormone Balance"
faqs:
  - q: "EpiSpan ต่างจากการตรวจ DNA (Genetic Test) อย่างไร?"
    a: "การตรวจ DNA วิเคราะห์รหัสพันธุกรรม (genetic sequence) ซึ่งไม่เปลี่ยนแปลงตลอดชีวิต ส่วน EpiSpan วิเคราะห์ epigenetics คือรูปแบบการแสดงออกของยีน (gene expression) ซึ่งเปลี่ยนแปลงได้ตามอายุ ไลฟ์สไตล์ และสิ่งแวดล้อม พูดง่ายๆ คือ DNA บอกพิมพ์เขียวที่ติดตัวมาแต่กำเนิด ส่วน EpiSpan บอกว่าพิมพ์เขียวนั้นถูกใช้งานอย่างไรในวันนี้ ทั้งสองการตรวจเสริมกัน ไม่ได้แทนกัน"
  - q: "ต้องหยุดยาหรืออาหารเสริมก่อนตรวจ EpiSpan หรือไม่?"
    a: "ไม่จำเป็นต้องหยุดยาหรืออาหารเสริมที่กินเป็นประจำก่อนตรวจ ปัจจุบันข้อมูลเกี่ยวกับยาที่ส่งผลต่อรูปแบบ methylation (การเติมหมู่เคมีบน DNA ที่ใช้วัดอายุชีวภาพ) ยังมีไม่มากนัก อย่างไรก็ตาม ควรแจ้งแพทย์ถึงยาและอาหารเสริมที่ใช้อยู่ทุกครั้งก่อนตรวจ"
  - q: "ผู้ป่วยมะเร็งสามารถตรวจ EpiSpan ได้หรือไม่?"
    a: "ตรวจได้ในกรณีส่วนใหญ่ เนื่องจากปัจจัยเรื่อง circulating tumor cells (เซลล์มะเร็งที่หลุดลอยในกระแสเลือด) มีปริมาณน้อยเกินกว่าจะส่งผลต่อการวิเคราะห์ อย่างไรก็ตาม ไม่แนะนำให้ตรวจในผู้ป่วยมะเร็งเม็ดเลือด (blood cancer) เพราะค่า methylation จากเซลล์เม็ดเลือดและระบบภูมิคุ้มกันจะเปลี่ยนแปลงไปมาก ทำให้ผลตรวจคลาดเคลื่อน ควรปรึกษาแพทย์ก่อนตรวจทุกครั้งหากมีประวัติมะเร็ง"
  - q: "เพิ่งได้รับเลือดหรือ Stem Cell ต้องรอนานแค่ไหนก่อนตรวจ?"
    a: "หากเพิ่งได้รับการถ่ายเลือด แนะนำให้เว้นระยะอย่างน้อย 8-12 สัปดาห์ก่อนตรวจ EpiSpan ส่วนผู้ที่ได้รับ IV Mesenchymal Stem Cell แนะนำให้เว้นระยะอย่างน้อย 4 สัปดาห์ เนื่องจากเซลล์ใหม่ที่เข้าสู่ร่างกายมีรูปแบบ methylation ของตัวเอง ซึ่งจะปะปนกับผลตรวจ ทำให้อายุชีวภาพที่วัดได้ไม่สะท้อนร่างกายของคุณจริงๆ"
  - q: "ควรตรวจ EpiSpan ซ้ำเมื่อไหร่?"
    a: "แนะนำให้ตรวจซ้ำทุก 6 เดือน โดยเฉพาะหลังจากปรับเปลี่ยนไลฟ์สไตล์หรือได้รับการดูแลบางอย่าง เช่น ปรับอาหาร ออกกำลังกาย หรือจัดการความเครียด เนื่องจาก epigenetics เปลี่ยนแปลงได้ต่อเนื่อง อัตราการเปลี่ยนแปลงขึ้นกับแต่ละบุคคล แต่โดยเฉลี่ยอยู่ที่ประมาณ 6 เดือนจึงจะเห็นความแตกต่างที่มีนัยสำคัญ"
cta:
  headline: "อยากรู้ไหมว่าเซลล์คุณอายุเท่าไหร่จริงๆ?"
  subline: "ตรวจ EpiSpan ที่ Thrive Wellness Clinic สอบถามราคาและรายละเอียดได้ที่ทีมงาน The Crystal Park ชั้น 2 ลาดพร้าว เปิดทุกวัน 10:00–19:00"
  primaryBtn:
    label: "โทรสอบถามราคา"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE สอบถามราคา"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
relatedServices:
  - title: "ตรวจ DNA พันธุกรรม"
    href: "/dna-test"
    icon: "🧬"
    description: "DNA คือพิมพ์เขียวที่ไม่เปลี่ยนแปลง ส่วน EpiSpan วัดว่าพิมพ์เขียวนั้นถูกใช้งานอย่างไรในวันนี้ ตรวจคู่กันเพื่อเห็นภาพสุขภาพครบทุกมิติ"
  - title: "NAD+ Therapy"
    href: "/nad"
    icon: "⚡"
    description: "NAD+ ส่งผลโดยตรงต่อการทำงานของเซลล์และกระบวนการชะลอวัย ใช้ผล EpiSpan วัดความเปลี่ยนแปลงก่อน-หลังการรักษา"
  - title: "ตรวจสุขภาพครบวงจร"
    href: "/check-up"
    icon: "🏥"
    description: "ใช้ควบคู่กับตรวจสุขภาพพื้นฐาน เพื่อเห็นภาพรวมสุขภาพทั้งปัจจุบันและแนวโน้มระยะยาว"
jsonLd:
  - "@context": "https://schema.org"
    "@graph":
      - "@type": "MedicalClinic"
        "@id": "https://www.thrivewellnessth.com/#clinic"
        name: "Thrive Wellness Clinic"
        url: "https://www.thrivewellnessth.com"
        telephone: "+66959349640"
        address:
          "@type": "PostalAddress"
          streetAddress: "The Crystal Park ชั้น 2 อาคาร B เลขที่ 199 ถนนประดิษฐ์มนูธรรม"
          addressLocality: "ลาดพร้าว กรุงเทพมหานคร"
          postalCode: "10230"
          addressCountry: "TH"
        geo:
          "@type": "GeoCoordinates"
          latitude: "13.7951"
          longitude: "100.6100"
        openingHours: "Mo-Su 10:00-19:00"
        medicalSpecialty: "Anti-aging & Regenerative Medicine"
      - "@type": "Person"
        "@id": "https://www.thrivewellnessth.com/#dr-chanakan"
        name: "พญ. ชนากานต์ ตระหง่านศรี"
        alternateName: "หมอนุ่น"
        jobTitle: "แพทย์เวชศาสตร์ชะลอวัยและฟื้นฟู"
        worksFor:
          "@id": "https://www.thrivewellnessth.com/#clinic"
      - "@type": "MedicalTest"
        name: "ตรวจ EpiSpan (Epigenetic & Biological Age Testing)"
        alternateName: "EpiSpan Test"
        description: "การตรวจวิเคราะห์ DNA methylation เพื่อประเมินอายุชีวภาพระดับเซลล์ อัตราการแก่ของร่างกาย และอายุแยกรายอวัยวะ ช่วยวางแผนชะลอวัยและป้องกันโรคเรื้อรังอย่างตรงจุด"
        howPerformed: "เก็บตัวอย่างเลือด ส่งวิเคราะห์รูปแบบ DNA methylation ในห้องปฏิบัติการพันธมิตร"
        usedToDiagnose:
          - "@type": "MedicalCondition"
            name: "อัตราการแก่ของเซลล์ที่เร็วกว่าอายุจริง (accelerated biological aging)"
          - "@type": "MedicalCondition"
            name: "ความเสี่ยงโรคเรื้อรังจากการอักเสบระดับต่ำเรื้อรัง (chronic inflammation)"
          - "@type": "MedicalCondition"
            name: "ความเสื่อมของอวัยวะเฉพาะระบบก่อนวัยอันควร"
        performedBy:
          "@id": "https://www.thrivewellnessth.com/#clinic"
      - "@type": "FAQPage"
        mainEntity:
          - "@type": "Question"
            name: "EpiSpan ต่างจากการตรวจ DNA (Genetic Test) อย่างไร?"
            acceptedAnswer:
              "@type": "Answer"
              text: "การตรวจ DNA วิเคราะห์รหัสพันธุกรรมซึ่งไม่เปลี่ยนแปลงตลอดชีวิต ส่วน EpiSpan วิเคราะห์ epigenetics คือรูปแบบการแสดงออกของยีนซึ่งเปลี่ยนแปลงได้ตามอายุ ไลฟ์สไตล์ และสิ่งแวดล้อม ทั้งสองการตรวจเสริมกัน ไม่ได้แทนกัน"
          - "@type": "Question"
            name: "ต้องหยุดยาหรืออาหารเสริมก่อนตรวจ EpiSpan หรือไม่?"
            acceptedAnswer:
              "@type": "Answer"
              text: "ไม่จำเป็นต้องหยุดยาหรืออาหารเสริมที่กินเป็นประจำก่อนตรวจ ข้อมูลเกี่ยวกับยาที่ส่งผลต่อรูปแบบ methylation ยังมีไม่มากนัก แต่ควรแจ้งแพทย์ถึงยาและอาหารเสริมที่ใช้อยู่ทุกครั้ง"
          - "@type": "Question"
            name: "ผู้ป่วยมะเร็งสามารถตรวจ EpiSpan ได้หรือไม่?"
            acceptedAnswer:
              "@type": "Answer"
              text: "ตรวจได้ในกรณีส่วนใหญ่ แต่ไม่แนะนำในผู้ป่วยมะเร็งเม็ดเลือด เพราะค่า methylation จากเซลล์เม็ดเลือดและระบบภูมิคุ้มกันจะเปลี่ยนแปลงมาก ควรปรึกษาแพทย์ก่อนตรวจหากมีประวัติมะเร็ง"
          - "@type": "Question"
            name: "เพิ่งได้รับเลือดหรือ Stem Cell ต้องรอนานแค่ไหนก่อนตรวจ?"
            acceptedAnswer:
              "@type": "Answer"
              text: "หากเพิ่งได้รับการถ่ายเลือด แนะนำเว้นระยะ 8-12 สัปดาห์ก่อนตรวจ ส่วนผู้ที่ได้รับ IV Mesenchymal Stem Cell แนะนำเว้นระยะ 4 สัปดาห์ เพราะเซลล์ใหม่มีรูปแบบ methylation ของตัวเองที่จะปะปนกับผลตรวจ"
          - "@type": "Question"
            name: "ควรตรวจ EpiSpan ซ้ำเมื่อไหร่?"
            acceptedAnswer:
              "@type": "Answer"
              text: "แนะนำให้ตรวจซ้ำทุก 6 เดือน โดยเฉพาะหลังปรับเปลี่ยนไลฟ์สไตล์หรือได้รับการดูแลบางอย่าง เนื่องจาก epigenetics เปลี่ยนแปลงได้ต่อเนื่อง โดยเฉลี่ยใช้เวลาประมาณ 6 เดือนจึงเห็นความแตกต่างที่มีนัยสำคัญ"
      - "@type": "BreadcrumbList"
        itemListElement:
          - "@type": "ListItem"
            position: 1
            name: "หน้าแรก"
            item: "https://www.thrivewellnessth.com/"
          - "@type": "ListItem"
            position: 2
            name: "ตรวจ EpiSpan อายุชีวภาพ"
            item: "https://www.thrivewellnessth.com/epispan"
---

<div style="background:#ecfeff;border:1.5px solid #67e8f9;border-radius:12px;padding:24px 28px;margin:24px 0 40px;">
  <div style="font-weight:800;color:#0c4a6e;margin-bottom:14px;font-size:.9rem;letter-spacing:.05em;">📋 สรุปประเด็นสำคัญ (Key Takeaways)</div>
  <ul style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:10px;color:#0c4a6e;font-size:.9rem;line-height:1.75;">
    <li><strong>EpiSpan วัดอายุชีวภาพระดับเซลล์ (Biological Age)</strong> — ต่างจากอายุตามบัตรประชาชน ด้วยเทคโนโลยี Epigenetics ที่พัฒนาร่วมกับ Harvard, Yale และ Duke</li>
    <li><strong>ต่างจากการตรวจ DNA</strong> — DNA บอกพิมพ์เขียวที่ไม่เปลี่ยนแปลง ส่วน EpiSpan บอกว่าพิมพ์เขียวนั้นถูกใช้งานอย่างไรในวันนี้ ปรับเปลี่ยนได้ตามไลฟ์สไตล์</li>
    <li><strong>วัดอายุแยกราย 11 อวัยวะ</strong> — พร้อมอัตราการแก่โดยรวม (Pace of Aging) และไบโอมาร์กเกอร์กว่า 40 ตัวที่มาพร้อมคำแนะนำเชิงปฏิบัติ</li>
    <li><strong>ผลตรวจนำไปสู่การวางแผนชะลอวัยที่ตรงจุด</strong> — รู้ว่าอวัยวะไหนแก่เร็วกว่าอายุจริง ควรดูแลเป็นพิเศษเรื่องอะไร</li>
    <li><strong>แนะนำตรวจซ้ำทุก 6 เดือน</strong> — เพื่อติดตามผลหลังปรับไลฟ์สไตล์หรือรับการดูแลจาก Thrive</li>
  </ul>
</div>

<style>{`
  @media (max-width: 768px) {
    .two-col { grid-template-columns: 1fr !important; }
  }
`}</style>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;" class="two-col">
      <div>
        <p class="section-label" style="font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4f46e5;margin-bottom:0.5rem;">Epigenetics คืออะไร?</p>
        <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#111827;line-height:1.25;margin-bottom:1rem;">DNA ไม่เปลี่ยน แต่การใช้งาน DNA เปลี่ยนได้</h2>
        <p class="section-sub" style="font-size:1.05rem;color:#4b5563;max-width:640px;line-height:1.7;margin-bottom:1.5rem;">
          Epigenetics คือการศึกษาว่ายีนของคุณถูก "เปิด" หรือ "ปิด" การทำงานอย่างไร โดยที่ลำดับ DNA เองไม่ได้เปลี่ยนแปลง กลไกหลักมี 3 แบบ ได้แก่ <strong>DNA Methylation</strong> (การเติมหมู่เคมีเล็กๆ บน DNA เพื่อ "ปิด" ยีน), <strong>Histone Modification</strong> (การปรับแต่งโปรตีนที่ DNA พันรอบทำให้ DNA แน่นขึ้นหรือคลายตัว) และ <strong>Non-coding RNA</strong> (โมเลกุล RNA ที่ไม่ใช่รหัสโปรตีน แต่ควบคุมการแสดงออกของยีน)
        </p>
        <p class="section-sub" style="font-size:1.05rem;color:#4b5563;max-width:640px;line-height:1.7;">
          รูปแบบ methylation เหล่านี้เปลี่ยนแปลงไปตามอายุอย่างมีแบบแผน คาดเดาได้ในทางสถิติ นักวิทยาศาสตร์จึงใช้ข้อมูลนี้สร้าง "epigenetic clock" เพื่อคำนวณอายุชีวภาพของคุณ ซึ่งอาจต่างจากอายุตามบัตรประชาชนก็ได้ [1]
        </p>
      </div>
      <div style="background:#f9fafb;border-radius:20px;padding:2rem;">
        <p style="font-weight:700;color:#374151;margin-bottom:1.25rem;">อะไรบ้างที่ทำให้ epigenome เปลี่ยนแปลง?</p>
        <div style="display:grid;gap:0.6rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;background:#fff;border-radius:10px;">
            <span style="font-size:1.1rem;">💊</span>
            <span style="font-size:0.92rem;color:#374151;">ยาบางชนิดที่ใช้ต่อเนื่อง</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;background:#fff;border-radius:10px;">
            <span style="font-size:1.1rem;">🏭</span>
            <span style="font-size:0.92rem;color:#374151;">มลภาวะ ฝุ่น PM2.5 และสารพิษในสิ่งแวดล้อม</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;background:#fff;border-radius:10px;">
            <span style="font-size:1.1rem;">🥗</span>
            <span style="font-size:0.92rem;color:#374151;">อาหารและโภชนาการ</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;background:#fff;border-radius:10px;">
            <span style="font-size:1.1rem;">🏃</span>
            <span style="font-size:0.92rem;color:#374151;">การออกกำลังกายและการนอนหลับ</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;background:#fff;border-radius:10px;">
            <span style="font-size:1.1rem;">🚬</span>
            <span style="font-size:0.92rem;color:#374151;">การสูบบุหรี่และแอลกอฮอล์</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.75rem;background:#fff;border-radius:10px;">
            <span style="font-size:1.1rem;">😖</span>
            <span style="font-size:0.92rem;color:#374151;">ความเครียดเรื้อรัง</span>
          </div>
        </div>
        <p style="font-size:0.82rem;color:#6b7280;margin-top:1rem;line-height:1.6;">ข่าวดีคือ epigenome ไม่ได้ถูกกำหนดตายตัว การปรับไลฟ์สไตล์สามารถ "ปรับแต่ง" การทำงานของยีนได้จริง</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:#f9fafb;">
  <div class="container">
    <div style="text-align:center;margin-bottom:3rem;">
      <p class="section-label" style="font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4f46e5;margin-bottom:0.5rem;">อายุตามบัตร vs อายุเซลล์</p>
      <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#111827;line-height:1.25;margin-bottom:1rem;">อายุจริงบอกแค่ปีเกิด อายุชีวภาพบอกว่าเซลล์คุณแก่แค่ไหน</h2>
      <p class="section-sub" style="font-size:1.05rem;color:#4b5563;max-width:640px;margin:0 auto;">คนอายุเท่ากันสองคน อาจมีอายุชีวภาพต่างกันได้หลายปี ขึ้นอยู่กับไลฟ์สไตล์และการดูแลตัวเอง</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;" class="two-col">
      <div style="background:#fff;border-radius:16px;border:1.5px solid #bbf7d0;padding:1.75rem;">
        <p style="font-weight:700;color:#166534;margin-bottom:0.75rem;">🟢 ไลฟ์สไตล์กระตือรือร้น สมดุล</p>
        <p style="font-size:0.9rem;color:#4b5563;line-height:1.7;margin-bottom:0.75rem;">ออกกำลังกายสม่ำเสมอ กินอาหารสมดุล จัดการความเครียดได้ดี</p>
        <p style="font-size:0.85rem;font-weight:700;color:#166534;">ผลลัพธ์ที่มักพบ: อายุชีวภาพต่ำกว่าอายุจริง อัตราการแก่ช้าลง ความเสี่ยงโรคเรื้อรังต่ำกว่า</p>
      </div>
      <div style="background:#fff;border-radius:16px;border:1.5px solid #fecaca;padding:1.75rem;">
        <p style="font-weight:700;color:#991b1b;margin-bottom:0.75rem;">🔴 ไลฟ์สไตล์นั่งนิ่ง ไม่สมดุล</p>
        <p style="font-size:0.9rem;color:#4b5563;line-height:1.7;margin-bottom:0.75rem;">เคลื่อนไหวน้อย อาหารแปรรูปสูง ความเครียดสะสมเรื้อรัง</p>
        <p style="font-size:0.85rem;font-weight:700;color:#991b1b;">ผลลัพธ์ที่มักพบ: อายุชีวภาพสูงกว่าอายุจริง อัตราการแก่เร็วขึ้น ความเสี่ยงโรคเรื้อรังสูงกว่า</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="text-align:center;margin-bottom:3rem;">
      <p class="section-label" style="font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4f46e5;margin-bottom:0.5rem;">EpiSpan วัดอะไรบ้าง</p>
      <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#111827;line-height:1.25;margin-bottom:1rem;">5 มิติของอายุชีวภาพ ในการตรวจครั้งเดียว</h2>
      <p class="section-sub" style="font-size:1.05rem;color:#4b5563;max-width:640px;margin:0 auto;">แต่ละมิติพัฒนาโดยทีมวิจัยจากมหาวิทยาลัยชั้นนำ ผ่านการศึกษาในกลุ่มตัวอย่างหลักพันถึงหลักหมื่นคน</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">

      <div style="background:#fff;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,0.07);overflow:hidden;">
        <div style="background:#4f46e5;padding:1.5rem;color:#fff;">
          <div style="font-size:1.8rem;margin-bottom:0.5rem;">🧬</div>
          <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:0.3rem;">OMICm Age</h3>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.75);">อายุชีวภาพโดยรวม · พัฒนาร่วมกับ Harvard</p>
        </div>
        <div style="padding:1.5rem;">
          <p style="font-size:0.9rem;color:#4b5563;line-height:1.6;">คำนวณอายุชีวภาพจากรูปแบบ DNA methylation เทียบกับกลุ่มตัวอย่างเพศและช่วงอายุใกล้เคียงกัน บอกว่าเซลล์ของคุณ "แก่กว่า" หรือ "อ่อนกว่า" อายุจริงกี่ปี</p>
        </div>
      </div>

      <div style="background:#fff;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,0.07);overflow:hidden;border-top:4px solid #4f46e5;">
        <div style="background:linear-gradient(135deg,#312e81,#4338ca);padding:1.5rem;color:#fff;">
          <div style="font-size:1.8rem;margin-bottom:0.5rem;">🫀</div>
          <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:0.3rem;">SYMPHONY Age</h3>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.75);">อายุแยกราย 11 อวัยวะ · พัฒนาร่วมกับ Yale</p>
        </div>
        <div style="padding:1.5rem;">
          <p style="font-size:0.9rem;color:#4b5563;line-height:1.6;margin-bottom:1rem;">วิเคราะห์อายุของแต่ละระบบแยกกัน จากไบโอมาร์กเกอร์กว่า 130 ตัว ทำให้รู้ว่าอวัยวะไหนแก่เร็วกว่าอวัยวะอื่น</p>
          <div>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">เลือด</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">สมอง</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">หัวใจ</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">ตับ</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">ไต</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">ปอด</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">ฮอร์โมน</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">ระบบภูมิคุ้มกัน</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">การอักเสบ</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">เมตาบอลิซึม</span>
            <span style="display:inline-block;background:#eef2ff;color:#3730a3;font-size:0.72rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:999px;margin:0.15rem;">กล้ามเนื้อและกระดูก</span>
          </div>
        </div>
      </div>

      <div style="background:#fff;border-radius:20px;box-shadow:0 2px 16px rgba(0,0,0,0.07);overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e1b4b,#3730a3);padding:1.5rem;color:#fff;">
          <div style="font-size:1.8rem;margin-bottom:0.5rem;">⏱️</div>
          <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:0.3rem;">DunedinPACE</h3>
          <p style="font-size:0.85rem;color:rgba(255,255,255,0.75);">อัตราความเร็วในการแก่ · พัฒนาร่วมกับ Duke</p>
        </div>
        <div style="padding:1.5rem;">
          <p style="font-size:0.9rem;color:#4b5563;line-height:1.6;">บอกว่าในแต่ละปีที่ผ่านไป ร่างกายคุณ "แก่" เร็วหรือช้ากว่าอัตราปกติ (ค่า 1.0) เท่าไหร่ ยิ่งค่าต่ำกว่า 1.0 ยิ่งดี</p>
        </div>
      </div>

      <div style="background:#fff;border-radius:16px;border:1.5px solid #e5e7eb;padding:1.5rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
          <span style="font-size:1.5rem;">🧵</span>
          <h4 style="font-weight:700;color:#111827;">Telomere Length</h4>
        </div>
        <p style="font-size:0.88rem;color:#6b7280;line-height:1.6;">วัดความยาวของเทโลเมียร์ ปลายสายดีเอ็นเอที่สั้นลงตามอายุ เทโลเมียร์สั้นสัมพันธ์กับโรคเรื้อรังหลายชนิด</p>
      </div>

      <div style="background:#fff;border-radius:16px;border:1.5px solid #e5e7eb;padding:1.5rem;">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
          <span style="font-size:1.5rem;">🛡️</span>
          <h4 style="font-weight:700;color:#111827;">Immune Health & Inflammation</h4>
        </div>
        <p style="font-size:0.88rem;color:#6b7280;line-height:1.6;">วิเคราะห์สัดส่วนเซลล์ภูมิคุ้มกันและตัวชี้วัดการอักเสบ เช่น CRP, IL-6 ที่สัมพันธ์กับความเสี่ยงโรคเรื้อรัง</p>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:#f9fafb;">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;" class="two-col">
      <div>
        <p class="section-label" style="font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4f46e5;margin-bottom:0.5rem;">ทำไมต้องรู้อายุชีวภาพ</p>
        <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#111827;line-height:1.25;margin-bottom:1rem;">ความเสี่ยงโรคไม่ได้มาจากพันธุกรรมอย่างเดียว</h2>
        <p class="section-sub" style="font-size:1.05rem;color:#4b5563;max-width:640px;line-height:1.7;margin-bottom:1rem;">
          ความเสี่ยงต่อโรคเกิดจากสามปัจจัยรวมกัน คือ <strong>ความเสี่ยงทางพันธุกรรม</strong> (ปรับเปลี่ยนไม่ได้), <strong>อายุ</strong> (ปรับเปลี่ยนไม่ได้) และ <strong>สิ่งแวดล้อม/ไลฟ์สไตล์</strong> (ปรับเปลี่ยนได้) เมื่อสามปัจจัยนี้รวมกันเกินระดับหนึ่ง จึงนำไปสู่การเกิดโรค [2]
        </p>
        <p class="section-sub" style="font-size:1.05rem;color:#4b5563;max-width:640px;line-height:1.7;">
          งานวิจัยพบว่าการปรับเปลี่ยนไลฟ์สไตล์และมาตรการป้องกันที่เหมาะสม <strong>อาจช่วยลดความเสี่ยงต่อการเกิดโรคได้</strong> ในขณะที่การไม่ปรับเปลี่ยนอะไรเลยมีความสัมพันธ์กับความเสี่ยงที่เพิ่มขึ้นตามเวลา [2] EpiSpan ช่วยให้เห็นตัวเลขที่จับต้องได้ว่าไลฟ์สไตล์ปัจจุบันของคุณกำลังพาไปทางไหน
        </p>
      </div>
      <div style="background:#fff;border-radius:20px;padding:2rem;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
        <p style="font-weight:700;color:#374151;margin-bottom:1.25rem;">ผลตรวจ EpiSpan นำไปใช้อย่างไร?</p>
        <div style="display:grid;gap:0.75rem;">
          <div style="display:flex;gap:0.75rem;align-items:flex-start;">
            <span style="font-size:1.1rem;">1️⃣</span>
            <p style="font-size:0.9rem;color:#374151;">รู้ว่าอวัยวะไหนแก่เร็วกว่าอายุจริง ควรให้ความสำคัญเป็นพิเศษ</p>
          </div>
          <div style="display:flex;gap:0.75rem;align-items:flex-start;">
            <span style="font-size:1.1rem;">2️⃣</span>
            <p style="font-size:0.9rem;color:#374151;">แพทย์ใช้ผลตรวจออกแบบแผนดูแลสุขภาพเฉพาะบุคคล ทั้งอาหาร การนอน และการออกกำลังกาย</p>
          </div>
          <div style="display:flex;gap:0.75rem;align-items:flex-start;">
            <span style="font-size:1.1rem;">3️⃣</span>
            <p style="font-size:0.9rem;color:#374151;">ใช้เป็นตัวเลขตั้งต้นสำหรับวัดผลการรักษาอื่นๆ เช่น NAD+ Therapy หรือ HBOT เมื่อตรวจซ้ำในภายหลัง</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div style="text-align:center;margin-bottom:3rem;">
      <p class="section-label" style="font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4f46e5;margin-bottom:0.5rem;">ใครเหมาะที่จะตรวจ?</p>
      <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#111827;line-height:1.25;margin-bottom:1rem;">เหมาะกับทุกคนที่อยากรู้ตัวเลขจริง ไม่ใช่แค่ความรู้สึก</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;">
      <div style="background:#eef2ff;border:1.5px solid #e0e7ff;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.4rem;">🌿</span>
        <div>
          <p style="font-weight:700;color:#1e1b4b;font-size:0.95rem;">สายรักสุขภาพ / Anti-aging</p>
          <p style="font-size:0.82rem;color:#6b7280;">อยากรู้ว่าไลฟ์สไตล์ที่ทำอยู่ได้ผลจริงหรือไม่</p>
        </div>
      </div>
      <div style="background:#eef2ff;border:1.5px solid #e0e7ff;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.4rem;">👨‍👩‍👧</span>
        <div>
          <p style="font-weight:700;color:#1e1b4b;font-size:0.95rem;">มีประวัติครอบครัวเป็นโรคเรื้อรัง</p>
          <p style="font-size:0.82rem;color:#6b7280;">อยากรู้ว่าตัวเองมีสัญญาณอายุแก่เร็วกว่าปกติหรือยัง</p>
        </div>
      </div>
      <div style="background:#eef2ff;border:1.5px solid #e0e7ff;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.4rem;">⚡</span>
        <div>
          <p style="font-weight:700;color:#1e1b4b;font-size:0.95rem;">กำลังทำ NAD+ หรือ HBOT อยู่แล้ว</p>
          <p style="font-size:0.82rem;color:#6b7280;">อยากวัดผลลัพธ์การรักษาเป็นตัวเลขที่จับต้องได้</p>
        </div>
      </div>
      <div style="background:#eef2ff;border:1.5px solid #e0e7ff;border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.4rem;">📊</span>
        <div>
          <p style="font-weight:700;color:#1e1b4b;font-size:0.95rem;">Biohacker / Wellness Enthusiast</p>
          <p style="font-size:0.82rem;color:#6b7280;">ต้องการข้อมูลเชิงลึกเพื่อดูแลสุขภาพแบบ data-driven</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section" style="background:#f9fafb;">
  <div class="container">
    <div style="text-align:center;margin-bottom:3rem;">
      <p class="section-label" style="font-size:0.75rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4f46e5;margin-bottom:0.5rem;">ขั้นตอนการตรวจ</p>
      <h2 class="section-title" style="font-size:clamp(1.6rem,3vw,2.4rem);font-weight:800;color:#111827;line-height:1.25;margin-bottom:1rem;">4 ขั้นตอน จากตัวอย่างเลือดสู่แผนชะลอวัย</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;">
      <div style="background:#fff;border-radius:16px;padding:1.75rem;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <div style="width:48px;height:48px;background:#4f46e5;color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:900;margin-bottom:1rem;">1</div>
        <h3 style="font-weight:700;color:#111827;margin-bottom:0.5rem;">ปรึกษาแพทย์</h3>
        <p style="font-size:0.9rem;color:#6b7280;line-height:1.6;">แพทย์พูดคุยเรื่องเป้าหมายสุขภาพ ประวัติการรักษา และเช็คว่ามีข้อควรระวัง เช่น เพิ่งได้รับเลือดหรือ Stem Cell หรือไม่</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:1.75rem;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <div style="width:48px;height:48px;background:#4f46e5;color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:900;margin-bottom:1rem;">2</div>
        <h3 style="font-weight:700;color:#111827;margin-bottom:0.5rem;">เก็บตัวอย่างเลือด</h3>
        <p style="font-size:0.9rem;color:#6b7280;line-height:1.6;">เจ้าหน้าที่เก็บตัวอย่างเลือดตามมาตรฐานคลินิก [ทีมงานจะยืนยันรายละเอียดขั้นตอนก่อนเผยแพร่จริง]</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:1.75rem;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <div style="width:48px;height:48px;background:#4f46e5;color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:900;margin-bottom:1rem;">3</div>
        <h3 style="font-weight:700;color:#111827;margin-bottom:0.5rem;">วิเคราะห์ในห้องแล็บ</h3>
        <p style="font-size:0.9rem;color:#6b7280;line-height:1.6;">ส่งวิเคราะห์รูปแบบ DNA methylation ในห้องปฏิบัติการพันธมิตร [ทีมงานจะยืนยันระยะเวลารอผลก่อนเผยแพร่จริง]</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:1.75rem;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
        <div style="width:48px;height:48px;background:#4f46e5;color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:900;margin-bottom:1rem;">4</div>
        <h3 style="font-weight:700;color:#111827;margin-bottom:0.5rem;">แพทย์แปลผลและวางแผน</h3>
        <p style="font-size:0.9rem;color:#6b7280;line-height:1.6;">รับรายงานอายุชีวภาพแบบละเอียด พร้อมนัดพบแพทย์เพื่ออธิบายผลและออกแบบแผนชะลอวัยเฉพาะบุคคล</p>
      </div>
    </div>
  </div>
</section>

<section style="background:#eef2ff;padding:3.5rem 1.5rem;text-align:center;">
  <div class="container">
    <h2 style="font-size:1.8rem;font-weight:800;color:#1e1b4b;margin-bottom:0.75rem;">อยากรู้ไหมว่าเซลล์คุณอายุเท่าไหร่จริงๆ?</h2>
    <p style="color:#6b7280;margin-bottom:1.75rem;max-width:500px;margin-left:auto;margin-right:auto;">ตรวจ EpiSpan ที่ Thrive Wellness Clinic สอบถามราคาและรายละเอียดได้กับทีมงาน</p>
    <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
      <a href="tel:+66959349640" style="background:#4f46e5;color:#fff;padding:0.85rem 2rem;border-radius:9999px;font-weight:700;font-size:1rem;display:inline-block;text-decoration:none;">โทรสอบถามราคา</a>
      <a href="https://line.me/R/ti/p/@thrivewellnessth" target="_blank" rel="noopener" style="background:#16a34a;color:#fff;padding:0.85rem 2rem;border-radius:9999px;font-weight:700;text-decoration:none;">LINE สอบถามราคา</a>
    </div>
  </div>
</section>

<section style="background:#f9fafb;padding:3rem 1.5rem;">
  <div class="container" style="max-width:780px;">
    <p style="font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9ca3af;margin-bottom:1rem;">อ้างอิงทางวิทยาศาสตร์</p>
    <ul style="list-style:none;padding:0;">
      <li style="padding:0.6rem 0;border-bottom:1px solid #f3f4f6;font-size:0.85rem;color:#6b7280;">[1] Li Piani L, Vaccarezza M, Chirumbolo S, et al. "Epigenetic clocks and biological age: a review of DNA methylation-based aging estimators." Front Cell Dev Biol. 2023.</li>
      <li style="padding:0.6rem 0;border-bottom:1px solid #f3f4f6;font-size:0.85rem;color:#6b7280;">[2] Hall A, et al. "Gene-environment interactions and disease risk over the life course." Int J Mol Sci. 2020.</li>
      <li style="padding:0.6rem 0;border-bottom:1px solid #f3f4f6;font-size:0.85rem;color:#6b7280;">[3] TruDiagnostic Clinical Methodology Report — OMICm Age, SYMPHONY Age, and DunedinPACE panel documentation, developed in collaboration with Harvard, Yale, and Duke University research teams.</li>
      <li style="padding:0.6rem 0;border-bottom:none;font-size:0.85rem;color:#6b7280;">[4] Horvath S. "DNA methylation age of human tissues and cell types." Genome Biol. 2013;14(10):R115.</li>
    </ul>
    <p style="font-size:0.78rem;color:#9ca3af;margin-top:1rem;line-height:1.6;">หมายเหตุ: บทความนี้อยู่ระหว่างเพิ่มแหล่งอ้างอิงจากสถาบันวิชาการในไทยให้ครบตามมาตรฐานเนื้อหาของ Thrive ก่อนเผยแพร่จริง</p>
  </div>
</section>
````

- [ ] **Step 2: Run astro check to validate frontmatter against the Zod schema**

```bash
cd astro && npx astro check
```

Expected: `0 errors` (this is the acceptance test for this task — the Zod schema in `content.config.ts` will reject the file if any required frontmatter field is missing, mistyped, or if `seo.description` exceeds 180 characters)

- [ ] **Step 3: Commit**

```bash
git add astro/src/content/services/epispan.mdx
git commit -m "feat(content): add EpiSpan epigenetic/biological age test content entry"
```

---

## Task 2: Create the page wrapper at `/epispan`

**Files:**
- Create: `astro/src/pages/epispan.astro`

**Interfaces:**
- Consumes: content entry produced by Task 1 (`getEntry('services', 'epispan')` → `entry.data.{seo,hero,doctor,faqs,cta,relatedServices,jsonLd}`), and existing components: `BaseLayout`, `Header`, `Footer`, `SEO`, `Breadcrumbs`, `ServiceHero`, `FAQSection`, `DoctorAttribution`, `CTASection`, `LeadForm`, `ServiceCard` (all already exist in `astro/src/components/`, prop shapes confirmed by reading each component's `Props` interface)
- Produces: publicly routable page at `/epispan`

- [ ] **Step 1: Write the page wrapper**

Create `astro/src/pages/epispan.astro` with this exact content:

```astro
---
import { getEntry, render } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SEO from '../components/SEO.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
import ServiceHero from '../components/ServiceHero.astro';
import FAQSection from '../components/FAQSection.astro';
import DoctorAttribution from '../components/DoctorAttribution.astro';
import CTASection from '../components/CTASection.astro';
import LeadForm from '../components/LeadForm.astro';
import ServiceCard from '../components/ServiceCard.astro';

const entry = await getEntry('services', 'epispan');
if (!entry) throw new Error('Missing epispan content entry');
const { Content } = await render(entry);
const d = entry.data;

const crumbs = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'ตรวจสุขภาพเชิงลึก', href: '/check-up' },
  { label: 'ตรวจ EpiSpan', href: '/epispan' },
];
---

<BaseLayout>
  <SEO slot="head" {...d.seo} heroImage={d.hero.image} jsonLd={d.jsonLd} />
  <Header />
  <Breadcrumbs crumbs={crumbs} />
  <ServiceHero {...d.hero} />
  <main class="service-page">
    <article class="service-content"><Content /></article>
    <FAQSection items={d.faqs} />
    <DoctorAttribution doctor={d.doctor} />
    <section class="section related-services">
      <div class="section-container">
        <div class="section-title-center">
          <span class="section-label">Related Services</span>
          <h2 class="section-title">บริการที่เกี่ยวข้อง</h2>
        </div>
        <div class="related-services__grid">{d.relatedServices.map((service) => <ServiceCard {...service} />)}</div>
      </div>
    </section>
    <CTASection {...d.cta} />
    <LeadForm serviceSlug="epispan" formTitle="นัดตรวจ EpiSpan" />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Run the type checker**

```bash
cd astro && npx astro check
```

Expected: `0 errors`

- [ ] **Step 3: Run the production build**

```bash
cd astro && npm run build
```

Expected: build completes with no errors, and `astro/dist/epispan/index.html` exists

- [ ] **Step 4: Verify the built page contains the expected content**

```bash
grep -o "อายุตามบัตรประชาชน กับ อายุเซลล์จริง" astro/dist/epispan/index.html
grep -c "MedicalTest" astro/dist/epispan/index.html
grep -o "คำถามที่พบบ่อย" astro/dist/epispan/index.html
```

Expected: first command echoes the headline, second command returns a count ≥ 1 (JSON-LD present), third echoes the FAQ section heading

- [ ] **Step 5: Commit**

```bash
git add astro/src/pages/epispan.astro
git commit -m "feat(pages): add /epispan page wrapper"
```

---

## Task 3: Update SITE-TRACKER.md doctor table

**Files:**
- Modify: `SITE-TRACKER.md`

**Interfaces:**
- Consumes: existing "Doctor on File" markdown table in `SITE-TRACKER.md` (rows are `| filename | date |`)
- Produces: nothing consumed by later tasks — this is a documentation bookkeeping requirement stated explicitly in `SITE-TRACKER.md` itself ("ทุกครั้งที่สร้างหรืออัปเดตหน้าที่มีโปรไฟล์หมอนุ่น ต้องอัปเดตตารางนี้ทันที ก่อน commit")

- [ ] **Step 1: Add the new row**

Find this line in `SITE-TRACKER.md`:

```
| `fit132.mdx` (Astro service page) | 2026-06-09 |
```

Replace it with:

```
| `fit132.mdx` (Astro service page) | 2026-06-09 |
| `epispan.mdx` (Astro service page) | 2026-07-02 |
```

- [ ] **Step 2: Verify the row was added**

```bash
grep "epispan.mdx" SITE-TRACKER.md
```

Expected: `| \`epispan.mdx\` (Astro service page) | 2026-07-02 |`

- [ ] **Step 3: Commit**

```bash
git add SITE-TRACKER.md
git commit -m "docs: log epispan.mdx in doctor-on-file tracker"
```

---

## Task 4: Add EpiSpan to the Tier A CTA map in thrive-content-writer skill

**Files:**
- Modify: `.claude/skills/thrive-content-writer/SKILL.md`

**Interfaces:**
- Consumes: existing "Tier A service page map" markdown table in that file
- Produces: routing information future blog-writing sessions will read to pick the correct CTA link for epigenetic/biological-age topics

- [ ] **Step 1: Add the new row**

Find this line in `.claude/skills/thrive-content-writer/SKILL.md`:

```
| DNA test, genetic test, gene, genome, MTHFR, genetic risk | `/dna-test` | "Explore DNA testing at Thrive →" |
```

Replace it with:

```
| DNA test, genetic test, gene, genome, MTHFR, genetic risk | `/dna-test` | "Explore DNA testing at Thrive →" |
| epigenetic test, biological age, epigenetic clock, aging test, methylation, longevity test, DunedinPACE | `/epispan` | "Explore EpiSpan biological age testing at Thrive →" |
```

- [ ] **Step 2: Verify the row was added**

```bash
grep "epispan" .claude/skills/thrive-content-writer/SKILL.md
```

Expected: the new table row is echoed back

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/thrive-content-writer/SKILL.md
git commit -m "docs: route epigenetic/biological-age topics to /epispan in content-writer skill"
```

---

## Task 5: Manual browser verification

- [ ] **Step 1: Start the dev server**

```bash
cd astro && npm run dev
```

Open: `http://localhost:4321/epispan`

- [ ] **Step 2: Check hero section**
  - Headline "อายุตามบัตรประชาชน กับ อายุเซลล์จริง ต่างกันแค่ไหน?" renders
  - 4 stat tiles render (11 / Harvard·Yale·Duke / 40+ / 1)
  - Primary button (`tel:+66959349640`) and secondary button (LINE) both render and are clickable

- [ ] **Step 3: Check body content**
  - Key Takeaways box renders at the top (cyan background)
  - "EpiSpan วัดอะไรบ้าง" card grid shows all 5 cards (OMICm Age, SYMPHONY Age, DunedinPACE, Telomere Length, Immune Health & Inflammation)
  - SYMPHONY Age card lists all 11 organ tags

- [ ] **Step 4: Check FAQ section**
  - 5 FAQ items render as collapsible `<details>` elements
  - Clicking each one expands to show the answer

- [ ] **Step 5: Check doctor attribution**
  - พญ. ชนากานต์ ตระหง่านศรี photo and bio render
  - Specializations tags render, including "Anti-aging & Regenerative Medicine"

- [ ] **Step 6: Check related services**
  - 3 cards render: DNA test, NAD+ Therapy, Check-up — each links to the correct existing page (`/dna-test`, `/nad`, `/check-up`)

- [ ] **Step 7: Check bottom CTA and lead form**
  - CTA section renders with "อยากรู้ไหมว่าเซลล์คุณอายุเท่าไหร่จริงๆ?"
  - Lead form renders below it with hidden `service_interest` field set to `epispan`

- [ ] **Step 8: Check mobile layout (resize to 375px)**
  - Two-column sections (`.two-col`) collapse to single column
  - Card grids reflow to single column, no horizontal overflow

- [ ] **Step 9: Final commit if any tweaks made**

```bash
git add -p
git commit -m "fix: visual tweaks from manual browser test on /epispan"
```

---

## Post-implementation open items (do not block this plan, but must resolve before production publish)

- [ ] Confirm EpiSpan pricing with clinic — currently CTA-only, no price shown
- [ ] Confirm sample collection method and lab turnaround time with clinic/GENFOSIS, then remove the `[ทีมงานจะยืนยัน...]` bracketed notes in Task 1's testing-process section
- [ ] Commission and add real hero photo at `astro/public/epispan-hero-1200x630.jpg` (lifestyle/editorial style, not clinical) — page will build and render correctly without it, but the image will 404 until added
- [ ] Add ≥1 Thai-institution citation to the References section to satisfy the thrive-content-writer skill's 5-source/1-Thai-source minimum (currently 4 sources, 0 Thai-specific)
- [ ] Confirm "GENFOSIS" is the correct official distributor/company name before it appears in any published external-facing copy (it does not currently appear in the MDX body — flagged here in case future revisions add it)
