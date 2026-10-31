#!/usr/bin/env node
// Add thyroid-cluster back-links to 4 live blog posts (legacyHtml only).
// Mirrors the one-line edits made in docs/blog/*.md on feature/blog-hypothyroidism.
//
// Run from the repo root:
//   node astro/scripts/patch-thyroid-backlinks.mjs           # dry run
//   node astro/scripts/patch-thyroid-backlinks.mjs --write   # patch published docs
//
// Safe to re-run: posts that already contain the link are skipped. Refuses to patch a
// post unless its anchor text appears exactly once.
//
// Token is loaded automatically from .env.local (SANITY_API_TOKEN).

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WRITE = process.argv.includes('--write')

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

const link = (href, text) => `<a href="${href}">${text}</a>`

// anchor = text right before the insertion point in legacyHtml
const PATCHES = [
  {
    slug: 'hyrox-overtraining-hormone-imbalance',
    anchor: 'แยกภาวะไทรอยด์ต่ำที่มีอาการคล้ายกันออกจาก OTS',
    insert: ` (${link('/blog/hypothyroidism-symptoms', 'ไทรอยด์ต่ำ อาการเป็นอย่างไร')})`,
  },
  {
    slug: 'female-hormone-panel-age-40',
    anchor: 'นั่นคือเหตุผลที่ต้องตรวจทั้งระบบ',
    insert: ` (อ่านเพิ่มเติม: ${link('/blog/hypothyroidism-symptoms', 'ไทรอยด์ต่ำ อาการเป็นอย่างไร')})`,
  },
  {
    slug: 'hormone-balancing-foods-women',
    anchor: 'ช่วงวันที่ 2–5 ของรอบเดือน',
    insert: ` (ถ้าเป็นไทรอยด์ต่ำอยู่ อ่าน ${link('/blog/hypothyroidism-foods-to-avoid', 'ไทรอยด์ต่ำ ห้ามกินอะไร')})`,
  },
  {
    slug: 'red-s-relative-energy-deficiency-sport',
    anchor: 'อัตราการเผาผลาญพื้นฐานลดลง',
    insert: ` ฮอร์โมนไทรอยด์ T3 อาจลดตาม (${link('/blog/hypothyroidism-symptoms#exercise-energy', 'แยกจากโรคไทรอยด์ต่ำอย่างไร')})`,
  },
]

console.log(`Mode: ${WRITE ? 'WRITE' : 'DRY RUN (nothing is written)'}`)
let failed = 0
for (const { slug, anchor, insert } of PATCHES) {
  const id = `blog-${slug}`
  const doc = await client.fetch(`*[_id == $id][0]{ _id, _rev, legacyHtml }`, { id })
  if (!doc?.legacyHtml) {
    console.log(`✗ ${slug}: published doc or legacyHtml not found`)
    failed++
    continue
  }
  if (doc.legacyHtml.includes(insert)) {
    console.log(`= ${slug}: already linked, skipped`)
    continue
  }
  const count = doc.legacyHtml.split(anchor).length - 1
  if (count !== 1) {
    console.log(`✗ ${slug}: anchor found ${count}× (need exactly 1)`)
    failed++
    continue
  }
  const legacyHtml = doc.legacyHtml.replace(anchor, anchor + insert)
  console.log(`✓ ${slug}: …${anchor}${insert}`)
  if (WRITE) await client.patch(id).ifRevisionId(doc._rev).set({ legacyHtml }).commit()
}

if (!WRITE) console.log('Dry run only. Add --write to patch.')
if (failed) process.exitCode = 1
