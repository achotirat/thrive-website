#!/usr/bin/env node
/**
 * One-off Sanity import for the "HBOT กับการนอนหลับ" post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-hbot-and-sleep.mjs
 *
 * Token is loaded automatically from .env.local (SANITY_API_TOKEN).
 * This post has only 1 image (hero) — no inline images.
 */

import { createClient } from '@sanity/client'
import { createReadStream, readFileSync } from 'fs'
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
    console.log(`  ✓ Found existing asset for ${filename}: ${existing._id}`)
    return { asset: existing, altText }
  }

  console.log(`  Uploading ${filename}...`)
  const asset = await client.assets.upload('image', createReadStream(join(BLOG_DIR, filename)), {
    filename,
    contentType: 'image/webp',
  })
  console.log(`  ✓ Uploaded ${filename}: ${asset._id}  ${asset.url}`)
  return { asset, altText }
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

function stripHtmlComments(text) {
  return text.replace(/<!--[\s\S]*?-->/g, '')
}

function stripHeadingIds(text) {
  return text.replace(/\s*\{#[^}]+\}/g, '')
}

async function buildBodyHtml(raw, imageUrlMap) {
  let text = stripHeadingIds(stripHtmlComments(raw))

  const introMarker = 'หลายคนที่ทำ HBOT (ออกซิเจนบำบัดความดันสูง) เล่าว่าคืนนั้นหลับลึกขึ้นผิดปกติ'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Could not find intro paragraph marker')
  let bodySection = text.slice(introIdx)

  // Cut out "## FAQ" section — [slug].astro renders FAQ separately as an
  // accordion from the doc's faq[] field (and again in FAQPage JSON-LD).
  // Keep the References section that follows — it has nowhere else to render.
  const faqMarker = '## FAQ'
  const referencesMarker = '## References'
  const faqIdx = bodySection.indexOf(faqMarker)
  const referencesIdx = bodySection.indexOf(referencesMarker)
  if (faqIdx !== -1 && referencesIdx !== -1 && faqIdx < referencesIdx) {
    bodySection = bodySection.slice(0, faqIdx) + bodySection.slice(referencesIdx)
  }

  const imagePromptsMarker = '## Image Prompts'
  const imagePromptsIdx = bodySection.indexOf(imagePromptsMarker)
  if (imagePromptsIdx !== -1) bodySection = bodySection.slice(0, imagePromptsIdx)

  for (const [filename, url] of Object.entries(imageUrlMap)) {
    bodySection = bodySection.replaceAll(filename, url)
  }

  bodySection = bodySection.replace(/\n{4,}/g, '\n\n\n')

  return mdToHtml(bodySection)
}

async function findService(slug) {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == $slug][0]{ _id, title }`,
    { slug },
  )
  if (result) {
    console.log(`  ✓ Found service: ${result._id} (${result.title})`)
  } else {
    console.log(`  ⚠ Service "${slug}" not found — ctaService will be skipped`)
  }
  return result
}

async function main() {
  console.log('\n── Resolving images ──')
  const hero = await getOrUploadImage(
    'hbot-and-sleep-hero.webp',
    'ผู้ชายไทยวัย 40 ต้นยืนอยู่ริมหน้าต่างห้องนอนในคอนโดกรุงเทพฯ ยามเช้า ยืดตัวเบาๆ สีหน้าสดชื่นหลังตื่นนอน แสงแดดอ่อนๆ ส่องผ่านม่าน',
  )

  console.log('\n── Looking up CTA service ──')
  const hbotService = await findService('hbot')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'hbot-and-sleep.md'), 'utf8')
  const imageUrlMap = {
    'hbot-and-sleep-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-hbot-and-sleep',
    title: 'ทำไมหลายคนออกจากแคปซูล HBOT แล้วคืนนั้นหลับลึกขึ้น — วิทยาศาสตร์บอกอะไรบ้าง',
    slug: { _type: 'slug', current: 'hbot-and-sleep' },
    category: 'สุขภาพจิต',
    excerpt:
      'หลายคนบอกว่าทำ HBOT แล้วคืนนั้นหลับดีขึ้น แต่ meta-analysis รวมผลกลับพบว่าคะแนนคุณภาพการนอนโดยรวมไม่ต่างจากกลุ่มควบคุม บทความนี้เล่าตามหลักฐานจริงว่ากลุ่มไหนได้ผล กลุ่มไหนยังไม่มีหลักฐานรองรับ',
    publishedAt: '2026-08-07T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(hbotService && {
      ctaService: { _type: 'reference', _ref: hbotService._id },
    }),
    reviewedByDoctor: 'pijak',
    keyTakeaways: [
      'งาน Meta-analysis ที่รวมผล 4 RCT (n=243) พบว่าคะแนนคุณภาพการนอน (PSQI) โดยรวมไม่ต่างจากกลุ่มควบคุมอย่างมีนัยสำคัญ (p=0.99)',
      'แต่ในผู้ป่วย Long COVID (n=92) พบคะแนนรวมและ 5 มิติย่อยดีขึ้นระดับปานกลางถึงมาก และผลยังคงอยู่นานถึง 1 ปี',
      'คนที่นอนไม่หลับเรื้อรังจากการอยู่บนที่สูง RCT ปี 2025 (n=80) พบว่าคะแนนความรุนแรงของการนอนไม่หลับ (ISI) ดีขึ้นชัดเจนในกลุ่มที่ทำ HBOT',
      'ผู้ป่วยพาร์กินสัน meta-analysis 7 RCT (n=461) ก็พบ PSQI ดีขึ้นอย่างมีนัยสำคัญเช่นกัน',
      'ถ้านอนไม่หลับเรื้อรังแบบทั่วไปไม่มีสาเหตุจำเพาะ หลักฐานตอนนี้ยังไม่สนับสนุนว่า HBOT จะช่วย — ควรหาสาเหตุก่อน (ภาวะหยุดหายใจขณะหลับ ฮอร์โมน ความเครียด)',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-does-hbot-help-sleep',
        question: 'HBOT ช่วยนอนหลับจริงไหม?',
        shortAnswer:
          'ขึ้นอยู่กับสาเหตุของอาการนอนไม่หลับ ในประชากรทั่วไป Meta-analysis ยังไม่พบความแตกต่างที่มีนัยสำคัญทางสถิติเมื่อเทียบกับกลุ่มควบคุม แต่ในกลุ่มผู้ป่วย Long COVID คนที่นอนไม่หลับเรื้อรังบนที่สูง และผู้ป่วยพาร์กินสัน พบผลบวกที่ชัดเจนและมีนัยสำคัญทางสถิติ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-chronic-insomnia-what-to-do',
        question: 'นอนไม่หลับเรื้อรังทำไงดี?',
        shortAnswer:
          'ควรเริ่มจากหาสาเหตุกับแพทย์ก่อน เพราะสาเหตุที่พบบ่อยอย่างภาวะหยุดหายใจขณะหลับ ฮอร์โมนไม่สมดุล หรือความเครียดเรื้อรัง ต้องรักษาที่ต้นตอ การใช้ HBOT โดยไม่ทราบสาเหตุอาจไม่ได้แก้ปัญหาที่แท้จริง',
      },
      {
        _type: 'faqItem',
        _key: 'faq-who-is-hbot-for-sleep',
        question: 'HBOT เหมาะกับใคร (ในแง่ปัญหาการนอน)?',
        shortAnswer:
          'เหมาะกับคนที่มีภาวะ Long COVID นอนไม่หลับเรื้อรังจากการอยู่บนที่สูง หรือมีโรคทางระบบประสาทเรื้อรังอย่างพาร์กินสันที่ส่งผลต่อการนอน ซึ่งเป็นกลุ่มที่มีหลักฐานงานวิจัยรองรับชัดเจนที่สุด',
      },
      {
        _type: 'faqItem',
        _key: 'faq-how-many-sessions-sleep',
        question: 'ทำ HBOT กี่ครั้งถึงเห็นผลเรื่องการนอน?',
        shortAnswer:
          'งานวิจัยที่เห็นผลชัดในกลุ่ม Long COVID ใช้โปรโตคอลประมาณ 60 เซสชัน ซึ่งเป็นคอร์สที่ค่อนข้างยาว ส่วนจำนวนครั้งที่เหมาะสมสำหรับแต่ละคนควรให้แพทย์ประเมินตามอาการและสาเหตุที่พบ ไม่มีตัวเลขตายตัวที่ใช้ได้กับทุกคน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-sleepy-after-session',
        question: 'ทำ HBOT แล้วรู้สึกง่วงทันทีหลังออกจากห้อง เป็นเพราะอะไร?',
        shortAnswer:
          'อาจเกี่ยวข้องกับความผ่อนคลายของระบบประสาทหลังได้รับออกซิเจนสูงต่อเนื่องเป็นเวลานาน แต่ความรู้สึกง่วงระยะสั้นหลังทำ 1 ครั้งเป็นคนละเรื่องกับ "คุณภาพการนอนที่ดีขึ้นอย่างมีนัยสำคัญในระยะยาว" ซึ่งยังเป็นหลักฐานที่จำกัดเฉพาะบางกลุ่มเท่านั้น',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'The Effects of Hyperbaric Oxygen Therapy on Sleep Quality: A Systematic Review and Meta-Analysis',
        source: 'Annals of Clinical and Analytical Medicine',
        year: 2025,
        url: 'https://crimsonpublishers.com/acam/fulltext/ACAM.000708.php',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Long term outcomes of hyperbaric oxygen therapy in post covid condition: longitudinal follow-up of a randomized controlled trial',
        source: 'Scientific Reports',
        year: 2024,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10869702/',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Hyperbaric oxygen treatment for chronic insomnia at high altitude: A prospective, randomized, open-label, parallel-group trial',
        source: 'Travel Medicine and Infectious Disease',
        year: 2025,
        url: 'https://www.sciencedirect.com/science/article/pii/S1477893925000407',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Efficacy of hyperbaric oxygen therapy as an adjunct therapy in the treatment of sleep disorders among patients with Parkinson’s disease: a meta-analysis',
        source: 'Frontiers in Neurology',
        year: 2024,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11322060/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'นอนไม่หลับ เกิดจากอะไร?',
        source: 'โรงพยาบาลศิริราช ปิยมหาราชการุณย์',
        year: 2026,
        url: 'https://www.siphhospital.com/th/news/article/share/insomnia',
      },
    ],
    body: [
      {
        _type: 'block',
        _key: 'body-legacy-placeholder',
        style: 'normal',
        markDefs: [],
        children: [{ _type: 'span', _key: 's1', marks: [], text: 'Full content stored in legacyHtml.' }],
      },
    ],
    legacyHtml,
    seo: {
      _type: 'seoMeta',
      seoTitle: 'HBOT กับการนอนหลับ ได้ผลจริงหรือแค่รู้สึก? | Thrive Bangkok',
      seoDescription:
        'HBOT ช่วยให้นอนหลับดีขึ้นจริงไหม? ดูข้อมูลตามจริง — กลุ่มไหนมีหลักฐานชัด กลุ่มไหนยังไม่มี ก่อนตัดสินใจที่ Thrive Wellness กรุงเทพ',
      noIndex: false,
      schemaType: 'BlogPosting',
      includeInSitemap: true,
      sitemapPriority: 0.8,
    },
  }

  const result = await client.createOrReplace(doc)
  console.log(`  ✓ Document created/replaced: ${result._id}`)
  console.log(`\nView in Sanity Studio:`)
  console.log(`  https://jx3ty6pl155yiizbs6ry5t4q.sanity.studio/structure/blogPost;${result._id}`)
  console.log(`\nDone! Run "npm run build" in astro/ to verify the page renders.`)
}

main().catch((err) => {
  console.error('\nError:', err.message ?? err)
  process.exit(1)
})
