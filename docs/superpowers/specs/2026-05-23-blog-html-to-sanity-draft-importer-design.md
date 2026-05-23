# Blog HTML To Sanity Draft Importer Design

Date: 2026-05-23
Branch: feature/phase5-blog-migration
Status: Proposed for implementation

## Goal

Create a semi-automated importer that converts existing static blog HTML files into Sanity `blogPost` draft documents. The importer should reduce manual content entry while keeping human review in Sanity Studio before publishing.

## Scope

Import blog posts from these local sources:

- `new html from vkasama/blog-tierB-bucket1/*.html`
- `new html from vkasama/blog-tierB-bucket2/*.html`
- root-level `blog-*.html`

The importer creates drafts only. It must not publish documents automatically.

## Inputs

The script uses local HTML files and local image files under `image/`.

Runtime environment variables:

- `SANITY_API_TOKEN`: write-capable Sanity API token, required for non-dry-run imports.
- `PUBLIC_SANITY_PROJECT_ID`: defaults to `fc8ot1td` if omitted.
- `PUBLIC_SANITY_DATASET`: defaults to `production` if omitted.

The token stays local in `.env.local` or shell environment and must never be committed.

## Output

For each imported post, create or replace a Sanity draft document:

```text
drafts.blogPost.<slug>
```

Fields populated where available:

- `title`
- `slug`
- `category`
- `excerpt`
- `publishedAt`
- `updatedAt`
- `mainImage`
- `body`
- `faq`
- `seo`

The importer also writes a Markdown report:

```text
docs/blog-import-report.md
```

The report lists imported files, skipped files, inferred slugs, missing images, parse warnings, and documents created.

## Parsing Rules

Extract metadata from standard HTML first:

- `<title>` for title fallback.
- `<meta name="description">` for excerpt and SEO description.
- `<link rel="canonical">` for old URL and slug hints.
- Open Graph image for hero image hints.
- JSON-LD FAQPage for FAQ when present.
- `article:published_time` or nearby metadata for publish date.

Extract body content from semantic content regions when possible:

- Prefer `<main>`, `<article>`, `.article`, `.post`, or `.content`.
- Preserve headings, paragraphs, ordered lists, unordered lists, blockquotes, links, and images.
- Convert unsupported layout sections into plain rich text blocks rather than failing.

## Category Mapping

The first version uses a small mapping table by filename keywords:

- hormone, adrenal, testosterone, progesterone -> `ฮอร์โมน`
- chili, mineral, zinc, vitamin, apple, omega, probiotic -> `โภชนาการ`
- depression, mental, gaba, neurotransmitter -> `สุขภาพจิต`
- immunity, allergy, nk, glutathione -> `ภูมิคุ้มกัน`
- acne, skin, silica -> `ผิวหนัง`
- gut, intestine, probiotic -> `ระบบย่อยอาหาร`
- blood, triglyceride, coq10 -> `หัวใจและหลอดเลือด`
- period, menstrual, pms, pcos, menopause -> `สตรีสุขภาพ`

Unknown categories fall back to `โภชนาการ` and are flagged in the report.

## Command Shape

Dry-run:

```bash
node tools/import-blog-html-to-sanity.mjs --limit 10 --dry-run
```

Pilot import:

```bash
node tools/import-blog-html-to-sanity.mjs --limit 10
```

Full import:

```bash
node tools/import-blog-html-to-sanity.mjs
```

Useful options:

- `--limit <n>` imports only the first N files.
- `--dry-run` parses and reports without writing to Sanity.
- `--source <path>` imports a specific file or directory.
- `--replace` overwrites existing drafts for the same slug.

## Error Handling

The importer should continue past individual file errors and record them in the report.

Hard failures:

- Missing `SANITY_API_TOKEN` for non-dry-run.
- Sanity write API rejects authentication.
- Invalid project or dataset.

Soft failures:

- Missing hero image.
- Unrecognized category.
- Partial body parse.
- Missing FAQ.
- Duplicate slug, unless `--replace` is used.

## Verification

Local verification:

```bash
node tools/import-blog-html-to-sanity.mjs --limit 3 --dry-run
node tools/import-blog-html-to-sanity.mjs --limit 3
cd astro && PUBLIC_SANITY_PROJECT_ID=fc8ot1td PUBLIC_SANITY_DATASET=production npm run build
```

Manual verification:

1. Open Sanity Studio.
2. Confirm imported posts appear as drafts.
3. Review one pilot post.
4. Publish it.
5. Trigger a Netlify deploy.
6. Confirm `/blog` shows the post and `/blog/<slug>` renders.

## Out Of Scope

- Automatic publishing.
- Perfect preservation of custom HTML visual design.
- Creating advanced custom Portable Text blocks for every special layout.
- Running OCR or image editing.
- Importing service pages.

## Open Risks

Some source HTML files use highly custom sections, tables, or decorative cards. The first importer should prioritize SEO-safe content, clean text, links, headings, images, and FAQ. Rich visual parity can be improved later with custom block schemas if needed.
