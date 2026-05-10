# Design: Phase 1 Content Components
**Date:** 2026-05-10  
**Branch:** `feature/phase1-content-components`  
**Author:** Satemshi + AI  
**Status:** Approved

---

## Overview

Build the reusable Astro component layer and content collection schema that Tier A service pages need. Port `food-intolerance.html` to Astro as the first real end-to-end page, proving all components work together before Phase 2 begins.

Approach: **Hybrid — prop-driven components + Astro content collections.** Components accept typed props (flexible, reusable). Content collection defines a Zod schema as the contract for all Tier A pages. `food-intolerance.astro` queries the collection and assembles components.

---

## Section 1 — Component Architecture

All components live in `astro/src/components/`. Each accepts typed TypeScript props in its frontmatter — no global state.

| Component | Key Props | Purpose |
|---|---|---|
| `SEO.astro` | seoTitle, description, canonical, ogImage, ogLocale, hreflang[], geo, heroImage, noIndex, publishedAt, updatedAt, lastMedicalReview, reviewedBy, medicalSpecialty, jsonLd[] | All `<head>` SEO tags. Emits `<link rel="preload">` for hero image. Handles noIndex flag. |
| `JsonLd.astro` | schema: object | Renders `<script type="application/ld+json">` |
| `ServiceHero.astro` | headline, subline, image, imageAlt, primaryBtn, secondaryBtn?, stats[]? | Renders the only `<h1>` on the page. Hero image with `fetchpriority="high"`. |
| `LeadForm.astro` | serviceSlug, formTitle? | POST → `/api/leads` with UTM/click ID capture. Redirects to `/thank-you?service={slug}` on success. Turnstile placeholder. |
| `CTASection.astro` | headline, subline?, primaryBtn, secondaryBtn? | Mid-page CTA block. Buttons carry `data-gtm-event="cta_click"`. |
| `FAQSection.astro` | items: {q, a}[] | Accordion. Questions are `<h3>`. JSON-LD ready (FAQPage schema passed via SEO component). |
| `DoctorAttribution.astro` | doctor: {name, title, image, imageAlt, bio, specializations[]} | Doctor trust section. Image alt must include keyword. |
| `ServiceCard.astro` | title, href, icon?, description? | Related services card. Native `<a>` tags for crawlability. |
| `Breadcrumbs.astro` | crumbs: {label, href}[] | Visible breadcrumb nav. Must always match BreadcrumbList JSON-LD passed to SEO component. |

---

## Section 2 — Content Collection Schema

**File:** `astro/src/content/config.ts`  
**Collection name:** `services`

```typescript
const servicesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    seo: z.object({
      seoTitle: z.string(),           // <title> tag — may differ from hero.headline
      description: z.string().max(160),
      ogImage: z.string(),
      ogLocale: z.string().default('th_TH'),
      canonicalPath: z.string(),
      noIndex: z.boolean().default(false),
      hreflang: z.array(z.object({ lang: z.string(), href: z.string() })),
      geo: z.object({
        region: z.string(),           // "TH-10"
        placename: z.string(),        // "Bangkok, Thailand"
        position: z.string(),         // "13.7563;100.5018"
        icbm: z.string(),             // "13.7563, 100.5018"
      }),
      publishedAt: z.date(),
      updatedAt: z.date(),
      lastMedicalReview: z.date(),
      reviewedBy: z.string(),
      medicalSpecialty: z.string(),   // "Allergy", "FunctionalMedicine", etc.
    }),
    hero: z.object({
      headline: z.string(),           // renders as <h1>
      subline: z.string(),
      image: z.string(),
      imageAlt: z.string(),           // must include primary keyword
      primaryBtn: z.object({ label: z.string(), href: z.string() }),
      secondaryBtn: z.object({ label: z.string(), href: z.string() }).optional(),
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
      primaryBtn: z.object({ label: z.string(), href: z.string() }),
      secondaryBtn: z.object({ label: z.string(), href: z.string() }).optional(),
    }),
    relatedServices: z.array(z.object({
      title: z.string(),
      href: z.string(),
      icon: z.string().optional(),
    })),
    jsonLd: z.array(z.record(z.unknown())), // raw schema objects
  }),
});
```

**MDX body** contains long-form HTML sections (symptom grids, comparison tables, step-by-step, package details, scientific references). All section headings must be `## (H2)` — never H1.

**First entry:** `astro/src/content/services/food-intolerance.mdx`

---

## Section 3 — LeadForm & GTM Hooks

### LeadForm flow

```
User submits form
  → client JS reads from sessionStorage (set on first page load):
    utm_source, utm_medium, utm_campaign, utm_term, utm_content,
    gclid, fbclid, wbraid, gbraid, landing_page, referrer
  → POST /api/leads { name, phone, line_id, service_interest, message,
    utm_*, gclid, fbclid, wbraid, gbraid, landing_page, referrer,
    consent_at, consent_version }
  → success: redirect → /thank-you?service={slug}
  → error: show inline error, stay on page
```

**Form fields:** ชื่อ, เบอร์โทร, LINE ID (optional), บริการที่สนใจ (dropdown), ข้อความ (optional), consent checkbox (PDPA required)

**Turnstile:** `<div class="cf-turnstile" data-sitekey={PUBLIC_TURNSTILE_SITE_KEY}>` — skipped gracefully if env key absent (local dev safe)

**`/thank-you` page:** Static Astro page, `noIndex: true`. Fires `lead_submit` to GTM dataLayer on load. Google Ads uses this URL as conversion goal (more reliable than event-only tracking).

### GTM dataLayer hooks

Global script in `BaseLayout.astro` listens for `data-gtm-event` attributes and pushes to `window.dataLayer`.

| Event | Trigger | Component |
|---|---|---|
| `content_view` | page load | BaseLayout |
| `content_engaged` | scroll ≥ 50% | BaseLayout |
| `form_start` | first field focus | LeadForm |
| `lead_submit` | /thank-you page load | thank-you.astro |
| `cta_click` | button click | CTASection, Header |
| `faq_expand` | accordion open | FAQSection |
| `line_click` | LINE CTA click | LeadForm, CTASection |
| `call_click` | tel: link click | Header, CTASection |

---

## Section 4 — food-intolerance Astro Page

**Files:**
- `astro/src/content/services/food-intolerance.mdx` — frontmatter + MDX body
- `astro/src/pages/food-intolerance.astro` — queries collection, assembles components

**Page assembly:**

```astro
---
const entry = await getEntry('services', 'food-intolerance');
const { Content } = await entry.render();
const d = entry.data;
---

<BaseLayout>
  <SEO seoTitle={d.seo.seoTitle} heroImage={d.hero.image} ... />
  <Header />
  <Breadcrumbs crumbs={[
    { label: 'หน้าแรก', href: '/' },
    { label: 'ตรวจภูมิแพ้อาหารแฝง', href: '/food-intolerance' },
  ]} />
  <ServiceHero headline={d.hero.headline} image={d.hero.image} ... />
  <Content />   <!-- H2 sections: symptoms, IgE/IgG table, process, package, references -->
  <FAQSection items={d.faqs} />
  <DoctorAttribution doctor={d.doctor} />
  <CTASection {...d.cta} />
  <LeadForm serviceSlug="food-intolerance" />
  <Footer />
</BaseLayout>
```

**SEO rules enforced by structure:**
- Only `ServiceHero` renders `<h1>` — enforced by component design
- MDX body headings are `## (H2)` only — convention documented in MDX file header
- `seoTitle` (title tag) is separate from `hero.headline` (H1) — different strings allowed
- Hero image gets `fetchpriority="high"` + `<link rel="preload">` via SEO component
- URL is `/food-intolerance` — direct page file, no nested routing
- BreadcrumbList JSON-LD passed in `jsonLd[]` must match visible `<Breadcrumbs>` crumbs

---

## Section 5 — Exit Criteria & Verification

### Build checks (required before PR)

```bash
cd astro
npx astro check    # 0 TypeScript errors
npm run build      # clean build, no broken imports
```

### SEO verification (manual)

| Check | Tool | Pass condition |
|---|---|---|
| JSON-LD valid | schema.org Rich Results Test | FAQPage, MedicalClinic, BreadcrumbList valid |
| Canonical + og:url match | View source | Identical URL, no trailing slash mismatch |
| H1 count | Browser DevTools | Exactly 1 per page |
| Hero image preload | Lighthouse / Network tab | `<link rel="preload">` present, LCP ≤ 2.5s target |
| noIndex on staging | View source | `<meta name="robots" content="noindex">` present |
| Hreflang complete | View source | th-TH, en, x-default all present |
| food-intolerance in sitemap | `/sitemap-index.xml` | URL present |

### Functional verification

- LeadForm submit → Supabase record created with UTM fields populated
- Redirect → `/thank-you?service=food-intolerance` after successful submit
- GTM: `content_view`, `cta_click`, `lead_submit` appear in browser dataLayer

### Branch exit criteria (per PHASE1_PARALLEL_WORK.md)

- [ ] All 9 components render in Astro without errors (SEO, JsonLd, ServiceHero, LeadForm, CTASection, FAQSection, DoctorAttribution, ServiceCard, Breadcrumbs)
- [ ] Content collection schema defined in `config.ts`
- [ ] `food-intolerance.astro` builds and passes SEO checks
- [ ] Homepage (`index.astro`) uses `Header`, `Footer`, `CTASection`
- [ ] Content/Sanity boundary documented in `sanity/README.md`
- [ ] `PHASE1_STATUS.md` updated

---

## Sanity Boundary

Tier A service pages (including `food-intolerance`) stay in Astro content collections / MDX for now. Sanity is not required for this branch.

Tier B content (blog posts, testimonials, doctors, FAQs) will move to Sanity after Tier A pages are stable — tracked in Phase 5.

Leads and workflow data remain in Supabase only — never Sanity.

Document the integration boundary in `sanity/README.md`.

---

## Write Scope

Per `PHASE1_PARALLEL_WORK.md` — Branch B owns:
- `astro/src/components/*`
- `astro/src/content/*`
- `astro/src/pages/*` (food-intolerance.astro, thank-you.astro, dev pages only)
- `astro/src/styles/global.css` (component styles only)
- `sanity/README.md`
- `PHASE1_STATUS.md`
- This spec

**Do not touch:** `netlify.toml`, `.github/workflows/`, Phase 0 API functions (unless LeadForm needs a `/api/leads` contract fix).
