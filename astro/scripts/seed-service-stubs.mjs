#!/usr/bin/env node
/**
 * Seeds minimal Sanity service stubs for all Tier A service pages.
 *
 * These stubs allow blog posts to reference services via ctaService.
 * Full content (description, images, FAQ) should be added in Sanity Studio.
 *
 * Run from repo root:
 *   node astro/scripts/seed-service-stubs.mjs
 *
 * Safe to re-run — uses createIfNotExists so existing docs are never overwritten.
 */

import { createClient } from '@sanity/client'

if (!process.env.SANITY_API_TOKEN) {
  console.error('Error: SANITY_API_TOKEN environment variable is required.')
  process.exit(1)
}

const client = createClient({
  projectId: 'fc8ot1td',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const stubs = [
  // Already exists — skipped by createIfNotExists
  {
    _id: 'service-food-intolerance',
    slug: 'food-intolerance',
    title: 'Food Intolerance Test',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจภูมิแพ้อาหารแฝง IgG เพื่อค้นหาอาหารที่อาจกระตุ้นอาการเรื้อรัง',
  },
  {
    _id: 'service-check-up',
    slug: 'check-up',
    title: 'Health Check-Up',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจสุขภาพประจำปีครบวงจร — blood panel, lipid profile, และการประเมินสุขภาพเชิงป้องกัน',
  },
  {
    _id: 'service-adrenal-fatigue',
    slug: 'adrenal-fatigue',
    title: 'Adrenal Fatigue Treatment',
    category: 'hormone-longevity',
    shortDescription: 'ประเมินและรักษาภาวะต่อมหมวกไตล้า — cortisol, HPA axis, และความเหนื่อยล้าเรื้อรัง',
  },
  {
    _id: 'service-hormones-quiz',
    slug: 'hormones-quiz',
    title: 'Hormone Health Assessment',
    category: 'hormone-longevity',
    shortDescription: 'ประเมินสุขภาพฮอร์โมน — เอสโตรเจน เทสโทสเตอโรน โปรเจสเตอโรน และ DHEA',
  },
  {
    _id: 'service-hbot',
    slug: 'hbot',
    title: 'Hyperbaric Oxygen Therapy (HBOT)',
    category: 'regenerative-wellness',
    shortDescription: 'การบำบัดด้วยออกซิเจนแรงดันสูง — เสริมการฟื้นตัว ลด brain fog และรองรับ long COVID',
  },
  {
    _id: 'service-iv-drip',
    slug: 'iv-drip',
    title: 'IV Drip Therapy',
    category: 'iv-therapy',
    shortDescription: 'วิตามินและแร่ธาตุทางหลอดเลือดดำ — Myers Cocktail, High-dose Vitamin C, และสูตรเฉพาะบุคคล',
  },
  {
    _id: 'service-gluta',
    slug: 'gluta',
    title: 'Glutathione Therapy',
    category: 'iv-therapy',
    shortDescription: 'กลูต้าไธโอนทางหลอดเลือดดำ — ต้านอนุมูลอิสระ, ผิวใส, และ detox ระดับเซลล์',
  },
  {
    _id: 'service-chelation',
    slug: 'chelation',
    title: 'Chelation Therapy',
    category: 'iv-therapy',
    shortDescription: 'การขับโลหะหนักออกจากร่างกาย — ตะกั่ว ปรอท สารหนู และโลหะสะสมอื่นๆ',
  },
  {
    _id: 'service-personalized-vitamins',
    slug: 'personalized-vitamins',
    title: 'Personalized Vitamin Plan',
    category: 'personalized-program',
    shortDescription: 'แผนวิตามินและซัปพลีเมนต์เฉพาะบุคคล ออกแบบตามผลตรวจเลือดและ micronutrient panel',
  },
  {
    _id: 'service-nad',
    slug: 'nad',
    title: 'NAD+ Therapy',
    category: 'iv-therapy',
    shortDescription: 'NAD+ ทางหลอดเลือดดำ — เพิ่มพลังงานระดับเซลล์ ชะลอวัย และสนับสนุน mitochondria',
  },
  {
    _id: 'service-nk-cell',
    slug: 'nk-cell',
    title: 'NK Cell Therapy',
    category: 'regenerative-wellness',
    shortDescription: 'เสริม Natural Killer Cell — เพิ่มภูมิคุ้มกัน ป้องกันมะเร็ง และฟื้นฟูระบบภูมิคุ้มกัน',
  },
  {
    _id: 'service-allergy-ige',
    slug: 'allergy-ige',
    title: 'Allergy IgE Test',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจภูมิแพ้ IgE — ค้นหาสารก่อภูมิแพ้ที่ทำให้เกิดอาการทันที เช่น ผื่นลมพิษ น้ำมูก หอบ',
  },
  {
    _id: 'service-urine-organic-test',
    slug: 'urine-organic-test',
    title: 'Urine Organic Acids Test (OAT)',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจ OAT จากปัสสาวะ — ประเมินสุขภาพเมตาบอลิก จุลินทรีย์ลำไส้ และภาวะยีสต์เกินปกติ',
  },
  {
    _id: 'service-vitamin-d',
    slug: 'vitamin-d',
    title: 'Vitamin D Assessment & Therapy',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจและเสริมวิตามินดี — กระดูก ภูมิคุ้มกัน และสุขภาพโดยรวม',
  },
  {
    _id: 'service-vitamins-and-micronutrients',
    slug: 'vitamins-and-micronutrients',
    title: 'Vitamins & Micronutrient Testing',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจวิตามินและแร่ธาตุครบชุด — B12, Mg, Zn, Fe และ micronutrient panel',
  },
  {
    _id: 'service-oligoscan',
    slug: 'oligoscan',
    title: 'OligoScan',
    category: 'diagnostic-testing',
    shortDescription: 'วัดแร่ธาตุและโลหะหนักในเนื้อเยื่อด้วย OligoScan — ไม่ต้องเจาะเลือด',
  },
  {
    _id: 'service-cancer-screening',
    slug: 'cancer-screening',
    title: 'Cancer Screening',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจ tumour markers และการคัดกรองมะเร็งในระยะแรก — เพื่อการป้องกันและตรวจจับก่อนสาย',
  },
  {
    _id: 'service-dna-test',
    slug: 'dna-test',
    title: 'DNA & Genetic Testing',
    category: 'diagnostic-testing',
    shortDescription: 'ตรวจพันธุกรรม DNA — MTHFR, ความเสี่ยงโรค และการวางแผนสุขภาพเฉพาะบุคคล',
  },
]

async function main() {
  console.log(`Seeding ${stubs.length} service stubs...\n`)

  const tx = client.transaction()
  for (const { _id, slug, title, category, shortDescription } of stubs) {
    tx.createIfNotExists({
      _type: 'service',
      _id,
      title,
      slug: { _type: 'slug', current: slug },
      category,
      shortDescription,
    })
  }

  const result = await tx.commit()
  console.log(`Committed ${result.results.length} operations.`)

  // Show which were skipped (already existed) vs created
  for (const r of result.results) {
    const operation = r.operation
    const id = r.id
    const stub = stubs.find(s => s._id === id)
    const slug = stub?.slug ?? id
    if (operation === 'create') {
      console.log(`  ✓ Created: ${slug}  (${id})`)
    } else {
      console.log(`  — Skipped (exists): ${slug}  (${id})`)
    }
  }

  console.log('\nDone.')
  console.log('Full service content (description, images, FAQ) should be added in Sanity Studio:')
  console.log('  https://jx3ty6pl155yiizbs6ry5t4q.sanity.studio/structure/service')
}

main().catch(e => { console.error(e.message); process.exit(1) })
