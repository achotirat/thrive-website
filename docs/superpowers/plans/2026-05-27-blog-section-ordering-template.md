# Blog Section Ordering Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardise the section order across all Sanity-driven blog posts so CTA appears right before the doctor section, and structured references appear after the doctor section.

**Architecture:** Five files touch: Sanity schema adds `blogCta` object field; the GROQ loader fetches it alongside existing `references[]` and `relatedServices[]`; the Zod schema is extended to match; `BlogPostLayout.astro` is restructured with the new order and an inline references renderer; `[slug].astro` passes the two new props through. No new component files are created.

**Tech Stack:** Astro 6, Sanity (GROQ), TypeScript, CSS custom properties (no Tailwind)

**Spec:** `docs/superpowers/specs/2026-05-27-blog-section-ordering-template-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `sanity/schemaTypes/documents/blogPost.ts` | Modify | Add `blogCta` object field |
| `astro/src/lib/sanityBlogLoader.ts` | Modify | Fetch `blogCta`, `references[]`, `relatedServices[]->` in GROQ |
| `astro/src/content.config.ts` | Modify | Add `blogCta`, `references`, `relatedServices` to Zod schema |
| `astro/src/layouts/BlogPostLayout.astro` | Modify | Reorder sections; add references renderer; accept new props |
| `astro/src/pages/blog/[slug].astro` | Modify | Pass `blogCta` and `references` to BlogPostLayout |
| `astro/src/styles/global.css` | Modify | Add `.blog-references` CSS at end of file |

---

## Task 1: Create the feature branch

**Files:** none

- [ ] **Step 1: Create and switch to branch**

```bash
git checkout -b feature/blog-section-ordering-template
```

Expected: `Switched to a new branch 'feature/blog-section-ordering-template'`

---

## Task 2: Add `blogCta` field to Sanity blogPost schema

**Files:**
- Modify: `sanity/schemaTypes/documents/blogPost.ts`

- [ ] **Step 1: Open the file and locate the `faq` field** (around line 119). Add the `blogCta` field immediately after the closing brace of the `faq` field definition:

```ts
// in sanity/schemaTypes/documents/blogPost.ts
// Add this after the faq field (after line ~133), before relatedTopics

defineField({
  name: 'blogCta',
  title: 'Blog CTA (shown before doctor section)',
  type: 'object',
  description: 'Leave blank to use the default clinic CTA.',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'subline',
      title: 'Subline',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'primaryBtnLabel',
      title: 'Button label',
      type: 'string',
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: 'primaryBtnHref',
      title: 'Button href',
      type: 'string',
    }),
  ],
}),
```

- [ ] **Step 2: Verify the Sanity schema file compiles (no TypeScript errors)**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website/sanity
npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (zero errors)

- [ ] **Step 3: Commit**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website
git add sanity/schemaTypes/documents/blogPost.ts
git commit -m "feat(sanity): add blogCta optional object field to blogPost schema"
```

---

## Task 3: Update GROQ query to fetch `blogCta`, `references`, and `relatedServices`

**Files:**
- Modify: `astro/src/lib/sanityBlogLoader.ts`

- [ ] **Step 1: Open the file. The GROQ string ends before the closing backtick (around line 28). Add three new projections inside the query, after the `seo { ... }` block:**

Replace the closing `}` of the GROQ template literal so the full query reads:

```ts
const GROQ = `*[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
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
  legacyHtml,
  faq[] {
    question,
    shortAnswer
  },
  blogCta {
    headline,
    subline,
    primaryBtnLabel,
    primaryBtnHref
  },
  references[] {
    title,
    source,
    year,
    url
  },
  "relatedServices": relatedServices[]->{ title, "slug": slug.current },
  seo {
    seoTitle,
    seoDescription,
    noIndex,
    canonicalUrl
  }
}`
```

- [ ] **Step 2: Commit**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website
git add astro/src/lib/sanityBlogLoader.ts
git commit -m "feat(loader): fetch blogCta, references, relatedServices from Sanity"
```

---

## Task 4: Extend Zod schema in `content.config.ts`

**Files:**
- Modify: `astro/src/content.config.ts`

- [ ] **Step 1: Open the file. In the `blogPostsCollection` definition, the `faq` field ends around line 88. Add three new fields after `faq`:**

```ts
// Add after the faq field, before the closing `})` of z.object(...)
blogCta: z.object({
  headline: z.string().optional(),
  subline: z.string().optional(),
  primaryBtnLabel: z.string().optional(),
  primaryBtnHref: z.string().optional(),
}).optional(),
references: z.array(z.object({
  title: z.string(),
  source: z.string().optional(),
  year: z.number().optional(),
  url: z.string().optional(),
})).optional().default([]),
relatedServices: z.array(z.object({
  title: z.string(),
  slug: z.string(),
})).optional().default([]),
```

- [ ] **Step 2: Run Astro type-check from inside the `astro/` directory**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website/astro
npx astro check 2>&1 | tail -20
```

Expected: `Found 0 errors.` (or only pre-existing errors unrelated to this change)

- [ ] **Step 3: Commit**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website
git add astro/src/content.config.ts
git commit -m "feat(schema): add blogCta, references, relatedServices to blogPosts Zod schema"
```

---

## Task 5: Restructure `BlogPostLayout.astro`

**Files:**
- Modify: `astro/src/layouts/BlogPostLayout.astro`

This task reorders the three outer sections (CTA → Doctor → References) and adds the inline references renderer.

- [ ] **Step 1: Add `blogCta` and `references` to the Props interface (after `faqItems`):**

```ts
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
  faqItems?: { question: string; answer: string }[]
  blogCta?: {
    headline?: string
    subline?: string
    primaryBtnLabel?: string
    primaryBtnHref?: string
  }
  references?: { title: string; source?: string; year?: number; url?: string }[]
}
```

- [ ] **Step 2: Destructure the two new props in the frontmatter (after `faqItems = []`):**

```ts
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
  faqItems = [],
  blogCta,
  references = [],
} = Astro.props
```

- [ ] **Step 3: Replace the three-section block at the bottom of `<main>` (lines 144–153 of the original file) with the new order:**

Old block (remove this entirely):
```astro
    <DoctorAttribution doctor={{
      name: 'พญ. ชนากานต์ ตระหง่านศรี',
      title: 'แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ',
      image: '/dr-chanakan-trangansri-thrive-400x400.jpg',
      imageAlt: 'พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ Thrive Wellness',
      bio: 'ผู้เชี่ยวชาญด้านเวชศาสตร์ชะลอวัยและโภชนาการ ดูแลการตรวจวิเคราะห์สุขภาพเชิงลึก พร้อมให้คำปรึกษาแผนสุขภาพเฉพาะบุคคลที่ Thrive Wellness Center',
      specializations: ['Anti-aging & Regenerative Medicine', 'Nutrition Wellness', 'Functional Medicine'],
    }} />

    <CTASection {...cta} />
```

New block (replace with this):
```astro
    <CTASection
      headline={blogCta?.headline ?? cta.headline}
      subline={blogCta?.subline ?? cta.subline}
      primaryBtn={{
        label: blogCta?.primaryBtnLabel ?? cta.primaryBtn.label,
        href:  blogCta?.primaryBtnHref  ?? cta.primaryBtn.href,
      }}
      secondaryBtn={blogCta ? undefined : cta.secondaryBtn}
    />

    <DoctorAttribution doctor={{
      name: 'พญ. ชนากานต์ ตระหง่านศรี',
      title: 'แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ',
      image: '/dr-chanakan-trangansri-thrive-400x400.jpg',
      imageAlt: 'พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ Thrive Wellness',
      bio: 'ผู้เชี่ยวชาญด้านเวชศาสตร์ชะลอวัยและโภชนาการ ดูแลการตรวจวิเคราะห์สุขภาพเชิงลึก พร้อมให้คำปรึกษาแผนสุขภาพเฉพาะบุคคลที่ Thrive Wellness Center',
      specializations: ['Anti-aging & Regenerative Medicine', 'Nutrition Wellness', 'Functional Medicine'],
    }} />

    {references.length > 0 && (
      <section class="blog-references">
        <div class="section-container">
          <h2 class="blog-references__heading">อ้างอิงทางวิทยาศาสตร์</h2>
          <ol class="blog-references__list">
            {references.map((ref) => (
              <li class="blog-references__item">
                {ref.url
                  ? <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>
                  : <span>{ref.title}</span>
                }
                {ref.source && <span class="blog-references__meta"> — {ref.source}</span>}
                {ref.year   && <span class="blog-references__meta"> ({ref.year})</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>
    )}
```

- [ ] **Step 4: Run Astro type-check**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website/astro
npx astro check 2>&1 | tail -20
```

Expected: `Found 0 errors.`

- [ ] **Step 5: Commit**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website
git add astro/src/layouts/BlogPostLayout.astro
git commit -m "feat(layout): reorder blog sections — CTA before doctor, references after"
```

---

## Task 6: Update `[slug].astro` to pass new props

**Files:**
- Modify: `astro/src/pages/blog/[slug].astro`

- [ ] **Step 1: Pass `blogCta` and `references` from Sanity data to `BlogPostLayout`. The `<BlogPostLayout ...>` call currently starts at line 22. Add the two new props after `faqItems={faqItems}`:**

```astro
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
  faqItems={faqItems}
  blogCta={d.blogCta}
  references={d.references}
>
```

- [ ] **Step 2: Run Astro type-check**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website/astro
npx astro check 2>&1 | tail -20
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Commit**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website
git add astro/src/pages/blog/[slug].astro
git commit -m "feat(pages): pass blogCta and references props to BlogPostLayout"
```

---

## Task 7: Add `.blog-references` CSS to `global.css`

**Files:**
- Modify: `astro/src/styles/global.css` (append after line 2756)

- [ ] **Step 1: Append the following CSS block to the very end of `global.css`:**

```css

/* ── Blog References ─────────────────────────────────────── */
.blog-references {
  padding: var(--sp-10) 0;
  background: var(--bg);
}

.blog-references__heading {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--navy);
  margin: 0 0 var(--sp-4);
}

.blog-references__list {
  margin: 0;
  padding-left: 1.25rem;
  display: grid;
  gap: var(--sp-2);
}

.blog-references__item {
  font-size: var(--text-sm);
  color: var(--text-2);
  line-height: 1.7;
}

.blog-references__item a {
  color: var(--teal);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.blog-references__item a:hover {
  color: var(--navy);
}

.blog-references__meta {
  color: var(--text-3, var(--text-2));
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website
git add astro/src/styles/global.css
git commit -m "style: add blog-references CSS block"
```

---

## Task 8: Final build verification

**Files:** none changed

- [ ] **Step 1: Run full Astro build from the `astro/` directory**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website/astro
npm run build 2>&1 | tail -30
```

Expected: build completes with no errors. Sanity posts may show a warning if env vars aren't set locally — that is expected and acceptable.

- [ ] **Step 2: If the build fails due to Sanity env vars not set, verify type-check only**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website/astro
npx astro check 2>&1 | tail -10
```

Expected: `Found 0 errors.`

- [ ] **Step 3: Open a PR**

```bash
cd /Users/kook/Documents/Claude/Projects/thrive-website
gh pr create \
  --title "feat: blog section ordering template — CTA before doctor, references after" \
  --body "$(cat <<'EOF'
## Summary
- Adds optional `blogCta` object field to Sanity `blogPost` schema
- Fetches `blogCta`, `references[]`, and `relatedServices[]` in the GROQ loader
- Reorders blog layout: FAQ → CTA (blog-specific or generic fallback) → Doctor → References
- Adds structured references section after the doctor section

## Content task (Facade)
For each blog, Facade should fill in `blogCta` and `references[]` in Sanity Studio if blog-specific content is desired.

## Test plan
- [ ] `npx astro check` returns 0 errors
- [ ] `npm run build` completes without errors
- [ ] Blog posts without `blogCta` fall back to generic CTA text
- [ ] Blog posts without `references` do not render the references section
- [ ] Sanity Studio shows new `blogCta` field under each blog post document

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
