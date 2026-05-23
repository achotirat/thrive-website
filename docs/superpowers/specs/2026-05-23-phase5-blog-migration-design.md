# Phase 5 — Tier B Blog Migration Design

**Date:** 2026-05-23
**Branch:** feature/phase5-blog-migration
**Status:** Approved — ready for implementation

---

## 1. Goal

Migrate Thrive Wellness Center's Tier B blog posts (70 posts) from static HTML reference files into the live Astro site, powered by Sanity CMS. Deliver a `/blog` listing page with category filters and individual `/blog/[slug]` post pages, with automatic 301 redirects from the old Wix `/post/[slug]` URLs.

Exit criteria: top 10 posts live on Astro at `/blog/[slug]`, redirects working, Sanity schema stable, pipeline proven for remaining 60 posts.

---

## 2. Architecture

```
Sanity Content Lake (project fc8ot1td, dataset production)
        │ blogPost documents
        ▼
@sanity/astro loader  ──► content.config.ts  ──► getCollection('blogPosts')
        │
        ├── src/pages/blog/index.astro       → /blog (grid + category filter)
        ├── src/pages/blog/[slug].astro      → /blog/chili, /blog/zinc-checklist …
        └── src/pages/post/[slug].astro      → 301 redirect to /blog/[slug]
```

- Sanity project `fc8ot1td` (existing) gets a `blogPost` document type added to its schema
- `@sanity/astro` loader fetches all posts at build time; Zod validates each document
- Listing and detail pages are new; redirect shim covers all Wix backlink URLs automatically

---

## 3. Sanity Schema — `blogPost`

```js
// sanity/schemas/blogPost.js
{
  name: 'blogPost',
  type: 'document',
  fields: [
    { name: 'slug',           type: 'slug',     validation: Rule => Rule.required().unique() },
    { name: 'title',          type: 'string',   validation: Rule => Rule.required() },
    { name: 'excerpt',        type: 'text',     rows: 3 },
    { name: 'heroImage',      type: 'image',    options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string' }] },
    { name: 'category',       type: 'string',
      options: { list: [
        'ฮอร์โมน', 'โภชนาการ', 'สุขภาพจิต',
        'ภูมิคุ้มกัน', 'ผิวหนัง', 'ระบบย่อยอาหาร',
        'หัวใจและหลอดเลือด', 'สตรีสุขภาพ'
      ]}},
    { name: 'body',           type: 'array', of: [{ type: 'block' }, { type: 'image' }] },
    { name: 'seoTitle',       type: 'string' },
    { name: 'seoDescription', type: 'string',   validation: Rule => Rule.max(160) },
    { name: 'publishedAt',    type: 'datetime' },
    { name: 'updatedAt',      type: 'datetime' },
    { name: 'reviewedBy',     type: 'string' },
    { name: 'noIndex',        type: 'boolean',  initialValue: false },
    { name: 'faqs',           type: 'array',
      of: [{ type: 'object', fields: [
        { name: 'question', type: 'string' },
        { name: 'answer',   type: 'text' }
      ]}]},
    { name: 'relatedPosts',   type: 'array', of: [{ type: 'reference', to: [{ type: 'blogPost' }] }] },
  ]
}
```

---

## 4. Astro Integration

### Environment variables

```
# .env.local (dev) and Netlify env vars (prod)
PUBLIC_SANITY_PROJECT_ID=fc8ot1td
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=<read-only token>   # server-only, never PUBLIC_*
```

### content.config.ts addition

```ts
import { sanityLoader } from '@sanity/astro/loader'

const blogPostsCollection = defineCollection({
  loader: sanityLoader({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
    dataset:   import.meta.env.PUBLIC_SANITY_DATASET,
    query: `*[_type == "blogPost"] | order(publishedAt desc)`,
  }),
  schema: z.object({
    slug:           z.object({ current: z.string() }),
    title:          z.string(),
    excerpt:        z.string(),
    heroImage:      z.object({ asset: z.any(), alt: z.string() }),
    category:       z.string(),
    body:           z.array(z.any()),
    seoTitle:       z.string(),
    seoDescription: z.string().max(160),
    publishedAt:    z.coerce.date(),
    updatedAt:      z.coerce.date(),
    reviewedBy:     z.string(),
    noIndex:        z.boolean().default(false),
    faqs:           z.array(z.object({ question: z.string(), answer: z.string() })),
  }),
})

export const collections = {
  services:  servicesCollection,  // existing
  blogPosts: blogPostsCollection, // new
}
```

### New packages

```bash
npm install @sanity/astro @sanity/client @portabletext/to-html
```

---

## 5. New Files

| File | Purpose |
|------|---------|
| `astro/src/pages/blog/index.astro` | `/blog` listing page — card grid + category filter |
| `astro/src/pages/blog/[slug].astro` | `/blog/[slug]` detail page |
| `astro/src/pages/post/[slug].astro` | 301 redirect shim from Wix URLs |
| `astro/src/layouts/BlogPostLayout.astro` | Wraps BaseLayout; adds blog-specific header/footer |
| `astro/src/components/BlogCard.astro` | Card used on listing page |
| `astro/src/components/PortableTextRenderer.astro` | Converts Sanity Portable Text → HTML |
| `astro/src/components/CategoryFilter.astro` | Client-side filter buttons for listing page |
| `sanity/schemas/blogPost.js` | Sanity document type definition |

---

## 6. Page Designs

### `/blog` listing

- Breadcrumb: Home → บทความ
- H1: "บทความสุขภาพ"
- Category filter bar (8 categories + "ทั้งหมด") — client-side, no JS framework
- Card grid (3 columns desktop, 2 tablet, 1 mobile)
- Each card: hero image, category badge, title, excerpt (2 lines), read-more link
- SEO: `<title>บทความสุขภาพ | Thrive Wellness Center</title>`

### `/blog/[slug]` detail

Render order:
1. Hero image (full-width)
2. Category badge + title (H1)
3. Published / updated date + reviewed-by line
4. `DoctorAttribution` component (existing)
5. Portable Text body (headings, paragraphs, tables, card grids)
6. `FAQSection` component (existing, fed from `faqs` field)
7. CTA section (existing `CTASection` component)

Schema.org: `Article` JSON-LD via existing `JsonLd.astro`.

### `/post/[slug]` redirect

```astro
---
export async function getStaticPaths() {
  const posts = await getCollection('blogPosts')
  return posts.map(p => ({
    params: { slug: p.data.slug.current },
    props:  { target: `/blog/${p.data.slug.current}` },
  }))
}
const { target } = Astro.props
return Astro.redirect(target, 301)
---
```

---

## 7. Pilot Batch — Top 10 Posts

| # | Title | New slug | Traffic/mo | Backlinks | Source HTML |
|---|-------|----------|----------:|----------:|-------------|
| 1 | ประโยชน์ของพริก | `chili` | 1,771 | — | `blog-chili.html` |
| 2 | คุณรู้จักแร่ธาตุดีแค่ไหน? | `minerals` | 1,077 | — | `blog-minerals.html` |
| 3 | แอปเปิ้ลแดง Vs แอปเปิ้ลเขียว | `apple-benefit` | 1,046 | 3 | `blog-apple-benefit.html` |
| 4 | ประจำเดือนไม่มาเกิน 3 เดือน? | `abnormal-period` | 675 | 171 | `blog-abnormal-period.html` |
| 5 | 7 อาการสุดทนของมนุษย์เมนส์ | `periodpain` | 399 | — | `blog-periodpain.html` |
| 6 | เพราะชีวิตขาด Zinc ไม่ได้ | `zinc-checklist` | 340 | — | `blog-zinc.html` |
| 7 | ป่วยง่าย ป่วยบ่อย วิตามินตัวไหนดี? | `immunity` | 301 | — | `blog-immunity.html` |
| 8 | Growth factor คืออะไร | `growth-factor` | 281 | — | `blog-growth-factor.html` |
| 9 | Smiling Depression รอยยิ้มหน้ากาก | `smiling-depression` | 245 | 4 | `blog-smiling-depression.html` |
| 10 | Glutathione กลูตาไธโอน | `glutathione` | 214 | 3 | `blog-glutathione.html` |

All source files are in `new html from vkasama/blog-tierB-bucket1/`.

**Migration process per post:**
1. Parse HTML → extract title, excerpt, hero image filename, category, body blocks, FAQs
2. Create `blogPost` document in Sanity Studio
3. Verify `/blog/[slug]` renders correctly against the HTML reference
4. Confirm `/post/[old-wix-slug]` 301-redirects to `/blog/[slug]`

---

## 8. Out of Scope (Phase 5)

- Netlify build webhook triggered by Sanity publish (add in Phase 6)
- Testimonials and doctors Sanity schemas (separate task)
- Remaining 60 posts (follow same pipeline after pilot passes)
- Sanity Studio deployment (use local Studio for now)
