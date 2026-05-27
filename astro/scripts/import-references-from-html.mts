/**
 * One-time migration: extract references from TierB HTML files and patch them into Sanity.
 *
 * Run from the astro/ directory:
 *   npx tsx scripts/import-references-from-html.mts
 *   npx tsx scripts/import-references-from-html.mts --dry-run   (preview only, no writes)
 */

import { createClient } from '@sanity/client'
import { readFileSync, readdirSync } from 'fs'
import { join, basename } from 'path'

// ── Config ────────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run')

// Token lives in root .env.local, not astro/.env.local
const ENV_FILE = join(import.meta.dirname, '..', '..', '.env.local')
const env: Record<string, string> = {}
for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
  if (!line.includes('=') || line.startsWith('#')) continue
  const i = line.indexOf('=')
  env[line.slice(0, i).trim()] = line.slice(i + 1).trim()
}

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

const HTML_DIRS = [
  join(import.meta.dirname, '..', '..', 'new html from vkasama', 'blog-tierB-bucket1'),
  join(import.meta.dirname, '..', '..', 'new html from vkasama', 'blog-tierB-bucket2'),
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract the blog slug from a canonical or hreflang link in the HTML */
function extractSlugFromHtml(html: string): string | null {
  // matches /blog/<slug> or /post/<slug>
  const m = html.match(/href="[^"]*\/(?:blog|post)\/([^/"]+)["\/]/)
  return m ? m[1] : null
}

/** Strip HTML tags from a string */
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

/** Extract structured citations from the references <ol> block */
function extractReferences(html: string): { title: string; source?: string; year?: number; url?: string }[] {
  // Handles all observed patterns across bucket1 + bucket2:
  //   A: <div class="references">...<ol>
  //   B: <h2>แหล่งอ้างอิง / เอกสารอ้างอิง</h2><ol class="ref-list">
  //   C: <h4>อ้างอิง</h4><ol>
  const refBlock =
    html.match(/<div class="references"[\s\S]*?<\/ol>/)?.[0]
    ?? html.match(/(?:แหล่งอ้างอิง|อ้างอิงทางวิทยาศาสตร์|เอกสารอ้างอิง|>อ้างอิง<)[\s\S]{0,300}?<ol[^>]*>[\s\S]*?<\/ol>/)?.[0]
  if (!refBlock) return []

  // Extract individual <li> items
  const liMatches = [...refBlock.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
  if (!liMatches.length) return []

  return liMatches.map(m => {
    const raw = m[1]

    // Extract URL from <a href="..."> if present
    const urlMatch = raw.match(/href="(https?:\/\/[^"]+)"/)
    const url = urlMatch ? urlMatch[1] : undefined

    // Strip tags for plain text
    const text = stripTags(raw)

    // Extract 4-digit year in parentheses: (2023) or . 2013.
    const yearMatch = text.match(/\((\d{4})\)/) ?? text.match(/\b(19|20)\d{2}\b/)
    const year = yearMatch ? parseInt(yearMatch[1]) : undefined

    // Extract journal/source — text inside <em> or italic pattern
    const sourceMatch = raw.match(/<em>(.*?)<\/em>/) ?? raw.match(/<i>(.*?)<\/i>/)
    const source = sourceMatch ? stripTags(sourceMatch[1]).slice(0, 160) : undefined

    return {
      title: text.slice(0, 220),
      ...(source ? { source } : {}),
      ...(year ? { year } : {}),
      ...(url ? { url } : {}),
    }
  }).filter(r => r.title.length > 5)
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(DRY_RUN ? '🔍 DRY RUN — no writes to Sanity\n' : '🚀 LIVE RUN — patching Sanity\n')

// Fetch all Sanity posts
const sanityPosts = await client.fetch<{ _id: string; slug: string; refCount: number }[]>(
  `*[_type=='blogPost'&&!(_id in path('drafts.**'))]{_id,'slug':slug.current,'refCount':count(references)}`
)
const sanityBySlug = new Map(sanityPosts.map(p => [p.slug, p]))
console.log(`Found ${sanityPosts.length} published Sanity posts\n`)

// Collect all HTML files
const htmlFiles: string[] = []
for (const dir of HTML_DIRS) {
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.html')) htmlFiles.push(join(dir, f))
  }
}
console.log(`Found ${htmlFiles.length} HTML files to process\n`)

let matched = 0, skipped = 0, unmatched = 0, alreadyHasRefs = 0

for (const filePath of htmlFiles) {
  const html = readFileSync(filePath, 'utf8')
  const fileName = basename(filePath)

  const slug = extractSlugFromHtml(html)
  if (!slug) {
    console.warn(`  ⚠️  No slug found: ${fileName}`)
    unmatched++
    continue
  }

  const post = sanityBySlug.get(slug)
  if (!post) {
    console.warn(`  ⚠️  No Sanity match for slug "${slug}" (${fileName})`)
    unmatched++
    continue
  }

  if (post.refCount > 0) {
    console.log(`  ⏭️  Already has ${post.refCount} refs — skipping: ${slug}`)
    alreadyHasRefs++
    skipped++
    continue
  }

  const refs = extractReferences(html)
  if (!refs.length) {
    console.warn(`  ⚠️  No references found in HTML: ${fileName}`)
    skipped++
    continue
  }

  console.log(`  ✅  ${slug} — ${refs.length} refs`)

  if (!DRY_RUN) {
    await client
      .patch(post._id)
      .set({ references: refs.map(r => ({ _type: 'citation', _key: crypto.randomUUID(), ...r })) })
      .commit()
  }

  matched++
}

console.log(`
────────────────────────────
Matched + patched : ${matched}
Already had refs  : ${alreadyHasRefs}
Skipped (no refs) : ${skipped - alreadyHasRefs}
No slug/match     : ${unmatched}
────────────────────────────
${DRY_RUN ? 'DRY RUN — nothing written to Sanity' : 'Done ✓'}
`)
