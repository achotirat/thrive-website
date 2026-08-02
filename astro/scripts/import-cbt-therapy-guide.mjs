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

  // Cut out the "## FAQ" section — [slug].astro renders FAQ separately as
  // an accordion from the faq[] field, so leaving it in legacyHtml causes
  // it to render a second time as plain paragraphs. Keep the References
  // section that follows it.
  const faqMarker = '## FAQ'
  const refsMarker = '## References'
  const faqIdx = text.indexOf(faqMarker)
  const refsIdx = text.indexOf(refsMarker)
  if (faqIdx !== -1 && refsIdx !== -1 && faqIdx < refsIdx) {
    text = text.slice(0, faqIdx) + text.slice(refsIdx)
  }

  const endMarker = '## Image Prompts'
  const endIdx = text.indexOf(endMarker)
  if (endIdx !== -1) text = text.slice(0, endIdx)

  return mdToHtml(text)
}

async function main() {
  const slug = 'cbt-therapy-guide'
  console.log(`\n📦 Importing blog post: ${slug}\n`)

  console.log('Uploading images...')
  const heroResult = await getOrUploadImage(
    'cbt-therapy-guide-hero.webp',
    'ชายไทยวัย 40 ต้นๆ นั่งจดบันทึกในห้องทำงานที่บ้าน กรุงเทพฯ สะท้อนการดูแลสุขภาพจิตด้วยตัวเอง',
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
    title: 'จิตบำบัด CBT คืออะไร ช่วยอะไรได้บ้าง — และเริ่มต้นยังไงดี',
    slug: { _type: 'slug', current: slug },
    category: 'สุขภาพใจ',
    excerpt:
      'CBT คือการบำบัดที่เปลี่ยนวิธีคิดและพฤติกรรมที่ทำให้รู้สึกแย่ รู้จักว่า CBT ช่วยอะไรได้บ้าง ต่างจากจิตแพทย์อย่างไร และควรเริ่มเมื่อไหร่ที่ Thrive Bangkok',
    publishedAt: new Date('2026-06-10').toISOString(),
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: heroResult.asset._id },
      alt: heroResult.altText,
    },
    ...(service && { ctaService: { _type: 'reference', _ref: service._id } }),
    keyTakeaways: [
      'CBT เปลี่ยนวงจรความคิด-ความรู้สึก-พฤติกรรม ไม่ใช่แค่การระบายหรือคิดบวก',
      'มีหลักฐานสนับสนุนชัดเจนในการรักษาซึมเศร้า วิตกกังวล แพนิค และอื่นๆ',
      'นักจิตบำบัด ≠ จิตแพทย์ — สองบทบาทต่างกัน เหมาะกับสถานการณ์ต่างกัน',
      'CBT-I (สำหรับการนอนหลับ) แนะนำเป็นการรักษาหลักก่อนยานอนหลับ',
      'ผลของ CBT ยาวนานกว่ายา เพราะทักษะที่ได้ใช้ได้ตลอดชีวิต',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-1',
        question: 'CBT ต่างจากการไปนั่งคุยกับที่ปรึกษาทั่วไปยังไง?',
        shortAnswer:
          'CBT มีโครงสร้างชัดเจน มีการบ้านระหว่างสัปดาห์ และมีเป้าหมายที่วัดได้ ต่างจาก supportive counselling ที่เน้นการรับฟัง CBT เน้นการฝึกทักษะเปลี่ยนรูปแบบความคิด-พฤติกรรมอย่างเป็นระบบ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-2',
        question: 'ทำ CBT ผ่านออนไลน์ได้ไหม?',
        shortAnswer:
          'ได้ และมีประสิทธิผลใกล้เคียงกับแบบพบตัวสำหรับอาการระดับเบา-ปานกลาง ข้อเสียคือขาดความลึกในการสังเกตภาษากาย ซึ่งนักบำบัดที่ดีจะอ่านได้ในห้องจริง',
      },
      {
        _type: 'faqItem',
        _key: 'faq-3',
        question: 'ต้องทำ CBT กี่ครั้งถึงจะเห็นผล?',
        shortAnswer:
          'คนส่วนใหญ่เริ่มสังเกตความเปลี่ยนแปลงหลัง 4–6 ครั้ง แต่ผลลัพธ์ที่ยั่งยืนมักต้องการ 12–16 ครั้งขึ้นไป ขึ้นอยู่กับเป้าหมายและความซับซ้อนของปัญหา',
      },
      {
        _type: 'faqItem',
        _key: 'faq-4',
        question: 'ถ้ากินยาอยู่แล้ว ยังทำ CBT ได้ไหม?',
        shortAnswer:
          'ได้ และแนะนำมากด้วย งานวิจัยพบว่ายา + CBT ร่วมกันได้ผลดีกว่าอย่างใดอย่างหนึ่งเพียงอย่างเดียวในผู้ป่วยซึมเศร้าปานกลาง-รุนแรง นักบำบัดและจิตแพทย์ทำงานประสานกันได้',
      },
      {
        _type: 'faqItem',
        _key: 'faq-5',
        question: 'CBT เหมาะกับคนไทยไหม วัฒนธรรมแตกต่างกัน?',
        shortAnswer:
          'เหมาะมาก CBT ใช้ได้ผลข้ามวัฒนธรรม นักบำบัดที่เข้าใจบริบทไทย เช่น แรงกดดันจากครอบครัวและการกดทับอารมณ์ จะช่วยให้การบำบัดได้ผลเร็วและลึกกว่า',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'The empirical status of cognitive-behavioral therapy: a review of meta-analyses',
        source: 'Psychological Bulletin, 132(1), 17–42',
        year: 2006,
        url: 'https://doi.org/10.1037/0033-2909.132.1.17',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'The efficacy of cognitive behavioral therapy: a review of meta-analyses',
        source: 'Cognitive Therapy and Research, 36(5), 427–440',
        year: 2012,
        url: 'https://doi.org/10.1007/s10608-012-9476-1',
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
        title: 'How effective are cognitive behavior therapies for major depression and anxiety disorders? A meta-analytic update',
        source: 'World Psychiatry, 15(3), 245–258',
        year: 2016,
        url: 'https://doi.org/10.1002/wps.20346',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Cognitive therapy vs medications in the treatment of moderate to severe depression',
        source: 'Archives of General Psychiatry, 62(4), 409–416',
        year: 2005,
        url: 'https://doi.org/10.1001/archpsyc.62.4.409',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Effectiveness and cost-effectiveness of mindfulness-based cognitive therapy compared with maintenance antidepressant treatment in the prevention of depressive relapse (PREVENT)',
        source: 'The Lancet, 386(9988), 63–73',
        year: 2015,
        url: 'https://doi.org/10.1016/S0140-6736(14)62222-4',
      },
    ],
    legacyHtml,
    seo: {
      _type: 'seoMeta',
      seoTitle: 'จิตบำบัด CBT คืออะไร ช่วยอะไรได้บ้าง — และเริ่มต้นยังไงดี',
      seoDescription:
        'CBT คือการบำบัดที่เปลี่ยนวิธีคิดและพฤติกรรมที่ทำให้รู้สึกแย่ รู้จักว่า CBT ช่วยอะไรได้บ้าง ต่างจากจิตแพทย์อย่างไร และควรเริ่มเมื่อไหร่',
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
