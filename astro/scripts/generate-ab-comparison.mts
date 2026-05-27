/**
 * Generates a side-by-side A/B comparison page for bucket2 HTML files
 * vs their likely Sanity counterparts.
 *
 * Run from astro/ directory:
 *   npx tsx scripts/generate-ab-comparison.mts
 * Opens: scripts/ab-comparison.html
 */

import { createClient } from '@sanity/client'
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join, basename } from 'path'

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT = join(import.meta.dirname, '..', '..')
const ENV_FILE = join(ROOT, '.env.local')
const env: Record<string,string> = {}
for (const line of readFileSync(ENV_FILE,'utf8').split('\n')) {
  if (!line.includes('=') || line.startsWith('#')) continue
  const i = line.indexOf('=')
  env[line.slice(0,i).trim()] = line.slice(i+1).trim()
}

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_API_TOKEN,
  useCdn: false,
})

const BUCKET2 = join(ROOT, 'new html from vkasama', 'blog-tierB-bucket2')

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractSlug(html: string): string | null {
  const m = html.match(/href="[^"]*\/(?:blog|post)\/([^/"]+)["\/]/)
  return m ? decodeURIComponent(m[1]) : null
}

function extractTitle(html: string): string {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
  if (h1) return h1.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().slice(0,120)
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return title ? title.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim().split('|')[0].trim().slice(0,120) : 'Untitled'
}

function extractBody(html: string): string {
  // Pull the <main> or <article> or largest <div class="container"> block
  return html.match(/<main[\s\S]*?<\/main>/i)?.[0]
    ?? html.match(/<article[\s\S]*?<\/article>/i)?.[0]
    ?? html.match(/<div class="container"[\s\S]*?<\/div>\s*<\/body>/i)?.[0]
    ?? '<p>(Could not extract body)</p>'
}

/** Score how well two slugs match — higher = better */
function slugScore(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase()
    .replace(/-/g,' ').replace(/_/g,' ')
    .split(/\s+/).filter(w => w.length > 2)
  const wa = new Set(normalize(a))
  const wb = new Set(normalize(b))
  let overlap = 0
  for (const w of wa) if (wb.has(w)) overlap++
  return overlap
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('Fetching Sanity posts...')
const sanityPosts = await client.fetch<{_id:string; slug:string; title:string; legacyHtml:string}[]>(
  `*[_type=='blogPost'&&!(_id in path('drafts.**'))]{_id,'slug':slug.current,title,legacyHtml}`
)
console.log(`${sanityPosts.length} posts loaded`)

const htmlFiles = readdirSync(BUCKET2).filter(f => f.endsWith('.html'))

type Pair = {
  fileName: string
  newSlug: string | null
  newTitle: string
  newBody: string
  sanitySlug: string | null
  sanityTitle: string
  sanityHtml: string
  score: number
  isNew: boolean
}

const pairs: Pair[] = []

for (const fileName of htmlFiles) {
  const html = readFileSync(join(BUCKET2, fileName), 'utf8')
  const newSlug = extractSlug(html)
  const newTitle = extractTitle(html)
  const newBody = extractBody(html)

  // Try exact match first
  let best = sanityPosts.find(p => p.slug === newSlug)
  let score = best ? 999 : 0

  // Then fuzzy match
  if (!best && newSlug) {
    let bestScore = 0
    for (const p of sanityPosts) {
      const s = slugScore(newSlug, p.slug)
      if (s > bestScore) { bestScore = s; best = p; score = s }
    }
  }

  // Also try matching against the filename itself
  if (!best || score < 1) {
    const fileSlug = fileName.replace('.html','').replace(/^blog-/,'')
    let bestScore = score
    for (const p of sanityPosts) {
      const s = slugScore(fileSlug, p.slug)
      if (s > bestScore) { bestScore = s; best = p; score = s }
    }
  }

  pairs.push({
    fileName,
    newSlug,
    newTitle,
    newBody,
    sanitySlug: best?.slug ?? null,
    sanityTitle: best?.title ?? '',
    sanityHtml: best?.legacyHtml ?? '',
    score,
    isNew: !best || score === 0,
  })
}

// Sort: matched pairs first, then new posts
pairs.sort((a,b) => (b.isNew ? -1 : 1) - (a.isNew ? -1 : 1) || b.score - a.score)

// ── Generate HTML ─────────────────────────────────────────────────────────────

const navLinks = pairs.map((p,i) => `
  <a href="#pair-${i}" class="${p.isNew ? 'new' : p.score >= 2 ? 'good' : 'weak'}">
    ${p.isNew ? '🆕' : p.score >= 2 ? '✅' : '⚠️'} ${p.newTitle.slice(0,50)}
  </a>`).join('\n')

const sections = pairs.map((p,i) => `
<section id="pair-${i}" class="pair">
  <div class="pair-header ${p.isNew ? 'is-new' : ''}">
    <div class="pair-meta">
      <h2>${p.newTitle}</h2>
      <div class="slugs">
        <span class="tag">New: <code>${p.newSlug ?? basename(p.fileName,'.html')}</code></span>
        ${p.sanitySlug ? `<span class="tag sanity-tag">Sanity: <code>${p.sanitySlug}</code></span>` : ''}
        <span class="badge ${p.isNew ? 'badge-new' : p.score >= 2 ? 'badge-match' : 'badge-weak'}">
          ${p.isNew ? 'NEW POST' : p.score >= 2 ? `Match (score ${p.score})` : `Weak match (score ${p.score})`}
        </span>
      </div>
      <div class="file-name">File: ${p.fileName}</div>
    </div>
  </div>
  <div class="columns">
    <div class="col col-a">
      <div class="col-label">A — Current Sanity${p.sanityTitle ? ': ' + p.sanityTitle : ''}</div>
      <div class="col-body">${p.sanityHtml || '<p class="empty">No legacyHtml in Sanity</p>'}</div>
    </div>
    <div class="col col-b">
      <div class="col-label">B — New HTML (bucket2)</div>
      <div class="col-body">${p.newBody}</div>
    </div>
  </div>
</section>`).join('\n')

const page = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>A/B Blog Comparison — Thrive (${pairs.length} posts)</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; font-size: 14px; background: #f5f5f5; color: #222; }

  /* Nav */
  nav { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; overflow-y: auto;
        background: #1a1a2e; padding: 16px 12px; }
  nav h1 { color: #fff; font-size: 13px; margin-bottom: 12px; padding-bottom: 8px;
            border-bottom: 1px solid #333; }
  nav a { display: block; padding: 6px 8px; margin-bottom: 3px; border-radius: 4px;
          color: #ccc; text-decoration: none; font-size: 12px; line-height: 1.4; }
  nav a:hover { background: #333; color: #fff; }
  nav a.good { color: #6ee7b7; }
  nav a.weak { color: #fcd34d; }
  nav a.new  { color: #93c5fd; }

  /* Main */
  main { margin-left: 260px; padding: 24px; }

  .pair { background: #fff; border-radius: 8px; margin-bottom: 32px;
          box-shadow: 0 1px 4px rgba(0,0,0,.1); overflow: hidden; }
  .pair-header { padding: 16px 20px; background: #f0f9ff; border-bottom: 2px solid #e0f0ff; }
  .pair-header.is-new { background: #eff6ff; border-color: #bfdbfe; }
  .pair-header h2 { font-size: 16px; margin-bottom: 8px; color: #111; }
  .slugs { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 6px; }
  .tag { font-size: 12px; background: #e2e8f0; padding: 2px 8px; border-radius: 99px; }
  .tag code { font-family: monospace; }
  .sanity-tag { background: #dbeafe; }
  .badge { font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 99px; }
  .badge-match { background: #d1fae5; color: #065f46; }
  .badge-weak  { background: #fef3c7; color: #92400e; }
  .badge-new   { background: #dbeafe; color: #1e40af; }
  .file-name { font-size: 11px; color: #888; }

  .columns { display: grid; grid-template-columns: 1fr 1fr; }
  .col { padding: 20px; overflow-x: auto; }
  .col + .col { border-left: 1px solid #e5e7eb; }
  .col-label { font-size: 11px; font-weight: 700; text-transform: uppercase;
               letter-spacing: .05em; color: #666; margin-bottom: 12px;
               padding-bottom: 6px; border-bottom: 1px solid #eee; }
  .col-a .col-label { color: #475569; }
  .col-b .col-label { color: #0369a1; }
  .col-body { font-size: 13px; line-height: 1.8; }
  .col-body h1,h2,h3,h4 { margin: 16px 0 8px; }
  .col-body p { margin-bottom: 10px; }
  .col-body img { max-width: 100%; height: auto; }
  .col-body table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12px; }
  .col-body th, .col-body td { border: 1px solid #ddd; padding: 6px 8px; }
  .col-body .sticky-bar, .col-body footer, .col-body header,
  .col-body nav, .col-body style, .col-body script { display: none; }
  .empty { color: #aaa; font-style: italic; }
</style>
</head>
<body>
<nav>
  <h1>A/B Comparison<br>${pairs.length} bucket2 files</h1>
  ${navLinks}
</nav>
<main>
  <div style="margin-bottom:24px; padding:16px; background:#fff; border-radius:8px; font-size:13px; line-height:1.8;">
    <strong>How to use:</strong> Each section shows the current Sanity version (A) vs the new bucket2 HTML (B).
    ✅ = strong slug match &nbsp; ⚠️ = weak match &nbsp; 🆕 = no existing Sanity post found.<br>
    Decide which version to keep and let Facade know the slug to use.
  </div>
  ${sections}
</main>
</body>
</html>`

const outFile = join(import.meta.dirname, 'ab-comparison.html')
writeFileSync(outFile, page)
console.log(`\n✅ Written to: ${outFile}`)
console.log(`Open in browser: open "${outFile}"`)
