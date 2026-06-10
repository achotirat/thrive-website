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

// Load .env.local
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

  // Strip frontmatter block
  const h1Idx = text.indexOf('\n# ')
  if (h1Idx !== -1) text = text.slice(h1Idx)

  // Strip from Image Prompts section onward
  const endMarker = '## Image Prompts'
  const endIdx = text.indexOf(endMarker)
  if (endIdx !== -1) text = text.slice(0, endIdx)

  return mdToHtml(text)
}

async function main() {
  const slug = 'panic-disorder-coping'
  console.log(`\n📦 Importing blog post: ${slug}\n`)

  // --- Images ---
  console.log('Uploading images...')
  const heroResult = await getOrUploadImage(
    'panic-disorder-coping-hero.webp',
    'ผู้หญิงไทยนั่งอยู่คนเดียวในร้านกาแฟกรุงเทพฯ มือวางบนหน้าอก สะท้อนช่วงเวลาที่ต้องการฝึกหายใจรับมือกับอาการแพนิค',
  )

  if (!heroResult) {
    console.error('Hero image is required but not found. Aborting.')
    process.exit(1)
  }

  // --- Service link ---
  console.log('\nLooking up CTA service...')
  const service = await findService('therapist-consult')

  // --- Body HTML ---
  console.log('\nBuilding body HTML...')
  const raw = await readFile(join(BLOG_DIR, `${slug}.md`), 'utf8')
  const legacyHtml = await buildBodyHtml(raw)
  console.log(`  ✓ Body HTML length: ${legacyHtml.length} chars`)

  // --- Sanity document ---
  const doc = {
    _type: 'blogPost',
    _id: `blog-${slug}`,
    title: 'วิธีรับมือเมื่อเกิดอาการแพนิค ให้ผ่านพ้นได้โดยไม่ตื่นตระหนก',
    slug: { _type: 'slug', current: slug },
    category: 'สุขภาพใจ',
    excerpt:
      'อาการแพนิครู้สึกน่ากลัวแต่ไม่อันตราย รู้จักวิธีรับมือทันทีที่ได้ผล ทั้งการหายใจแบบกระบังลม เทคนิค 5-4-3-2-1 และรู้ว่าเมื่อไหร่ควรพบผู้เชี่ยวชาญที่ Thrive Bangkok',
    publishedAt: new Date('2026-06-10').toISOString(),
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: heroResult.asset._id },
      alt: heroResult.altText,
    },
    ...(service && { ctaService: { _type: 'reference', _ref: service._id } }),
    keyTakeaways: [
      'อาการแพนิคเกิดจากระบบประสาทส่งสัญญาณฉุกเฉินผิดพลาด ไม่ใช่อันตรายถึงชีวิต',
      'การหายใจช้าลงต่ำกว่า 10 ครั้ง/นาที ช่วยหยุดวงจรของอาการได้เร็วที่สุด',
      'เทคนิค 5-4-3-2-1 ดึงสมองกลับมาใช้เหตุผล แทนการตอบสนองต่อสัญญาณฉุกเฉิน',
      'โรคแพนิค ≠ panic attack ครั้งเดียว — ต้องมีอาการซ้ำๆ จึงจะเข้าข่ายโรค',
      'CBT พิสูจน์แล้วว่าได้ผลสูง และให้ทักษะที่ใช้ได้ตลอดชีวิต',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-1',
        question: 'โรคแพนิครักษาหายขาดได้ไหม?',
        shortAnswer:
          'ได้ในหลายกรณี โดยเฉพาะเมื่อได้รับการรักษาด้วย CBT อย่างเหมาะสม งานวิจัยพบว่าผู้ป่วยส่วนใหญ่มีอาการดีขึ้นอย่างมีนัยสำคัญหลัง CBT 12–16 ครั้ง',
      },
      {
        _type: 'faqItem',
        _key: 'faq-2',
        question: 'ต้องกินยารักษาโรคแพนิคไหม?',
        shortAnswer:
          'ไม่จำเป็นเสมอไป CBT เพียงอย่างเดียวมีประสิทธิภาพสูงในอาการระดับเบาถึงปานกลาง ในกรณีที่อาการรุนแรง แพทย์อาจพิจารณาใช้ยาร่วมกับ CBT ควรปรึกษาแพทย์ก่อนเสมอ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-3',
        question: 'แพนิค vs หัวใจวาย แยกยังไง?',
        shortAnswer:
          'อาการแพนิคมักถึงจุดสูงสุดใน 10 นาทีแล้วค่อยๆ ลดลง ขณะที่อาการหัวใจวายมักเพิ่มขึ้นต่อเนื่องและอาจร้าวไปที่แขน คอ หรือขากรรไกร ถ้าไม่แน่ใจ ให้ไปพบแพทย์ทันที',
      },
      {
        _type: 'faqItem',
        _key: 'faq-4',
        question: 'แพนิคเกิดได้เฉพาะในที่แออัดจริงไหม?',
        shortAnswer:
          'ไม่จริง อาการสามารถเกิดขึ้นได้ทุกที่ รวมถึงขณะนอนหลับอยู่บ้านตามลำพัง ตำแหน่งที่เกิดอาการขึ้นอยู่กับว่าสมองแต่ละคนเรียนรู้ว่าอะไรคือสัญญาณอันตราย',
      },
      {
        _type: 'faqItem',
        _key: 'faq-5',
        question: 'ถ้าเห็นคนใกล้ชิดเกิดอาการแพนิค ควรทำอะไร?',
        shortAnswer:
          'อยู่ใกล้ๆ พูดเสียงเบาๆ ว่า "ฉันอยู่นี่นะ" ช่วยนับลมหายใจด้วยกัน อย่าบอกให้อย่าคิดมาก และอย่าทำให้สถานการณ์น่าตื่นเต้นมากขึ้น เมื่ออาการผ่านไปแล้ว แนะนำให้ไปพบผู้เชี่ยวชาญ',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Panic disorder',
        source: 'The Lancet, 388(10049), 1066–1073',
        year: 2016,
        url: 'https://doi.org/10.1016/S0140-6736(16)00015-4',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'รายงานสุขภาพจิตคนไทย ปีงบประมาณ 2566 [Thai Mental Health Report FY2023]',
        source: 'กรมสุขภาพจิต กระทรวงสาธารณสุข',
        year: 2023,
        url: 'https://www.dmh.go.th',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Cognitive-behavioral therapy for adult anxiety disorders: a meta-analysis of randomized placebo-controlled trials',
        source: 'Journal of Clinical Psychiatry, 69(4), 621–632',
        year: 2008,
        url: 'https://doi.org/10.4088/jcp.v69n0415',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Hyperventilation in panic disorder and asthma: Empirical evidence and clinical strategies',
        source: 'International Journal of Psychophysiology, 78(1), 68–79',
        year: 2010,
        url: 'https://doi.org/10.1016/j.ijpsycho.2010.05.006',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'The Effect of Diaphragmatic Breathing on Attention, Negative Affect and Stress in Healthy Adults',
        source: 'Frontiers in Psychology, 8, 874',
        year: 2017,
        url: 'https://doi.org/10.3389/fpsyg.2017.00874',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Anxiety disorders',
        source: 'The Lancet, 397(10277), 914–927',
        year: 2021,
        url: 'https://doi.org/10.1016/S0140-6736(21)00359-7',
      },
    ],
    legacyHtml,
    seo: {
      _type: 'seoMeta',
      seoTitle: 'วิธีรับมือเมื่อเกิดอาการแพนิค ให้ผ่านพ้นโดยไม่ตื่นตระหนก',
      seoDescription:
        'อาการแพนิครู้สึกน่ากลัวแต่ไม่อันตราย รู้จักวิธีรับมือทันทีที่ได้ผล ทั้งการหายใจ เทคนิค 5-4-3-2-1 และรู้ว่าเมื่อไหร่ควรพบผู้เชี่ยวชาญที่ Thrive Bangkok',
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
