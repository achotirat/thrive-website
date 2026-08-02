---
name: thrive-sanity-blog-publish
description: Use when a Thrive blog post content (.md) and images (.webp) are ready in docs/blog/ and need to be published to Sanity, linked to a TierA service page, and submitted as a PR for Satemshi to approve. Triggers on "publish to Sanity", "upload blog", "push blog to Sanity", "create import script", or "blog is ready to go live".
---

# Thrive Sanity Blog Publisher

Writes and runs a Sanity import script for a completed blog post, links it to a TierA service, then opens a PR on a feature branch for Satemshi to approve.

## Pre-flight Checklist

Before writing anything, verify all inputs are present:

```bash
# 1. Token exists
grep SANITY_API_TOKEN .env.local

# 2. Content file exists
ls docs/blog/{slug}.md

# 3. Images exist (all must be .webp)
ls docs/blog/{slug}*.webp

# 4. TierA service slugs available
ls astro/src/content/services/
```

If token is missing → stop, tell user to add `SANITY_API_TOKEN=sk-...` to `.env.local`.  
If content or images missing → list what's found, ask user to confirm before continuing.

## Script Location & Naming

```
astro/scripts/import-{slug}.mjs
```

Always `.mjs`, always in `astro/scripts/`, always `import-` prefix.

## Canonical Script Template

Follow this pattern **exactly** — do not invent variations:

```js
#!/usr/bin/env node
import { createClient } from '@sanity/client'
import { createReadStream, readFileSync } from 'fs'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = join(__dirname, '../../docs/blog')

// Load .env.local
if (!process.env.SANITY_API_TOKEN) {
  try {
    const envPath = join(__dirname, '../../.env.local')
    const envContent = readFileSync(envPath, 'utf8')
    for (const line of envContent.split('\n')) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
      if (match) process.env[match[1]] ??= match[2].trim()
    }
  } catch {}
}
if (!process.env.SANITY_API_TOKEN) {
  console.error('Error: SANITY_API_TOKEN not found in environment or .env.local.')
  process.exit(1)
}

const client = createClient({
  projectId: 'fc8ot1td',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})
```

### Image Helper — Always Deduplicate

Use `getOrUploadImage` (not raw `uploadImage`) so re-runs don't create duplicate assets:

```js
async function getOrUploadImage(filename, altText) {
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{ _id, url }`,
    { filename },
  )
  if (existing) {
    console.log(`  ✓ Found existing asset: ${existing._id}`)
    return { asset: existing, altText }
  }
  console.log(`  Uploading ${filename}...`)
  const asset = await client.assets.upload('image', createReadStream(join(BLOG_DIR, filename)), {
    filename,
    contentType: 'image/webp',
  })
  console.log(`  ✓ Uploaded: ${asset._id}`)
  return { asset, altText }
}
```

### Body HTML Builder

```js
async function mdToHtml(md) {
  const result = await unified()
    .use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify)
    .process(md)
  return String(result)
}

async function buildBodyHtml(raw, imageUrlMap) {
  let text = raw.replace(/<!--[\s\S]*?-->/g, '').replace(/\s*\{#[^}]+\}/g, '')

  // Cut out the "## FAQ" (or "## คำถามที่พบบ่อย") section — [slug].astro
  // renders FAQ separately as an accordion from the doc's faq[] field (and
  // again in FAQPage JSON-LD), so leaving the raw FAQ markdown in legacyHtml
  // makes it render a THIRD time as plain paragraphs. Keep the References
  // section that follows it — that one has nowhere else to render.
  const faqMarker = text.includes('## FAQ') ? '## FAQ' : '## คำถามที่พบบ่อย'
  const refsMarker = '## References'
  const faqIdx = text.indexOf(faqMarker)
  const refsIdx = text.indexOf(refsMarker)
  if (faqIdx !== -1 && refsIdx !== -1 && faqIdx < refsIdx) {
    text = text.slice(0, faqIdx) + text.slice(refsIdx)
  }

  // Slice from intro paragraph to image prompts section
  const endMarker = '## Image Prompts'
  const endIdx = text.indexOf(endMarker)
  if (endIdx !== -1) text = text.slice(0, endIdx)
  for (const [filename, url] of Object.entries(imageUrlMap)) {
    text = text.replaceAll(filename, url)
  }
  return mdToHtml(text)
}
```

## Linking to a TierA Service (ctaService)

Always look up the service by slug — never hardcode the `_id`:

```js
async function findService(slug) {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == $slug][0]{ _id, title }`,
    { slug },
  )
  if (result) console.log(`  ✓ Found service: ${result._id} (${result.title})`)
  else console.log(`  ⚠ Service "${slug}" not found — ctaService skipped`)
  return result
}
```

Available TierA service slugs (from `astro/src/content/services/`):
`adrenal-fatigue`, `allergy-ige`, `cancer-screening`, `check-up`, `chelation`, `dna-test`, `food-intolerance`, `gluta`, `hbot`, `hormones-quiz`, `iv-drip`, `mental-health`, `nad`, `nk-cell`, `oligoscan`, `personalized-vitamins`, `urine-organic-test`, `vitamin-d`, `vitamins-and-micronutrients`

Ask the user which service to link if it isn't obvious from the blog topic.

## Sanity Document Shape

```js
const doc = {
  _type: 'blogPost',
  _id: `blog-${slug}`,               // e.g. 'blog-female-hormone-panel-age-40'
  title: '...',                       // Thai title
  slug: { _type: 'slug', current: slug },
  category: '...',                    // e.g. 'สุขภาพผู้หญิง'
  excerpt: '...',
  publishedAt: new Date().toISOString(),
  mainImage: {
    _type: 'imageWithAlt',
    asset: { _type: 'reference', _ref: heroAsset._id },
    alt: '...',
  },
  ...(service && { ctaService: { _type: 'reference', _ref: service._id } }),
  keyTakeaways: ['...', '...'],       // 4–6 bullet strings
  faq: [                              // 4–6 items
    { _type: 'faqItem', _key: 'faq-1', question: '...', shortAnswer: '...' },
  ],
  references: [
    { _type: 'citation', _key: 'ref-1', title: '...', source: '...', year: 2024, url: '...' },
  ],
  legacyHtml,                         // full HTML body
  seo: {
    _type: 'seoMeta',
    seoTitle: '...',
    seoDescription: '...',
    noIndex: false,
    schemaType: 'BlogPosting',
    includeInSitemap: true,
    sitemapPriority: 0.8,
  },
}
await client.createOrReplace(doc)
```

## Running the Script

```bash
node astro/scripts/import-{slug}.mjs
```

Run from repo root. Watch for errors — common ones:

| Error | Fix |
|-------|-----|
| `SANITY_API_TOKEN not found` | Add token to `.env.local` |
| `ENOENT: docs/blog/{file}` | Image filename mismatch — check exact filename |
| `Insufficient permissions` | Token needs Editor role in Sanity |
| `document already exists` | Safe — `createOrReplace` handles it |

## Branch & PR

After a successful import run:

```bash
git checkout -b feature/blog-{slug}
git add astro/scripts/import-{slug}.mjs
git commit -m "feat(blog): add {Thai title} + Sanity import script"
gh pr create \
  --title "feat(blog): {Thai title}" \
  --body "$(cat <<'EOF'
## Blog post
- **Slug:** /blog/{slug}
- **CTA service linked:** {tier-a-slug}
- **Images uploaded:** {list filenames}
- **Import script:** astro/scripts/import-{slug}.mjs (safe to re-run)

## Checklist
- [ ] `node astro/scripts/import-{slug}.mjs` ran without errors
- [ ] Post visible in Sanity Studio
- [ ] CTA service reference confirmed
- [ ] No secrets or PMS data included

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Branch naming: `feature/blog-{slug}` — never push to `main` directly.

## Common Mistakes

- **Uploading images without dedup check** → duplicate assets pile up in Sanity; always use `getOrUploadImage`
- **Hardcoding service `_id`** → IDs change across datasets; always look up by slug
- **Running script before content is sliced correctly** → `buildBodyHtml` must strip Image Prompts section and any draft frontmatter
- **Not stripping the FAQ section from legacyHtml** → `[slug].astro` renders FAQ separately as an accordion from `faq[]` (plus again in FAQPage JSON-LD). If `buildBodyHtml` doesn't also cut from `## FAQ`/`## คำถามที่พบบ่อย` to `## References`, the FAQ renders a third time as plain paragraphs mid-article. Verify by grepping the built `dist/blog/{slug}/index.html` for a FAQ question string — it must occur exactly 2× (JSON-LD + accordion), never 3×
- **Forgetting `.env.local` token check** → script must gracefully exit with a helpful message, not throw a cryptic error
- **Pushing to main** → always a feature branch, always a PR
