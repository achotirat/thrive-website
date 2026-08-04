#!/usr/bin/env node
/**
 * One-off Sanity import for the "RED-S คืออะไร" cluster post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-red-s-relative-energy-deficiency-sport.mjs
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

  const introMarker = 'RED-S คือภาวะที่ร่างกายได้รับพลังงานจากอาหารไม่พอกับที่ใช้ไปในการซ้อมและใช้ชีวิตประจำวัน ส่งผลกระทบต่อฮอร์โมน'
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
    'red-s-relative-energy-deficiency-sport-hero.webp',
    'นักกีฬาไทยหญิงวัย 20 ปลายนั่งพักหลังซ้อมวิ่งในกรุงเทพฯ ถือขวดน้ำมองไปที่จานอาหารเช้าด้วยสีหน้าครุ่นคิด แสงธรรมชาติยามเช้า',
  )

  console.log('\n── Looking up CTA service ──')
  const adrenalFatigueService = await findService('adrenal-fatigue')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'red-s-relative-energy-deficiency-sport.md'), 'utf8')
  const imageUrlMap = {
    'red-s-relative-energy-deficiency-sport-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-red-s-relative-energy-deficiency-sport',
    title: 'RED-S คืออะไร — ภาวะที่นักกีฬาไทยแทบไม่รู้จัก แต่เสี่ยงทุกคนที่ซ้อมหนัก',
    slug: { _type: 'slug', current: 'red-s-relative-energy-deficiency-sport' },
    category: 'ฮอร์โมนและการออกกำลังกาย',
    excerpt:
      'RED-S (Relative Energy Deficiency in Sport) คือภาวะที่ร่างกายได้รับพลังงานไม่พอกับที่ใช้ไปในการซ้อม ส่งผลกระทบต่อฮอร์โมน กระดูก และภูมิคุ้มกันพร้อมกัน เกิดได้ทั้งชายและหญิง แต่แทบไม่มีใครในไทยรู้จักชื่อนี้',
    publishedAt: '2026-08-04T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(adrenalFatigueService && {
      ctaService: { _type: 'reference', _ref: adrenalFatigueService._id },
    }),
    keyTakeaways: [
      'RED-S (Relative Energy Deficiency in Sport) คือภาวะที่ร่างกายได้รับพลังงานจากอาหารไม่พอกับที่ใช้ไปในการซ้อมและใช้ชีวิตประจำวัน',
      'เดิมเรียกว่า "Female Athlete Triad" แต่ถูกปรับชื่อในปี 2014 เพราะพบว่าผู้ชายก็เป็นได้เช่นกัน ไม่ใช่ปัญหาเฉพาะนักกีฬาหญิง',
      'RED-S กระทบหลายระบบพร้อมกัน ทั้งฮอร์โมนสืบพันธุ์ ความหนาแน่นของกระดูก ภูมิคุ้มกัน และการทำงานของหัวใจ ไม่ใช่แค่เรื่องประจำเดือนขาด',
      'ในผู้ชาย RED-S แสดงออกเป็นเทสโทสเตอโรนต่ำที่ไม่เกี่ยวกับอายุ ผ่านกลไกเดียวกับที่ทำให้ผู้หญิงประจำเดือนขาด',
      'สังเกตยากเพราะคนที่เป็น RED-S มักดูฟิตและมีวินัยการซ้อมดี ทำให้ปัญหาถูกมองข้ามจนกว่าจะแสดงอาการชัดเจน',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-vs-overtraining',
        question: 'RED-S ต่างจาก Overtraining Syndrome อย่างไร?',
        shortAnswer:
          'RED-S เน้นที่ต้นเหตุด้านพลังงาน (กินไม่พอกับที่ใช้) ส่วน Overtraining Syndrome เน้นที่ความเครียดสะสมจากปริมาณการซ้อม ทั้งสองภาวะเกิดร่วมกันได้บ่อย และมีกลไกที่ทับซ้อนกันในระบบฮอร์โมนความเครียด',
      },
      {
        _type: 'faqItem',
        _key: 'faq-need-to-be-thin',
        question: 'ต้องผอมมากถึงจะเป็น RED-S ไหม?',
        shortAnswer:
          'ไม่จำเป็น RED-S เกิดจากพลังงานที่ได้รับไม่พอเทียบกับที่ใช้ไป ไม่ใช่จากน้ำหนักตัวหรือรูปร่างภายนอก คนที่ดูฟิตและน้ำหนักปกติก็เป็น RED-S ได้ถ้าพลังงานสุทธิติดลบต่อเนื่อง',
      },
      {
        _type: 'faqItem',
        _key: 'faq-men-how-to-know',
        question: 'ผู้ชายที่เป็น RED-S จะรู้ตัวได้อย่างไร ถ้าไม่มีประจำเดือนเป็นสัญญาณ?',
        shortAnswer:
          'สังเกตจากความต้องการทางเพศที่ลดลง ผลงานการซ้อมที่แย่ลงทั้งที่ซ้อมหนักขึ้น หรือป่วยบ่อยกว่าปกติ หากสงสัยควรตรวจเทสโทสเตอโรนร่วมกับฮอร์โมนอื่นเพื่อยืนยัน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-how-much-more-food',
        question: 'กิน RED-S ให้หายต้องเพิ่มอาหารเท่าไหร่?',
        shortAnswer:
          'ไม่มีตัวเลขตายตัวสำหรับทุกคน ขึ้นอยู่กับปริมาณการซ้อมและพลังงานที่ขาดไปเดิม แนะนำให้ประเมินร่วมกับแพทย์หรือนักโภชนาการที่เข้าใจความต้องการพลังงานของนักกีฬาโดยเฉพาะ ไม่ใช่ปรับเองตามความรู้สึก',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'International Olympic Committee (IOC) Consensus Statement on Relative Energy Deficiency in Sport (RED-S): 2018 Update',
        source: 'International Journal of Sport Nutrition and Exercise Metabolism',
        year: 2018,
        url: 'https://journals.humankinetics.com/abstract/journals/ijsnem/28/4/article-p316.xml',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'The IOC consensus statement: beyond the Female Athlete Triad—Relative Energy Deficiency in Sport (RED-S)',
        source: 'British Journal of Sports Medicine',
        year: 2014,
        url: 'https://aqmse.org/wp-content/uploads/2014/09/br-j-sports-med-2014-mountjoy-491-7.pdf',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Hypogonadism in Exercising Males: Dysfunction or Adaptive-Regulatory Adjustment?',
        source: 'Frontiers in Endocrinology',
        year: 2020,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7005256',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Novel causes and consequences of overtraining syndrome: the EROS-DISRUPTORS study',
        source: 'BMC Sports Science, Medicine and Rehabilitation',
        year: 2019,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6751688',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Characterization of the Profile of Hyrox© Athletes',
        source: 'Applied Sciences',
        year: 2025,
        url: 'https://www.mdpi.com/2076-3417/15/21/11693',
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
      seoTitle: 'RED-S คืออะไร ภาวะพลังงานไม่พอในนักกีฬา | Thrive Bangkok',
      seoDescription:
        'RED-S คือภาวะที่นักกีฬาซ้อมหนักแต่กินไม่พอ ส่งผลต่อฮอร์โมน กระดูก และภูมิคุ้มกัน เกิดได้ทั้งชายและหญิง เช็กสัญญาณและวิธีรับมือ — แพทย์ Thrive อธิบาย',
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
