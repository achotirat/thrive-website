# Check-up Programs (/check-up/[slug]) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 13 `/check-up/[slug]` program pages with a shared Astro dynamic route, new content collection, and redesigned `/check-up` index that lists all programs grouped by category.

**Architecture:** New `checkUpPrograms` Astro content collection (`src/content/check-up/*.mdx`) with a Zod schema extending the existing services pattern. One dynamic route `check-up/[slug].astro` renders all 13 pages. Pricing decoupled to `pricing.json` with `draft: true` stubs. Index page `check-up.astro` updated to show a two-group programs grid pulled from the collection.

**Tech Stack:** Astro 6, MDX, Zod, TypeScript — same as rest of site. No new dependencies.

---

## Hero Image Filenames

Place all images in `astro/public/` before or during content tasks. Name them exactly:

| Program | Filename |
|---------|----------|
| Young Balance™ | `check-up-young-balance-1200x630.jpg` |
| Healthy Balance™ | `check-up-healthy-balance-1200x630.jpg` |
| Optimum Balance™ | `check-up-optimum-balance-1200x630.jpg` |
| Iconic Balance™ | `check-up-iconic-balance-1200x630.jpg` |
| Food Intolerance | `check-up-food-intolerance-1200x630.jpg` |
| Hormones | `check-up-hormones-1200x630.jpg` |
| DNA for Health & Life | `check-up-dna-health-life-1200x630.jpg` |
| Vitamins & Micronutrients | `check-up-vitamins-and-micronutrients-1200x630.jpg` |
| Urine Organic Profile | `check-up-urine-organic-test-1200x630.jpg` |
| Heavy Metal & Trace Elements | `check-up-heavy-metal-trace-elements-1200x630.jpg` |
| Acne Solution | `check-up-acne-solution-1200x630.jpg` |
| Special Test | `check-up-special-test-1200x630.jpg` |
| Immune Check-up | `check-up-immune-check-up-1200x630.jpg` |

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Modify | `astro/src/content.config.ts` | Add `checkUpPrograms` collection + Zod schema |
| Create | `astro/src/components/CheckUpSummary.astro` | Key tests list + audience chips |
| Create | `astro/src/pages/check-up/[slug].astro` | Dynamic route for all 13 program pages |
| Modify | `astro/src/config/pricing.json` | Add 13 `draft: true` pricing stubs |
| Create | `astro/src/content/check-up/young-balance.mdx` | Balance tier 1 |
| Create | `astro/src/content/check-up/healthy-balance.mdx` | Balance tier 2 |
| Create | `astro/src/content/check-up/optimum-balance.mdx` | Balance tier 3 |
| Create | `astro/src/content/check-up/iconic-balance.mdx` | Balance tier 4 (premium) |
| Create | `astro/src/content/check-up/food-intolerance.mdx` | Specialty mirror |
| Create | `astro/src/content/check-up/hormones.mdx` | Specialty mirror |
| Create | `astro/src/content/check-up/dna-health-life.mdx` | Specialty mirror |
| Create | `astro/src/content/check-up/vitamins-and-micronutrients.mdx` | Specialty mirror |
| Create | `astro/src/content/check-up/urine-organic-test.mdx` | Specialty mirror |
| Create | `astro/src/content/check-up/heavy-metal-trace-elements.mdx` | Specialty new |
| Create | `astro/src/content/check-up/acne-solution.mdx` | Specialty new |
| Create | `astro/src/content/check-up/special-test.mdx` | Specialty new |
| Create | `astro/src/content/check-up/immune-check-up.mdx` | Specialty new |
| Modify | `astro/src/pages/check-up.astro` | Add programs grid section |
| Modify | `astro/src/content/services/check-up.mdx` | Remove old 3-package hardcoded section |

---

## Task 1: Add checkUpPrograms collection to content.config.ts

**Files:**
- Modify: `astro/src/content.config.ts`

- [ ] **Step 1: Add the collection definition**

In `astro/src/content.config.ts`, after the `servicesCollection` closing `});` and before `const blogPostsCollection`, insert:

```typescript
const checkUpProgramsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/check-up' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['balance', 'specialty']),
    tagline: z.string(),
    targetAudience: z.array(z.string()),
    keyTests: z.array(z.string()),
    seo: z.object({
      seoTitle: z.string(),
      description: z.string().max(180),
      ogImage: z.string(),
      ogLocale: z.string().default('th_TH'),
      canonicalPath: z.string(),
      noIndex: z.boolean().default(false),
      hreflang: z.array(z.object({ lang: z.string(), href: z.string() })).default([]),
      geo: z.object({
        region: z.string(),
        placename: z.string(),
        position: z.string(),
        icbm: z.string(),
      }),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      lastMedicalReview: z.coerce.date(),
      reviewedBy: z.string(),
      medicalSpecialty: z.string(),
    }),
    hero: z.object({
      headline: z.string(),
      subline: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      primaryBtn: buttonSchema,
      secondaryBtn: buttonSchema.optional(),
      stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    }),
    doctor: z.object({
      name: z.string(),
      title: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      bio: z.string(),
      specializations: z.array(z.string()),
    }),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })),
    cta: z.object({
      headline: z.string(),
      subline: z.string().optional(),
      primaryBtn: buttonSchema,
      secondaryBtn: buttonSchema.optional(),
    }),
    relatedPrograms: z.array(z.object({
      title: z.string(),
      href: z.string(),
      icon: z.string().optional(),
      description: z.string().optional(),
    })),
    jsonLd: z.array(z.any()).default([]),
  }),
});
```

- [ ] **Step 2: Export the new collection**

Change the `export const collections` block at the bottom of `content.config.ts` from:
```typescript
export const collections = {
  services: servicesCollection,
  blogPosts: blogPostsCollection,
  blog: blogCollection,
};
```
to:
```typescript
export const collections = {
  services: servicesCollection,
  checkUpPrograms: checkUpProgramsCollection,
  blogPosts: blogPostsCollection,
  blog: blogCollection,
};
```

- [ ] **Step 3: Verify type-check passes (no MDX files yet — empty collection is fine)**

```bash
cd astro && npx astro check
```
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add astro/src/content.config.ts
git commit -m "feat(check-up): add checkUpPrograms content collection schema"
```

---

## Task 2: Create CheckUpSummary component

**Files:**
- Create: `astro/src/components/CheckUpSummary.astro`

- [ ] **Step 1: Create the component**

```astro
---
export interface Props {
  keyTests: string[];
  targetAudience: string[];
}

const { keyTests, targetAudience } = Astro.props;
---

<section class="section bg-white">
  <div class="container narrow">
    <div class="check-up-summary">
      <div class="check-up-summary__tests">
        <h3 class="check-up-summary__heading">รายการตรวจหลัก</h3>
        <ul class="check-up-summary__list">
          {keyTests.map((test) => (
            <li>
              <span class="check-up-summary__dot"></span>
              {test}
            </li>
          ))}
        </ul>
      </div>
      {targetAudience.length > 0 && (
        <div class="check-up-summary__audience">
          <h3 class="check-up-summary__heading">เหมาะสำหรับ</h3>
          <div class="check-up-summary__chips">
            {targetAudience.map((a) => <span class="chip">{a}</span>)}
          </div>
        </div>
      )}
    </div>
  </div>
</section>

<style>
  .check-up-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 32px 0;
  }
  @media (max-width: 640px) {
    .check-up-summary { grid-template-columns: 1fr; gap: 24px; }
  }
  .check-up-summary__heading {
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--blue);
    margin-bottom: 16px;
  }
  .check-up-summary__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .check-up-summary__list li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
  }
  .check-up-summary__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--blue);
    flex-shrink: 0;
  }
  .check-up-summary__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    display: inline-block;
    padding: 5px 12px;
    background: var(--blue-xl);
    border: 1px solid var(--blue-l);
    border-radius: var(--r-pill);
    font-size: 0.82rem;
    color: var(--blue-d);
    font-weight: 500;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add astro/src/components/CheckUpSummary.astro
git commit -m "feat(check-up): add CheckUpSummary component"
```

---

## Task 3: Create dynamic route check-up/[slug].astro

**Files:**
- Create: `astro/src/pages/check-up/[slug].astro`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p astro/src/pages/check-up
```

Create `astro/src/pages/check-up/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import SEO from '../../components/SEO.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import ServiceHero from '../../components/ServiceHero.astro';
import CheckUpSummary from '../../components/CheckUpSummary.astro';
import FAQSection from '../../components/FAQSection.astro';
import DoctorAttribution from '../../components/DoctorAttribution.astro';
import CTASection from '../../components/CTASection.astro';
import LeadForm from '../../components/LeadForm.astro';
import ServiceCard from '../../components/ServiceCard.astro';
import { getServicePricing } from '../../lib/pricing';

export async function getStaticPaths() {
  const programs = await getCollection('checkUpPrograms');
  return programs.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const d = entry.data;

const pricing = getServicePricing('check-up/' + entry.id);

const crumbs = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'ตรวจสุขภาพ Check-up', href: '/check-up' },
  { label: d.title, href: `/check-up/${entry.id}` },
];
---

<BaseLayout>
  <SEO slot="head" {...d.seo} heroImage={d.hero.image} jsonLd={d.jsonLd} />
  <Header />
  <Breadcrumbs crumbs={crumbs} />
  <ServiceHero {...d.hero} />
  <main class="service-page">
    <CheckUpSummary keyTests={d.keyTests} targetAudience={d.targetAudience} />
    <article class="service-content">
      <Content />
    </article>
    {pricing && pricing.from && (
      <section class="section" style="background:var(--blue-xl)">
        <div class="container narrow" style="text-align:center">
          <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:6px;">ราคาเริ่มต้น</p>
          <strong style="font-size:1.8rem;color:var(--blue-d)">{pricing.from}</strong>
          {pricing.note && <p style="font-size:.85rem;color:var(--text-muted);margin-top:8px">{pricing.note}</p>}
          <div style="margin-top:20px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap">
            <a href="tel:+66959349640" class="btn btn-primary">โทร 095-934-9640</a>
            <a href="https://line.me/R/ti/p/@thrivewellnessth" class="btn btn-secondary">LINE @thrivewellnessth</a>
          </div>
        </div>
      </section>
    )}
    <DoctorAttribution doctor={d.doctor} />
    <FAQSection items={d.faqs} />
    <section class="section related-services">
      <div class="section-container">
        <div class="section-title-center">
          <span class="section-label">โปรแกรมที่เกี่ยวข้อง</span>
          <h2 class="section-title">สำรวจโปรแกรมอื่น</h2>
        </div>
        <div class="related-services__grid">
          {d.relatedPrograms.map((p) => <ServiceCard {...p} />)}
        </div>
      </div>
    </section>
    <CTASection {...d.cta} />
    <LeadForm serviceSlug={`check-up/${entry.id}`} formTitle={`นัดปรึกษา ${d.title}`} />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Type-check**

```bash
cd astro && npx astro check
```
Expected: 0 errors. (Empty collection → getStaticPaths returns [] → no pages built, no errors.)

- [ ] **Step 3: Commit**

```bash
git add astro/src/pages/check-up/[slug].astro
git commit -m "feat(check-up): add dynamic route for check-up programs"
```

---

## Task 4: Add pricing stubs to pricing.json

**Files:**
- Modify: `astro/src/config/pricing.json`

- [ ] **Step 1: Add 13 entries**

Append to `astro/src/config/pricing.json` (inside the top-level `{}`, after the last existing entry):

```json
  "check-up/young-balance": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/healthy-balance": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/optimum-balance": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/iconic-balance": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/food-intolerance": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/hormones": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/dna-health-life": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/vitamins-and-micronutrients": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/urine-organic-test": {
    "from": "15,900 บาท",
    "note": "ราคารวมตรวจ + รายงานผล | เพิ่มแพ็กเกจรักษา ฿19,000 (รวม IV Drip มูลค่า ฿4,000)",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/heavy-metal-trace-elements": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/acne-solution": {
    "from": "2,990 บาท",
    "note": "ต่อครั้ง หรือ ฿9,900 คอร์ส 5 ครั้ง (Skin Healing) | Strength Booster ฿3,800/ครั้ง หรือ ฿14,900 คอร์ส 5 ครั้ง",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/special-test": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  },
  "check-up/immune-check-up": {
    "from": "TBD",
    "note": "ราคากำลังรอ review",
    "updatedAt": "2026-05-28",
    "draft": true,
    "priceReviewRequiredBy": "apanit-pueng"
  }
```

- [ ] **Step 2: Commit**

```bash
git add astro/src/config/pricing.json
git commit -m "feat(check-up): add pricing stubs for 13 check-up programs"
```

---

## Tasks 5–17: MDX Content Files

**Before writing each MDX file:** invoke the `thrive-content-writer` skill — it handles medical citations (5+ sources), Thai/English research, E-E-A-T signals, plain-language gate, and AI search optimisation on top of the frontmatter below.

**Wix source URLs for reference during content writing:**
- Young Balance: https://www.thrivewellnessth.com/young-balance-check-up
- Healthy Balance: https://www.thrivewellnessth.com/healthy-balance-check-up
- Optimum Balance: https://www.thrivewellnessth.com/optimum-balance-check-up
- Iconic Balance: https://www.thrivewellnessth.com/iconic-balance-check-up
- Food Intolerance: https://www.thrivewellnessth.com/food-intolerance
- Hormones: https://www.thrivewellnessth.com/hormones-quiz
- DNA: https://www.thrivewellnessth.com/dna-health-life
- Vitamins: https://www.thrivewellnessth.com/vitamins-and-micronutrients
- Urine Organic: https://www.thrivewellnessth.com/urine-organic-test
- Heavy Metal: https://www.thrivewellnessth.com/heavy-metal-trace-elements-test
- Acne: https://www.thrivewellnessth.com/acne-solution
- Special Test: https://www.thrivewellnessth.com/special-test
- Immune: https://www.thrivewellnessth.com/package-immune-screening

Each MDX file follows this structure:
1. Frontmatter (complete YAML — provided per task below)
2. Key Takeaways callout box (same cyan box pattern as other service pages)
3. What this program tests (h2 + explanation)
4. Who it's for (h2 + 3-4 scenarios)
5. What the results tell you (h2 + what each marker means)
6. Scientific references (ul at bottom)

After each MDX file: run `npx astro check` and commit.

---

### Task 5: young-balance.mdx

**Files:**
- Create: `astro/src/content/check-up/young-balance.mdx`

- [ ] **Step 1: Create the file with this frontmatter, then write the body using thrive-content-writer**

```yaml
---
title: "Young Balance™"
category: balance
tagline: "ตรวจสุขภาพเชิงลึก สำหรับคนวัยทำงานที่อยากรู้ Baseline ของร่างกายตัวเอง"
targetAudience:
  - "คนวัยทำงาน อายุ 25–40 ปี"
  - "ตรวจสุขภาพประจำปีครั้งแรก"
  - "ต้องการรู้ Baseline สุขภาพตัวเอง"
keyTests:
  - "CBC (ความสมบูรณ์ของเลือด)"
  - "Liver Function Test (LFT)"
  - "Kidney Function (BUN/Creatinine)"
  - "Fasting Blood Sugar & HbA1c"
  - "Lipid Profile (ไขมัน 4 ตัว)"
  - "Uric Acid"
  - "Vitamin D3"
  - "Calcium & Magnesium"
  - "Cortisol (ฮอร์โมนความเครียด)"
seo:
  seoTitle: "Young Balance™ ตรวจสุขภาพสำหรับวัยทำงาน | Thrive Wellness Clinic ลาดพร้าว"
  description: "โปรแกรม Young Balance™ ตรวจเลือดพื้นฐาน วิตามิน และฮอร์โมนความเครียด เหมาะสำหรับคนอายุ 25–40 ที่อยากรู้ Baseline — Thrive Wellness Clinic ลาดพร้าว"
  ogImage: "/check-up-young-balance-1200x630.jpg"
  ogLocale: "th_TH"
  canonicalPath: "/check-up/young-balance"
  noIndex: false
  hreflang:
    - lang: "th-TH"
      href: "https://www.thrivewellnessth.com/check-up/young-balance"
    - lang: "en"
      href: "https://www.thrivewellnessth.com/check-up/young-balance"
    - lang: "x-default"
      href: "https://www.thrivewellnessth.com/check-up/young-balance"
  geo:
    region: "TH-10"
    placename: "Bangkok, Lat Phrao, Thailand"
    position: "13.8207;100.5736"
    icbm: "13.8207, 100.5736"
  publishedAt: "2026-05-28"
  updatedAt: "2026-05-28"
  lastMedicalReview: "2026-05-28"
  reviewedBy: "พญ. ชนากานต์ ตระหง่านศรี"
  medicalSpecialty: "Preventive Medicine"
hero:
  headline: "รู้ Baseline ร่างกายตัวเอง ก่อนจะรู้สึกว่ามีอะไรผิดปกติ"
  subline: "Young Balance™ ออกแบบสำหรับคนวัยทำงาน — ตรวจเลือดพื้นฐาน วิตามิน และฮอร์โมนความเครียด ในครั้งเดียว พร้อมแปลผลกับแพทย์"
  image: "/check-up-young-balance-1200x630.jpg"
  imageAlt: "โปรแกรม Young Balance™ ตรวจสุขภาพสำหรับคนวัยทำงาน Thrive Wellness Clinic"
  primaryBtn:
    label: "โทรนัดตรวจ 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
doctor:
  name: "พญ. ชนากานต์ ตระหง่านศรี"
  title: "Chanakan Trangansri, MD. (หมอนุ่น)"
  image: "/dr-chanakan-trangansri-thrive-400x400.jpg"
  imageAlt: "พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น Thrive Wellness Clinic"
  bio: "หมอนุ่นแปลผล Young Balance™ ด้วยมุมมอง Functional Medicine — ไม่ใช่แค่ดูค่าปกติหรือไม่ แต่มองหา Pattern ที่บ่งบอกความเสี่ยงล่วงหน้า เพื่อวางแผนป้องกันตั้งแต่เนิ่นๆ"
  specializations:
    - "Anti-aging & Regenerative Medicine"
    - "Nutrition Wellness"
    - "Hormone Balance"
    - "Lifestyle Medicine"
faqs:
  - q: "Young Balance™ ต่างจากตรวจสุขภาพโรงพยาบาลทั่วไปอย่างไร?"
    a: "โปรแกรมทั่วไปตรวจเพื่อหาโรค — Young Balance™ ตรวจเพื่อดูว่าร่างกายทำงานได้ดีแค่ไหน เพิ่มการตรวจ Vitamin D3, Cortisol และ Magnesium ที่ส่งผลต่อพลังงาน นอนหลับ และการรับมือความเครียด ซึ่งโปรแกรมมาตรฐานมักไม่มี"
  - q: "ต้องอดอาหารนานแค่ไหน?"
    a: "อดอาหาร 8–12 ชั่วโมงก่อนเจาะเลือด ดื่มน้ำเปล่าได้ตามปกติ แนะนำนัดตรวจช่วงเช้า"
  - q: "รู้ผลเมื่อไหร่?"
    a: "ผลส่วนใหญ่ทราบภายใน 3–5 วันทำการ แพทย์นัดแปลผลหลังผลครบ"
  - q: "ตรวจครั้งเดียวได้ทุกรายการเลยไหม?"
    a: "ใช่ เจาะเลือดครั้งเดียว ครอบคลุมทุกรายการใน Young Balance™"
cta:
  headline: "เริ่มรู้จักร่างกายตัวเองวันนี้"
  subline: "Thrive Wellness Clinic — The Crystal Park ชั้น 2 ลาดพร้าว เปิดทุกวัน 10:00–19:00"
  primaryBtn:
    label: "โทร 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
relatedPrograms:
  - title: "Healthy Balance™"
    href: "/check-up/healthy-balance"
    icon: "🌿"
    description: "เพิ่มฮอร์โมนพื้นฐาน + วิตามิน 10 ตัว"
  - title: "Optimum Balance™"
    href: "/check-up/optimum-balance"
    icon: "⚡"
    description: "ฮอร์โมนเต็มระบบ ไทรอยด์ + เพศ"
  - title: "Hormone Check-up"
    href: "/check-up/hormones"
    icon: "🧬"
    description: "ตรวจฮอร์โมน 18 ตัวเชิงลึก"
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
          streetAddress: "199 ถนนประดิษฐ์มนูธรรม อาคาร B ชั้น 2 The Crystal Park"
          addressLocality: "ลาดพร้าว กรุงเทพฯ"
          postalCode: "10230"
          addressCountry: "TH"
        openingHours: "Mo-Su 10:00-19:00"
        medicalSpecialty: "Preventive Medicine"
      - "@type": "Person"
        "@id": "https://www.thrivewellnessth.com/#dr-chanakan"
        name: "พญ. ชนากานต์ ตระหง่านศรี"
        alternateName: "Chanakan Trangansri, MD."
        jobTitle: "แพทย์ด้าน Anti-aging & Regenerative Medicine"
        worksFor:
          "@id": "https://www.thrivewellnessth.com/#clinic"
        image: "https://www.thrivewellnessth.com/dr-chanakan-trangansri-thrive-400x400.jpg"
      - "@type": "MedicalTest"
        name: "Young Balance™ โปรแกรมตรวจสุขภาพสำหรับคนวัยทำงาน"
        description: "โปรแกรมตรวจสุขภาพพื้นฐานเชิงลึกครอบคลุมเลือด วิตามิน และฮอร์โมนความเครียด สำหรับคนอายุ 25–40 ปี"
        relevantSpecialty: "Preventive Medicine"
        recognizingAuthority:
          "@id": "https://www.thrivewellnessth.com/#clinic"
      - "@type": "FAQPage"
        mainEntity:
          - "@type": "Question"
            name: "Young Balance™ ต่างจากตรวจสุขภาพโรงพยาบาลทั่วไปอย่างไร?"
            acceptedAnswer:
              "@type": "Answer"
              text: "โปรแกรมทั่วไปตรวจเพื่อหาโรค — Young Balance™ ตรวจเพื่อดูว่าร่างกายทำงานได้ดีแค่ไหน เพิ่มการตรวจ Vitamin D3, Cortisol และ Magnesium ที่ส่งผลต่อพลังงาน นอนหลับ และการรับมือความเครียด"
          - "@type": "Question"
            name: "ต้องอดอาหารนานแค่ไหน?"
            acceptedAnswer:
              "@type": "Answer"
              text: "อดอาหาร 8–12 ชั่วโมงก่อนเจาะเลือด ดื่มน้ำเปล่าได้ตามปกติ แนะนำนัดตรวจช่วงเช้า"
      - "@type": "BreadcrumbList"
        itemListElement:
          - "@type": "ListItem"
            position: 1
            name: "หน้าแรก"
            item: "https://www.thrivewellnessth.com/"
          - "@type": "ListItem"
            position: 2
            name: "ตรวจสุขภาพ Check-up"
            item: "https://www.thrivewellnessth.com/check-up"
          - "@type": "ListItem"
            position: 3
            name: "Young Balance™"
            item: "https://www.thrivewellnessth.com/check-up/young-balance"
---
```

- [ ] **Step 2: Write MDX body using thrive-content-writer skill**

Source URL: https://www.thrivewellnessth.com/young-balance-check-up

Required body sections:
- Key Takeaways callout (cyan box, 4–5 bullets)
- ทำไม Young Balance™ ถึงมากกว่าการตรวจสุขภาพทั่วไป (h2)
- รายการตรวจใน Young Balance™ และความหมาย (h2 + table or list)
- ใครควรตรวจ Young Balance™ (h2 + 3 scenarios)
- Scientific references (5+ PMID citations)

- [ ] **Step 3: Type-check and verify route builds**

```bash
cd astro && npx astro check
```
Expected: 0 errors. Route `/check-up/young-balance` now builds.

- [ ] **Step 4: Commit**

```bash
git add astro/src/content/check-up/young-balance.mdx
git commit -m "feat(check-up): add Young Balance program page"
```

---

### Task 6: healthy-balance.mdx

**Files:**
- Create: `astro/src/content/check-up/healthy-balance.mdx`

- [ ] **Step 1: Create with frontmatter below, then write body via thrive-content-writer**

Source URL: https://www.thrivewellnessth.com/healthy-balance-check-up

```yaml
---
title: "Healthy Balance™"
category: balance
tagline: "ตรวจวิตามิน แร่ธาตุ และฮอร์โมนพื้นฐาน — รู้ว่าร่างกายขาดอะไร ก่อนจะรู้สึก"
targetAudience:
  - "เหนื่อยง่าย นอนหลับไม่ดีไม่ทราบสาเหตุ"
  - "อยากรู้ระดับวิตามินและฮอร์โมนพื้นฐาน"
  - "อายุ 30 ปีขึ้นไป"
keyTests:
  - "CBC + ตรวจเลือดพื้นฐาน"
  - "Vitamin D3"
  - "TSH + Cortisol + Insulin (ฮอร์โมนพื้นฐาน)"
  - "Homocysteine (ตัวบ่งชี้การอักเสบ)"
  - "Folate"
  - "10 วิตามินและสารต้านอนุมูลอิสระ"
  - "ฟรี! Personalized Vitamins 1 เดือน"
seo:
  seoTitle: "Healthy Balance™ ตรวจวิตามินและฮอร์โมนพื้นฐาน | Thrive Wellness Clinic ลาดพร้าว"
  description: "โปรแกรม Healthy Balance™ ตรวจวิตามิน ฮอร์โมนพื้นฐาน และการอักเสบ รับ Personalized Vitamins 1 เดือนฟรี — Thrive Wellness Clinic ลาดพร้าว"
  ogImage: "/check-up-healthy-balance-1200x630.jpg"
  ogLocale: "th_TH"
  canonicalPath: "/check-up/healthy-balance"
  noIndex: false
  hreflang:
    - lang: "th-TH"
      href: "https://www.thrivewellnessth.com/check-up/healthy-balance"
    - lang: "en"
      href: "https://www.thrivewellnessth.com/check-up/healthy-balance"
    - lang: "x-default"
      href: "https://www.thrivewellnessth.com/check-up/healthy-balance"
  geo:
    region: "TH-10"
    placename: "Bangkok, Lat Phrao, Thailand"
    position: "13.8207;100.5736"
    icbm: "13.8207, 100.5736"
  publishedAt: "2026-05-28"
  updatedAt: "2026-05-28"
  lastMedicalReview: "2026-05-28"
  reviewedBy: "พญ. ชนากานต์ ตระหง่านศรี"
  medicalSpecialty: "Preventive Medicine"
hero:
  headline: "ร่างกายขาดอะไรอยู่ — คุณอาจยังไม่รู้สึก แต่ตัวเลขบอกได้"
  subline: "Healthy Balance™ ตรวจวิตามิน ฮอร์โมนพื้นฐาน และการอักเสบ พร้อมแปลผลกับแพทย์และรับ Personalized Vitamins 1 เดือนฟรี"
  image: "/check-up-healthy-balance-1200x630.jpg"
  imageAlt: "โปรแกรม Healthy Balance™ ตรวจวิตามินและฮอร์โมน Thrive Wellness Clinic"
  primaryBtn:
    label: "โทรนัดตรวจ 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
doctor:
  name: "พญ. ชนากานต์ ตระหง่านศรี"
  title: "Chanakan Trangansri, MD. (หมอนุ่น)"
  image: "/dr-chanakan-trangansri-thrive-400x400.jpg"
  imageAlt: "พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น Thrive Wellness Clinic"
  bio: "หมอนุ่นอ่านผล Healthy Balance™ ในบริบทของชีวิตจริง — ตัวเลขที่ 'อยู่ในเกณฑ์' บางตัวยังบ่งบอกปัญหาได้ เมื่ออ่านร่วมกับอาการและไลฟ์สไตล์"
  specializations:
    - "Anti-aging & Regenerative Medicine"
    - "Nutrition Wellness"
    - "Hormone Balance"
    - "Lifestyle Medicine"
faqs:
  - q: "Personalized Vitamins ที่ได้ฟรีคืออะไร?"
    a: "เป็นวิตามินที่แพทย์สั่งจ่ายตามผลตรวจจริงของคุณ ไม่ใช่สูตรกระป๋องทั่วไป ใช้ได้ 1 เดือนพร้อมคำแนะนำการกิน"
  - q: "Homocysteine คืออะไร ทำไมต้องตรวจ?"
    a: "Homocysteine คือกรดอะมิโนในเลือด ถ้าสูงเกินเกณฑ์เป็นสัญญาณของการอักเสบเรื้อรัง ความเสี่ยงโรคหัวใจ และการดูดซึมวิตามิน B12/Folate บกพร่อง"
  - q: "ต้องอดอาหารก่อนตรวจไหม?"
    a: "อดอาหาร 8–12 ชั่วโมง ดื่มน้ำเปล่าได้ แนะนำนัดตรวจช่วงเช้า"
cta:
  headline: "รู้ระดับวิตามินจริงของคุณ — รับแผนเสริมที่แม่นยำ"
  subline: "Thrive Wellness Clinic — The Crystal Park ชั้น 2 ลาดพร้าว เปิดทุกวัน 10:00–19:00"
  primaryBtn:
    label: "โทร 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
relatedPrograms:
  - title: "Young Balance™"
    href: "/check-up/young-balance"
    icon: "🌱"
    description: "ตรวจสุขภาพพื้นฐานสำหรับวัยทำงาน"
  - title: "Optimum Balance™"
    href: "/check-up/optimum-balance"
    icon: "⚡"
    description: "ฮอร์โมนเต็มระบบ ไทรอยด์ + เพศ"
  - title: "วิตามินเฉพาะบุคคล"
    href: "/personalized-vitamins"
    icon: "💊"
    description: "เสริมตามผล Check-up จริง"
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
          streetAddress: "199 ถนนประดิษฐ์มนูธรรม อาคาร B ชั้น 2 The Crystal Park"
          addressLocality: "ลาดพร้าว กรุงเทพฯ"
          postalCode: "10230"
          addressCountry: "TH"
        openingHours: "Mo-Su 10:00-19:00"
        medicalSpecialty: "Preventive Medicine"
      - "@type": "Person"
        "@id": "https://www.thrivewellnessth.com/#dr-chanakan"
        name: "พญ. ชนากานต์ ตระหง่านศรี"
        alternateName: "Chanakan Trangansri, MD."
        jobTitle: "แพทย์ด้าน Anti-aging & Regenerative Medicine"
        worksFor:
          "@id": "https://www.thrivewellnessth.com/#clinic"
        image: "https://www.thrivewellnessth.com/dr-chanakan-trangansri-thrive-400x400.jpg"
      - "@type": "MedicalTest"
        name: "Healthy Balance™ โปรแกรมตรวจวิตามินและฮอร์โมนพื้นฐาน"
        description: "โปรแกรมตรวจสุขภาพครอบคลุมวิตามิน ฮอร์โมนพื้นฐาน และการอักเสบ พร้อม Personalized Vitamins 1 เดือนฟรี"
        relevantSpecialty: "Preventive Medicine"
        recognizingAuthority:
          "@id": "https://www.thrivewellnessth.com/#clinic"
      - "@type": "BreadcrumbList"
        itemListElement:
          - "@type": "ListItem"
            position: 1
            name: "หน้าแรก"
            item: "https://www.thrivewellnessth.com/"
          - "@type": "ListItem"
            position: 2
            name: "ตรวจสุขภาพ Check-up"
            item: "https://www.thrivewellnessth.com/check-up"
          - "@type": "ListItem"
            position: 3
            name: "Healthy Balance™"
            item: "https://www.thrivewellnessth.com/check-up/healthy-balance"
---
```

- [ ] **Step 2: Type-check + commit**

```bash
cd astro && npx astro check
git add astro/src/content/check-up/healthy-balance.mdx
git commit -m "feat(check-up): add Healthy Balance program page"
```

---

### Task 7: optimum-balance.mdx

**Files:**
- Create: `astro/src/content/check-up/optimum-balance.mdx`

- [ ] **Step 1: Create with frontmatter, then body via thrive-content-writer**

Source URL: https://www.thrivewellnessth.com/optimum-balance-check-up

```yaml
---
title: "Optimum Balance™"
category: balance
tagline: "ตรวจฮอร์โมนเต็มระบบ ทั้งไทรอยด์ ต่อมหมวกไต เพศ และการอักเสบ ในครั้งเดียว"
targetAudience:
  - "อายุ 40–60 ปี หรือวัยเริ่มหมดประจำเดือน"
  - "นักกีฬา นักวิ่ง นักไตรกีฬา"
  - "มีอาการเรื้อรังที่ยังไม่รู้สาเหตุ"
keyTests:
  - "Thyroid Panel เต็ม (TSH, Free T3, Free T4, Anti-TPO)"
  - "Adrenal Hormones (Cortisol, DHEA-S)"
  - "Sex Hormones (Estradiol, Testosterone, Progesterone)"
  - "Growth Hormone Marker (IGF-1)"
  - "hs-CRP (การอักเสบ)"
  - "Cardiac Risk Panel (Homocysteine, Lipids)"
  - "ฟรี! Personalized Vitamins 1 เดือน"
seo:
  seoTitle: "Optimum Balance™ ตรวจฮอร์โมนเต็มระบบ | Thrive Wellness Clinic ลาดพร้าว"
  description: "โปรแกรม Optimum Balance™ ตรวจฮอร์โมนไทรอยด์ ต่อมหมวกไต เพศ และความเสี่ยงหัวใจ เหมาะอายุ 40+ และนักกีฬา — Thrive Wellness Clinic ลาดพร้าว"
  ogImage: "/check-up-optimum-balance-1200x630.jpg"
  ogLocale: "th_TH"
  canonicalPath: "/check-up/optimum-balance"
  noIndex: false
  hreflang:
    - lang: "th-TH"
      href: "https://www.thrivewellnessth.com/check-up/optimum-balance"
    - lang: "en"
      href: "https://www.thrivewellnessth.com/check-up/optimum-balance"
    - lang: "x-default"
      href: "https://www.thrivewellnessth.com/check-up/optimum-balance"
  geo:
    region: "TH-10"
    placename: "Bangkok, Lat Phrao, Thailand"
    position: "13.8207;100.5736"
    icbm: "13.8207, 100.5736"
  publishedAt: "2026-05-28"
  updatedAt: "2026-05-28"
  lastMedicalReview: "2026-05-28"
  reviewedBy: "พญ. ชนากานต์ ตระหง่านศรี"
  medicalSpecialty: "Preventive Medicine"
hero:
  headline: "ฮอร์โมนเปลี่ยน คุณอาจไม่รู้ — แต่ร่างกายรู้สึกอยู่แล้ว"
  subline: "Optimum Balance™ ตรวจฮอร์โมนเต็มระบบในครั้งเดียว พร้อมแปลผลกับแพทย์และวางแผนปรับสมดุล"
  image: "/check-up-optimum-balance-1200x630.jpg"
  imageAlt: "โปรแกรม Optimum Balance™ ตรวจฮอร์โมนเต็มระบบ Thrive Wellness Clinic"
  primaryBtn:
    label: "โทรนัดตรวจ 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
doctor:
  name: "พญ. ชนากานต์ ตระหง่านศรี"
  title: "Chanakan Trangansri, MD. (หมอนุ่น)"
  image: "/dr-chanakan-trangansri-thrive-400x400.jpg"
  imageAlt: "พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น Thrive Wellness Clinic"
  bio: "หมอนุ่นเชี่ยวชาญด้านการปรับสมดุลฮอร์โมนและ Anti-aging — อ่านผลฮอร์โมนในภาพรวมพร้อมกัน ไม่ดูแค่ค่าตัวใดตัวหนึ่ง เพราะฮอร์โมนมีผลต่อกันเป็นระบบ"
  specializations:
    - "Anti-aging & Regenerative Medicine"
    - "Hormone Balance"
    - "Lifestyle Medicine"
    - "Chelation & Detoxification"
faqs:
  - q: "Optimum Balance™ เหมาะกับอายุเท่าไหร่?"
    a: "เหมาะที่สุดสำหรับอายุ 35 ปีขึ้นไป ฮอร์โมนเริ่มเปลี่ยนแปลง หรือผู้ที่มีอาการเหนื่อยเรื้อรัง น้ำหนักขึ้นง่าย หลับยาก อารมณ์แปรปรวน โดยไม่ทราบสาเหตุ"
  - q: "ต่างจาก Healthy Balance™ อย่างไร?"
    a: "Optimum Balance™ เพิ่มการตรวจ Sex Hormones (Estradiol, Testosterone, Progesterone), IGF-1 และ Cardiac Risk Panel ครบกว่า เหมาะผู้ที่ต้องการภาพรวมฮอร์โมนเต็มรูปแบบ"
  - q: "นักกีฬาควรตรวจอะไรเป็นพิเศษ?"
    a: "Testosterone, Cortisol และ IGF-1 บ่งบอกการฟื้นตัวและประสิทธิภาพ Iron+Ferritin สำคัญสำหรับนักวิ่งที่ใช้เหล็กสูง Optimum Balance™ ครอบคลุมทั้งหมดนี้"
cta:
  headline: "ฮอร์โมนสมดุล ร่างกายทำงานได้เต็มศักยภาพ"
  subline: "Thrive Wellness Clinic — The Crystal Park ชั้น 2 ลาดพร้าว เปิดทุกวัน 10:00–19:00"
  primaryBtn:
    label: "โทร 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
relatedPrograms:
  - title: "Iconic Balance™"
    href: "/check-up/iconic-balance"
    icon: "👑"
    description: "เพิ่มคัดกรองมะเร็งและสารต้านอนุมูลอิสระ"
  - title: "Healthy Balance™"
    href: "/check-up/healthy-balance"
    icon: "🌿"
    description: "ฮอร์โมนพื้นฐาน + วิตามิน 10 ตัว"
  - title: "ตรวจฮอร์โมนเชิงลึก"
    href: "/check-up/hormones"
    icon: "🧬"
    description: "18 ฮอร์โมน ไทรอยด์เต็มระบบ"
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
          streetAddress: "199 ถนนประดิษฐ์มนูธรรม อาคาร B ชั้น 2 The Crystal Park"
          addressLocality: "ลาดพร้าว กรุงเทพฯ"
          postalCode: "10230"
          addressCountry: "TH"
        openingHours: "Mo-Su 10:00-19:00"
        medicalSpecialty: "Preventive Medicine"
      - "@type": "Person"
        "@id": "https://www.thrivewellnessth.com/#dr-chanakan"
        name: "พญ. ชนากานต์ ตระหง่านศรี"
        jobTitle: "แพทย์ด้าน Anti-aging & Regenerative Medicine"
        worksFor:
          "@id": "https://www.thrivewellnessth.com/#clinic"
        image: "https://www.thrivewellnessth.com/dr-chanakan-trangansri-thrive-400x400.jpg"
      - "@type": "MedicalTest"
        name: "Optimum Balance™ ตรวจฮอร์โมนเต็มระบบ"
        description: "โปรแกรมตรวจฮอร์โมนครอบคลุม ไทรอยด์ ต่อมหมวกไต ฮอร์โมนเพศ IGF-1 และความเสี่ยงหัวใจ พร้อม Personalized Vitamins 1 เดือน"
        relevantSpecialty: "Preventive Medicine"
        recognizingAuthority:
          "@id": "https://www.thrivewellnessth.com/#clinic"
      - "@type": "BreadcrumbList"
        itemListElement:
          - "@type": "ListItem"
            position: 1
            name: "หน้าแรก"
            item: "https://www.thrivewellnessth.com/"
          - "@type": "ListItem"
            position: 2
            name: "ตรวจสุขภาพ Check-up"
            item: "https://www.thrivewellnessth.com/check-up"
          - "@type": "ListItem"
            position: 3
            name: "Optimum Balance™"
            item: "https://www.thrivewellnessth.com/check-up/optimum-balance"
---
```

- [ ] **Step 2: Type-check + commit**

```bash
cd astro && npx astro check
git add astro/src/content/check-up/optimum-balance.mdx
git commit -m "feat(check-up): add Optimum Balance program page"
```

---

### Task 8: iconic-balance.mdx

**Files:**
- Create: `astro/src/content/check-up/iconic-balance.mdx`

- [ ] **Step 1: Create with frontmatter, then body via thrive-content-writer**

Source URL: https://www.thrivewellnessth.com/iconic-balance-check-up

```yaml
---
title: "Iconic Balance™"
category: balance
tagline: "โปรแกรม Premium สุดท้าย — ฮอร์โมนเต็มระบบ สารต้านอนุมูลอิสระ และคัดกรองมะเร็ง 5 ชนิด"
targetAudience:
  - "ต้องการตรวจสุขภาพเชิงลึกระดับ Longevity"
  - "มีประวัติครอบครัวเป็นมะเร็ง"
  - "ต้องการดูแลสุขภาพเชิงป้องกันขั้นสูง"
keyTests:
  - "ทุกอย่างใน Optimum Balance™"
  - "Vitamins A, C, E"
  - "Trace Minerals: Chromium, Zinc, Selenium, Copper"
  - "CoQ10 & Beta-carotene"
  - "Lycopene (สารต้านมะเร็ง)"
  - "Cancer Markers: CEA, AFP, CA125, PSA (ตับ, ลำไส้, เต้านม, รังไข่, ต่อมลูกหมาก)"
  - "ฟรี! Personalized Vitamins 1 เดือน"
seo:
  seoTitle: "Iconic Balance™ ตรวจสุขภาพ Premium คัดกรองมะเร็ง | Thrive Wellness Clinic ลาดพร้าว"
  description: "โปรแกรม Iconic Balance™ ตรวจฮอร์โมนเต็มระบบ สารต้านอนุมูลอิสระ และคัดกรองมะเร็ง 5 ชนิด — Thrive Wellness Clinic ลาดพร้าว"
  ogImage: "/check-up-iconic-balance-1200x630.jpg"
  ogLocale: "th_TH"
  canonicalPath: "/check-up/iconic-balance"
  noIndex: false
  hreflang:
    - lang: "th-TH"
      href: "https://www.thrivewellnessth.com/check-up/iconic-balance"
    - lang: "en"
      href: "https://www.thrivewellnessth.com/check-up/iconic-balance"
    - lang: "x-default"
      href: "https://www.thrivewellnessth.com/check-up/iconic-balance"
  geo:
    region: "TH-10"
    placename: "Bangkok, Lat Phrao, Thailand"
    position: "13.8207;100.5736"
    icbm: "13.8207, 100.5736"
  publishedAt: "2026-05-28"
  updatedAt: "2026-05-28"
  lastMedicalReview: "2026-05-28"
  reviewedBy: "พญ. ชนากานต์ ตระหง่านศรี"
  medicalSpecialty: "Preventive Medicine"
hero:
  headline: "ตรวจสุขภาพระดับ Longevity — ฮอร์โมน สารต้านอนุมูลอิสระ และมะเร็ง ครบในครั้งเดียว"
  subline: "Iconic Balance™ คือโปรแกรมสูงสุดของ Thrive ครอบคลุมทุกมิติของสุขภาพเชิงป้องกัน พร้อมแปลผลและวางแผนโดยแพทย์"
  image: "/check-up-iconic-balance-1200x630.jpg"
  imageAlt: "โปรแกรม Iconic Balance™ ตรวจสุขภาพ Premium Thrive Wellness Clinic"
  primaryBtn:
    label: "โทรนัดตรวจ 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
doctor:
  name: "พญ. ชนากานต์ ตระหง่านศรี"
  title: "Chanakan Trangansri, MD. (หมอนุ่น)"
  image: "/dr-chanakan-trangansri-thrive-400x400.jpg"
  imageAlt: "พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น Thrive Wellness Clinic"
  bio: "หมอนุ่นออกแบบ Iconic Balance™ สำหรับผู้ที่ต้องการภาพรวมสุขภาพที่ครบที่สุด — อ่านผลในมุม Longevity Medicine เพื่อวางแผนสุขภาพระยะยาว ไม่ใช่แค่ตรวจปีนี้แล้วรอปีหน้า"
  specializations:
    - "Anti-aging & Regenerative Medicine"
    - "Nutrition Wellness"
    - "Hormone Balance"
    - "Lifestyle Medicine"
    - "Chelation & Detoxification"
faqs:
  - q: "Cancer Markers ที่ตรวจในโปรแกรมนี้บ่งบอกว่าเป็นมะเร็งได้เลยไหม?"
    a: "Cancer Markers เป็นการคัดกรองความเสี่ยง ไม่ใช่การวินิจฉัยโรค ค่าสูงขึ้นบ่งชี้ว่าควรตรวจเพิ่มเติม แพทย์จะแปลผลร่วมกับอาการและประวัติครอบครัวเสมอ"
  - q: "Lycopene และ CoQ10 ตรวจแล้วรู้อะไร?"
    a: "Lycopene เป็นสารต้านอนุมูลอิสระที่สัมพันธ์กับความเสี่ยงมะเร็งต่อมลูกหมากและหัวใจ CoQ10 บ่งบอกประสิทธิภาพพลังงานเซลล์และสุขภาพหัวใจ ค่าต่ำมักพบในผู้ใช้ยา Statin"
  - q: "Iconic Balance™ เหมาะกับอายุเท่าไหร่?"
    a: "เหมาะสำหรับอายุ 40 ปีขึ้นไป หรือผู้ที่มีประวัติครอบครัวเป็นมะเร็ง เบาหวาน หรือโรคหัวใจ และต้องการตรวจป้องกันระดับสูงสุด"
cta:
  headline: "ตรวจสุขภาพที่ครบที่สุด เพื่อวางแผนสุขภาพระยะยาว"
  subline: "Thrive Wellness Clinic — The Crystal Park ชั้น 2 ลาดพร้าว เปิดทุกวัน 10:00–19:00"
  primaryBtn:
    label: "โทร 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
relatedPrograms:
  - title: "Optimum Balance™"
    href: "/check-up/optimum-balance"
    icon: "⚡"
    description: "ฮอร์โมนเต็มระบบ ไม่รวมมะเร็ง"
  - title: "NK Cell Activity"
    href: "/nk-cell"
    icon: "🛡️"
    description: "วัดภูมิคุ้มกันต้านมะเร็ง"
  - title: "Immune Check-up"
    href: "/check-up/immune-check-up"
    icon: "🔬"
    description: "CD Profile + ภูมิคุ้มกันโดยละเอียด"
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
          streetAddress: "199 ถนนประดิษฐ์มนูธรรม อาคาร B ชั้น 2 The Crystal Park"
          addressLocality: "ลาดพร้าว กรุงเทพฯ"
          postalCode: "10230"
          addressCountry: "TH"
        openingHours: "Mo-Su 10:00-19:00"
        medicalSpecialty: "Preventive Medicine"
      - "@type": "Person"
        "@id": "https://www.thrivewellnessth.com/#dr-chanakan"
        name: "พญ. ชนากานต์ ตระหง่านศรี"
        jobTitle: "แพทย์ด้าน Anti-aging & Regenerative Medicine"
        worksFor:
          "@id": "https://www.thrivewellnessth.com/#clinic"
        image: "https://www.thrivewellnessth.com/dr-chanakan-trangansri-thrive-400x400.jpg"
      - "@type": "MedicalTest"
        name: "Iconic Balance™ โปรแกรมตรวจสุขภาพ Premium"
        description: "โปรแกรมตรวจสุขภาพสูงสุด ครอบคลุมฮอร์โมนเต็มระบบ สารต้านอนุมูลอิสระ และ Cancer Markers 5 ชนิด"
        relevantSpecialty: "Preventive Medicine"
        recognizingAuthority:
          "@id": "https://www.thrivewellnessth.com/#clinic"
      - "@type": "BreadcrumbList"
        itemListElement:
          - "@type": "ListItem"
            position: 1
            name: "หน้าแรก"
            item: "https://www.thrivewellnessth.com/"
          - "@type": "ListItem"
            position: 2
            name: "ตรวจสุขภาพ Check-up"
            item: "https://www.thrivewellnessth.com/check-up"
          - "@type": "ListItem"
            position: 3
            name: "Iconic Balance™"
            item: "https://www.thrivewellnessth.com/check-up/iconic-balance"
---
```

- [ ] **Step 2: Type-check + commit**

```bash
cd astro && npx astro check
git add astro/src/content/check-up/iconic-balance.mdx
git commit -m "feat(check-up): add Iconic Balance program page"
```

---

### Tasks 9–13: Specialty Mirror Pages

For each of the 5 mirror programs (food-intolerance, hormones, dna-health-life, vitamins-and-micronutrients, urine-organic-test), the content closely mirrors the existing top-level service page but with:
- `canonicalPath` → `/check-up/[slug]`
- `hreflang` hrefs → `https://www.thrivewellnessth.com/check-up/[slug]`
- BreadcrumbList 3rd item → the `/check-up/[slug]` URL
- `relatedPrograms` linking to other `/check-up/` pages (not `relatedServices`)

**Task 9: food-intolerance.mdx**

Source: existing `astro/src/content/services/food-intolerance.mdx` + https://www.thrivewellnessth.com/food-intolerance

```yaml
---
title: "ตรวจภูมิแพ้อาหารแฝง IgG"
category: specialty
tagline: "ตรวจ IgG 216 ชนิด รู้ว่าอาหารอะไรที่ร่างกายคุณแพ้แบบไม่แสดงอาการทันที"
targetAudience:
  - "ผิวหนังอักเสบหรือสิวเรื้อรัง"
  - "ปวดหัว ท้องอืดบ่อยโดยไม่ทราบสาเหตุ"
  - "ต้องการลดน้ำหนักแต่ไม่ได้ผล"
keyTests:
  - "IgG Antibody Panel — 216 ชนิดอาหาร"
  - "ครอบคลุมเนื้อสัตว์ ผัก ผลไม้ ธัญพืช นม ถั่ว และเครื่องเทศ"
  - "รายงานผลแยกระดับความรุนแรง (Class 0–4)"
  - "คำแนะนำการปรับอาหารส่วนตัวจากแพทย์"
seo:
  seoTitle: "ตรวจภูมิแพ้อาหารแฝง IgG 216 ชนิด | Thrive Wellness Clinic ลาดพร้าว"
  description: "ตรวจ IgG Food Intolerance 216 ชนิด พร้อมแปลผลและวางแผนอาหารกับแพทย์ — Thrive Wellness Clinic ลาดพร้าว"
  ogImage: "/check-up-food-intolerance-1200x630.jpg"
  ogLocale: "th_TH"
  canonicalPath: "/check-up/food-intolerance"
  noIndex: false
  hreflang:
    - lang: "th-TH"
      href: "https://www.thrivewellnessth.com/check-up/food-intolerance"
    - lang: "en"
      href: "https://www.thrivewellnessth.com/check-up/food-intolerance"
    - lang: "x-default"
      href: "https://www.thrivewellnessth.com/check-up/food-intolerance"
  geo:
    region: "TH-10"
    placename: "Bangkok, Lat Phrao, Thailand"
    position: "13.8207;100.5736"
    icbm: "13.8207, 100.5736"
  publishedAt: "2026-05-28"
  updatedAt: "2026-05-28"
  lastMedicalReview: "2026-05-28"
  reviewedBy: "พญ. ชนากานต์ ตระหง่านศรี"
  medicalSpecialty: "Allergy and Immunology"
hero:
  headline: "อาหารที่กินทุกวัน อาจเป็นต้นเหตุของปัญหาเรื้อรังที่หาสาเหตุไม่ได้"
  subline: "ตรวจ IgG ภูมิแพ้อาหารแฝง 216 ชนิด ในการเจาะเลือดครั้งเดียว พร้อมแปลผลและวางแผนอาหารส่วนตัวกับแพทย์"
  image: "/check-up-food-intolerance-1200x630.jpg"
  imageAlt: "ตรวจภูมิแพ้อาหารแฝง IgG 216 ชนิด Thrive Wellness Clinic"
  primaryBtn:
    label: "โทรนัดตรวจ 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
doctor:
  name: "พญ. ชนากานต์ ตระหง่านศรี"
  title: "Chanakan Trangansri, MD. (หมอนุ่น)"
  image: "/dr-chanakan-trangansri-thrive-400x400.jpg"
  imageAlt: "พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น Thrive Wellness Clinic"
  bio: "หมอนุ่นแปลผล Food Intolerance ด้วยการวางแผนอาหารเฉพาะบุคคล ไม่ใช่แค่บอกว่า 'งดอาหารนี้' แต่ช่วยออกแบบมื้ออาหารที่สอดคล้องกับผลตรวจจริง"
  specializations:
    - "Nutrition Wellness"
    - "Anti-aging & Regenerative Medicine"
    - "Lifestyle Medicine"
faqs:
  - q: "IgG กับ IgE ต่างกันอย่างไร?"
    a: "IgE คือภูมิแพ้เฉียบพลัน — กินแล้วแพ้ทันที บวม คัน หายใจลำบาก IgG คือภูมิแพ้แฝง — อาการเกิดช้า 4–72 ชั่วโมง ยากจะเชื่อมโยงกับอาหารที่กิน"
  - q: "ต้องเตรียมตัวก่อนตรวจอย่างไร?"
    a: "ไม่ต้องอดอาหาร เพียงหยุดกินยา Antihistamine หรือ Corticosteroid ล่วงหน้า 7 วัน แจ้งแพทย์ก่อนตรวจ"
  - q: "ผลตรวจใช้เวลานานแค่ไหน?"
    a: "7–10 วันทำการ แพทย์นัดแปลผลและวางแผนอาหารหลังผลครบ"
cta:
  headline: "รู้ว่าอาหารอะไรที่ร่างกายคุณรับไม่ได้"
  subline: "Thrive Wellness Clinic — The Crystal Park ชั้น 2 ลาดพร้าว เปิดทุกวัน 10:00–19:00"
  primaryBtn:
    label: "โทร 095-934-9640"
    href: "tel:+66959349640"
  secondaryBtn:
    label: "LINE @thrivewellnessth"
    href: "https://line.me/R/ti/p/@thrivewellnessth"
relatedPrograms:
  - title: "Urine Organic Profile"
    href: "/check-up/urine-organic-test"
    icon: "🧪"
    description: "ตรวจการทำงานลำไส้เชิงลึก"
  - title: "Acne Solution"
    href: "/check-up/acne-solution"
    icon: "✨"
    description: "สิวเรื้อรังจากการอักเสบภายใน"
  - title: "Healthy Balance™"
    href: "/check-up/healthy-balance"
    icon: "🌿"
    description: "ตรวจสุขภาพ + วิตามินพื้นฐาน"
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
          streetAddress: "199 ถนนประดิษฐ์มนูธรรม อาคาร B ชั้น 2 The Crystal Park"
          addressLocality: "ลาดพร้าว กรุงเทพฯ"
          postalCode: "10230"
          addressCountry: "TH"
        openingHours: "Mo-Su 10:00-19:00"
        medicalSpecialty: "Allergy and Immunology"
      - "@type": "Person"
        "@id": "https://www.thrivewellnessth.com/#dr-chanakan"
        name: "พญ. ชนากานต์ ตระหง่านศรี"
        jobTitle: "แพทย์ด้าน Anti-aging & Regenerative Medicine"
        worksFor:
          "@id": "https://www.thrivewellnessth.com/#clinic"
        image: "https://www.thrivewellnessth.com/dr-chanakan-trangansri-thrive-400x400.jpg"
      - "@type": "MedicalTest"
        name: "Food Intolerance IgG Test 216 ชนิด"
        description: "การตรวจ IgG antibody สำหรับภูมิแพ้อาหารแฝง 216 ชนิด"
        relevantSpecialty: "Allergy and Immunology"
        recognizingAuthority:
          "@id": "https://www.thrivewellnessth.com/#clinic"
      - "@type": "BreadcrumbList"
        itemListElement:
          - "@type": "ListItem"
            position: 1
            name: "หน้าแรก"
            item: "https://www.thrivewellnessth.com/"
          - "@type": "ListItem"
            position: 2
            name: "ตรวจสุขภาพ Check-up"
            item: "https://www.thrivewellnessth.com/check-up"
          - "@type": "ListItem"
            position: 3
            name: "ตรวจภูมิแพ้อาหารแฝง IgG"
            item: "https://www.thrivewellnessth.com/check-up/food-intolerance"
---
```

Body: use thrive-content-writer, reference existing `/food-intolerance` MDX body + Wix source.

- [ ] **Type-check + commit after each mirror**

```bash
cd astro && npx astro check
git add astro/src/content/check-up/food-intolerance.mdx
git commit -m "feat(check-up): add Food Intolerance mirror page under /check-up"
```

---

**Tasks 10–13 follow the same pattern. Key frontmatter differences:**

**Task 10 — hormones.mdx**
- `title`: "ตรวจสมดุลฮอร์โมน"
- `category`: specialty
- `canonicalPath`: "/check-up/hormones"
- `ogImage`: "/check-up-hormones-1200x630.jpg"
- `keyTests`: ["Free T3, Free T4, TSH, Anti-TPO (ไทรอยด์เต็ม)", "Cortisol + DHEA-S (ต่อมหมวกไต)", "Estradiol, Testosterone, Progesterone", "IGF-1 (Growth Hormone marker)", "Parathyroid Hormone (PTH)", "Insulin", "รวม 18 ฮอร์โมน"]
- `targetAudience`: ["เหนื่อยเรื้อรัง อ้วนง่าย หลับยาก", "อารมณ์แปรปรวน ไม่ทราบสาเหตุ", "ผู้หญิงวัยก่อนหมดประจำเดือน"]
- Source: https://www.thrivewellnessth.com/hormones-quiz + existing hormones-quiz.mdx
- BreadcrumbList 3rd: `check-up/hormones`
- Commit: `"feat(check-up): add Hormones mirror page under /check-up"`

**Task 11 — dna-health-life.mdx**
- `title`: "DNA for Health & Life"
- `category`: specialty
- `canonicalPath`: "/check-up/dna-health-life"
- `ogImage`: "/check-up-dna-health-life-1200x630.jpg"
- `keyTests`: ["DNA for Health — 245 รายงาน (หัวใจ, มะเร็ง, ยา, โรคทั่วไป)", "DNA for Life — 79 รายงาน (โภชนาการ, กีฬา, ผิวพรรณ, ความเครียด)", "Bundle ทั้ง 2 ชุด — 324 รายงาน", "ผลใน 30 วัน + คำปรึกษาแพทย์ 1 ชั่วโมง"]
- `targetAudience`: ["ต้องการรู้ความเสี่ยงโรคจากพันธุกรรม", "อยากรู้ว่าอาหารและการออกกำลังกายแบบใดเหมาะกับ DNA ตัวเอง", "มีประวัติครอบครัวเป็นมะเร็งหรือโรคหัวใจ"]
- Source: https://www.thrivewellnessth.com/dna-health-life + existing dna-test.mdx
- BreadcrumbList 3rd: `check-up/dna-health-life`
- Commit: `"feat(check-up): add DNA Health & Life mirror page under /check-up"`

**Task 12 — vitamins-and-micronutrients.mdx**
- `title`: "ตรวจวิตามินและสารอาหาร"
- `category`: specialty
- `canonicalPath`: "/check-up/vitamins-and-micronutrients"
- `ogImage`: "/check-up-vitamins-and-micronutrients-1200x630.jpg"
- `keyTests`: ["วิตามิน A, C, D, E, B1, B2, B6, B12", "แร่ธาตุ: Magnesium, Zinc, Selenium, Copper", "สารต้านอนุมูลอิสระ: CoQ10, Lycopene, Beta-carotene", "ไม่ต้องอดอาหารก่อนตรวจ"]
- `targetAudience`: ["กินวิตามินอยู่แต่ไม่รู้ว่าถูกตัวไหม", "เหนื่อย ผมร่วง เล็บเปราะ ผิวแห้ง", "ต้องการ Baseline ก่อนเริ่มโปรแกรมเสริมวิตามิน"]
- Source: https://www.thrivewellnessth.com/vitamins-and-micronutrients + existing vitamins-and-micronutrients.mdx
- BreadcrumbList 3rd: `check-up/vitamins-and-micronutrients`
- Commit: `"feat(check-up): add Vitamins & Micronutrients mirror page under /check-up"`

**Task 13 — urine-organic-test.mdx**
- `title`: "Urine Organic Profile Test"
- `category`: specialty
- `canonicalPath`: "/check-up/urine-organic-test"
- `ogImage`: "/check-up-urine-organic-test-1200x630.jpg"
- `keyTests`: ["50+ กรดอินทรีย์ในปัสสาวะ", "Oxidative stress + Mitochondrial function", "Gut dysbiosis + Oxalate metabolism", "Neurotransmitter markers (Dopamine, Serotonin)", "Vitamin B status", "Detoxification & toxicant levels"]
- `targetAudience`: ["เหนื่อยเรื้อรัง น้ำหนักไม่ลด", "ปัญหาลำไส้ ย่อยอาหารไม่ดี", "อารมณ์ซึมเศร้า นอนไม่หลับ ไม่ทราบสาเหตุ"]
- Source: https://www.thrivewellnessth.com/urine-organic-test + existing urine-organic-test.mdx
- BreadcrumbList 3rd: `check-up/urine-organic-test`
- Commit: `"feat(check-up): add Urine Organic Test mirror page under /check-up"`

---

### Tasks 14–17: New Specialty Pages

For each new specialty page, invoke `thrive-content-writer` skill with the Wix source URL. The frontmatter keys follow the exact same shape as Tasks 9–13.

**Task 14 — heavy-metal-trace-elements.mdx**
- `title`: "Heavy Metal & Trace Elements"
- `category`: specialty
- `canonicalPath`: "/check-up/heavy-metal-trace-elements"
- `ogImage`: "/check-up-heavy-metal-trace-elements-1200x630.jpg"
- `keyTests`: ["Blood test: Lead, Cadmium, Arsenic, Mercury, Aluminum", "Urine Organic Test: Phthalates + detox toxicants", "Oligoscan: 21 แร่ธาตุ + 14 โลหะหนัก (4 จุดฝ่ามือ)", "ผลทันที (Oligoscan) หรือ 5–7 วันทำการ (เลือด/ปัสสาวะ)"]
- `targetAudience`: ["อยู่ในเมือง ใกล้โรงงาน หรือกินอาหารทะเลมาก", "ปวดหัวเรื้อรัง นอนไม่หลับ อ่อนเพลียไม่ทราบสาเหตุ", "ต้องการทำ Chelation Detox แต่ยังไม่รู้ว่ามีโลหะหนักสะสม"]
- Source: https://www.thrivewellnessth.com/heavy-metal-trace-elements-test
- BreadcrumbList 3rd: `check-up/heavy-metal-trace-elements`
- Commit: `"feat(check-up): add Heavy Metal & Trace Elements page"`

**Task 15 — acne-solution.mdx**
- `title`: "Acne Solution — Clear Skin Package"
- `category`: specialty
- `canonicalPath`: "/check-up/acne-solution"
- `ogImage`: "/check-up-acne-solution-1200x630.jpg"
- `keyTests`: ["IV Drip Skin Healing (ลดอักเสบ)", "IV Drip Skin Strength Booster (Detox + Cell Regeneration)", "ปรึกษาแพทย์ Anti-aging 30 นาที", "คอร์ส 5 ครั้งหรือครั้งเดียว"]
- `targetAudience`: ["สิวอักเสบเรื้อรัง สิวผู้ใหญ่", "สิวที่รักษาด้วยผลิตภัณฑ์ภายนอกแล้วไม่ดีขึ้น", "ต้องการรักษาจากสาเหตุภายใน (ลำไส้ + ฮอร์โมน)"]
- Source: https://www.thrivewellnessth.com/acne-solution
- BreadcrumbList 3rd: `check-up/acne-solution`
- Commit: `"feat(check-up): add Acne Solution page"`

**Task 16 — special-test.mdx**
- `title`: "Special Test"
- `category`: specialty
- `canonicalPath`: "/check-up/special-test"
- `ogImage`: "/check-up-special-test-1200x630.jpg"
- `keyTests`: ["Food Intolerance IgG (222 ชนิด)", "FIT 132 (Inflammation testing)", "Urine Organic Test", "Premium DNA Testing", "Vitamin & Antioxidants 20", "Vitamins 10 Profile", "Heavy Metal Test"]
- `targetAudience`: ["มีปัญหาสุขภาพเรื้อรังหลายอย่างพร้อมกัน", "ต้องการตรวจแบบ Comprehensive ในครั้งเดียว", "ไม่รู้ว่าควรตรวจอะไร แพทย์จะแนะนำ"]
- Source: https://www.thrivewellnessth.com/special-test
- BreadcrumbList 3rd: `check-up/special-test`
- Commit: `"feat(check-up): add Special Test page"`

**Task 17 — immune-check-up.mdx**
- `title`: "Immune Check-up"
- `category`: specialty
- `canonicalPath`: "/check-up/immune-check-up"
- `ogImage`: "/check-up-immune-check-up-1200x630.jpg"
- `keyTests`: ["CD Profile (การทำงานเม็ดเลือดขาวโดยละเอียด)", "CBC (ความสมบูรณ์ของเลือด)", "Vitamin D3 (สนับสนุนภูมิคุ้มกัน)"]
- `targetAudience`: ["ป่วยบ่อย หวัดซ้ำ ภูมิคุ้มกันต่ำ", "มีโรคภูมิแพ้หรือภูมิแพ้ตัวเอง (Autoimmune)", "ต้องการรู้สถานะภูมิคุ้มกันก่อนเริ่มโปรแกรมเสริมภูมิ"]
- Source: https://www.thrivewellnessth.com/package-immune-screening
- BreadcrumbList 3rd: `check-up/immune-check-up`
- Commit: `"feat(check-up): add Immune Check-up page"`

---

## Task 18: Update check-up index page

**Files:**
- Modify: `astro/src/pages/check-up.astro`
- Modify: `astro/src/content/services/check-up.mdx` (remove old 3-package section)

- [ ] **Step 1: Remove the old 3-package section from check-up.mdx**

In `astro/src/content/services/check-up.mdx`, delete lines 206–269 (the entire `{/* Packages */}` section from `<section class="section" style="background:var(--blue-xl)">` through its closing `</section>`). The "Why Thrive", "Who should check-up", "Process", mid-CTA, and references sections remain.

- [ ] **Step 2: Add getCollection import and programs grid to check-up.astro**

At the top of `astro/src/pages/check-up.astro`, add this import after the existing imports:

```typescript
import { getCollection } from 'astro:content';
```

Before the `const entry = await getEntry(...)` line, add:

```typescript
const allPrograms = await getCollection('checkUpPrograms');
const balancePrograms = allPrograms
  .filter(p => p.data.category === 'balance')
  .sort((a, b) => ['young-balance','healthy-balance','optimum-balance','iconic-balance'].indexOf(a.id) - ['young-balance','healthy-balance','optimum-balance','iconic-balance'].indexOf(b.id));
const specialtyPrograms = allPrograms.filter(p => p.data.category === 'specialty');
```

- [ ] **Step 3: Insert programs grid section into the page template**

In `check-up.astro`, after `<Content />` and before `<FAQSection ...>`, insert:

```astro
<section class="section" style="background:var(--blue-xl)">
  <div class="container">
    <div class="section-label" style="color:var(--blue)">โปรแกรมตรวจสุขภาพ</div>
    <h2 class="section-title">เลือกโปรแกรมที่เหมาะกับคุณ</h2>

    <h3 style="font-size:1rem;color:var(--blue-d);margin:32px 0 16px;">Balance Check-up Programs</h3>
    <div class="related-services__grid">
      {balancePrograms.map((p) => (
        <ServiceCard
          title={p.data.title}
          href={`/check-up/${p.id}`}
          description={p.data.tagline}
        />
      ))}
    </div>

    <h3 style="font-size:1rem;color:var(--blue-d);margin:32px 0 16px;">Specialty Tests</h3>
    <div class="related-services__grid">
      {specialtyPrograms.map((p) => (
        <ServiceCard
          title={p.data.title}
          href={`/check-up/${p.id}`}
          description={p.data.tagline}
        />
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Type-check**

```bash
cd astro && npx astro check
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add astro/src/pages/check-up.astro astro/src/content/services/check-up.mdx
git commit -m "feat(check-up): redesign index to show all programs grid"
```

---

## Task 19: Final build verification

- [ ] **Step 1: Full build**

```bash
cd astro && npm run build
```
Expected: build completes with no errors. Check terminal output for any type errors or missing content warnings.

- [ ] **Step 2: Verify all 13 routes exist in dist**

```bash
ls astro/dist/check-up/
```
Expected output includes: `index.html`, `young-balance/`, `healthy-balance/`, `optimum-balance/`, `iconic-balance/`, `food-intolerance/`, `hormones/`, `dna-health-life/`, `vitamins-and-micronutrients/`, `urine-organic-test/`, `heavy-metal-trace-elements/`, `acne-solution/`, `special-test/`, `immune-check-up/`

- [ ] **Step 3: Preview and spot-check**

```bash
cd astro && npm run preview
```

Open in browser:
- `http://localhost:4321/check-up` — should show programs grid with two groups
- `http://localhost:4321/check-up/young-balance` — should render hero, summary card, content, no price (draft), doctor, FAQ, related programs
- `http://localhost:4321/check-up/iconic-balance` — same structure
- `http://localhost:4321/check-up/food-intolerance` — specialty mirror page

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(check-up): complete 13 check-up program pages under /check-up/[slug]"
```
