#!/usr/bin/env node
// One-off: merge two duplicate blog category pairs on /blog/:
//   สุขภาพจิต          -> สุขภาพใจ  (the tag /blog/mental-health filters on)
//   หัวใจและหลอดเลือด   -> สุขภาพหัวใจและหลอดเลือด
//   ฟิตเนสและสุขภาพหัวใจ -> สุขภาพหัวใจและหลอดเลือด
//
// Run from the repo root:
//   node astro/scripts/patch-merge-mind-heart-categories.mjs
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

const MERGES = {
  'สุขภาพจิต': 'สุขภาพใจ',
  'หัวใจและหลอดเลือด': 'สุขภาพหัวใจและหลอดเลือด',
  'ฟิตเนสและสุขภาพหัวใจ': 'สุขภาพหัวใจและหลอดเลือด',
}

const docs = await client.fetch(
  `*[_type == "blogPost" && category in $old]{ _id, category }`,
  { old: Object.keys(MERGES) },
)

if (docs.length === 0) {
  console.log('Nothing to patch — no posts in', Object.keys(MERGES).join(', '))
  process.exit(0)
}

const tx = client.transaction()
for (const doc of docs) {
  const next = MERGES[doc.category]
  console.log(`${doc._id}: ${doc.category} -> ${next}`)
  tx.patch(doc._id, (p) => p.set({ category: next }))
}
await tx.commit()
console.log(`Patched ${docs.length} post(s).`)
