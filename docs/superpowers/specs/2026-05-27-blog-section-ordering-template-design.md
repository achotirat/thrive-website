---
name: blog-section-ordering-template
description: Standardise Sanity blog post section order — CTA before Doctor, References after Doctor — with per-blog blogCta field in Sanity falling back to generic CTA
metadata:
  type: project
---

# Blog Section Ordering Template

## Goal

Standardise the section order across every Sanity-driven blog post so that:

1. Body content + FAQ
2. Blog CTA (right before doctor)
3. Doctor Attribution
4. References (after doctor)

The blog CTA headline/subline/button text is stored in a new optional `blogCta` object field on the Sanity `blogPost` document. If `blogCta` is not filled in, the layout falls back to the existing generic CTA.

References come from the existing structured `references[]` field in Sanity (already in schema, not yet fetched). Content editors are responsible for populating `blogCta` and `references[]` in Sanity Studio per blog; the code only wires up the rendering and reordering.

---

## Architecture

### Files changed

| File | Change |
|---|---|
| `sanity/schemaTypes/documents/blogPost.ts` | Add optional `blogCta` object field |
| `astro/src/lib/sanityBlogLoader.ts` | Add `blogCta`, `references[]`, `relatedServices[]->` to GROQ |
| `astro/src/content.config.ts` | Add `blogCta` and `references` to `blogPostsCollection` Zod schema |
| `astro/src/layouts/BlogPostLayout.astro` | Add props, reorder sections, add BlogReferences inline |
| `astro/src/pages/blog/[slug].astro` | Pass `blogCta` and `references` to layout |

No new Astro pages. `BlogReferences` is rendered inline in `BlogPostLayout.astro` (too small to warrant its own component file).

---

## Section 1 — Sanity schema: `blogCta` field

Add an optional object field to `blogPost` after the existing `faq` field:

```ts
defineField({
  name: 'blogCta',
  title: 'Blog CTA (shown before doctor section)',
  type: 'object',
  description: 'Leave blank to use the default clinic CTA.',
  fields: [
    defineField({ name: 'headline',        title: 'Headline',      type: 'string',
                  validation: (Rule) => Rule.max(120) }),
    defineField({ name: 'subline',         title: 'Subline',       type: 'text', rows: 2,
                  validation: (Rule) => Rule.max(300) }),
    defineField({ name: 'primaryBtnLabel', title: 'Button label',  type: 'string',
                  validation: (Rule) => Rule.max(60) }),
    defineField({ name: 'primaryBtnHref',  title: 'Button href',   type: 'string' }),
  ],
})
```

The field is optional at the document level — no `validation: Rule.required()`.

---

## Section 2 — GROQ additions (`sanityBlogLoader.ts`)

Add three projections to the existing GROQ query string:

```groq
blogCta { headline, subline, primaryBtnLabel, primaryBtnHref },
references[] { title, source, year, url },
"relatedServices": relatedServices[]->{ title, "slug": slug.current }
```

`references` and `relatedServices` already exist in the Sanity schema. No Sanity Studio changes needed for them.

---

## Section 3 — Zod schema additions (`content.config.ts`)

Add to `blogPostsCollection`:

```ts
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

---

## Section 4 — `BlogPostLayout.astro` restructure

### New props

```ts
export interface Props {
  // ...existing props...
  blogCta?: {
    headline?: string
    subline?: string
    primaryBtnLabel?: string
    primaryBtnHref?: string
  }
  references?: { title: string; source?: string; year?: number; url?: string }[]
}
```

### New section order (outside slot)

```astro
<!-- 1. slot (body + FAQ already inside) -->
<slot />

<!-- 2. CTA — blog-specific or generic fallback -->
<CTASection
  headline={blogCta?.headline ?? cta.headline}
  subline={blogCta?.subline ?? cta.subline}
  primaryBtn={{
    label: blogCta?.primaryBtnLabel ?? cta.primaryBtn.label,
    href:  blogCta?.primaryBtnHref  ?? cta.primaryBtn.href,
  }}
/>

<!-- 3. Doctor -->
<DoctorAttribution doctor={{...}} />

<!-- 4. References — only if non-empty -->
{references && references.length > 0 && (
  <section class="blog-references">
    <div class="section-container">
      <h2 class="blog-references__heading">อ้างอิงทางวิทยาศาสตร์</h2>
      <ol class="blog-references__list">
        {references.map((ref) => (
          <li>
            {ref.url
              ? <a href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}</a>
              : ref.title}
            {ref.source && <span> — {ref.source}</span>}
            {ref.year   && <span> ({ref.year})</span>}
          </li>
        ))}
      </ol>
    </div>
  </section>
)}
```

### CSS

Add minimal styles for `.blog-references` in the existing blog post stylesheet (no Tailwind). Follow the same patterns as `.faq-section`.

---

## Section 5 — `[slug].astro` updates

Pass the two new props to `BlogPostLayout`:

```astro
<BlogPostLayout
  ...
  blogCta={d.blogCta}
  references={d.references}
>
```

---

## Content task (out of scope for this branch)

For each published blog (especially PCOS):
1. Fill in `blogCta` in Sanity Studio if a blog-specific CTA is desired
2. Populate `references[]` array in Sanity Studio
3. Strip any duplicate references block from `legacyHtml` to avoid double-rendering

This is Facade's responsibility — he is solely responsible for all content editing in Sanity Studio from this point forward.

---

## Branch

`feature/blog-section-ordering-template`

## Out of scope

- Changing the generic CTA text or design
- Adding related-services rendering within the CTA block (separate feature)
- Converting any blog from `legacyHtml` to structured `body` richText
