#!/usr/bin/env node
import { createClient } from '@sanity/client'
import { createReadStream, readFileSync, existsSync } from 'fs'
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

if (!process.env.SANITY_API_TOKEN) {
  try {
    const envPath = join(__dirname, '../../.env.local')
    const envContent = readFileSync(envPath, 'utf8')
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

async function getOrUploadImage(filename, altText) {
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{ _id, url }`,
    { filename },
  )
  if (existing) {
    console.log(`  ✓ Found existing asset: ${existing._id}`)
    return { asset: existing, altText }
  }
  const filePath = join(BLOG_DIR, filename)
  if (!existsSync(filePath)) {
    console.warn(`  ⚠ Image not found, skipping: ${filename}`)
    return null
  }
  console.log(`  Uploading ${filename}...`)
  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename,
    contentType: 'image/webp',
  })
  console.log(`  ✓ Uploaded: ${asset._id}`)
  return { asset, altText }
}

async function findService(slug) {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == $slug][0]{ _id, title }`,
    { slug },
  )
  if (result) console.log(`  ✓ Found service: ${result._id} (${result.title})`)
  else console.log(`  ⚠ Service "${slug}" not found — ctaService skipped`)
  return result
}

async function mdToHtml(md) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(md)
  return String(result)
}

async function buildBodyHtml(raw) {
  let text = raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\{#[^}]+\}/g, '')
  const h1Idx = text.indexOf('\n# ')
  if (h1Idx !== -1) text = text.slice(h1Idx)
  const endIdx = text.indexOf('## Image Prompts')
  if (endIdx !== -1) text = text.slice(0, endIdx)
  return mdToHtml(text)
}

async function main() {
  const slug = 'social-phobia-treatment'
  console.log(`\n📦 Importing blog post: ${slug}\n`)

  console.log('Uploading images...')
  const heroResult = await getOrUploadImage(
    'social-phobia-treatment-hero.webp',
    'ผู้หญิงไทยยืนห่างจากกลุ่มเพื่อนร่วมงานในออฟฟิศกรุงเทพฯ สะท้อนความรู้สึกแปลกแยกจากโรคกลัวสังคม',
  )
  if (!heroResult) {
    console.error('Hero image is required but not found. Aborting.')
    process.exit(1)
  }

  console.log('\nLooking up CTA service...')
  const service = await findService('therapist-consult')

  console.log('\nBuilding body HTML...')
  const raw = await readFile(join(BLOG_DIR, `${slug}.md`), 'utf8')
  const legacyHtml = await buildBodyHtml(raw)
  console.log(`  ✓ Body HTML length: ${legacyHtml.length} chars`)

  const doc = {
    _type: 'blogPost',
    _id: `blog-${slug}`,
    title: 'โรคกลัวสังคม (Social Phobia) คืออะไร — รักษาได้ไหม และเริ่มต้นยังไง',
    slug: { _type: 'slug', current: slug },
    category: 'สุขภาพใจ',
    excerpt:
      'โรคกลัวสังคมไม่ใช่แค่ขี้อาย แต่คือความกลัวที่รบกวนชีวิต รู้จักอาการ สาเหตุ และวิธีรักษา CBT ที่ได้ผลจริง พร้อมรู้ว่าเมื่อไหร่ควรพบผู้เชี่ยวชาญที่ Thrive Bangkok',
    publishedAt: new Date('2026-06-10').toISOString(),
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: heroResult.asset._id },
      alt: heroResult.altText,
    },
    ...(service && { ctaService: { _type: 'reference', _ref: service._id } }),
    keyTakeaways: [
      'โรคกลัวสังคม ≠ ขี้อาย — คือความกลัวที่รุนแรงจนกระทบการใช้ชีวิต',
      'การหลีกเลี่ยงสถานการณ์ยิ่งทำให้โรครุนแรงขึ้น ไม่ใช่ดีขึ้น',
      'CBT โดยเฉพาะแบบกลุ่ม มีหลักฐานสูงมากในการรักษา',
      'ไม่จำเป็นต้องใช้ยาเสมอไป — CBT เพียงอย่างเดียวได้ผลชัดเจน',
      'ยิ่งเริ่มรักษาเร็ว ยิ่งมีโอกาสกลับมาใช้ชีวิตได้เต็มที่',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-1',
        question: 'โรคกลัวสังคมรักษาหายขาดได้ไหม?',
        shortAnswer:
          'รักษาได้ผลดีมากในหลายกรณี CBT เฉพาะทางช่วยลดอาการได้อย่างมีนัยสำคัญและผลลัพธ์มักยาวนาน บางคนอาจยังมีความประหม่าอยู่บ้าง แต่จะไม่ถึงขั้นควบคุมชีวิตอีกต่อไป',
      },
      {
        _type: 'faqItem',
        _key: 'faq-2',
        question: 'โรคกลัวสังคม ต่างจากโรคกลัวฝูงชน (Agoraphobia) อย่างไร?',
        shortAnswer:
          'โรคกลัวสังคมคือกลัวการถูกตัดสินหรืออับอายต่อหน้าคนอื่น ส่วน Agoraphobia คือกลัวสถานที่ที่หนีออกยากหรือไม่มีความช่วยเหลือ ทั้งสองอาจเกิดร่วมกันได้ แต่กลไกและการรักษาต่างกัน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-3',
        question: 'ถ้าต้องพูดหน้าห้องแล้วตื่นเต้นมาก แบบนี้เป็นโรคกลัวสังคมไหม?',
        shortAnswer:
          'การตื่นเต้นก่อนพูดหน้าห้องเป็นเรื่องปกติมาก จะเข้าข่ายโรคกลัวสังคมก็ต่อเมื่อความกังวลนั้นรบกวนชีวิตอย่างมีนัยสำคัญ เช่น หลีกเลี่ยงงานที่ต้องพูด หรือทรมานมากเกินจนกระทบคุณภาพงาน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-4',
        question: 'โรคนี้ส่งผลต่อการทำงานในองค์กรยังไง?',
        shortAnswer:
          'ส่งผลมาก หลายคนหลีกเลี่ยงการขอขึ้นเงินเดือน ไม่กล้านำเสนอไอเดีย หรือไม่ยกมือถามในประชุม สิ่งเหล่านี้สะสมเป็นข้อเสียเปรียบในสายอาชีพโดยที่ไม่รู้ตัว',
      },
      {
        _type: 'faqItem',
        _key: 'faq-5',
        question: 'ลูกที่ขี้อายมากควรพาไปพบผู้เชี่ยวชาญไหม?',
        shortAnswer:
          'ถ้าความขี้อายส่งผลต่อการเรียน การมีเพื่อน หรือทำให้เด็กทุกข์ใจมาก ควรปรึกษาผู้เชี่ยวชาญ CBT สำหรับเด็กและวัยรุ่นได้ผลดีมาก และยิ่งเริ่มเร็วยิ่งดี',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Social anxiety disorder',
        source: 'The Lancet, 371(9618), 1115–1125',
        year: 2008,
        url: 'https://doi.org/10.1016/S0140-6736(08)60488-2',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Psychological and pharmacological interventions for social anxiety disorder in adults: a systematic review and network meta-analysis',
        source: 'The Lancet Psychiatry, 1(5), 368–376',
        year: 2014,
        url: 'https://doi.org/10.1016/S2215-0366(14)70329-3',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'รายงานสุขภาพจิตคนไทย ปีงบประมาณ 2566 [Thai Mental Health Report FY2023]',
        source: 'กรมสุขภาพจิต กระทรวงสาธารณสุข',
        year: 2023,
        url: 'https://www.dmh.go.th',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'A placebo-controlled trial of phenelzine, cognitive behavioral group therapy, and their combination for social anxiety disorder',
        source: 'Archives of General Psychiatry, 67(3), 286–295',
        year: 2010,
        url: 'https://doi.org/10.1001/archgenpsychiatry.2010.11',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Intensive group cognitive treatment and individual cognitive therapy vs. treatment as usual in social phobia: a randomized controlled trial',
        source: 'Acta Psychiatrica Scandinavica, 115(2), 142–154',
        year: 2007,
        url: 'https://doi.org/10.1111/j.1600-0447.2006.00839.x',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Lifetime prevalence and age-of-onset distributions of DSM-IV disorders in the National Comorbidity Survey Replication',
        source: 'Archives of General Psychiatry, 62(6), 593–602',
        year: 2005,
        url: 'https://doi.org/10.1001/archpsyc.62.6.593',
      },
    ],
    legacyHtml,
    seo: {
      _type: 'seoMeta',
      seoTitle: 'โรคกลัวสังคม คืออะไร รักษาได้ไหม วิธีเอาชนะ Social Phobia',
      seoDescription:
        'โรคกลัวสังคมไม่ใช่แค่ขี้อาย แต่คือความกลัวที่รบกวนชีวิต รู้จักอาการ สาเหตุ และวิธีรักษาที่ได้ผลจริง รวมถึงเมื่อไหร่ควรพบผู้เชี่ยวชาญที่ Thrive Bangkok',
      noIndex: false,
      schemaType: 'BlogPosting',
      includeInSitemap: true,
      sitemapPriority: 0.8,
    },
  }

  console.log('\nWriting to Sanity...')
  const result = await client.createOrReplace(doc)
  console.log(`\n✅ Done! Document ID: ${result._id}`)
  console.log(`   Slug: /blog/${slug}`)
}

main().catch((err) => {
  console.error('\n❌ Import failed:', err.message)
  process.exit(1)
})
