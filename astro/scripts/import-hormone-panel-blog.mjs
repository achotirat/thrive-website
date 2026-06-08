#!/usr/bin/env node
/**
 * One-off Sanity import for the ฮอร์โมนทำงานเป็นทีม blog post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-hormone-panel-blog.mjs
 *
 * Token is loaded automatically from .env.local (SANITY_API_TOKEN).
 * Images are found in Sanity by filename; if not found, they are uploaded
 * from docs/blog/.
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

// Load .env.local if SANITY_API_TOKEN not already in environment
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
  // Try to find an existing asset by originalFilename
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{ _id, url }`,
    { filename },
  )
  if (existing) {
    console.log(`  ✓ Found existing asset for ${filename}: ${existing._id}`)
    return { asset: existing, altText }
  }

  // Not found — upload from docs/blog/
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

  // Body starts at intro paragraph
  const introMarker = 'ผู้หญิงวัย 40 ที่ตรวจฮอร์โมนเพียง 1–2 ตัว'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Could not find intro paragraph marker')
  let bodySection = text.slice(introIdx)

  // Stop before Image Prompts section (end of real content)
  const imagePromptsMarker = '## Image Prompts'
  const imagePromptsIdx = bodySection.indexOf(imagePromptsMarker)
  if (imagePromptsIdx !== -1) bodySection = bodySection.slice(0, imagePromptsIdx)

  // Replace local image filenames with Sanity CDN URLs
  for (const [filename, url] of Object.entries(imageUrlMap)) {
    bodySection = bodySection.replaceAll(filename, url)
  }

  // Collapse excessive blank lines
  bodySection = bodySection.replace(/\n{4,}/g, '\n\n\n')

  return mdToHtml(bodySection)
}

async function findHormonesQuizService() {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == "hormones-quiz"][0]{ _id, title }`,
  )
  if (result) {
    console.log(`  ✓ Found hormones-quiz service: ${result._id} (${result.title})`)
  } else {
    console.log('  ⚠ hormones-quiz service not found — ctaService will be skipped')
  }
  return result
}

async function main() {
  // 1. Resolve images (find existing or upload)
  console.log('\n── Resolving images ──')
  const [hero, diagram1, infographic, flowchart] = await Promise.all([
    getOrUploadImage(
      'female-hormone-panel-age-40-hero.webp',
      'หญิงไทยวัย 40 ต้นนั่งในร้านกาแฟกรุงเทพฯ ยามเช้า มองออกไปด้วยสายตาใคร่ครวญ แสงธรรมชาติสีทองอบอุ่น บรรยากาศสงบและเป็นส่วนตัว',
    ),
    getOrUploadImage(
      'female-hormone-panel-age-40-diagram-1.webp',
      'แผนภาพแสดงความสัมพันธ์ระหว่างต่อมใต้สมอง รังไข่ ต่อมหมวกไต และไทรอยด์ — ฮอร์โมนทำงานเป็นทีม',
    ),
    getOrUploadImage(
      'female-hormone-panel-age-40-infographic.webp',
      '11 ฮอร์โมนที่ต้องตรวจสำหรับผู้หญิงวัย 40 จัดกลุ่มตามแหล่งกำเนิด',
    ),
    getOrUploadImage(
      'female-hormone-panel-age-40-flowchart.webp',
      'การอ่านค่าฮอร์โมนแบบจับคู่: FSH+E2, LH+Progesterone, TSH+Free T3+Anti-TPO, SHBG+E2',
    ),
  ])

  // 2. Look up hormones-quiz service for ctaService
  console.log('\n── Looking up CTA service ──')
  const hormonesQuizService = await findHormonesQuizService()

  // 3. Convert markdown body to HTML
  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'female-hormone-panel-age-40.md'), 'utf8')
  const imageUrlMap = {
    'female-hormone-panel-age-40-hero.webp': hero.asset.url,
    'female-hormone-panel-age-40-diagram-1.webp': diagram1.asset.url,
    'female-hormone-panel-age-40-infographic.webp': infographic.asset.url,
    'female-hormone-panel-age-40-flowchart.webp': flowchart.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  // 4. Build and create the Sanity document
  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-female-hormone-panel-age-40',
    title: 'ฮอร์โมนทำงานเป็นทีม — ทำไมผู้หญิงวัย 40 ต้องตรวจครบ ไม่ใช่แค่ 1–2 ตัว',
    slug: { _type: 'slug', current: 'female-hormone-panel-age-40' },
    category: 'สุขภาพผู้หญิง',
    excerpt:
      'ฮอร์โมนเพศหญิงทำงานจับคู่กัน ถ้าตัวหนึ่งลด อีกตัวจะกระทบตามทันที รู้ว่าต้องตรวจ E2, FSH, LH, Progesterone, SHBG, DHEAS และไทรอยด์ครบ เพราะการตรวจแค่ 1–2 ตัวอาจพลาดต้นเหตุจริง',
    publishedAt: '2026-06-08T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(hormonesQuizService && {
      ctaService: { _type: 'reference', _ref: hormonesQuizService._id },
    }),
    keyTakeaways: [
      'ฮอร์โมนเพศหญิงทำงานจับคู่และพึ่งพากัน ถ้าตัวหนึ่งลด ตัวอื่นจะถูกกระทบตาม',
      'ผู้หญิงวัย 40 ควรตรวจฮอร์โมนอย่างน้อยปีละครั้ง เพราะ Perimenopause สามารถเริ่มได้ตั้งแต่อายุ 35–40 ปี',
      'Panel ที่สมบูรณ์ต้องครอบคลุม 11 ตัว: E2, Progesterone, FSH, LH, SHBG, DHEAS และไทรอยด์ครบ',
      'ตรวจแค่ 1–2 ตัวอาจพลาดต้นเหตุจริง เพราะค่าที่ "ปกติ" เดี่ยวๆ อาจผิดปกติเมื่อดูร่วมกัน',
      'เริ่มตรวจก่อนอาการจะเห็นชัด คือโอกาสที่ดีที่สุดในการชะลอความเสื่อม',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-what-to-test',
        question: 'ผู้หญิงวัย 40 ควรตรวจฮอร์โมนอะไรบ้าง?',
        shortAnswer:
          'Panel ขั้นต่ำที่ให้ภาพครบคือ: Estradiol (E2), Progesterone, FSH, LH, SHBG, DHEAS รวมกับ Thyroid Panel (TSH, Free T3, Free T4, TG Ab, Anti-TPO) รวม 11 ตัว การตรวจแค่ FSH หรือ E2 เพียงตัวเดียวไม่เพียงพอสำหรับการวินิจฉัยที่แม่นยำ เพราะฮอร์โมนทำงานเป็นทีม',
      },
      {
        _type: 'faqItem',
        _key: 'faq-fsh-high',
        question: 'FSH สูง หมายความว่าอะไร?',
        shortAnswer:
          'FSH (Follicle Stimulating Hormone) ที่สูงขึ้นหมายความว่าต่อมใต้สมองกำลังส่งสัญญาณกระตุ้นรังไข่อย่างหนักขึ้น ซึ่งมักเกิดเมื่อรังไข่ตอบสนองน้อยลง ในช่วง Perimenopause FSH จะสูงขึ้นก่อน E2 จะลดลงอย่างชัดเจน ดังนั้น FSH สูงในวัย 40 คือสัญญาณเตือนที่ควรรับรู้ก่อนอาการจะปรากฏ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-low-e2-symptoms',
        question: 'ฮอร์โมนเอสโตรเจน (Estradiol) ต่ำมีอาการอย่างไร?',
        shortAnswer:
          'Estradiol (E2) ต่ำแสดงออกหลายรูปแบบ: ร้อนวูบวาบ เหงื่อออกกลางดึก นอนไม่หลับ อารมณ์แปรปรวน ผิวแห้ง ช่องคลอดแห้ง ผมร่วง และกระดูกเริ่มบางลง ในระยะยาว E2 ต่ำเพิ่มความเสี่ยงโรคกระดูกพรุนและโรคหัวใจอย่างมีนัยสำคัญ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-perimenopause-age',
        question: 'Perimenopause เริ่มตั้งแต่อายุเท่าไหร่?',
        shortAnswer:
          'ช่วง Perimenopause สามารถเริ่มได้ตั้งแต่อายุ 35–40 ปี และกินเวลา 2–8 ปี อาการในระยะแรกมักเบาและไม่ชัดเจน เช่น รอบเดือนเริ่มเปลี่ยน นอนหลับยากขึ้น หรืออารมณ์แปรปรวนมากกว่าเดิม การตรวจ Hormone Panel ช่วยยืนยันได้ก่อนอาการจะรุนแรง',
      },
      {
        _type: 'faqItem',
        _key: 'faq-shbg-dheas',
        question: 'SHBG กับ DHEAS ตรวจทำไม สำคัญแค่ไหน?',
        shortAnswer:
          'SHBG ควบคุมว่าฮอร์โมนเพศที่ "ออกฤทธิ์ได้จริง" ในร่างกายมีปริมาณเท่าไหร่ ระดับ SHBG ต่ำสัมพันธ์กับความเสี่ยงมะเร็งเต้านมและเนื้องอกมดลูกที่สูงขึ้น ส่วน DHEAS เป็นสารตั้งต้นของฮอร์โมนเพศหลายชนิดจากต่อมหมวกไต ระดับที่ต่ำเกินไปเชื่อมโยงกับภูมิคุ้มกันอ่อน กระดูกเปราะ และพลังงานต่ำ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-timing',
        question: 'ตรวจฮอร์โมนต้องเจาะเลือดวันไหนของรอบเดือน?',
        shortAnswer:
          'สำหรับผู้หญิงที่ยังมีประจำเดือน วันที่ 2–5 ของรอบเดือนให้ผล FSH, LH, และ E2 ที่แม่นยำที่สุด ส่วน Progesterone ควรตรวจในช่วงกลางรอบ (วันที่ 19–21) เพื่อดูว่ามีการตกไข่และ Progesterone ขึ้นเพียงพอหรือไม่ แพทย์ Thrive จะแนะนำ Timing ที่เหมาะสมก่อนนัดตรวจเสมอ',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title:
          'Trajectory clustering of estradiol and follicle-stimulating hormone during the menopausal transition among women in the Study of Women\'s Health across the Nation (SWAN)',
        source: 'Menopause',
        year: 2011,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3410268/',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title:
          'Oral micronized progesterone for perimenopausal night sweats and hot flushes: a Phase III Canada-wide randomized placebo-controlled 4-month trial',
        source: 'Menopause',
        year: 2023,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10241804/',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title:
          'Menopausal transition stage-specific changes in circulating adrenal androgens',
        source: 'Menopause',
        year: 2012,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3366025/',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Autoimmune Thyroid Disease in Women',
        source: 'International Journal of Environmental Research and Public Health',
        year: 2023,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10071442/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Premature menopause or early menopause: long-term health consequences',
        source: 'Maturitas',
        year: 2010,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2815011/',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title:
          'Low levels of sex hormone-binding globulin predict an increased breast cancer risk and its underlying molecular mechanisms',
        source: 'Frontiers in Oncology',
        year: 2024,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10921478/',
      },
      {
        _type: 'citation',
        _key: 'ref-7',
        title:
          'Serum follicle stimulating hormone and estradiol in peri/postmenopausal women attending Siriraj Menopause Clinic: a retrospective study',
        source: 'Journal of the Medical Association of Thailand',
        year: 2006,
        url: 'https://pubmed.ncbi.nlm.nih.gov/17048416/',
      },
      {
        _type: 'citation',
        _key: 'ref-8',
        title:
          'Steroid Hormone Secretion Over the Course of the Perimenopause: Findings From the Swiss Perimenopause Study',
        source: 'Frontiers in Endocrinology',
        year: 2022,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8712488/',
      },
    ],
    body: [
      {
        _type: 'block',
        _key: 'body-legacy-placeholder',
        style: 'normal',
        markDefs: [],
        children: [
          {
            _type: 'span',
            _key: 's1',
            marks: [],
            text: 'Full content stored in legacyHtml.',
          },
        ],
      },
    ],
    legacyHtml,
    seo: {
      _type: 'seoMeta',
      seoTitle: 'ตรวจฮอร์โมนผู้หญิงวัย 40 ต้องตรวจอะไรบ้าง | Thrive Wellness Bangkok',
      seoDescription:
        'วัย 40 ฮอร์โมนลดทีละตัว อาการจะตามมา รู้ว่าต้องตรวจ E2, FSH, LH, Progesterone, SHBG, DHEAS และไทรอยด์ครบ เพราะฮอร์โมนทำงานจับคู่กัน — แพทย์ Thrive อธิบาย',
      noIndex: false,
      schemaType: 'BlogPosting',
      includeInSitemap: true,
      sitemapPriority: 0.8,
    },
  }

  const result = await client.createOrReplace(doc)
  console.log(`  ✓ Document created/replaced: ${result._id}`)
  console.log(`\nView in Sanity Studio:`)
  console.log(
    `  https://jx3ty6pl155yiizbs6ry5t4q.sanity.studio/structure/blogPost;${result._id}`,
  )
  console.log(`\nDone! Run "npm run build" in astro/ to verify the page renders.`)
}

main().catch((err) => {
  console.error('\nError:', err.message ?? err)
  process.exit(1)
})
