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

async function buildBodyHtml(raw, imageUrlMap) {
  let text = raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\{#[^}]+\}/g, '')

  // Strip frontmatter / dev note block before H1
  const h1Idx = text.indexOf('\n# ')
  if (h1Idx !== -1) text = text.slice(h1Idx)

  // Strip from Image Prompts section onward
  const endMarker = '## Image Prompts'
  const endIdx = text.indexOf(endMarker)
  if (endIdx !== -1) text = text.slice(0, endIdx)

  // Replace image filenames with uploaded URLs
  for (const [filename, url] of Object.entries(imageUrlMap)) {
    text = text.replaceAll(filename, url)
  }

  return mdToHtml(text)
}

async function main() {
  const slug = 'natural-depression-treatment'
  console.log(`\n📦 Importing blog post: ${slug}\n`)

  // --- Images ---
  console.log('Uploading images...')
  const heroResult = await getOrUploadImage(
    'natural-depression-treatment-hero.webp',
    'ผู้หญิงไทยนั่งดื่มชาในร้านกาแฟกรุงเทพฯ ตอนเช้า สะท้อนถึงการดูแลสุขภาพจิตแบบองค์รวม',
  )

  if (!heroResult) {
    console.error('Hero image is required but not found. Aborting.')
    process.exit(1)
  }

  const imageUrlMap = {}
  // Inline images — optional, skip gracefully if missing
  const inlineImages = [
    { filename: 'natural-depression-treatment-brain-diagram.webp', alt: 'ไดอะแกรมสารสื่อประสาทในสมอง' },
    { filename: 'natural-depression-treatment-causes-infographic.webp', alt: 'อินโฟกราฟิกสาเหตุของโรคซึมเศร้า' },
    { filename: 'natural-depression-treatment-methods-flowchart.webp', alt: 'ฟลอว์ชาร์ตวิธีรักษาซึมเศร้าแบบธรรมชาติ' },
  ]
  for (const img of inlineImages) {
    const result = await getOrUploadImage(img.filename, img.alt)
    if (result) imageUrlMap[img.filename] = result.asset.url
  }

  // --- Service link ---
  console.log('\nLooking up CTA service...')
  const service = await findService('mental-health')

  // --- Body HTML ---
  console.log('\nBuilding body HTML...')
  const raw = await readFile(join(BLOG_DIR, `${slug}.md`), 'utf8')
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ Body HTML length: ${legacyHtml.length} chars`)

  // --- Sanity document ---
  const doc = {
    _type: 'blogPost',
    _id: `blog-${slug}`,
    title: 'วิธีรักษาซึมเศร้าแบบธรรมชาติ ที่ได้ผลจริง — และเมื่อไหรควรพบผู้เชี่ยวชาญ',
    slug: { _type: 'slug', current: slug },
    category: 'สุขภาพใจ',
    excerpt:
      'ซึมเศร้ารักษาได้โดยไม่ต้องพึ่งยาเพียงอย่างเดียว รู้จักวิธีธรรมชาติที่พิสูจน์แล้วว่าได้ผล ทั้งการออกกำลังกาย โอเมก้า-3 และการนอนหลับ พร้อมเข้าใจว่าเมื่อไหรควรปรึกษาผู้เชี่ยวชาญที่ Thrive Bangkok',
    publishedAt: new Date().toISOString(),
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: heroResult.asset._id },
      alt: heroResult.altText,
    },
    ...(service && { ctaService: { _type: 'reference', _ref: service._id } }),
    keyTakeaways: [
      'การออกกำลังกายแบบแอโรบิก 3-5 ครั้งต่อสัปดาห์ มีหลักฐานว่าลดซึมเศร้าได้เทียบเท่ายาในบางกรณี',
      'การนอนไม่หลับเพิ่มความเสี่ยงซึมเศร้า 2 เท่า — แก้การนอนช่วยแก้ซึมเศร้าด้วย',
      'โอเมก้า-3 (EPA สูง 1,000-1,500 มก./วัน) มีงานวิจัยสนับสนุนการลดอาการซึมเศร้า',
      'NAD+ และ Bach Flower เป็นตัวเลือกเสริม ไม่ใช่การรักษาหลัก',
      'หากมีความคิดทำร้ายตัวเอง หรืออาการรุนแรงต่อเนื่อง 2 สัปดาห์ขึ้นไป ควรพบผู้เชี่ยวชาญทันที',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-1',
        question: 'โรคซึมเศร้าหายขาดได้ไหมถ้าไม่กินยา?',
        shortAnswer:
          'ได้ในบางกรณี โดยเฉพาะอาการระดับเบาถึงปานกลาง การออกกำลังกาย CBT และการปรับวิถีชีวิตช่วยได้ แต่ควรอยู่ภายใต้การดูแลของผู้เชี่ยวชาญเสมอ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-2',
        question: 'Bach Flower รักษาซึมเศร้าได้จริงไหม?',
        shortAnswer:
          'เป็นการบำบัดเสริม ไม่ใช่การรักษาหลัก หลักฐานทางวิทยาศาสตร์ยังสรุปไม่แน่ชัด แต่มีความปลอดภัยสูง ควรใช้ร่วมกับแผนการดูแลที่ครอบคลุม',
      },
      {
        _type: 'faqItem',
        _key: 'faq-3',
        question: 'การออกกำลังกายแบบไหนดีที่สุดสำหรับซึมเศร้า?',
        shortAnswer:
          'แอโรบิกความเข้มข้นระดับกลาง เช่น เดินเร็ว วิ่ง ว่ายน้ำ ปั่นจักรยาน 30 นาที 3-5 ครั้ง/สัปดาห์ สำคัญที่สุดคือความสม่ำเสมอ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-4',
        question: 'ถ้าทำวิธีธรรมชาติแล้วนานแค่ไหนจะเห็นผล?',
        shortAnswer:
          'ส่วนใหญ่เห็นความเปลี่ยนแปลงใน 3-6 สัปดาห์ หากทำครบ 8 สัปดาห์แล้วไม่ดีขึ้น ควรปรึกษาผู้เชี่ยวชาญ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-5',
        question: 'NAD+ ช่วยซึมเศร้าได้ไหม?',
        shortAnswer:
          'งานวิจัยพบความเชื่อมโยงระหว่าง NAD+ ต่ำกับซึมเศร้า แต่หลักฐานในมนุษย์ยังจำกัด ควรใช้เป็นส่วนเสริมของแผนการดูแลที่ครอบคลุม',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'อัตราป่วยรายใหม่และความชุกโรคซึมเศร้าในคนไทยอายุ 15 ปีขึ้นไป ปีพ.ศ. 2565-2567',
        source: 'กรมสุขภาพจิต กระทรวงสาธารณสุข',
        year: 2024,
        url: 'https://dmh-elibrary.org/items/show/1807',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Effect of exercise for depression: systematic review and network meta-analysis of randomised controlled trials',
        source: 'BMJ, 384, e075847',
        year: 2024,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10870815/',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Depression in sleep disturbance: A review on a bidirectional relationship, mechanisms and treatment',
        source: 'Journal of Cellular and Molecular Medicine, 23(4)',
        year: 2019,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6433686/',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Meta-analysis and meta-regression of omega-3 polyunsaturated fatty acid supplementation for major depressive disorder',
        source: 'Translational Psychiatry, 6(3)',
        year: 2016,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6683166/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Potential Therapeutic Effects of NAMPT-Mediated NAD Biosynthesis in Depression In Vivo',
        source: 'International Journal of Molecular Sciences, 23(24)',
        year: 2022,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9775136/',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Bach Flower Remedies for psychological problems and pain: a systematic review',
        source: 'BMC Complementary and Alternative Medicine, 9',
        year: 2009,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2695424/',
      },
    ],
    legacyHtml,
    seo: {
      _type: 'seoMeta',
      seoTitle: 'วิธีรักษาซึมเศร้าแบบธรรมชาติ ที่ได้ผลจริง',
      seoDescription:
        'ซึมเศร้ารักษาได้โดยไม่ต้องพึ่งยาเพียงอย่างเดียว รู้จักวิธีธรรมชาติที่พิสูจน์แล้วว่าได้ผล และเข้าใจว่าเมื่อไหรควรปรึกษาผู้เชี่ยวชาญที่ Thrive Bangkok',
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
