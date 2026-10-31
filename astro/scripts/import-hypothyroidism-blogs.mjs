#!/usr/bin/env node
// Import docs/blog/hypothyroidism-symptoms.md and hypothyroidism-foods-to-avoid.md into Sanity.
//
// Adapted from import-wix-articles.mjs (same markdown layout). Differences:
// reviewer is Dr. Pijak, ctaService is optional (blank → sticky CTA falls back
// to /contact), and the disclaimer line before References is kept in the body.
//
// Run from the repo root:
//   node astro/scripts/import-hypothyroidism-blogs.mjs            # dry run
//   node astro/scripts/import-hypothyroidism-blogs.mjs --write    # save as Sanity DRAFT (not on the site)
//   node astro/scripts/import-hypothyroidism-blogs.mjs --publish  # go live
//
// --publish is refused while the .md still has the "<!-- Review note: ... -->" line
// (remove it once Dr. Pijak has approved the "มุมมองจากแพทย์ Thrive" section)
// or the hero image is missing from docs/blog/.
// --dump <dir> writes legacyHtml and the Sanity document (JSON) to <dir> for review.
//
// Token is loaded automatically from .env.local (SANITY_API_TOKEN).

import { createClient } from '@sanity/client'
import { createReadStream, readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { parse as parseYaml } from 'yaml'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = join(__dirname, '../../docs/blog')

const ARTICLES = ['hypothyroidism-symptoms', 'hypothyroidism-foods-to-avoid']

const args = process.argv.slice(2)
const PUBLISH = args.includes('--publish')
const WRITE = PUBLISH || args.includes('--write')
const dumpIdx = args.indexOf('--dump')
const DUMP_DIR = dumpIdx !== -1 ? args[dumpIdx + 1] : null
const slugs = args.filter((a, i) => !a.startsWith('--') && !(dumpIdx !== -1 && i === dumpIdx + 1))
const selected = slugs.length ? slugs : ARTICLES
for (const s of selected) {
  if (!ARTICLES.includes(s)) {
    console.error(`Unknown slug "${s}". Expected one of: ${ARTICLES.join(', ')}`)
    process.exit(1)
  }
}

if (!process.env.SANITY_API_TOKEN) {
  try {
    const envContent = readFileSync(join(__dirname, '../../.env.local'), 'utf8')
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

// ── markdown parsing ──────────────────────────────────────────────

const stripCitations = (s) => s.replace(/\s*(\[\d+\])+/g, '')
const plainText = (s) =>
  stripCitations(s).replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()

function section(text, startMarker, endPattern) {
  const start = text.indexOf(startMarker)
  if (start === -1) throw new Error(`Missing section "${startMarker}"`)
  const rest = text.slice(start + startMarker.length)
  const end = rest.search(endPattern)
  return end === -1 ? rest : rest.slice(0, end)
}

function parseArticle(raw) {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/)
  if (!fmMatch) throw new Error('Missing frontmatter')
  const fm = parseYaml(fmMatch[1])
  const text = raw.slice(fmMatch[0].length)

  const keyTakeaways = section(text, '**สรุปสั้น**', /\n\*\*ในบทความนี้\*\*/)
    .split('\n')
    .filter((l) => l.startsWith('- '))
    .map((l) => plainText(l.slice(2)))

  const faqText = section(text, '## FAQ {#faq}', /\n---\n/)
  const faq = [...faqText.matchAll(/^\*\*(.+?)\*\*\n([\s\S]+?)(?=\n\s*\n|\s*$)/gm)].map((m, i) => ({
    _type: 'faqItem',
    _key: `faq-${i + 1}`,
    question: plainText(m[1]),
    shortAnswer: plainText(m[2].replace(/\n/g, ' ')),
  }))

  const references = section(text, '## References', /\n(---|## )/)
    .split('\n')
    .map((l) => l.match(/^\[(\d+)\]\s+(.+)$/))
    .filter(Boolean)
    .map(([, n, body]) => parseCitation(n, body))

  return { fm, text, keyTakeaways, faq, references, reviewPending: /<!--\s*Review note:/.test(raw) }
}

function parseCitation(n, body) {
  const url = body.match(/https?:\/\/\S+$/)?.[0]
  const withoutUrl = url ? body.slice(0, -url.length).trim() : body
  const yearMatch = withoutUrl.match(/\((\d{4})[^)]*\)\.\s*/)
  let year = yearMatch ? Number(yearMatch[1]) : undefined
  if (year && year > 2400) year -= 543 // Thai Buddhist year
  const afterYear = yearMatch ? withoutUrl.slice(yearMatch.index + yearMatch[0].length) : withoutUrl
  const italic = afterYear.match(/\*([^*]+)\*/)
  const beforeItalic = (italic ? afterYear.slice(0, italic.index) : afterYear).trim().replace(/\.$/, '')
  // Undated web pages ("Agency. *Page title*. url"): the italic part is the title, the agency the source
  // Dated agency/news items ("Agency. (Year). *Title*." or "Agency. (Year). Title."): the
  // italic (or plain) part is the title and the author block before the year is the source
  const author = yearMatch ? withoutUrl.slice(0, yearMatch.index).trim().replace(/\.$/, '') : ''
  const [title, source] = !yearMatch && italic
    ? [italic[1], beforeItalic]
    : yearMatch && italic && !beforeItalic
      ? [italic[1].trim().replace(/\.$/, ''), author]
      : yearMatch && !italic
        ? [beforeItalic, author]
        : [beforeItalic || withoutUrl, italic?.[1].replace(/,\s*$/, '')]
  return {
    _type: 'citation',
    _key: `ref-${n}`,
    title: title.replace(/\*/g, ''),
    ...(source && { source }),
    ...(year && { year }),
    ...(url && { url }),
  }
}

async function buildBodyHtml(text, inlineUrls) {
  // Start at the intro paragraph: H1, สรุปสั้น, TOC and the top CTA are rendered by the
  // blog layout (title, keyTakeaways, sticky CTA). The top CTA is the 2nd "---" pair after the TOC.
  const tocIdx = text.indexOf('**ในบทความนี้**')
  const ctaOpen = text.indexOf('\n---\n', tocIdx)
  const ctaClose = text.indexOf('\n---\n', ctaOpen + 5)
  if (tocIdx === -1 || ctaOpen === -1 || ctaClose === -1) throw new Error('Could not locate intro after top CTA')
  let body = text.slice(ctaClose + 5)

  // FAQ renders as an accordion from faq[]; drop it (and the bottom CTA after it),
  // keep the disclaimer line and References.
  const faqIdx = body.indexOf('## FAQ {#faq}')
  const disclaimerIdx = body.indexOf('*บทความนี้ให้ข้อมูลทั่วไป')
  const refsIdx = body.indexOf('## References')
  body = body.slice(0, faqIdx) + body.slice(disclaimerIdx !== -1 ? disclaimerIdx : refsIdx)
  body = body.slice(0, body.indexOf('## Image Prompts')).replace(/\n---\s*$/, '\n')

  // Keep "{#id}" anchors as <h2 id> so deep links like /blog/hypothyroidism-symptoms#exercise-energy work
  const h2Ids = [...body.matchAll(/^## .+?(?:\s*\{#([^}]+)\})?$/gm)].map((m) => m[1])

  // Inline image placeholders → markdown images (only for images that exist)
  let lastH2 = ''
  body = body
    .split('\n')
    .map((line) => {
      const h2 = line.match(/^## (.+?)(\s*\{#[^}]+\})?$/)
      if (h2) lastH2 = h2[1]
      const img = line.match(/^<!--\s*Inline image:\s*(\S+?)\s*-->$/)
      if (!img) return line
      const url = inlineUrls[img[1]]
      return url ? `![ภาพประกอบ: ${lastH2}](${url})` : ''
    })
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\{#[^}]+\}/g, '')
    .replace(/\n{4,}/g, '\n\n\n')

  const html = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).process(body)
  let h2Index = 0
  return String(html).replace(/<h2>/g, () => {
    const id = h2Ids[h2Index++]
    return id ? `<h2 id="${id}">` : '<h2>'
  })
}

// ── Sanity helpers ────────────────────────────────────────────────

const findAsset = (filename) =>
  client.fetch(`*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{ _id, url }`, { filename })

async function resolveImage(filename) {
  const existing = await findAsset(filename)
  if (existing) return { ...existing, status: 'in Sanity' }
  if (!existsSync(join(BLOG_DIR, filename))) return null
  if (!WRITE) return { _id: '(upload on --write)', url: `https://cdn.sanity.io/(pending)/${filename}`, status: 'will upload' }
  const asset = await client.assets.upload('image', createReadStream(join(BLOG_DIR, filename)), {
    filename,
    contentType: 'image/webp',
  })
  return { _id: asset._id, url: asset.url, status: 'uploaded' }
}

async function importArticle(slug) {
  console.log(`\n── ${slug} ──`)
  const raw = readFileSync(join(BLOG_DIR, `${slug}.md`), 'utf8')
  const { fm, text, keyTakeaways, faq, references, reviewPending } = parseArticle(raw)
  if (fm.slug !== slug) throw new Error(`frontmatter slug "${fm.slug}" ≠ "${slug}"`)

  // Check publish blockers before uploading anything
  const heroAvailable = existsSync(join(BLOG_DIR, fm.heroImage)) || Boolean(await findAsset(fm.heroImage))
  const blockers = [
    reviewPending && 'doctor review pending (Review note still in .md)',
    !heroAvailable && `hero image ${fm.heroImage} missing`,
  ].filter(Boolean)
  if (blockers.length) console.log(`  publish blocked: ${blockers.join('; ')}`)
  if (PUBLISH && blockers.length) {
    console.log('  ✗ not published, nothing uploaded')
    return { slug, ok: false, blockers }
  }

  const hero = await resolveImage(fm.heroImage)
  console.log(`  hero ${fm.heroImage}: ${hero ? hero.status : 'MISSING'}`)

  const inlineUrls = {}
  for (const [, filename] of raw.matchAll(/<!--\s*Inline image:\s*(\S+?)\s*-->/g)) {
    const img = await resolveImage(filename)
    console.log(`  inline ${filename}: ${img ? img.status : 'missing, skipped'}`)
    if (img) inlineUrls[filename] = img.url
  }

  const service = fm.ctaService
    ? await client.fetch(`*[_type == "service" && slug.current == $slug][0]{ _id, title }`, { slug: fm.ctaService })
    : null
  console.log(`  ctaService ${fm.ctaService ?? '(none → /contact)'}: ${service ? service._id : 'not linked'}`)

  const legacyHtml = await buildBodyHtml(text, inlineUrls)
  console.log(`  category ${fm.category} · ${keyTakeaways.length} takeaways · ${faq.length} FAQ · ${references.length} refs · body ${legacyHtml.length} chars`)
  if (DUMP_DIR) {
    mkdirSync(DUMP_DIR, { recursive: true })
    writeFileSync(join(DUMP_DIR, `${slug}.html`), legacyHtml)
  }

  const id = `blog-${slug}`
  const doc = {
    _type: 'blogPost',
    _id: PUBLISH ? id : `drafts.${id}`,
    title: fm.title,
    slug: { _type: 'slug', current: slug },
    category: fm.category,
    excerpt: fm.excerpt,
    publishedAt: `${fm.publishedAt}T00:00:00.000Z`,
    ...(hero && WRITE && {
      mainImage: { _type: 'imageWithAlt', asset: { _type: 'reference', _ref: hero._id }, alt: fm.heroAlt },
    }),
    ...(service && { ctaService: { _type: 'reference', _ref: service._id } }),
    reviewedByDoctor: 'pijak',
    keyTakeaways,
    faq,
    references,
    body: [
      {
        _type: 'block',
        _key: 'body-legacy-placeholder',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's1', marks: [], text: 'Full content stored in legacyHtml.' }],
      },
    ],
    legacyHtml,
    seo: { _type: 'seoMeta', seoTitle: fm.seoTitle, seoDescription: fm.seoDescription },
  }

  if (DUMP_DIR) writeFileSync(join(DUMP_DIR, `${slug}.json`), JSON.stringify({ ...doc, legacyHtml: `(${slug}.html)` }, null, 2))
  if (!WRITE) return { slug, ok: true, blockers }
  await client.createOrReplace(doc)
  if (PUBLISH) await client.delete(`drafts.${id}`).catch(() => {})
  console.log(`  ✓ ${PUBLISH ? 'published' : 'saved as draft'}: ${doc._id}`)
  console.log(`  https://jx3ty6pl155yiizbs6ry5t4q.sanity.studio/structure/blogPost;${id}`)
  return { slug, ok: true, blockers }
}

console.log(`Mode: ${PUBLISH ? 'PUBLISH' : WRITE ? 'WRITE (drafts)' : 'DRY RUN (nothing is written)'}`)
const results = []
for (const slug of selected) results.push(await importArticle(slug))

const blocked = results.filter((r) => r.blockers.length)
console.log(`\n${results.filter((r) => r.ok).length}/${results.length} ${PUBLISH ? 'published' : WRITE ? 'saved as drafts' : 'parsed OK'}`)
if (blocked.length) console.log(`Not publishable yet: ${blocked.map((r) => r.slug).join(', ')}`)
if (!WRITE) console.log('Dry run only. Add --write to save drafts, or --publish to go live.')
if (PUBLISH && blocked.length) process.exitCode = 1
