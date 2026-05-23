/**
 * Sanity blog post import script
 *
 * Reads HTML reference files, extracts metadata + FAQs, and creates
 * draft blogPost documents in Sanity via the Mutations API.
 *
 * Usage:
 *   SANITY_WRITE_TOKEN=<token> node scripts/import-blog-to-sanity.mjs [--dry-run] [--force] [--slug <slug>]
 *
 *   --dry-run   Parse only, print what would be created, do not mutate
 *   --force     Use createOrReplace instead of createIfNotExists (overwrites!)
 *   --slug      Import a single post by its slug
 *
 * Get a write token at https://sanity.io/manage → project fc8ot1td → API → Tokens
 * (needs "Editor" permission or "Create / Update" grants on dataset "production")
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const HTML_BASE = resolve(REPO_ROOT, 'new html from vkasama')

const PROJECT_ID = 'fc8ot1td'
const DATASET    = 'production'
const API_VER    = '2024-01-01'

// ─── Batch 2 manifest ───────────────────────────────────────────────────────
// Traffic rank 11-20 from SITE-TRACKER.md
const BATCH2 = [
  { slug: 'ashwagandha',       category: 'สุขภาพจิต',      dir: 'blog-tierB-bucket2', file: 'blog-ashwagandha.html' },
  { slug: 'intestine',         category: 'ระบบย่อยอาหาร',  dir: 'blog-tierB-bucket1', file: 'blog-intestine.html' },
  { slug: 'tryptophan',        category: 'สุขภาพจิต',      dir: 'blog-tierB-bucket1', file: 'blog-tryptophan.html' },
  { slug: 'gaba',              category: 'สุขภาพจิต',      dir: 'blog-tierB-bucket1', file: 'blog-gaba.html' },
  { slug: 'mental-health',     category: 'สุขภาพจิต',      dir: 'blog-tierB-bucket1', file: 'blog-mental-health.html' },
  { slug: 'silica',            category: 'ผิวหนัง',        dir: 'blog-tierB-bucket1', file: 'blog-silica.html' },
  { slug: 'bromelain',         category: 'ระบบย่อยอาหาร',  dir: 'blog-tierB-bucket1', file: 'blog-bromelain.html' },
  { slug: 'omega3',            category: 'สุขภาพจิต',      dir: 'blog-tierB-bucket1', file: 'blog-omega3.html' },
  { slug: 'neurotransmitters', category: 'สุขภาพจิต',      dir: 'blog-tierB-bucket1', file: 'blog-neurotransmitters.html' },
  { slug: 'period-acne',       category: 'สตรีสุขภาพ',     dir: 'blog-tierB-bucket1', file: 'blog-period-acne.html' },
]

// ─── HTML parsers ────────────────────────────────────────────────────────────

function parseTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/)
  if (!m) return ''
  return m[1].replace(/\s*\|\s*Thrive.*$/, '').trim()
}

function parseDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)
  return m ? m[1].trim() : ''
}

function parsePublishedAt(html) {
  // Prefer article:published_time (most accurate, has timezone)
  let m = html.match(/<meta\s+property="article:published_time"\s+content="([^"]+)"/)
  if (m) return m[1]
  // Fall back to JSON-LD datePublished
  m = html.match(/"datePublished":\s*"([^"]+)"/)
  if (m) {
    const v = m[1]
    return v.length === 10 ? `${v}T00:00:00.000Z` : v
  }
  return new Date().toISOString()
}

function parseFaqs(html) {
  const ldRe = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g
  let m
  while ((m = ldRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1])
      // Three LD+JSON formats in the wild:
      //   1. Top-level array:  [{ @type: "X" }, ...]
      //   2. @graph wrapper:   { @graph: [{ @type: "X" }, ...] }
      //   3. Single object:    { @type: "FAQPage", ... }
      const nodes = Array.isArray(data)
        ? data
        : Array.isArray(data['@graph'])
          ? data['@graph']
          : [data]
      for (const node of nodes) {
        if (node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
          return node.mainEntity.map(q => ({
            question:    (q.name ?? '').trim(),
            shortAnswer: (q.acceptedAnswer?.text ?? '').trim(),
          }))
        }
      }
    } catch {
      // skip malformed LD+JSON blocks
    }
  }
  return []
}

function parseBodyBlocks(html) {
  // Grab content between the first <article> or .blog-body start and the CTA/references end
  const regionRe = /class="(?:blog-body|blog-post-wrap|post-content|entry-content)"[^>]*>([\s\S]*?)(?=class="(?:post-cta|cta-block|references-section|faq-section)"|<\/article>)/
  const region = html.match(regionRe)?.[1] ?? html

  const blocks = []
  const tagRe = /<(h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/g
  let match
  while ((match = tagRe.exec(region)) !== null) {
    const tag  = match[1]
    const text = match[2]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g,  '&')
      .replace(/&lt;/g,   '<')
      .replace(/&gt;/g,   '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g,    ' ')
      .trim()
    if (!text) continue
    blocks.push(makeBlock(tag === 'h2' ? 'h2' : tag === 'h3' ? 'h3' : 'normal', text))
  }

  return blocks.length > 0 ? blocks : [makeBlock('normal', '(Body content to be added in Studio)')]
}

// ─── Portable Text helpers ───────────────────────────────────────────────────

function key(len = 12) {
  return randomBytes(len).toString('hex').slice(0, len)
}

function makeBlock(style, text) {
  return {
    _type:     'block',
    _key:      key(),
    style,
    markDefs:  [],
    children:  [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

function makeFaqItem(q) {
  return {
    _type:       'faqItem',
    _key:        key(),
    question:    q.question.slice(0, 180),
    shortAnswer: q.shortAnswer.slice(0, 320),
    answer:      [makeBlock('normal', q.shortAnswer || q.question)],
  }
}

// ─── Sanity Mutations API ────────────────────────────────────────────────────

async function sanityMutate(mutations, token) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VER}/data/mutate/${DATASET}`
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Sanity ${res.status}: ${body.slice(0, 300)}`)
  }
  return res.json()
}

// ─── Per-post import ─────────────────────────────────────────────────────────

function buildDoc(post, html) {
  const title       = parseTitle(html)
  const excerpt     = parseDescription(html).slice(0, 240)
  const publishedAt = parsePublishedAt(html)
  const faqs        = parseFaqs(html)
  const body        = parseBodyBlocks(html)

  return {
    _type:       'blogPost',
    _id:         `drafts.blog-post-${post.slug}`,
    title,
    slug:        { _type: 'slug', current: post.slug },
    category:    post.category,
    excerpt,
    publishedAt,
    body,
    faq:         faqs.map(makeFaqItem),
    seo: {
      _type:          'seoMeta',
      seoTitle:        title.slice(0, 70),
      seoDescription:  excerpt.slice(0, 155),
      schemaType:      'BlogPosting',
    },
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const FORCE   = args.includes('--force')
const slugIdx = args.indexOf('--slug')
const onlySlug = slugIdx !== -1 ? args[slugIdx + 1] : null
const TOKEN   = process.env.SANITY_WRITE_TOKEN

if (!DRY_RUN && !TOKEN) {
  console.error('Error: SANITY_WRITE_TOKEN env var is required for mutations.')
  console.error('Get one at: https://sanity.io/manage → project fc8ot1td → API → Tokens')
  process.exit(1)
}

const posts = onlySlug ? BATCH2.filter(p => p.slug === onlySlug) : BATCH2
if (posts.length === 0) {
  console.error(`No posts matched slug "${onlySlug}". Available: ${BATCH2.map(p => p.slug).join(', ')}`)
  process.exit(1)
}

const mutationType = FORCE ? 'createOrReplace' : 'createIfNotExists'
console.log(`\nBlog import  •  ${PROJECT_ID}/${DATASET}`)
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : mutationType}  •  ${posts.length} post(s)\n`)

for (const post of posts) {
  process.stdout.write(`  ${post.slug.padEnd(22)}`)
  const htmlPath = resolve(HTML_BASE, post.dir, post.file)
  let html
  try {
    html = readFileSync(htmlPath, 'utf-8')
  } catch {
    console.log(`❌ file not found: ${post.dir}/${post.file}`)
    continue
  }

  const doc = buildDoc(post, html)
  const preview = `"${doc.title.slice(0, 45)}"  (${doc.body.length} blocks, ${doc.faq.length} FAQs)`

  if (DRY_RUN) {
    console.log(`[dry] ${preview}`)
    continue
  }

  try {
    await sanityMutate([{ [mutationType]: doc }], TOKEN)
    console.log(`✅ ${preview}`)
  } catch (err) {
    console.log(`❌ ${err.message}`)
  }
}

console.log('\nDone.')
if (!DRY_RUN) {
  console.log('→ Review and publish drafts at: https://thrivewellnessth.sanity.studio/structure/blogPost')
}
