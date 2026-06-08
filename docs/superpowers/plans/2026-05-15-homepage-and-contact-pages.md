# Homepage & Contact Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full homepage (`/`) and contact page (`/contact`) in Astro, plus fix the `form_submit` → `lead_submit` GTM event name in LeadForm.astro.

**Architecture:** All three files are standalone Astro pages/components — no new abstractions needed. Homepage uses the explore-then-convert layout (Hero → Services → Doctor → Testimonials → LeadForm → FAQ → Footer). Contact uses channels-first layout (LINE/Phone/Walkin big cards → Info bar → LeadForm → Transport). New CSS classes are appended to `astro/src/styles/global.css`.

**Tech Stack:** Astro 6, existing components (LeadForm, DoctorAttribution, FAQSection, CTASection, SEO, Header, Footer, Breadcrumbs), CSS custom properties from `global.css`.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `astro/src/components/LeadForm.astro` | Rename `form_submit` → `lead_submit` in dataLayer push |
| Modify | `astro/src/styles/global.css` | Add CSS for service-featured-card, services-grid, service-chip, testimonials-grid, testimonial-card, contact-channels, contact-channel |
| Modify | `astro/src/pages/index.astro` | Full rebuild with all homepage sections |
| Modify | `astro/src/pages/contact.astro` | Rebuild with channels-first layout |

---

## Task 1: Fix GTM event name in LeadForm

**Files:**
- Modify: `astro/src/components/LeadForm.astro`

- [ ] **Step 1.1: Edit the dataLayer push in the submit handler**

In `astro/src/components/LeadForm.astro`, find the submit success block (around line 201) and change:

```typescript
// BEFORE
dataLayerWindow.dataLayer.push({
  event: 'form_submit',
  service: serviceSlug,
  page_path: window.location.pathname,
});
```

```typescript
// AFTER
dataLayerWindow.dataLayer.push({
  event: 'lead_submit',
  service: serviceSlug,
  page_path: window.location.pathname,
});
```

- [ ] **Step 1.2: Verify no other occurrences of `form_submit` remain**

```bash
grep -n "form_submit" /Users/temtem/projects/thrive-website/thrive-website/astro/src/components/LeadForm.astro
```

Expected: no output (zero matches).

- [ ] **Step 1.3: Commit**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git add astro/src/components/LeadForm.astro
git commit -m "fix: rename GTM event form_submit to lead_submit per master_plan canonical names"
```

---

## Task 2: Add CSS for homepage components

**Files:**
- Modify: `astro/src/styles/global.css` (append at end, before the final `@media` block)

- [ ] **Step 2.1: Append homepage component CSS to global.css**

Add the following block immediately before the final `@media (max-width: 900px)` block at the end of `astro/src/styles/global.css`:

```css
/* ─── Homepage: Services Section ─────────────────────────────────── */

.service-featured-card {
  display: flex;
  align-items: center;
  gap: var(--sp-5);
  background: var(--white);
  border: 2px solid var(--teal-l);
  border-radius: var(--r-xl);
  padding: var(--sp-6) var(--sp-7);
  margin-bottom: var(--sp-5);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease);
}

.service-featured-card:hover {
  border-color: var(--teal);
  box-shadow: var(--sh-md);
}

.service-featured-card__icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.service-featured-card__label {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--teal);
  margin-bottom: var(--sp-1);
}

.service-featured-card__content {
  flex: 1;
}

.service-featured-card__content h3 {
  font-size: var(--text-xl);
  color: var(--navy);
  margin-bottom: var(--sp-2);
}

.service-featured-card__content p {
  font-size: var(--text-sm);
  color: var(--text-2);
  margin: 0;
}

.service-featured-card__cta {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--teal);
  white-space: nowrap;
  flex-shrink: 0;
}

.services-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
}

.service-chip {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  background: var(--white);
  border: 1.5px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-3) var(--sp-4);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--navy);
  transition: border-color var(--dur-base) var(--ease), background var(--dur-base) var(--ease);
}

.service-chip:hover {
  border-color: var(--teal);
  background: var(--teal-xl);
  color: var(--teal-d);
}

.service-chip--more {
  border-style: dashed;
  color: var(--teal);
  border-color: var(--teal);
  background: var(--teal-xl);
}

/* ─── Homepage: Testimonials ──────────────────────────────────────── */

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-5);
}

.testimonial-card {
  background: var(--white);
  border-radius: var(--r-xl);
  padding: var(--sp-6);
  box-shadow: var(--sh-sm);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.testimonial-card__stars {
  color: #f59e0b;
  font-size: var(--text-base);
  letter-spacing: 0.1em;
}

.testimonial-card__quote {
  font-size: var(--text-sm);
  color: var(--text-2);
  line-height: 1.8;
  flex: 1;
  margin: 0;
}

.testimonial-card__author {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--teal);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ─── Contact Page: Channels Block ───────────────────────────────── */

.contact-channels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-5);
  max-width: 760px;
  margin: 0 auto;
}

.contact-channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-7) var(--sp-5);
  border-radius: var(--r-xl);
  text-decoration: none;
  color: var(--white);
  font-weight: 700;
  text-align: center;
  transition: opacity var(--dur-base) var(--ease), transform var(--dur-base) var(--ease);
}

.contact-channel:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.contact-channel--line   { background: #06c755; }
.contact-channel--phone  { background: var(--teal-d); }
.contact-channel--walkin { background: #b45309; }

.contact-channel__icon {
  font-size: 2rem;
}

.contact-channel__name {
  font-size: var(--text-lg);
}

.contact-channel__detail {
  font-size: var(--text-sm);
  opacity: 0.9;
  font-weight: 400;
}
```

- [ ] **Step 2.2: Verify no syntax errors by running the build**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website/astro && npm run build 2>&1 | tail -20
```

Expected: build completes without CSS errors (exit 0).

- [ ] **Step 2.3: Commit**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git add astro/src/styles/global.css
git commit -m "style: add CSS for homepage services, testimonials, and contact channels"
```

---

## Task 3: Build the homepage

**Files:**
- Modify: `astro/src/pages/index.astro`

- [ ] **Step 3.1: Replace index.astro with the full homepage**

Replace the entire contents of `astro/src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SEO from '../components/SEO.astro';
import LeadForm from '../components/LeadForm.astro';
import DoctorAttribution from '../components/DoctorAttribution.astro';
import FAQSection from '../components/FAQSection.astro';
import CTASection from '../components/CTASection.astro';

const DR_NOON = {
  name: 'พญ. ชนากานต์ ตระหง่านศรี (หมอนุ่น)',
  title: 'Chanakan Trangansri, MD. — Anti-aging & Regenerative Medicine',
  image: '/image/dr-chanakan-trangansri-thrive-400x400.jpg',
  imageAlt: 'พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์ Anti-aging Thrive Wellness Center Bangkok',
  bio: 'ผู้เชี่ยวชาญด้าน Functional Medicine และ Anti-aging ดูแลสุขภาพเชิงลึกโดยหาต้นเหตุ ไม่ใช่แค่รักษาอาการ เชี่ยวชาญด้านฮอร์โมน ภูมิแพ้ และการฟื้นฟูระดับเซลล์',
  specializations: [
    'Anti-aging & Regenerative Medicine',
    'Nutrition Wellness',
    'Lifestyle Medicine',
    'Hormone Balance',
    'Chelation & Detoxification',
  ],
};

const FAQ_ITEMS = [
  {
    q: 'ต้องนัดล่วงหน้าไหม?',
    a: 'แนะนำให้นัดล่วงหน้าเพื่อความสะดวก สามารถนัดผ่าน LINE @thrivewellnessth หรือโทร 095-934-9640 ทีมงานจะยืนยันเวลานัดที่เหมาะสมกับคุณ',
  },
  {
    q: 'Thrive ต่างจากคลินิกทั่วไปอย่างไร?',
    a: 'เราใช้แนวทาง Functional Medicine — ตรวจเจาะลึกหาต้นเหตุของอาการ ไม่ใช่แค่รักษาตามอาการ ทุกแผนการดูแลออกแบบเฉพาะบุคคลตามผลตรวจและเป้าหมายสุขภาพของแต่ละคน',
  },
  {
    q: 'ราคาโดยประมาณเป็นอย่างไร?',
    a: 'ราคาขึ้นอยู่กับโปรแกรมที่เลือก ตั้งแต่การตรวจวิเคราะห์ไปจนถึงการดูแลแบบครบวงจร ทีมงานจะแนะนำโปรแกรมที่เหมาะสมและแจ้งราคาในการปรึกษาครั้งแรก ซึ่งฟรีไม่มีค่าใช้จ่าย',
  },
  {
    q: 'ผลตรวจออกเร็วแค่ไหน?',
    a: 'ผลตรวจเลือดพื้นฐานได้ภายในวันเดียวกัน สำหรับการตรวจเฉพาะทาง เช่น Food Intolerance IgG หรือ DNA Test จะใช้เวลา 7–14 วันทำการขึ้นอยู่กับ lab',
  },
  {
    q: 'มีบริการสำหรับชาวต่างชาติไหม?',
    a: 'มีครับ/ค่ะ ทีมงานสื่อสารภาษาอังกฤษได้ บริการทั้งหมดรองรับผู้ป่วยชาวต่างชาติ รวมถึงเอกสารและผลตรวจที่แสดงผลเป็นภาษาอังกฤษ',
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.thrivewellnessth.com/#website',
        url: 'https://www.thrivewellnessth.com',
        name: 'Thrive Wellness Center',
        inLanguage: ['th', 'en'],
      },
      {
        '@type': 'MedicalClinic',
        '@id': 'https://www.thrivewellnessth.com/#clinic',
        name: 'Thrive Wellness Center',
        alternateName: 'ไธรฟ์ เวลเนส เซ็นเตอร์',
        url: 'https://www.thrivewellnessth.com',
        telephone: '+66959349640',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '199 ถนนประดิษฐ์มนูธรรม ชั้น 2 อาคาร B เดอะ คริสตัล พาร์ค',
          addressLocality: 'ลาดพร้าว',
          addressRegion: 'กรุงเทพมหานคร',
          postalCode: '10230',
          addressCountry: 'TH',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '10:00',
          closes: '19:00',
        },
        medicalSpecialty: ['Anti-aging Medicine', 'Functional Medicine', 'Regenerative Medicine'],
        sameAs: [
          'https://www.facebook.com/thrivewellnessth',
          'https://www.instagram.com/thrivewellnessth',
          'https://line.me/R/ti/p/@thrivewellnessth',
        ],
      },
      {
        '@type': 'Person',
        '@id': 'https://www.thrivewellnessth.com/#dr-chanakan',
        name: 'พญ. ชนากานต์ ตระหง่านศรี',
        alternateName: 'Dr. Chanakan Trangansri',
        jobTitle: 'Anti-aging & Regenerative Medicine Physician',
        worksFor: { '@id': 'https://www.thrivewellnessth.com/#clinic' },
        knowsAbout: ['Functional Medicine', 'Anti-aging Medicine', 'Hormone Therapy', 'IV Nutrition', 'Food Intolerance Testing'],
      },
    ],
  },
];
---

<BaseLayout>
  <SEO
    slot="head"
    seoTitle="Thrive Wellness Center Bangkok — ดูแลสุขภาพแบบองค์รวมในระดับเซลล์"
    description="คลินิก Functional Medicine กรุงเทพฯ — ตรวจภูมิแพ้อาหารแฝง, Adrenal Fatigue, IV Drip, HBOT, ฮอร์โมน ดูแลโดยแพทย์เฉพาะทาง Anti-aging เปิดทุกวัน 10:00–19:00"
    canonicalPath="/"
    ogImage="/og-image.jpg"
    noIndex={false}
    jsonLd={jsonLd}
  />
  <Header />

  <!-- ── Hero ──────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="container">
      <div class="hero__inner">
        <div>
          <h1 class="hero__title">เหนื่อยไม่หาย<br>ไม่ใช่เรื่องปกติ</h1>
          <p class="hero__subtitle">
            ภูมิแพ้แฝง · ฮอร์โมนแปรปรวน · Adrenal Fatigue<br>
            หาสาเหตุจริงๆ แทนแค่รักษาอาการ
          </p>
          <div class="hero__actions">
            <a
              href="#lead-form"
              class="btn btn-primary"
              data-gtm-event="cta_click"
              data-gtm-label="hero-นัดปรึกษาฟรี"
            >นัดปรึกษาฟรี →</a>
            <a
              href="#services"
              class="btn btn-secondary"
              data-gtm-event="cta_click"
              data-gtm-label="hero-ดูบริการทั้งหมด"
            >ดูบริการทั้งหมด</a>
          </div>
          <div class="hero__stats">
            <div>
              <div class="hero__stat-number">7+</div>
              <div class="hero__stat-label">ปีดูแลสุขภาพเชิงลึก</div>
            </div>
            <div>
              <div class="hero__stat-number">5,000+</div>
              <div class="hero__stat-label">คนที่ไว้ใจให้เราดูแล</div>
            </div>
            <div>
              <div class="hero__stat-number">20+</div>
              <div class="hero__stat-label">โปรแกรมเฉพาะบุคคล</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Services ──────────────────────────────────────────────── -->
  <section class="section section--white" id="services">
    <div class="section-container">
      <div class="section-title-center">
        <span class="section-label">บริการ</span>
        <h2 class="section-title">เลือกโปรแกรมที่ตรงกับคุณ</h2>
      </div>

      <a
        href="/food-intolerance"
        class="service-featured-card"
        data-gtm-event="service_click"
        data-gtm-label="food-intolerance"
      >
        <div class="service-featured-card__icon">🔬</div>
        <div class="service-featured-card__content">
          <div class="service-featured-card__label">อันดับ 1 ที่ลูกค้าถามถึง</div>
          <h3>ตรวจภูมิแพ้อาหารแฝง IgG</h3>
          <p>ท้องอืด ผิวลาย เหนื่อยตลอด? อาจเกิดจากอาหารที่กินทุกวัน ตรวจพบ 216 ชนิด ผลชัด รู้สาเหตุจริง</p>
        </div>
        <span class="service-featured-card__cta">ดูเพิ่มเติม →</span>
      </a>

      <div class="services-grid">
        <a href="/adrenal-fatigue" class="service-chip" data-gtm-event="service_click" data-gtm-label="adrenal-fatigue">
          <span>💊</span>Adrenal Fatigue
        </a>
        <a href="/hormones-quiz" class="service-chip" data-gtm-event="service_click" data-gtm-label="hormones-quiz">
          <span>🧬</span>ตรวจฮอร์โมน
        </a>
        <a href="/hbot" class="service-chip" data-gtm-event="service_click" data-gtm-label="hbot">
          <span>🫧</span>HBOT
        </a>
        <a href="/iv-drip" class="service-chip" data-gtm-event="service_click" data-gtm-label="iv-drip">
          <span>💉</span>IV Drip
        </a>
        <a href="/gluta" class="service-chip" data-gtm-event="service_click" data-gtm-label="gluta">
          <span>✨</span>Glutathione IV
        </a>
        <a href="/about" class="service-chip service-chip--more" data-gtm-event="service_click" data-gtm-label="see-all-services">
          <span>+</span>ดูทั้งหมด 14+ บริการ
        </a>
      </div>
    </div>
  </section>

  <!-- ── Doctor trust ───────────────────────────────────────────── -->
  <DoctorAttribution doctor={DR_NOON} />

  <!-- ── Testimonials ──────────────────────────────────────────── -->
  <section class="section section--light">
    <div class="section-container">
      <div class="section-title-center">
        <span class="section-label">รีวิว</span>
        <h2 class="section-title">เสียงจากผู้ที่ไว้ใจ Thrive</h2>
      </div>
      <!-- TODO: replace with real testimonials from Sanity when Phase 5 content is available -->
      <div class="testimonials-grid">
        <div class="testimonial-card">
          <div class="testimonial-card__stars">★★★★★</div>
          <p class="testimonial-card__quote">"ตรวจภูมิแพ้อาหารแฝงแล้วพบว่าแพ้นม ไข่ และกลูเตน หลังงด 3 เดือนท้องอืดหายไปเลย ผิวดีขึ้นมาก หมอนุ่นอธิบายผลตรวจละเอียดมากค่ะ"</p>
          <div class="testimonial-card__author">ณัฐ. · ตรวจภูมิแพ้อาหารแฝง IgG</div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-card__stars">★★★★★</div>
          <p class="testimonial-card__quote">"มาทำ IV Drip และตรวจ Adrenal Fatigue หลังจากเหนื่อยมา 2 ปีแล้วไม่รู้สาเหตุ หมอหาต้นเหตุเจอและวางแผนดูแลชัดเจน พลังงานดีขึ้นมากหลัง 6 สัปดาห์"</p>
          <div class="testimonial-card__author">วิ. · IV Drip + Adrenal Fatigue</div>
        </div>
        <div class="testimonial-card">
          <div class="testimonial-card__stars">★★★★★</div>
          <p class="testimonial-card__quote">"ตรวจฮอร์โมนและได้วิตามินแบบ personalized ค่ะ รู้สึกว่าร่างกายได้รับสิ่งที่ขาดไปจริงๆ ไม่ใช่แค่กินวิตามินรวมไปงั้น ประทับใจมากที่สุดคือการ follow up"</p>
          <div class="testimonial-card__author">ป. · Hormone Check + Personalized Vitamins</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Lead form ──────────────────────────────────────────────── -->
  <LeadForm serviceSlug="homepage" formTitle="นัดปรึกษาแพทย์ฟรี" />

  <!-- ── FAQ ───────────────────────────────────────────────────── -->
  <FAQSection items={FAQ_ITEMS} />

  <!-- ── Final CTA ─────────────────────────────────────────────── -->
  <CTASection
    headline="พร้อมเริ่มดูแลสุขภาพในระดับที่ลึกกว่า?"
    subline="ปรึกษาหมอนุ่นฟรี ทีมงานช่วยเลือกโปรแกรมที่เหมาะกับเป้าหมายสุขภาพของคุณ"
    primaryBtn={{ label: 'นัดปรึกษาฟรี', href: '#lead-form' }}
    secondaryBtn={{ label: 'LINE @thrivewellnessth', href: 'https://line.me/R/ti/p/@thrivewellnessth' }}
  />

  <Footer />
</BaseLayout>
```

- [ ] **Step 3.2: Type-check**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website/astro && npx astro check 2>&1 | tail -20
```

Expected: `0 errors, 0 warnings` (or only pre-existing warnings unrelated to index.astro).

- [ ] **Step 3.3: Build check**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website/astro && npm run build 2>&1 | tail -20
```

Expected: build completes without errors.

- [ ] **Step 3.4: Commit**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git add astro/src/pages/index.astro
git commit -m "feat: build homepage with hero, services, doctor trust, testimonials, and lead form"
```

---

## Task 4: Build the contact page

**Files:**
- Modify: `astro/src/pages/contact.astro`

- [ ] **Step 4.1: Replace contact.astro with the channels-first layout**

Replace the entire contents of `astro/src/pages/contact.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import SEO from '../components/SEO.astro';
import Breadcrumbs from '../components/Breadcrumbs.astro';
import LeadForm from '../components/LeadForm.astro';
import CTASection from '../components/CTASection.astro';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalClinic',
        '@id': 'https://www.thrivewellnessth.com/#clinic',
        name: 'Thrive Wellness Center',
        telephone: '+66959349640',
        email: 'info@thrivewellnessth.com',
        url: 'https://www.thrivewellnessth.com',
        image: 'https://www.thrivewellnessth.com/og-image.jpg',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '199 ถนนประดิษฐ์มนูธรรม ชั้น 2 อาคาร B เดอะ คริสตัล พาร์ค',
          addressLocality: 'ลาดพร้าว',
          addressRegion: 'กรุงเทพมหานคร',
          postalCode: '10230',
          addressCountry: 'TH',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '10:00',
          closes: '19:00',
        },
        sameAs: [
          'https://www.facebook.com/thrivewellnessth',
          'https://www.instagram.com/thrivewellnessth',
          'https://line.me/R/ti/p/@thrivewellnessth',
        ],
      },
      {
        '@type': 'ContactPage',
        url: 'https://www.thrivewellnessth.com/contact',
        name: 'ติดต่อนัดหมาย Thrive Wellness Center',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'หน้าแรก', item: 'https://www.thrivewellnessth.com' },
          { '@type': 'ListItem', position: 2, name: 'ติดต่อเรา', item: 'https://www.thrivewellnessth.com/contact' },
        ],
      },
    ],
  },
];

const crumbs = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'ติดต่อเรา', href: '/contact' },
];
---

<BaseLayout>
  <SEO
    slot="head"
    seoTitle="ติดต่อนัดหมาย | Thrive Wellness Center | 095-934-9640"
    description="นัดหมายและติดต่อ Thrive Wellness Center โทร 095-934-9640 LINE @thrivewellnessth เดอะ คริสตัล พาร์ค ชั้น 2 ประดิษฐ์มนูธรรม ลาดพร้าว เปิดทุกวัน 10:00–19:00"
    canonicalPath="/contact"
    ogImage="/og-image.jpg"
    noIndex={false}
    jsonLd={jsonLd}
  />
  <Header />
  <Breadcrumbs crumbs={crumbs} />

  <main>
    <!-- ── Page header ────────────────────────────────────────── -->
    <section class="section section--white">
      <div class="section-container" style="text-align:center">
        <span class="section-label">ติดต่อ</span>
        <h1 class="section-title">ติดต่อและนัดหมาย</h1>
        <p style="color:var(--text-2);max-width:480px;margin:0 auto;">เลือกช่องทางที่สะดวกที่สุดสำหรับคุณ ทีมงานพร้อมตอบทุกวัน 10:00–19:00 น.</p>
      </div>
    </section>

    <!-- ── Channels (C: channels-first) ─────────────────────── -->
    <section class="section section--light">
      <div class="section-container">
        <div class="contact-channels">
          <a
            href="https://line.me/R/ti/p/@thrivewellnessth"
            class="contact-channel contact-channel--line"
            data-gtm-event="line_click"
            data-gtm-label="contact-page-LINE"
          >
            <span class="contact-channel__icon">💬</span>
            <span class="contact-channel__name">LINE</span>
            <span class="contact-channel__detail">@thrivewellnessth</span>
          </a>
          <a
            href="tel:+66959349640"
            class="contact-channel contact-channel--phone"
            data-gtm-event="call_click"
            data-gtm-label="contact-page-phone"
          >
            <span class="contact-channel__icon">📞</span>
            <span class="contact-channel__name">โทร</span>
            <span class="contact-channel__detail">095-934-9640</span>
          </a>
          <a
            href="https://maps.google.com/?q=199+Pradit+Manutham+Road+Bangkok+10230"
            target="_blank"
            rel="noopener noreferrer"
            class="contact-channel contact-channel--walkin"
            data-gtm-event="walkin_click"
            data-gtm-label="contact-page-walkin"
          >
            <span class="contact-channel__icon">📍</span>
            <span class="contact-channel__name">Walk-in</span>
            <span class="contact-channel__detail">เดอะ คริสตัล พาร์ค ชั้น 2</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ── Clinic info bar ───────────────────────────────────── -->
    <section class="section section--white">
      <div class="section-container">
        <div class="grid-4">
          <div class="card card-body">
            <h3>📍 ที่ตั้ง</h3>
            <p class="text-muted">ชั้น 2 อาคาร B เดอะ คริสตัล พาร์ค<br />199 ถนนประดิษฐ์มนูธรรม ลาดพร้าว กรุงเทพฯ 10230</p>
          </div>
          <div class="card card-body">
            <h3>📞 โทรศัพท์</h3>
            <p><a href="tel:+66959349640" data-gtm-event="call_click" data-gtm-label="info-bar-phone">095-934-9640</a></p>
          </div>
          <div class="card card-body">
            <h3>💬 LINE</h3>
            <p><a href="https://line.me/R/ti/p/@thrivewellnessth" data-gtm-event="line_click" data-gtm-label="info-bar-LINE">@thrivewellnessth</a></p>
          </div>
          <div class="card card-body">
            <h3>⏰ เวลาเปิดบริการ</h3>
            <p class="text-muted">เปิดทุกวัน<br />10:00–19:00 น.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Lead form ─────────────────────────────────────────── -->
    <section class="section section--light">
      <div class="section-container" style="text-align:center;padding-bottom:0">
        <span class="section-label">แบบฟอร์ม</span>
        <h2 class="section-title">ต้องการให้เราติดต่อกลับ?</h2>
        <p style="color:var(--text-2);max-width:480px;margin:0 auto;">ฝากข้อมูลไว้ได้เลย ทีมงานจะตอบกลับภายใน 1 วันทำการ</p>
      </div>
    </section>
    <LeadForm serviceSlug="contact" formTitle="แบบฟอร์มนัดหมาย" />

    <!-- ── Getting here ───────────────────────────────────────── -->
    <section class="section section--white">
      <div class="section-container">
        <div class="section-title-center">
          <span class="section-label">How To Visit</span>
          <h2 class="section-title">วิธีการเข้าถึงเรา</h2>
        </div>
        <div class="grid-3">
          <div class="card card-body">
            <h3>MRT</h3>
            <p class="text-muted">สถานีรามอินทรา กม.4 หรือสถานีเลียบด่วนรามอินทรา แล้วต่อรถมายังเดอะ คริสตัล พาร์ค</p>
          </div>
          <div class="card card-body">
            <h3>BTS</h3>
            <p class="text-muted">ลงสถานีเอกมัย แล้วต่อรถมายังเดอะ คริสตัล พาร์ค ประดิษฐ์มนูธรรม</p>
          </div>
          <div class="card card-body">
            <h3>รถยนต์</h3>
            <p class="text-muted">มีที่จอดรถภายในเดอะ คริสตัล พาร์ค บริเวณถนนประดิษฐ์มนูธรรม</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Final CTA ──────────────────────────────────────────── -->
    <CTASection
      headline="สะดวกคุยทาง LINE?"
      subline="แอด LINE เพื่อส่งอาการ เป้าหมายสุขภาพ หรือรูปผลตรวจเดิมให้ทีมงานช่วยประเมินเบื้องต้น"
      primaryBtn={{ label: 'เพิ่มเพื่อน LINE', href: 'https://line.me/R/ti/p/@thrivewellnessth' }}
      secondaryBtn={{ label: 'โทร 095-934-9640', href: 'tel:+66959349640' }}
    />
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 4.2: Type-check**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website/astro && npx astro check 2>&1 | tail -20
```

Expected: `0 errors` (or only pre-existing warnings).

- [ ] **Step 4.3: Build check**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website/astro && npm run build 2>&1 | tail -20
```

Expected: build succeeds, exit 0.

- [ ] **Step 4.4: Commit**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git add astro/src/pages/contact.astro
git commit -m "feat: rebuild contact page with channels-first layout (LINE, phone, walk-in)"
```

---

## Task 5: Mobile responsiveness for new CSS

**Files:**
- Modify: `astro/src/styles/global.css` — add mobile overrides inside the existing `@media (max-width: 900px)` block

- [ ] **Step 5.1: Add mobile overrides**

Inside the existing `@media (max-width: 900px)` block at the end of `global.css`, add:

```css
  .service-featured-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
  }

  .service-featured-card__cta {
    align-self: flex-end;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .contact-channels {
    grid-template-columns: 1fr;
    max-width: 340px;
  }
```

- [ ] **Step 5.2: Final build + type-check**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website/astro && npx astro check 2>&1 | tail -5 && npm run build 2>&1 | tail -5
```

Expected: both commands exit 0, no errors.

- [ ] **Step 5.3: Commit**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git add astro/src/styles/global.css
git commit -m "style: add mobile overrides for homepage services, testimonials, and contact channels"
```

---

## Task 6: Open PR

- [ ] **Step 6.1: Verify branch and push**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git log --oneline -5
git push origin HEAD
```

- [ ] **Step 6.2: Open PR**

Title: `feat: homepage and contact page builds`

Body should note:
- Homepage: hero (เหนื่อยไม่หาย), services (featured food-intolerance + grid), doctor trust, mockup testimonials, lead form, FAQ
- Contact: channels-first (LINE/phone/walk-in), clinic info bar, lead form, transport info
- LeadForm: `form_submit` → `lead_submit` GTM event rename
- Ready for Netlify deploy preview; requires Satemshi approval before merge to main
