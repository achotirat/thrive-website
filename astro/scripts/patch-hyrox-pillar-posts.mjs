#!/usr/bin/env node
// One-off: fix the 4-post HYROX/heavy-training pillar cluster —
//   1. bottom "Reviewed by" card -> หมอบาย on all 4 (was defaulting to หมอนุ่น)
//   2. cap CTAs at 2 per post, no duplicates (each currently repeats its single
//      ctaService 3x top/mid/bottom); the 2nd CTA becomes whichever of
//      adrenal-fatigue / hormones-quiz isn't already the post's primary
//   3. HYROX post only: remove the inaccurate "we already treat HYROX/Hybrid
//      Training patients" claim from the practitioner quote
//
// Run from the repo root:
//   node astro/scripts/patch-hyrox-pillar-posts.mjs
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

const HORMONE_QUIZ_CTA = {
  slug: 'hormones-quiz',
  title: 'แบบทดสอบฮอร์โมนฟรี',
  description: 'อ่อนเพลียเรื้อรัง น้ำหนักขึ้น อารมณ์แปรปรวน อาจเป็นสัญญาณฮอร์โมนไม่สมดุล ทำแบบทดสอบฟรี 2 นาที',
}

const ADRENAL_FATIGUE_CTA = {
  slug: 'adrenal-fatigue',
  title: 'ตรวจภาวะต่อมหมวกไตล้า',
  description: 'อ่อนเพลียเรื้อรัง ตื่นมาไม่สดชื่น อยากของหวานทั้งวัน อาจมาจาก Cortisol ไม่สมดุล ตรวจกับแพทย์ Anti-aging',
}

const POSTS = [
  {
    id: 'blog-hyrox-overtraining-hormone-imbalance',
    secondaryCta: HORMONE_QUIZ_CTA, // primary ctaService is adrenal-fatigue
    legacyHtmlFix: {
      find: 'ที่ซ้อมกีฬาแบบ HYROX หรือ Hybrid Training มักมาหาเรา',
      replace: 'ที่ออกกำลังกายหนักจนเริ่มมีอาการ Overtraining มักมาหาเรา',
    },
  },
  {
    id: 'blog-red-s-relative-energy-deficiency-sport',
    secondaryCta: HORMONE_QUIZ_CTA, // primary ctaService is adrenal-fatigue
  },
  {
    id: 'blog-low-testosterone-heavy-exercise-men',
    secondaryCta: ADRENAL_FATIGUE_CTA, // primary ctaService is hormones-quiz
  },
  {
    id: 'blog-prevent-hormone-imbalance-heavy-training',
    secondaryCta: HORMONE_QUIZ_CTA, // primary ctaService is adrenal-fatigue
  },
]

async function patchOne({ id, secondaryCta, legacyHtmlFix }) {
  const doc = await client.getDocument(id)
  if (!doc) throw new Error(`Document ${id} not found`)

  const setPayload = {
    reviewedByDoctor: 'pijak',
    secondaryCta,
  }

  if (legacyHtmlFix) {
    const legacyHtml = doc.legacyHtml ?? ''
    if (!legacyHtml.includes(legacyHtmlFix.find)) {
      throw new Error(
        `Expected substring not found in ${id}'s legacyHtml — has the post already been edited? Looking for: ${legacyHtmlFix.find}`
      )
    }
    setPayload.legacyHtml = legacyHtml.replace(legacyHtmlFix.find, legacyHtmlFix.replace)
  }

  await client.patch(id).set(setPayload).commit()

  console.log(`✓ Patched ${id}`)
  console.log(`  reviewedByDoctor -> pijak`)
  console.log(`  secondaryCta -> ${secondaryCta.slug}`)
  if (legacyHtmlFix) console.log(`  legacyHtml claim removed: ${legacyHtmlFix.find}`)
}

async function main() {
  for (const post of POSTS) {
    await patchOne(post)
  }
}

main().catch((e) => {
  console.error('\nError:', e.message)
  process.exit(1)
})
