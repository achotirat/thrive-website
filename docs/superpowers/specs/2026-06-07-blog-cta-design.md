# Blog CTA — Design Spec
**Date:** 2026-06-07
**Status:** Approved
**Branch:** `feature/blog-cta`

---

## Goal

Add inline CTA blocks to every Thrive blog post so readers are directed to the relevant Tier A service page (e.g. `/check-up`, `/food-intolerance`). Track the full user journey — blog → service page → clinic — via UTM parameters and GTM events.

---

## Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| CTA layout | Inline cards (no sticky bar) | Less intrusive, simpler to build, works in static HTML body |
| CTA count | 3 per post (Top, Mid, Bottom) | Catches readers who drop off early, halfway, and at the end |
| Card style | Soft callout with left accent | Editorial feel — looks like a doctor's recommendation, not an ad |
| Tracking | UTM params + GTM event | Full attribution through GA4; GTM event for granular per-post analytics |
| Service link | Existing Tier A Astro pages | No new Sanity-powered service pages. Stubs are pointer-only. |

---

## Architecture

### 1. Data layer

**`astro/src/lib/sanityBlogLoader.ts`** — extend GROQ query:

```groq
ctaService {
  "slug": slug.current,
  title,
  shortDescription
}
```

**`astro/src/content.config.ts`** — extend `blogPostsCollection` Zod schema:

```ts
ctaService: z.object({
  slug: z.string(),
  title: z.string(),
  shortDescription: z.string().optional(),
}).optional(),
```

---

### 2. New component: `BlogCTA.astro`

**Path:** `astro/src/components/BlogCTA.astro`

**Props:**

| Prop | Type | Description |
|---|---|---|
| `serviceSlug` | `string` | Tier A page slug (e.g. `check-up`). Fallback: `contact` |
| `serviceTitle` | `string` | Service display name. Fallback: `"Book your consultation at Thrive"` |
| `serviceDescription` | `string \| undefined` | Short description from Sanity stub. Fallback: generic Thai copy |
| `blogSlug` | `string` | Current post slug — used in UTM campaign param |
| `position` | `'top' \| 'mid' \| 'bottom'` | CTA position — used in UTM content param and GTM event |

**Link URL format:**
```
/{serviceSlug}?utm_source=blog&utm_medium=inline-cta&utm_campaign={blogSlug}&utm_content=cta-{position}
```

**GTM attributes on the `<a>` tag:**
```html
data-gtm-event="blog_cta_click"
data-gtm-label="{serviceSlug}"
data-gtm-blog="{blogSlug}"
data-gtm-position="{position}"
```

**Fallback (no `ctaService` on post):**
- `serviceSlug` → `contact`
- `serviceTitle` → `"Book your consultation at Thrive"`
- `serviceDescription` → `"Bangkok's functional medicine clinic — personalised care, science-backed."`

**Card HTML structure (soft callout):**
```html
<div class="blog-cta">
  <div class="blog-cta__label">Thrive แนะนำ</div>
  <div class="blog-cta__title">{serviceTitle}</div>
  <div class="blog-cta__desc">{serviceDescription}</div>
  <a href="/{serviceSlug}?utm_source=blog&..."
     class="btn btn-primary blog-cta__btn"
     data-gtm-event="blog_cta_click"
     data-gtm-label="{serviceSlug}"
     data-gtm-blog="{blogSlug}"
     data-gtm-position="{position}">
    นัดตรวจที่ Thrive →
  </a>
</div>
```

**CSS (add to `thrive-styles.css`):**
```css
.blog-cta {
  background: #f0faf9;
  border-left: 4px solid #2A9D8F;
  border-radius: 0 8px 8px 0;
  padding: 1.25rem 1.5rem;
  margin: 2rem 0;
}
.blog-cta__label {
  font-size: 0.625rem;
  color: #2A9D8F;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}
.blog-cta__title {
  font-size: 1rem;
  color: #1a2e2b;
  font-weight: 700;
  margin-bottom: 0.375rem;
}
.blog-cta__desc {
  font-size: 0.8125rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}
```

---

### 3. Page wiring: `astro/src/pages/blog/[slug].astro`

**CTA props extracted at top of frontmatter:**
```ts
const ctaSvc = d.ctaService
const ctaProps = {
  serviceSlug: ctaSvc?.slug ?? 'contact',
  serviceTitle: ctaSvc?.title ?? 'Book your consultation at Thrive',
  serviceDescription: ctaSvc?.shortDescription,
  blogSlug: d.slug.current,
}
```

**Top CTA** — rendered between keyTakeaways and body div:
```astro
<BlogCTA {...ctaProps} position="top" />
```

**Mid CTA** — JS template injection (see below), placed directly after the body div.

**Bottom CTA** — rendered after the FAQ section:
```astro
<BlogCTA {...ctaProps} position="bottom" />
```

---

### 4. Mid CTA — JS template injection

The article body is `legacyHtml` (pre-rendered HTML string). An Astro component cannot be injected into it at build time. Instead:

1. Astro pre-renders the mid CTA card HTML into a `<template id="blog-cta-mid">` element (hidden, outside the body div).
2. A small inline `<script>` runs after page load:
   - Finds all `h2` elements inside `.blog-post__body`
   - If there are ≥ 3 H2s, clones the template content and inserts it after the 3rd H2
   - If fewer than 3 H2s exist, the mid CTA is silently skipped

```html
<template id="blog-cta-mid">
  <!-- Astro renders full BlogCTA HTML here via set:html or Fragment -->
</template>

<script>
  const tmpl = document.getElementById('blog-cta-mid')
  const body = document.querySelector('.blog-post__body')
  if (tmpl && body) {
    const h2s = body.querySelectorAll('h2')
    if (h2s.length >= 3) {
      h2s[2].insertAdjacentElement('afterend', tmpl.content.cloneNode(true))
    }
  }
</script>
```

**Graceful degradation:** readers without JS see Top and Bottom CTAs only. SEO is unaffected (search engines index the full page without JS-injected content, which is acceptable for a CTA).

---

## File Change Summary

| File | Change |
|---|---|
| `astro/src/lib/sanityBlogLoader.ts` | Add `ctaService` to GROQ projection |
| `astro/src/content.config.ts` | Add `ctaService` to Zod schema |
| `astro/src/components/BlogCTA.astro` | **New** — soft callout CTA component |
| `astro/src/pages/blog/[slug].astro` | Add Top, Mid (template), Bottom CTAs |
| `thrive-styles.css` | Add `.blog-cta` CSS block |

---

## Out of Scope

- Sticky/floating CTA bar (explicitly rejected in favour of inline cards)
- New Sanity service pages (Tier A pages remain as Astro files)
- GTM container setup (Satemshi owns GTM config — dev provides the `data-gtm-*` attributes)
- TOC component (separate task)

---

## Acceptance Criteria

- [ ] All 3 blog CTA positions render on `/blog/non-alcoholic-fatty-liver-real-causes`
- [ ] Mid CTA appears after the 3rd H2 in the article body (verify in browser)
- [ ] CTA button href contains correct UTM params for each position
- [ ] Clicking the CTA button lands on the correct Tier A page (`/check-up`)
- [ ] `data-gtm-event="blog_cta_click"` present on the button `<a>` tag (verify in DevTools)
- [ ] Posts without `ctaService` render fallback CTA linking to `/contact`
- [ ] `npx astro check` passes with 0 errors
- [ ] `npm run build` succeeds
