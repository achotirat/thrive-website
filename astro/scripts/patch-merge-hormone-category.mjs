#!/usr/bin/env node
// One-off: merge the duplicate blog categories "สุขภาพฮอร์โมน" and
// "ฮอร์โมนและการออกกำลังกาย" into a single "ฮอร์โมน" filter tag on /blog/.
//
// Run from the repo root:
//   node astro/scripts/patch-merge-hormone-category.mjs
//
// Token is loaded automatically from .env.local (SANITY_API_TOKEN).
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (!process.env.SANITY_API_TOKEN) {
  try {
    const envPath = join(__dirname, '../../.env.local')
    const envText = readFileSync(envPath, 'utf8')
    for (const line of envText.split('\n')) {
      const match = line.match(/^SANITY_API_TOKEN=(.*)$/)
      if (match) process.env.SANITY_API_TOKEN = match[1].trim()
    }
  } catch {
    // .env.local not found — SANITY_API_TOKEN must already be in the environment
  }
}

if (!process.env.SANITY_API_TOKEN) {
  console.error('Error: SANITY_API_TOKEN not set (checked env and .env.local)')
  process.exit(1)
}

const client = createClient({
  projectId: 'fc8ot1td',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const OLD_CATEGORIES = ['สุขภาพฮอร์โมน', 'ฮอร์โมนและการออกกำลังกาย']
const NEW_CATEGORY = 'ฮอร์โมน'

const docs = await client.fetch(
  `*[_type == "blogPost" && category in $old]{ _id, category }`,
  { old: OLD_CATEGORIES },
)

if (docs.length === 0) {
  console.log('Nothing to patch — no posts in', OLD_CATEGORIES.join(', '))
  process.exit(0)
}

const tx = client.transaction()
for (const doc of docs) {
  console.log(`${doc._id}: ${doc.category} -> ${NEW_CATEGORY}`)
  tx.patch(doc._id, (p) => p.set({ category: NEW_CATEGORY }))
}
await tx.commit()
console.log(`Patched ${docs.length} post(s).`)
