#!/usr/bin/env node
/**
 * One-off Sanity import for the ซ้อม HYROX / Overtraining hormone pillar post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-hyrox-overtraining-hormone-imbalance.mjs
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

  const introMarker = 'ซ้อมหนักขึ้นก่อนแข่ง HYROX ไม่ใช่เรื่องผิด'
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
    'hyrox-overtraining-hormone-imbalance-hero.webp',
    'นักกีฬาไทยวัย 30 ปลายนั่งพักหลังซ้อมในยิมฟังก์ชันนัลที่กรุงเทพฯ เหงื่อยังไม่แห้ง มองดูนาฬิกาวัดหัวใจด้วยสีหน้าครุ่นคิด แสงธรรมชาติยามเช้า',
  )

  console.log('\n── Looking up CTA service ──')
  const adrenalFatigueService = await findService('adrenal-fatigue')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'hyrox-overtraining-hormone-imbalance.md'), 'utf8')
  const imageUrlMap = {
    'hyrox-overtraining-hormone-imbalance-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-hyrox-overtraining-hormone-imbalance',
    title: 'ซ้อม HYROX หนักแค่ไหนถึงเรียก Overtraining? เช็กฮอร์โมนก่อนแข่ง',
    slug: { _type: 'slug', current: 'hyrox-overtraining-hormone-imbalance' },
    category: 'ฮอร์โมนและการออกกำลังกาย',
    excerpt:
      'ก่อนแข่ง HYROX Bangkok 13-16 ส.ค. นี้ เช็กความแตกต่างระหว่างซ้อมหนักปกติกับ Overtraining Syndrome ที่ทำให้ฮอร์โมนทั้งระบบรวน พร้อมเช็กลิสต์สัญญาณเตือนและวิธีตรวจก่อนอาการลุกลาม',
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
      'งานวิจัยปี 2025 สำรวจนักกีฬา HYROX 80 คน พบว่า 43% เคยบาดเจ็บจากการซ้อมหรือแข่ง ส่วนใหญ่เป็นการบาดเจ็บจากการใช้งานซ้ำ',
      'Overtraining Syndrome (OTS) ไม่ใช่แค่ความเหนื่อยล้า แต่คือภาวะที่ระบบฮอร์โมนทั้งหมดตอบสนองต่อความเครียดได้แย่ลง',
      'RED-S (พลังงานไม่พอกับที่ใช้) คือจุดที่คนไทยพลาดบ่อยที่สุด เพราะซ้อมหนักขึ้นแต่คุมอาหารไปพร้อมกันเพื่อลดไขมัน',
      'อาการต่างกันตามเพศ: ผู้ชายมักเจอเทสโทสเตอโรนต่ำและนอนไม่ลึก ส่วนผู้หญิงมักเจอประจำเดือนมาไม่ปกติหรือขาดหาย',
      'HYROX เองยังไม่มีงานวิจัยตรงเรื่องฮอร์โมน แต่ความเสี่ยงมาจากกลไก OTS/RED-S ที่มีหลักฐานจากการฝึกหนักทุกชนิด — ซ้อมได้ แค่ต้องดูฮอร์โมนควบคู่ไปด้วย',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-what-counts-as-overtraining',
        question: 'ออกกำลังกายหนักแค่ไหนถึงเรียกว่า Overtraining?',
        shortAnswer:
          'ไม่มีตัวเลขตายตัว แต่สัญญาณหลักคือความเหนื่อยล้าที่ไม่หายภายใน 72 ชั่วโมง ร่วมกับผลงานที่แย่ลงทั้งที่ซ้อมหนักขึ้น ถ้าอาการเหล่านี้เกิดต่อเนื่องหลายสัปดาห์ ควรลดความเข้มข้นการซ้อมและปรึกษาแพทย์เพื่อประเมิน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-hormone-symptoms',
        question: 'อาการฮอร์โมนพังจากการซ้อมหนักเป็นแบบไหน?',
        shortAnswer:
          'ในผู้ชายมักเจอเทสโทสเตอโรนต่ำ ความต้องการทางเพศลดลง และนอนหลับไม่ลึก ในผู้หญิงมักเจอประจำเดือนมาไม่ปกติหรือขาดหายไป งานวิจัยยังพบว่าอัตราส่วนฮอร์โมนเพศเปลี่ยนแปลงชัดเจนในคนที่มีภาวะฝึกเกิน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-missed-period-danger',
        question: 'ประจำเดือนขาดจากการซ้อมหนักอันตรายไหม?',
        shortAnswer:
          'ถ้าประจำเดือนขาดต่อเนื่องมากกว่า 3 รอบ ควรพบสูตินรีแพทย์เพื่อประเมิน เพราะอาจเกี่ยวข้องกับพลังงานที่ร่างกายได้รับไม่พอ (RED-S) ซึ่งถ้าปล่อยไว้นานอาจกระทบมวลกระดูกในระยะยาว',
      },
      {
        _type: 'faqItem',
        _key: 'faq-what-to-test',
        question: 'ตรวจฮอร์โมนนักกีฬาต้องตรวจอะไรบ้าง?',
        shortAnswer:
          'พื้นฐานควรตรวจฮอร์โมนความเครียด (Cortisol, DHEAS) ฮอร์โมนเพศตามเพศของผู้ตรวจ และไทรอยด์ เพื่อแยกภาวะที่มีอาการคล้ายกันออกจากกัน แพทย์จะแนะนำรายการที่เหมาะกับอาการและประวัติการซ้อมของแต่ละคน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-should-stop-training',
        question: 'ถ้าสงสัยว่าตัวเองฝึกเกิน ต้องหยุดซ้อมทันทีไหม?',
        shortAnswer:
          'ไม่จำเป็นต้องหยุดทันที แต่ควรลดความเข้มข้นและปริมาณลงก่อน พร้อมสังเกตว่าอาการดีขึ้นภายใน 1–2 สัปดาห์หรือไม่ ถ้าอาการไม่ดีขึ้นหรือแย่ลง ควรปรึกษาแพทย์เพื่อตรวจฮอร์โมนและวางแผนฟื้นตัวอย่างเหมาะสม',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Characterization of the Profile of Hyrox© Athletes',
        source: 'Applied Sciences',
        year: 2025,
        url: 'https://www.mdpi.com/2076-3417/15/21/11693',
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
        title:
          'Hormonal response to a non-exercise stress test in athletes with overtraining syndrome: results from EROS — EROS-STRESS',
        source: 'Journal of Science and Medicine in Sport',
        year: 2017,
        url: 'https://www.sciencedirect.com/science/article/abs/pii/S1440244017317462',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title:
          'Diagnosis of Overtraining Syndrome: Results of the Endocrine and Metabolic Responses on Overtraining Syndrome Study: EROS-DIAGNOSIS',
        source: 'Journal of Sports Medicine',
        year: 2020,
        url: 'https://doi.org/10.1155/2020/3937819',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Blood Hormones as Markers of Training Stress and Overtraining',
        source: 'Sports Medicine',
        year: 1995,
        url: 'https://pubmed.ncbi.nlm.nih.gov/8584849/',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Overtraining รู้ให้ทัน ป้องกันได้ ออกกำลังกายปลอดภัยหายห่วง',
        source: 'คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล',
        year: 2026,
        url: 'https://www.si.mahidol.ac.th/th/healthdetail.asp?aid=1406',
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
      seoTitle: 'ซ้อม HYROX หนักไป เสี่ยง Overtraining ไหม? | Thrive Bangkok',
      seoDescription:
        'ก่อนแข่ง HYROX Bangkok 13-16 ส.ค. นี้ เช็กสัญญาณ Overtraining Syndrome และ RED-S ที่ทำฮอร์โมนรวน พร้อมวิธีตรวจและป้องกัน — แพทย์ Thrive อธิบาย',
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
