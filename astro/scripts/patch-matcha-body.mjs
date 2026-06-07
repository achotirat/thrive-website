#!/usr/bin/env node
// One-off: patch legacyHtml on the matcha blog post to include inline images.
// Images are already in Sanity CDN — no upload needed.
// Run: SANITY_API_TOKEN=<token> node astro/scripts/patch-matcha-body.mjs
import { createClient } from '@sanity/client'
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

const client = createClient({
  projectId: 'fc8ot1td',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// CDN URLs from the successful upload run
const imageUrlMap = {
  'matcha-nutrients-vitamins-hero.webp': 'https://cdn.sanity.io/images/fc8ot1td/production/c617c1384f39522274342b7347816d7964a7b658-1260x720.png',
  'matcha-nutrients-diagram-1.webp':     'https://cdn.sanity.io/images/fc8ot1td/production/f5d1f317bbbe665fb17afef5a53872398bcdd77f-1776x896.jpg',
  'matcha-nutrients-infographic.webp':   'https://cdn.sanity.io/images/fc8ot1td/production/9cd5b0ca2364da0f8df1eb7940d35f967a169dec-1680x944.jpg',
  'matcha-absorption-flowchart.webp':    'https://cdn.sanity.io/images/fc8ot1td/production/51e77cb0b704976942f74fdc2278ed00fb407a61-1680x944.jpg',
}

async function mdToHtml(md) {
  const result = await unified()
    .use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify)
    .process(md)
  return String(result)
}

async function main() {
  let text = await readFile(join(BLOG_DIR, 'matcha-nutrients-vitamins.md'), 'utf8')
  text = text.replace(/^---[\s\S]*?---\n/, '')
  text = text.replace(/\s*\{#[^}]+\}/g, '').replace(/<!--[\s\S]*?-->/g, '')

  const introMarker = 'มัทฉะมีสารอาหารหลายชนิด'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Intro marker not found')
  let body = text.slice(introIdx)

  const faqIdx = body.indexOf('## คำถามที่พบบ่อย')
  if (faqIdx !== -1) body = body.slice(0, faqIdx)

  const refsStart = text.indexOf('## References')
  const imagePromptsStart = text.indexOf('## Image Prompts')
  if (refsStart !== -1) {
    const end = imagePromptsStart !== -1 ? imagePromptsStart : undefined
    body = body.trimEnd() + '\n\n---\n\n' + text.slice(refsStart, end).trim()
  }

  for (const [filename, url] of Object.entries(imageUrlMap)) {
    body = body.replaceAll(filename, url)
  }
  body = body.replace(/\n{4,}/g, '\n\n\n')

  const legacyHtml = await mdToHtml(body)
  console.log(`Built ${legacyHtml.length} chars of HTML`)
  console.log('diagram-1:  ', legacyHtml.includes('f5d1f317') ? '✓' : '✗ MISSING')
  console.log('infographic:', legacyHtml.includes('9cd5b0ca') ? '✓' : '✗ MISSING')
  console.log('flowchart:  ', legacyHtml.includes('51e77cb0') ? '✓' : '✗ MISSING')

  await client.patch('blog-matcha-nutrients-vitamins').set({ legacyHtml }).commit()
  console.log('\n✓ Sanity document patched — inline images should now appear on site')
}

main().catch(e => { console.error('\nError:', e.message); process.exit(1) })
