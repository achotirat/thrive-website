#!/usr/bin/env node
/**
 * One-off Sanity import for the "เทสโทสเตอโรนต่ำจากซ้อมหนัก" cluster post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-low-testosterone-heavy-exercise-men.mjs
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

  const introMarker = 'เทสโทสเตอโรนต่ำไม่ได้เกิดกับผู้ชายวัย 40 ขึ้นไปเท่านั้น'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Could not find intro paragraph marker')
  let bodySection = text.slice(introIdx)

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
    'low-testosterone-heavy-exercise-men-hero.webp',
    'นักกีฬาไทยชายวัย 35 ยืนพักหลังวิ่งเทรลยามเช้าในกรุงเทพฯ มือเท้าสะเอวมองไปไกลๆ ด้วยสีหน้าครุ่นคิด แสงธรรมชาติสีทองอบอุ่น',
  )

  console.log('\n── Looking up CTA service ──')
  const hormonesQuizService = await findService('hormones-quiz')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'low-testosterone-heavy-exercise-men.md'), 'utf8')
  const imageUrlMap = {
    'low-testosterone-heavy-exercise-men-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-low-testosterone-heavy-exercise-men',
    title: 'ทำไมนักกีฬาซ้อมหนักถึงเทสโทสเตอโรนต่ำ — ไม่ใช่แค่เรื่องอายุ',
    slug: { _type: 'slug', current: 'low-testosterone-heavy-exercise-men' },
    category: 'ฮอร์โมนและการออกกำลังกาย',
    excerpt:
      'ผู้ชายที่ซ้อมหนักต่อเนื่อง โดยเฉพาะกีฬาแบบ Endurance และ Hybrid Training อย่าง HYROX อาจมีเทสโทสเตอโรนต่ำได้โดยไม่เกี่ยวกับอายุเลย ทำความเข้าใจ Exercise Hypogonadal Male Condition ภาวะที่นักกีฬาไทยแทบไม่รู้จัก',
    publishedAt: '2026-08-04T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(hormonesQuizService && {
      ctaService: { _type: 'reference', _ref: hormonesQuizService._id },
    }),
    keyTakeaways: [
      'นักกีฬาผู้ชายที่ซ้อมหนักต่อเนื่องเป็นเวลานานอาจมีเทสโทสเตอโรนต่ำกว่าค่าที่คาดตามอายุถึง 25–50% โดยไม่เกี่ยวกับอายุเลย ภาวะนี้เรียกว่า Exercise Hypogonadal Male Condition (EHMC)',
      'กลไกหลักคือคอร์ติซอลและโพรแลกตินที่สูงขึ้นจากการซ้อมหนักไปกดการทำงานของแกน Hypothalamic-Pituitary-Gonadal (HPG) ที่ควบคุมการผลิตเทสโทสเตอโรน',
      'พลังงานไม่พอกับที่ใช้ไป (Low Energy Availability) เป็นอีกกลไกที่กดฮอร์โมนเพศชายได้เช่นกัน ไม่ใช่แค่ปัญหาของนักกีฬาหญิง',
      'อัตราส่วนเทสโทสเตอโรนต่อเอสตราไดออลลดลงถึง 43% ในนักกีฬาที่มีภาวะฝึกเกิน เทียบกับนักกีฬาสุขภาพดี',
      'เทสโทสเตอโรนต่ำจากภาวะฝึกเกินมักฟื้นตัวได้เมื่อปรับการซ้อมและพลังงาน ต่างจากภาวะเรื้อรังที่อาจต้องใช้เวลานานกว่า',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-is-it-dangerous',
        question: 'เทสโทสเตอโรนต่ำจากการซ้อมหนัก อันตรายไหม?',
        shortAnswer:
          'ถ้าเป็นแบบเฉียบพลันจากภาวะฝึกเกิน มักฟื้นตัวได้เมื่อปรับการซ้อมและพลังงานที่ได้รับ ไม่ถือว่าอันตรายถ้าได้รับการดูแลเหมาะสม แต่ถ้าปล่อยไว้นานร่วมกับอาการอื่น เช่น ผลงานแย่ลงต่อเนื่อง ควรปรึกษาแพทย์เพื่อประเมิน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-young-athletes',
        question: 'นักกีฬาผู้ชายอายุน้อยก็เทสโทสเตอโรนต่ำได้จริงหรือ?',
        shortAnswer:
          'ได้จริง โดยเฉพาะนักกีฬา Endurance หรือ Hybrid Training ที่ซ้อมหนักต่อเนื่องเป็นเวลานาน ภาวะนี้ไม่เกี่ยวกับอายุ แต่เกี่ยวกับความเครียดสะสมจากการซ้อมและพลังงานที่ได้รับ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-supplements',
        question: 'ต้องกินอาหารเสริมเทสโทสเตอโรนไหม?',
        shortAnswer:
          'ไม่แนะนำให้เริ่มอาหารเสริมหรือฮอร์โมนทดแทนเองโดยไม่ตรวจและปรึกษาแพทย์ก่อน เพราะต้องแยกให้ชัดว่าสาเหตุมาจากการซ้อมหรือปัจจัยอื่น การแก้ที่ต้นเหตุ เช่น ปรับโหลดซ้อมและพลังงาน มักได้ผลดีกว่าในกรณีที่เกี่ยวกับการซ้อม',
      },
      {
        _type: 'faqItem',
        _key: 'faq-test-prep',
        question: 'ตรวจเทสโทสเตอโรนต้องงดอาหารหรือเตรียมตัวอย่างไร?',
        shortAnswer:
          'แนะนำให้เจาะเลือดช่วงเช้า (ก่อน 10 โมง) เพราะเทสโทสเตอโรนมีระดับสูงสุดในช่วงเช้า และควรตรวจในวันที่ไม่ได้ซ้อมหนักมาก่อนหน้า 24–48 ชั่วโมง เพื่อลดผลกระทบชั่วคราวจากการซ้อม',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Hypogonadism in Exercising Males: Dysfunction or Adaptive-Regulatory Adjustment?',
        source: 'Frontiers in Endocrinology',
        year: 2020,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7005256',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Novel causes and consequences of overtraining syndrome: the EROS-DISRUPTORS study',
        source: 'BMC Sports Science, Medicine and Rehabilitation',
        year: 2019,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6751688',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'International Olympic Committee (IOC) Consensus Statement on Relative Energy Deficiency in Sport (RED-S): 2018 Update',
        source: 'International Journal of Sport Nutrition and Exercise Metabolism',
        year: 2018,
        url: 'https://journals.humankinetics.com/abstract/journals/ijsnem/28/4/article-p316.xml',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title:
          'Hormonal response to a non-exercise stress test in athletes with overtraining syndrome: results from EROS — EROS-STRESS',
        source: 'Journal of Science and Medicine in Sport',
        year: 2017,
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S1440244017317462',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Blood Hormones as Markers of Training Stress and Overtraining',
        source: 'Sports Medicine',
        year: 1995,
        url: 'https://pubmed.ncbi.nlm.nih.gov/8584849/',
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
      seoTitle: 'เทสโทสเตอโรนต่ำจากซ้อมหนัก ไม่ใช่แค่อายุ | Thrive Bangkok',
      seoDescription:
        'นักกีฬาผู้ชายที่ซ้อมหนักต่อเนื่องอาจเทสโทสเตอโรนต่ำได้โดยไม่เกี่ยวกับอายุ เช็กอาการ สาเหตุ และวิธีตรวจ Exercise Hypogonadal Male Condition — แพทย์ Thrive อธิบาย',
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
