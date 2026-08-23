#!/usr/bin/env node
/**
 * One-off Sanity import for "สูตร 220 ลบอายุ แม่นแค่ไหน?" (VO2Max / heart rate zone follow-up).
 *
 * Run from the repo root:
 *   node astro/scripts/import-220-minus-age-heart-rate-formula-accuracy.mjs
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

  const introMarker =
    'สูตร "220 ลบอายุ" ที่หลายคนใช้คำนวณโซนหัวใจสำหรับออกกำลังกาย'
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
    '220-minus-age-heart-rate-formula-accuracy-hero.webp',
    'ผู้หญิงไทยวัย 30 ปลายยืนอยู่ในสวนสาธารณะกรุงเทพฯ ตอนเช้า มองนาฬิกาสมาร์ตวอทช์ที่ข้อมือด้วยสีหน้าครุ่นคิด หลังวิ่งจ๊อกกิ้งเสร็จ แสงธรรมชาติยามเช้า',
  )

  console.log('\n── Looking up CTA service ──')
  const checkUpService = await findService('check-up')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(
    join(BLOG_DIR, '220-minus-age-heart-rate-formula-accuracy.md'),
    'utf8',
  )
  const imageUrlMap = {
    '220-minus-age-heart-rate-formula-accuracy-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-220-minus-age-heart-rate-formula-accuracy',
    title: 'สูตร 220 ลบอายุ แม่นแค่ไหน? ทำไมโซนหัวใจที่คุณคำนวณอาจผิดถึง 15 ครั้ง/นาที',
    slug: { _type: 'slug', current: '220-minus-age-heart-rate-formula-accuracy' },
    category: 'ฟิตเนสและสุขภาพหัวใจ',
    excerpt:
      'สูตร 220 ลบอายุ ที่คนใช้คำนวณโซนหัวใจกันมานาน มีค่าคลาดเคลื่อนเฉลี่ย 10-15 ครั้ง/นาที เปรียบเทียบกับสูตร Tanaka, Karvonen (ที่ Whoop ใช้) และการตรวจ EST จริงที่คลินิก',
    publishedAt: '2026-08-21T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(checkUpService && {
      ctaService: { _type: 'reference', _ref: checkUpService._id },
    }),
    reviewedByDoctor: 'pijak',
    keyTakeaways: [
      'สูตร "220 ลบอายุ" ที่ใช้กันแพร่หลาย มีค่าคลาดเคลื่อนเฉลี่ย 10–15 ครั้งต่อนาที (bpm) เพราะไม่ได้มาจากงานวิจัยที่ควบคุมอย่างเป็นระบบตั้งแต่แรก',
      'สูตร Tanaka (208 − 0.7×อายุ) มาจากงานวิเคราะห์ข้อมูลรวมของ 351 การศึกษา กว่า 18,712 คน และแม่นยำกว่าสูตรเดิมอย่างมีนัยสำคัญ',
      'สูตร Karvonen ที่นำ Resting Heart Rate มาคำนวณร่วมด้วย (สูตรที่ Whoop ใช้) สะท้อนความฟิตของแต่ละคนได้ดีกว่าสูตรที่ใช้แค่อายุอย่างเดียว',
      'นาฬิกาข้อมือวัดชีพจรคลาดเคลื่อนได้มากขึ้นช่วงที่หัวใจเต้นเปลี่ยนเร็ว (เช่น ตอนเริ่มวิ่งหรือเร่งความเร็ว) เมื่อเทียบกับสายรัดอก',
      'วิธีที่แม่นที่สุดคือการตรวจวัดจริงด้วย Exercise Stress Test (EST) ที่คลินิก ไม่ใช่การคำนวณจากสูตรใดสูตรหนึ่ง',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-best-formula-no-est',
        question: 'ถ้าไม่เคยตรวจ EST มาก่อน ใช้สูตรไหนคำนวณโซนหัวใจได้ดีที่สุด?',
        shortAnswer:
          'สำหรับการออกกำลังกายทั่วไป สูตร Tanaka (208 − 0.7×อายุ) แม่นยำกว่าสูตร 220 ลบอายุ และถ้ารู้ค่า Resting Heart Rate ของตัวเอง (วัดตอนตื่นนอนก่อนลุกจากเตียง) การใช้สูตร Karvonen ร่วมด้วยจะสะท้อนความฟิตส่วนบุคคลได้แม่นยำขึ้นอีก',
      },
      {
        _type: 'faqItem',
        _key: 'faq-smartwatch-error',
        question: 'นาฬิกาสมาร์ตวอทช์วัดโซนหัวใจผิดได้มากแค่ไหน?',
        shortAnswer:
          'ความคลาดเคลื่อนแตกต่างกันไปตามยี่ห้อและสถานการณ์ โดยงานวิจัยพบว่าอุปกรณ์ข้อมือมีความคลาดเคลื่อนเพิ่มขึ้นชัดเจนในช่วงที่หัวใจเต้นเปลี่ยนเร็ว ถ้าต้องการความแม่นยำสูงสุดสำหรับการฝึกซ้อมจริงจัง ควรพิจารณาใช้สายรัดอกร่วมด้วย',
      },
      {
        _type: 'faqItem',
        _key: 'faq-when-to-test-est',
        question: 'ควรตรวจ EST ตอนไหน จำเป็นแค่ไหนสำหรับคนที่ออกกำลังกายอยู่แล้ว?',
        shortAnswer:
          'คนที่ออกกำลังกายเป็นประจำอยู่แล้วโดยไม่มีอาการผิดปกติ อาจไม่จำเป็นต้องตรวจ EST ทุกปี แต่ถ้าอายุ 40 ปีขึ้นไป กำลังจะเริ่มโปรแกรมซ้อมหนักขึ้นอย่างมีนัยสำคัญ หรือมีปัจจัยเสี่ยงโรคหัวใจ ควรปรึกษาแพทย์เพื่อพิจารณาตรวจก่อนเริ่มโปรแกรม',
      },
      {
        _type: 'faqItem',
        _key: 'faq-low-vo2max',
        question: 'VO2Max ต่ำ อันตรายไหม ปรับปรุงได้หรือไม่?',
        shortAnswer:
          'VO2Max สามารถพัฒนาได้ด้วยการฝึกซ้อมแบบแอโรบิกอย่างสม่ำเสมอ โดยเฉพาะการฝึกในโซนหัวใจ 2 และ 4 สลับกัน ค่า VO2Max ต่ำเพียงอย่างเดียวไม่ได้แปลว่าเป็นโรค แต่เป็นตัวชี้วัดที่ควรปรับปรุงเพื่อสุขภาพหัวใจและหลอดเลือดในระยะยาว ควรปรึกษาแพทย์หากมีข้อสงสัยเกี่ยวกับความเหมาะสมของโปรแกรมออกกำลังกาย',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Age-predicted maximal heart rate revisited',
        source: 'Journal of the American College of Cardiology',
        year: 2001,
        url: 'https://www.jacc.org/doi/10.1016/S0735-1097(00)01054-8',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title:
          'Cardiorespiratory fitness as a quantitative predictor of all-cause mortality and cardiovascular events in healthy men and women: a meta-analysis',
        source: 'JAMA',
        year: 2009,
        url: 'https://pubmed.ncbi.nlm.nih.gov/19454641/',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Association of Cardiorespiratory Fitness With Long-Term Mortality Among Adults Undergoing Exercise Treadmill Testing',
        source: 'JAMA Network Open',
        year: 2018,
        url: 'https://www.jacc.org/doi/10.1016/j.jacc.2018.06.045',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title:
          'Wrist-Worn and Arm-Worn Wearables for Monitoring Heart Rate During Sedentary and Light-to-Vigorous Physical Activities: Device Validation Study',
        source: 'JMIR Cardio',
        year: 2025,
        url: 'https://cardio.jmir.org/2025/1/e67110/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'The effects of training on heart rate; a longitudinal study',
        source: 'Annales Medicinae Experimentalis et Biologiae Fenniae',
        year: 1957,
        url: 'https://pubmed.ncbi.nlm.nih.gov/13470504/',
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
      seoTitle: 'สูตร 220 ลบอายุ แม่นแค่ไหน? โซนหัวใจที่แม่นกว่า | Thrive',
      seoDescription:
        'สูตร 220 ลบอายุ คลาดเคลื่อนเฉลี่ย 10-15 bpm เทียบสูตร Tanaka, Karvonen (Resting HR) ที่ Whoop ใช้ และทำไมตรวจ EST ที่คลินิกแม่นกว่าการคำนวณ',
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
