# Phase 5 Blog Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Sanity CMS blog posts into Astro 6, serving `/blog/[slug]` detail pages, a `/blog` listing page with category filters, and `/post/[slug]` 301 redirects — then manually enter the top 10 pilot posts into Sanity Studio.

**Architecture:** A custom Astro content loader fetches all `blogPost` documents from Sanity at build time, exposing them via `getCollection('blogPosts')`. A `PortableTextRenderer` component converts Sanity Portable Text to HTML. The redirect shim uses `Astro.redirect(url, 301)` in `getStaticPaths`.

**Tech Stack:** Astro 6, `@sanity/client` 6+, `@sanity/image-url`, `@portabletext/to-html`, Sanity Studio (project `fc8ot1td`, dataset `production`), `thrive-styles.css` class names throughout.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `sanity/schemaTypes/documents/blogPost.ts` | Add `category` field |
| Create | `astro/src/lib/sanity.ts` | Sanity client + `urlFor` image builder |
| Create | `astro/src/lib/portableTextToHtml.ts` | Portable Text → HTML string |
| Create | `astro/src/lib/sanityBlogLoader.ts` | Astro content loader (GROQ fetch) |
| Modify | `astro/src/content.config.ts` | Add `blogPosts` collection |
| Create | `astro/src/components/BlogCard.astro` | Card for listing page |
| Create | `astro/src/components/CategoryFilter.astro` | Client-side category filter |
| Create | `astro/src/pages/blog/index.astro` | `/blog` listing |
| Create | `astro/src/layouts/BlogPostLayout.astro` | Blog post page layout |
| Create | `astro/src/pages/blog/[slug].astro` | `/blog/[slug]` detail |
| Create | `astro/src/pages/post/[slug].astro` | `/post/[slug]` 301 redirect |

---

## Task 1: Add `category` field to Sanity blogPost schema

**Files:**
- Modify: `sanity/schemaTypes/documents/blogPost.ts`

- [ ] **Step 1: Open the file and add the category field**

Insert the following `defineField` block **after the `slug` field** (around line 20, after the slug closing brace):

```ts
defineField({
  name: 'category',
  title: 'Category',
  type: 'string',
  options: {
    list: [
      {title: 'ฮอร์โมน', value: 'ฮอร์โมน'},
      {title: 'โภชนาการ', value: 'โภชนาการ'},
      {title: 'สุขภาพจิต', value: 'สุขภาพจิต'},
      {title: 'ภูมิคุ้มกัน', value: 'ภูมิคุ้มกัน'},
      {title: 'ผิวหนัง', value: 'ผิวหนัง'},
      {title: 'ระบบย่อยอาหาร', value: 'ระบบย่อยอาหาร'},
      {title: 'หัวใจและหลอดเลือด', value: 'หัวใจและหลอดเลือด'},
      {title: 'สตรีสุขภาพ', value: 'สตรีสุขภาพ'},
    ],
    layout: 'radio',
  },
  validation: (Rule) => Rule.required(),
}),
```

- [ ] **Step 2: Verify Sanity Studio picks up the change**

```bash
cd sanity && npx sanity@latest dev
```

Open `http://localhost:3333`, open any `blogPost` document, and confirm the **Category** radio field appears.

- [ ] **Step 3: Commit**

```bash
git add sanity/schemaTypes/documents/blogPost.ts
git commit -m "feat(sanity): add category field to blogPost schema"
```

---

## Task 2: Install packages and configure environment

**Files:**
- Modify: `astro/package.json` (via npm install)
- Create: `astro/.env.local` (gitignored — do NOT commit)

- [ ] **Step 1: Install Sanity and Portable Text packages**

```bash
cd astro
npm install @sanity/client @sanity/image-url @portabletext/to-html
```

Expected output: 3 packages added, no peer dependency warnings.

- [ ] **Step 2: Create `.env.local`**

Create `astro/.env.local` with the following content (Satemshi can provide the read-only API token if the dataset requires authentication — for `production` public datasets, the token can be omitted):

```
PUBLIC_SANITY_PROJECT_ID=fc8ot1td
PUBLIC_SANITY_DATASET=production
# SANITY_API_TOKEN=<read-only-token>   # uncomment if dataset is private
```

Confirm `astro/.gitignore` includes `.env*` (Astro's default `.gitignore` already does this).

- [ ] **Step 3: Commit package changes only**

```bash
git add astro/package.json astro/package-lock.json
git commit -m "feat(astro): install @sanity/client, @sanity/image-url, @portabletext/to-html"
```

---

## Task 3: Create Sanity utilities

**Files:**
- Create: `astro/src/lib/sanity.ts`
- Create: `astro/src/lib/portableTextToHtml.ts`

- [ ] **Step 1: Create `astro/src/lib/sanity.ts`**

```ts
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: any) {
  return builder.image(source)
}
```

- [ ] **Step 2: Create `astro/src/lib/portableTextToHtml.ts`**

```ts
import { toHTML } from '@portabletext/to-html'
import { urlFor } from './sanity'

const components = {
  block: {
    h2: ({ children }: any) => `<h2>${children}</h2>`,
    h3: ({ children }: any) => `<h3>${children}</h3>`,
    h4: ({ children }: any) => `<h4>${children}</h4>`,
    blockquote: ({ children }: any) => `<blockquote><p>${children}</p></blockquote>`,
    normal: ({ children }: any) => `<p>${children}</p>`,
  },
  list: {
    bullet: ({ children }: any) => `<ul>${children}</ul>`,
    number: ({ children }: any) => `<ol>${children}</ol>`,
  },
  listItem: {
    bullet: ({ children }: any) => `<li>${children}</li>`,
    number: ({ children }: any) => `<li>${children}</li>`,
  },
  marks: {
    strong: ({ children }: any) => `<strong>${children}</strong>`,
    em: ({ children }: any) => `<em>${children}</em>`,
    link: ({ children, value }: any) => {
      const rel = value?.rel ? ` rel="${value.rel}"` : ''
      const target = value?.openInNewTab ? ' target="_blank" rel="noopener"' : ''
      return `<a href="${value?.href ?? '#'}"${rel}${target}>${children}</a>`
    },
  },
  types: {
    imageWithAlt: ({ value }: any) => {
      if (!value?.asset) return ''
      const src = urlFor(value).width(900).auto('format').url()
      const alt = value?.alt ?? ''
      return `<figure class="blog-figure"><img src="${src}" alt="${alt}" loading="lazy" width="900" /></figure>`
    },
  },
}

export function portableTextToHtml(blocks: any[]): string {
  if (!blocks || blocks.length === 0) return ''
  return toHTML(blocks, { components } as any)
}
```

- [ ] **Step 3: Commit**

```bash
git add astro/src/lib/sanity.ts astro/src/lib/portableTextToHtml.ts
git commit -m "feat(astro): add Sanity client and Portable Text utilities"
```

---

## Task 4: Create Sanity blog loader and update `content.config.ts`

**Files:**
- Create: `astro/src/lib/sanityBlogLoader.ts`
- Modify: `astro/src/content.config.ts`

- [ ] **Step 1: Create `astro/src/lib/sanityBlogLoader.ts`**

```ts
import { createClient } from '@sanity/client'
import type { Loader } from 'astro/loaders'

const GROQ = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  category,
  publishedAt,
  updatedAt,
  mainImage,
  "authorName": author->name,
  "authorTitle": author->title,
  keyTakeaways,
  body,
  faq[] {
    question,
    shortAnswer
  },
  seo {
    seoTitle,
    seoDescription,
    noIndex,
    canonicalUrl
  }
}`

export function sanityBlogLoader(): Loader {
  return {
    name: 'sanity-blog',
    load: async ({ store, logger }: any) => {
      const client = createClient({
        projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
        dataset: import.meta.env.PUBLIC_SANITY_DATASET,
        apiVersion: '2024-01-01',
        useCdn: true,
      })

      const posts: any[] = await client.fetch(GROQ)
      store.clear()

      for (const post of posts) {
        store.set({ id: post.slug.current, data: post })
      }

      logger.info(`Loaded ${posts.length} blog posts from Sanity`)
    },
  }
}
```

- [ ] **Step 2: Add `blogPosts` collection to `astro/src/content.config.ts`**

Add the following import at the top of the file (after the existing imports):

```ts
import { sanityBlogLoader } from './src/lib/sanityBlogLoader'
```

Then add the collection definition (insert after `servicesCollection` but before `export const collections`):

```ts
const blogPostsCollection = defineCollection({
  loader: sanityBlogLoader(),
  schema: z.object({
    _id: z.string(),
    title: z.string(),
    slug: z.object({ current: z.string() }),
    excerpt: z.string().optional().default(''),
    category: z.string().optional().default(''),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    mainImage: z.any().optional(),
    authorName: z.string().optional(),
    authorTitle: z.string().optional(),
    keyTakeaways: z.array(z.string()).optional().default([]),
    body: z.array(z.any()).optional().default([]),
    faq: z.array(z.object({
      question: z.string(),
      shortAnswer: z.string().optional().default(''),
    })).optional().default([]),
    seo: z.object({
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      noIndex: z.boolean().optional().default(false),
      canonicalUrl: z.string().optional(),
    }).optional(),
  }),
})
```

Update the export:

```ts
export const collections = {
  services: servicesCollection,
  blogPosts: blogPostsCollection,
}
```

- [ ] **Step 3: Verify Astro can resolve the types**

```bash
cd astro && npx astro check
```

Expected: 0 errors. If you see "Cannot find module" for `@sanity/client`, run `npm install` again.

- [ ] **Step 4: Verify build with zero Sanity docs (collection will be empty)**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds; `blog posts` count = 0 (Sanity is empty at this point — that's fine).

- [ ] **Step 5: Commit**

```bash
git add astro/src/lib/sanityBlogLoader.ts astro/src/content.config.ts
git commit -m "feat(astro): add Sanity blogPosts content collection"
```

---

## Task 5: Build `BlogCard` component

**Files:**
- Create: `astro/src/components/BlogCard.astro`

- [ ] **Step 1: Create `astro/src/components/BlogCard.astro`**

```astro
---
import { urlFor } from '../lib/sanity'

export interface Props {
  title: string
  slug: string
  excerpt: string
  category: string
  mainImage?: any
  publishedAt: string
}

const { title, slug, excerpt, category, mainImage, publishedAt } = Astro.props

const imgSrc = mainImage?.asset
  ? urlFor(mainImage).width(600).height(340).auto('format').url()
  : '/og-image.jpg'

const imgAlt = mainImage?.alt ?? title

const dateStr = new Date(publishedAt).toLocaleDateString('th-TH', {
  year: 'numeric', month: 'long', day: 'numeric',
})
---

<article class="blog-card" data-category={category}>
  <a href={`/blog/${slug}`} class="blog-card__image-link">
    <img src={imgSrc} alt={imgAlt} width="600" height="340" loading="lazy" class="blog-card__image" />
  </a>
  <div class="blog-card__body">
    {category && <span class="blog-card__category">{category}</span>}
    <h2 class="blog-card__title">
      <a href={`/blog/${slug}`}>{title}</a>
    </h2>
    <p class="blog-card__excerpt">{excerpt}</p>
    <div class="blog-card__meta">
      <time datetime={publishedAt}>{dateStr}</time>
    </div>
    <a href={`/blog/${slug}`} class="btn btn-outline blog-card__read-more">อ่านต่อ →</a>
  </div>
</article>
```

- [ ] **Step 2: Run type check**

```bash
cd astro && npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/BlogCard.astro
git commit -m "feat(astro): add BlogCard component"
```

---

## Task 6: Build `CategoryFilter` component

**Files:**
- Create: `astro/src/components/CategoryFilter.astro`

- [ ] **Step 1: Create `astro/src/components/CategoryFilter.astro`**

```astro
---
export interface Props {
  categories: string[]
}

const { categories } = Astro.props
const all = ['ทั้งหมด', ...categories]
---

<div class="blog-filter" id="category-filter">
  {all.map((cat) => (
    <button
      class={`blog-filter__btn${cat === 'ทั้งหมด' ? ' is-active' : ''}`}
      data-filter={cat === 'ทั้งหมด' ? 'all' : cat}
    >
      {cat}
    </button>
  ))}
</div>

<script>
  const filter = document.getElementById('category-filter')
  const grid = document.getElementById('blog-grid')

  if (filter && grid) {
    filter.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('button')
      if (!btn) return

      filter.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'))
      btn.classList.add('is-active')

      const chosen = btn.dataset.filter ?? 'all'
      grid.querySelectorAll<HTMLElement>('.blog-card').forEach((card) => {
        const match = chosen === 'all' || card.dataset.category === chosen
        card.style.display = match ? '' : 'none'
      })
    })
  }
</script>
```

- [ ] **Step 2: Run type check**

```bash
cd astro && npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/CategoryFilter.astro
git commit -m "feat(astro): add CategoryFilter component with client-side filtering"
```

---

## Task 7: Build `/blog` listing page

**Files:**
- Create: `astro/src/pages/blog/index.astro`

- [ ] **Step 1: Create `astro/src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content'
import BaseLayout from '../../layouts/BaseLayout.astro'
import Header from '../../components/Header.astro'
import Footer from '../../components/Footer.astro'
import SEO from '../../components/SEO.astro'
import Breadcrumbs from '../../components/Breadcrumbs.astro'
import BlogCard from '../../components/BlogCard.astro'
import CategoryFilter from '../../components/CategoryFilter.astro'

const posts = await getCollection('blogPosts')

const categories = [...new Set(
  posts.map((p) => p.data.category).filter(Boolean)
)] as string[]

const crumbs = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'บทความ', href: '/blog' },
]

const seo = {
  seoTitle: 'บทความสุขภาพ | Thrive Wellness Center',
  description: 'บทความสุขภาพจากทีมแพทย์ผู้เชี่ยวชาญ ด้านฮอร์โมน โภชนาการ สุขภาพจิต และภูมิคุ้มกัน',
  ogImage: '/og-image.jpg',
  ogLocale: 'th_TH',
  canonicalPath: '/blog',
  noIndex: false,
  hreflang: [],
  geo: {
    region: 'TH-10',
    placename: 'Bangkok',
    position: '13.7563;100.5018',
    icbm: '13.7563, 100.5018',
  },
  publishedAt: new Date('2026-01-01'),
  updatedAt: new Date(),
  lastMedicalReview: new Date('2026-01-01'),
  reviewedBy: 'Dr. Noon Pichayaporn',
  medicalSpecialty: 'Functional Medicine',
}
---

<BaseLayout>
  <SEO slot="head" {...seo} />
  <Header />
  <Breadcrumbs crumbs={crumbs} />

  <main class="blog-listing-page">
    <section class="section section--hero blog-listing-hero">
      <div class="section-container">
        <div class="section-title-center">
          <span class="section-label">Knowledge</span>
          <h1 class="section-title">บทความสุขภาพ</h1>
          <p class="section-subtitle">ความรู้จากทีมแพทย์ผู้เชี่ยวชาญ เพื่อสุขภาพที่ดีของคุณ</p>
        </div>
      </div>
    </section>

    <section class="section blog-filter-section">
      <div class="section-container">
        {categories.length > 0 && <CategoryFilter categories={categories} />}
      </div>
    </section>

    <section class="section blog-grid-section">
      <div class="section-container">
        {posts.length === 0 ? (
          <p class="blog-empty">ยังไม่มีบทความในขณะนี้ กลับมาเยี่ยมชมเร็วๆ นี้</p>
        ) : (
          <div class="blog-grid" id="blog-grid">
            {posts.map((post) => (
              <BlogCard
                title={post.data.title}
                slug={post.data.slug.current}
                excerpt={post.data.excerpt ?? ''}
                category={post.data.category ?? ''}
                mainImage={post.data.mainImage}
                publishedAt={post.data.publishedAt}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Run type check**

```bash
cd astro && npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add astro/src/pages/blog/index.astro
git commit -m "feat(astro): add /blog listing page with category filter"
```

---

## Task 8: Build `BlogPostLayout`

**Files:**
- Create: `astro/src/layouts/BlogPostLayout.astro`

- [ ] **Step 1: Create `astro/src/layouts/BlogPostLayout.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro'
import Header from '../components/Header.astro'
import Footer from '../components/Footer.astro'
import SEO from '../components/SEO.astro'
import Breadcrumbs from '../components/Breadcrumbs.astro'
import CTASection from '../components/CTASection.astro'

export interface Props {
  title: string
  publishedAt: string
  updatedAt?: string
  authorName?: string
  authorTitle?: string
  category?: string
  mainImage?: any
  seoTitle?: string
  seoDescription?: string
  noIndex?: boolean
  canonicalUrl?: string
  slug: string
}

const {
  title,
  publishedAt,
  updatedAt,
  authorName,
  authorTitle,
  category,
  mainImage,
  seoTitle,
  seoDescription,
  noIndex = false,
  canonicalUrl,
  slug,
} = Astro.props

import { urlFor } from '../lib/sanity'

const heroSrc = mainImage?.asset
  ? urlFor(mainImage).width(1200).height(630).auto('format').url()
  : '/og-image.jpg'

const heroAlt = mainImage?.alt ?? title

const publishDate = new Date(publishedAt).toLocaleDateString('th-TH', {
  year: 'numeric', month: 'long', day: 'numeric',
})

const updateDate = updatedAt
  ? new Date(updatedAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  : null

const crumbs = [
  { label: 'หน้าแรก', href: '/' },
  { label: 'บทความ', href: '/blog' },
  { label: title, href: `/blog/${slug}` },
]

const seo = {
  seoTitle: seoTitle ?? title,
  description: seoDescription ?? '',
  ogImage: heroSrc,
  ogLocale: 'th_TH',
  canonicalPath: canonicalUrl ?? `/blog/${slug}`,
  noIndex,
  hreflang: [],
  geo: {
    region: 'TH-10',
    placename: 'Bangkok',
    position: '13.7563;100.5018',
    icbm: '13.7563, 100.5018',
  },
  publishedAt: new Date(publishedAt),
  updatedAt: updatedAt ? new Date(updatedAt) : new Date(publishedAt),
  lastMedicalReview: new Date(publishedAt),
  reviewedBy: authorName ?? 'Dr. Noon Pichayaporn',
  medicalSpecialty: 'Functional Medicine',
}

const cta = {
  headline: 'ปรึกษาแพทย์ผู้เชี่ยวชาญของเรา',
  subline: 'นัดหมายวันนี้ รับคำแนะนำเฉพาะบุคคลจากทีมแพทย์ Thrive',
  primaryBtn: { label: 'นัดปรึกษาฟรี', href: '/contact' },
  secondaryBtn: { label: 'ดูบริการทั้งหมด', href: '/' },
}
---

<BaseLayout>
  <SEO slot="head" {...seo} />
  <Header />
  <Breadcrumbs crumbs={crumbs} />

  <main class="blog-post-page">
    <article class="blog-post">
      <header class="blog-post__header">
        <div class="section-container">
          {category && <span class="blog-post__category">{category}</span>}
          <h1 class="blog-post__title">{title}</h1>
          <div class="blog-post__meta">
            {authorName && (
              <span class="blog-post__author">
                โดย {authorName}{authorTitle ? `, ${authorTitle}` : ''}
              </span>
            )}
            <time datetime={publishedAt}>เผยแพร่ {publishDate}</time>
            {updateDate && <time datetime={updatedAt}>อัปเดต {updateDate}</time>}
          </div>
        </div>
      </header>

      <div class="blog-post__hero">
        <img src={heroSrc} alt={heroAlt} width="1200" height="630" loading="eager" />
      </div>

      <div class="section-container blog-post__content">
        <slot />
      </div>
    </article>

    <CTASection {...cta} />
  </main>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Run type check**

```bash
cd astro && npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add astro/src/layouts/BlogPostLayout.astro
git commit -m "feat(astro): add BlogPostLayout"
```

---

## Task 9: Build `/blog/[slug]` detail page

**Files:**
- Create: `astro/src/pages/blog/[slug].astro`

- [ ] **Step 1: Create `astro/src/pages/blog/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content'
import BlogPostLayout from '../../layouts/BlogPostLayout.astro'
import { portableTextToHtml } from '../../lib/portableTextToHtml'

export async function getStaticPaths() {
  const posts = await getCollection('blogPosts')
  return posts.map((post) => ({
    params: { slug: post.data.slug.current },
    props: { post },
  }))
}

const { post } = Astro.props
const d = post.data

const bodyHtml = portableTextToHtml(d.body ?? [])

const faqItems = (d.faq ?? []).map((item: any) => ({
  question: item.question,
  answer: item.shortAnswer ?? '',
}))
---

<BlogPostLayout
  title={d.title}
  publishedAt={d.publishedAt}
  updatedAt={d.updatedAt}
  authorName={d.authorName}
  authorTitle={d.authorTitle}
  category={d.category}
  mainImage={d.mainImage}
  seoTitle={d.seo?.seoTitle}
  seoDescription={d.seo?.seoDescription}
  noIndex={d.seo?.noIndex ?? false}
  canonicalUrl={d.seo?.canonicalUrl}
  slug={d.slug.current}
>
  {d.keyTakeaways && d.keyTakeaways.length > 0 && (
    <div class="blog-post__takeaways">
      <h2>สิ่งที่คุณจะได้เรียนรู้</h2>
      <ul>
        {d.keyTakeaways.map((point: string) => <li>{point}</li>)}
      </ul>
    </div>
  )}

  <div class="blog-post__body" set:html={bodyHtml} />

  {faqItems.length > 0 && (
    <section class="section faq-section">
      <div class="section-title-center">
        <span class="section-label">FAQ</span>
        <h2 class="section-title">คำถามที่พบบ่อย</h2>
      </div>
      <div class="faq-list">
        {faqItems.map((item: any) => (
          <details class="faq-item">
            <summary><h3>{item.question}</h3></summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )}
</BlogPostLayout>
```

- [ ] **Step 2: Run type check**

```bash
cd astro && npx astro check
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add astro/src/pages/blog/[slug].astro
git commit -m "feat(astro): add /blog/[slug] detail page"
```

---

## Task 10: Build `/post/[slug]` 301 redirect shim

**Files:**
- Create: `astro/src/pages/post/[slug].astro`

- [ ] **Step 1: Create `astro/src/pages/post/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blogPosts')
  return posts.map((post) => ({
    params: { slug: post.data.slug.current },
    props: { newSlug: post.data.slug.current },
  }))
}

const { newSlug } = Astro.props
return Astro.redirect(`/blog/${newSlug}`, 301)
---
```

- [ ] **Step 2: Run type check and build**

```bash
cd astro && npx astro check && npm run build 2>&1 | tail -20
```

Expected: 0 errors, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add astro/src/pages/post/[slug].astro
git commit -m "feat(astro): add /post/[slug] 301 redirect shim for Wix URL preservation"
```

---

## Task 11: Full build verification

**Files:** none (verification only)

- [ ] **Step 1: Run Astro type check**

```bash
cd astro && npx astro check
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Run production build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build completes with no errors. `/blog/index.html` and `/blog/` directory exist in `dist/`.

- [ ] **Step 3: Spot-check build output**

```bash
ls astro/dist/blog/
```

Expected: `index.html` file exists (empty grid — no Sanity docs yet).

- [ ] **Step 4: Push branch**

```bash
git push origin feature/phase5-blog-migration
```

---

## Task 12: Enter pilot post #1 in Sanity and verify end-to-end

This is a manual task. Source file: `new html from vkasama/blog-tierB-bucket1/blog-chili.html`.

- [ ] **Step 1: Start Sanity Studio**

```bash
cd sanity && npx sanity@latest dev
```

Open `http://localhost:3333`.

- [ ] **Step 2: Create a new `blogPost` document in Sanity Studio**

Fill in each field from the HTML reference file `blog-chili.html`:

| Field | Value |
|-------|-------|
| Title | ประโยชน์ของพริก ที่คุณอาจไม่เคยรู้ |
| Slug | `chili` (click Generate, then edit to just `chili`) |
| Category | โภชนาการ |
| Excerpt | พริกไม่ใช่แค่เครื่องเทศ — สาร capsaicin กระตุ้นเมแทบอลิซึม ลดการอักเสบ และดีต่อหัวใจ บทความนี้รวบรวมงานวิจัยกว่า 5 ชิ้นเพื่ออธิบายว่าทำไมพริกถึงเป็นซุปเปอร์ฟู้ด |
| Published at | 2026-01-01T00:00:00Z |
| Main image | Upload `chili-hero-1200x630.jpg` from `image/` directory; alt = "ประโยชน์ของพริก" |
| Author | Select Dr. Noon (create her doctor doc first if not yet in Sanity) |
| Body | Enter the main article content as Portable Text (headings, paragraphs, lists) |
| FAQ | Enter 6 FAQ items; fill **Short answer** field for each |
| SEO → SEO title | ประโยชน์ของพริก 8 อย่าง ที่ดีต่อสุขภาพ | Thrive Wellness |
| SEO → SEO description | พริกมีสาร capsaicin ช่วยเผาผลาญ ต้านการอักเสบ ดีต่อหัวใจ อ่านงานวิจัย 5 ชิ้นว่าพริกช่วยอะไรบ้าง |

- [ ] **Step 3: Publish the document**

Click **Publish** in Sanity Studio. The document is now live in the Content Lake.

- [ ] **Step 4: Start Astro dev server and verify**

```bash
cd astro && npm run dev
```

Open `http://localhost:4321/blog` — confirm the chili post card appears in the grid.

Open `http://localhost:4321/blog/chili` — confirm the full post renders with title, hero image, body content, and FAQs.

Open `http://localhost:4321/post/chili` — confirm it redirects (302 in dev, 301 in prod) to `/blog/chili`.

- [ ] **Step 5: Record completion in SITE-TRACKER.md**

In `SITE-TRACKER.md`, find the Phase 5 section and update:
- Change `⏳ ยังไม่เริ่ม` to `🔄 กำลังทำ` for Phase 5
- Note pilot post #1 (chili) is live at `/blog/chili`

- [ ] **Step 6: Commit SITE-TRACKER update**

```bash
git add SITE-TRACKER.md
git commit -m "docs: mark Phase 5 in-progress, pilot post #1 (chili) live"
```

- [ ] **Step 7: Push**

```bash
git push origin feature/phase5-blog-migration
```

---

## Pilot Posts 2–10 (repeat Task 12 pattern)

After post #1 is verified, enter the remaining 9 posts in Sanity Studio following the same process. Source files are all in `new html from vkasama/blog-tierB-bucket1/`:

| # | Slug | Source file | Category |
|---|------|-------------|----------|
| 2 | `minerals` | `blog-minerals.html` | โภชนาการ |
| 3 | `apple-benefit` | `blog-apple-benefit.html` | โภชนาการ |
| 4 | `abnormal-period` | `blog-abnormal-period.html` | สตรีสุขภาพ |
| 5 | `periodpain` | `blog-periodpain.html` | สตรีสุขภาพ |
| 6 | `zinc-checklist` | `blog-zinc.html` | โภชนาการ |
| 7 | `immunity` | `blog-immunity.html` | ภูมิคุ้มกัน |
| 8 | `growth-factor` | `blog-growth-factor.html` | ฮอร์โมน |
| 9 | `smiling-depression` | `blog-smiling-depression.html` | สุขภาพจิต |
| 10 | `glutathione` | `blog-glutathione.html` | ภูมิคุ้มกัน |

After all 10 are live, update SITE-TRACKER.md with a pilot-complete note and push.

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Sanity schema → Task 1
- ✅ @sanity/astro loader + content.config.ts → Tasks 4
- ✅ /blog listing with category filter → Tasks 5–7
- ✅ /blog/[slug] detail → Tasks 8–9
- ✅ /post/[slug] 301 redirect → Task 10
- ✅ Pilot batch top 10 → Tasks 11–12 + pilot table
- ✅ Build verification → Task 11
- ✅ Environment variables documented → Task 2

**Type consistency:**
- `portableTextToHtml` defined in Task 3, imported in Task 9 ✅
- `urlFor` defined in Task 3, used in Tasks 5 and 8 ✅
- `sanityBlogLoader` defined in Task 4, used in content.config.ts in Task 4 ✅
- `BlogCard` props (`title, slug, excerpt, category, mainImage, publishedAt`) match usage in Task 7 ✅
- `BlogPostLayout` props match usage in Task 9 ✅
- `faqItems` mapped as `{ question, answer }` in Task 9 and rendered inline (not via FAQSection component, since FAQSection expects `{ q, a }`) ✅
