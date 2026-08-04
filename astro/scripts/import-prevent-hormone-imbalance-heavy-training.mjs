#!/usr/bin/env node
/**
 * One-off Sanity import for the "6 วิธีป้องกันฮอร์โมนพัง" cluster post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-prevent-hormone-imbalance-heavy-training.mjs
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

  const introMarker = 'ป้องกันฮอร์โมนพังจากการซ้อมหนักไม่ได้แปลว่าต้องซ้อมเบาลงหรือหยุดซ้อม'
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
    'prevent-hormone-imbalance-heavy-training-hero.webp',
    'นักกีฬาไทยหญิงวัย 30 ต้นยืนเช็คตารางซ้อมบนโทรศัพท์มือถือหลังเซสชันเช้าในสวนสาธารณะกรุงเทพฯ สีหน้าครุ่นคิดวางแผน แสงธรรมชาติยามเช้า',
  )

  console.log('\n── Looking up CTA service ──')
  const adrenalFatigueService = await findService('adrenal-fatigue')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'prevent-hormone-imbalance-heavy-training.md'), 'utf8')
  const imageUrlMap = {
    'prevent-hormone-imbalance-heavy-training-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-prevent-hormone-imbalance-heavy-training',
    title: '6 วิธีป้องกันฮอร์โมนพังก่อนแข่งใหญ่ ไม่ต้องหยุดซ้อม',
    slug: { _type: 'slug', current: 'prevent-hormone-imbalance-heavy-training' },
    category: 'ฮอร์โมนและการออกกำลังกาย',
    excerpt:
      'ก่อนเข้าสู่ช่วงซ้อมหนักที่สุดของโปรแกรม เช็ก 6 วิธีป้องกันฮอร์โมนพังที่ทำได้จริงโดยไม่ต้องหยุดซ้อมหรือลดเป้าหมาย ตั้งแต่การเพิ่มโหลดแบบขั้นบันไดไปจนถึงการตรวจฮอร์โมน baseline ก่อนเข้าสู่ช่วง peak training',
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
      'ปัญหาไม่ได้อยู่ที่ "ซ้อมหนัก" แต่อยู่ที่ "เพิ่มโหลดเร็วเกินไปโดยไม่มีแผน" — IOC Consensus พบว่าการเพิ่มปริมาณซ้อมแบบพรวดพราดเพิ่มความเสี่ยงบาดเจ็บและเจ็บป่วยชัดเจน',
      'อย่าคุมอาหารเข้มงวดในสัปดาห์เดียวกับที่เพิ่มปริมาณซ้อม เพราะพลังงานติดลบต่อเนื่องเป็นตัวกระตุ้นภาวะฝึกเกินที่ชัดเจนที่สุดตัวหนึ่ง',
      'นักกีฬา HYROX กว่า 40% ไม่มีแผนฟื้นตัวหลังซ้อมที่ชัดเจนเลย ทั้งที่ร่างกายต้องรับภาระหนักทุกเซสชัน',
      'สัปดาห์ deload ทุก 3–4 สัปดาห์ และการฟังสัญญาณร่างกาย สำคัญพอๆ กับตารางซ้อมเอง',
      'ตรวจฮอร์โมน baseline ก่อนเข้าสู่ช่วง peak training ช่วยให้รู้จุดเริ่มต้นของตัวเอง เพื่อเทียบดูการเปลี่ยนแปลงได้ชัดเจนเมื่อจำเป็น',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-how-many-days-off',
        question: 'ต้องหยุดซ้อมกี่วันถ้าเริ่มมีสัญญาณฝึกเกิน?',
        shortAnswer:
          'ไม่มีตัวเลขตายตัว แต่โดยทั่วไปการลดโหลดลง 40–60% เป็นเวลา 1–2 สัปดาห์ พร้อมสังเกตว่าอาการดีขึ้นหรือไม่ เป็นจุดเริ่มต้นที่เหมาะสม ถ้าอาการไม่ดีขึ้นควรปรึกษาแพทย์เพื่อตรวจฮอร์โมนเพิ่มเติม',
      },
      {
        _type: 'faqItem',
        _key: 'faq-diet-while-training-hard',
        question: 'คุมอาหารลดไขมันพร้อมซ้อมหนักได้ไหม ถ้าระวังแล้ว?',
        shortAnswer:
          'ทำได้ยากในทางปฏิบัติ เพราะทั้งสองอย่างต้องการพลังงานคนละทิศทาง งานวิจัยพบว่าการขาดคาร์โบไฮเดรต โปรตีน หรือแคลอรีต่อเนื่อง แต่ละตัวเป็นปัจจัยกระตุ้นภาวะฝึกเกินได้อิสระต่อกัน แนะนำให้แยกช่วงคุมอาหารออกจากช่วงเพิ่มโหลดซ้อมสูงสุด',
      },
      {
        _type: 'faqItem',
        _key: 'faq-deload-hurts-performance',
        question: 'Deload สัปดาห์แล้วผลงานจะตกไหม?',
        shortAnswer:
          'ตรงกันข้าม — สัปดาห์ deload ที่วางแผนไว้ล่วงหน้าเป็นส่วนหนึ่งของการพัฒนาผลงาน ไม่ใช่การเสียเวลา ร่างกายต้องการเวลาซึมซับการปรับตัวจากโหลดที่ผ่านมา ก่อนจะพร้อมรับโหลดที่หนักขึ้นในรอบถัดไป',
      },
      {
        _type: 'faqItem',
        _key: 'faq-when-to-test-baseline',
        question: 'ตรวจฮอร์โมน Baseline ต้องตรวจตอนไหน ก่อนแข่งกี่สัปดาห์?',
        shortAnswer:
          'แนะนำให้ตรวจก่อนเริ่มเข้าสู่ช่วง peak training อย่างน้อย 4–6 สัปดาห์ เพื่อให้มีเวลาปรับแผนถ้าพบความผิดปกติ และยังทันเวลาก่อนวันแข่งจริง',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title:
          'How much is too much? (Part 1) International Olympic Committee consensus statement on load in sport and risk of injury',
        source: 'British Journal of Sports Medicine',
        year: 2016,
        url: 'https://www.ostrc.no/globalassets/publications/soligard_2016_bjsm_how-much-is-too-much.-ioc-consensus-statement-on-load-in-sport-and-risk-of-injury.pdf',
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
        title: 'Characterization of the Profile of Hyrox© Athletes',
        source: 'Applied Sciences',
        year: 2025,
        url: 'https://www.mdpi.com/2076-3417/15/21/11693',
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
      seoTitle: '6 วิธีป้องกันฮอร์โมนพังจากการซ้อมหนัก | Thrive Bangkok',
      seoDescription:
        'ซ้อมหนักได้โดยไม่ต้องเสี่ยงฮอร์โมนพัง เช็ก 6 วิธีป้องกันที่นักกีฬาทำได้จริง พร้อมสัญญาณเตือนที่ควรฟังก่อนร่างกายฟ้อง — แพทย์ Thrive อธิบาย',
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
