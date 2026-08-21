#!/usr/bin/env node
/**
 * One-off Sanity import for "ตรวจหัวใจ 4 ระดับ" (pillar post).
 *
 * Run from the repo root:
 *   node astro/scripts/import-4-levels-heart-screening-coronary-artery-disease.mjs
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
    'การตรวจหัวใจแบ่งได้เป็น 4 ระดับตามความละเอียดและความเสี่ยงของขั้นตอน'
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
    '4-levels-heart-screening-coronary-artery-disease-hero.webp',
    'ผู้ชายไทยวัย 40 ปลายนั่งอยู่ในห้องนั่งเล่นตอนเช้า มองหน้าจอมือถือที่แสดงผลตรวจสุขภาพ สีหน้าครุ่นคิดกังวลเล็กน้อยแต่ไม่ตื่นตระหนก แสงธรรมชาติยามเช้าในบ้านสไตล์กรุงเทพฯ',
  )

  console.log('\n── Looking up CTA service ──')
  const checkUpService = await findService('check-up')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(
    join(BLOG_DIR, '4-levels-heart-screening-coronary-artery-disease.md'),
    'utf8',
  )
  const imageUrlMap = {
    '4-levels-heart-screening-coronary-artery-disease-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-4-levels-heart-screening-coronary-artery-disease',
    title: 'ตรวจหัวใจ 4 ระดับ เช็กหลอดเลือดหัวใจตีบก่อนสาย (บทเรียนจากข่าว เร แมคโดนัลด์)',
    slug: { _type: 'slug', current: '4-levels-heart-screening-coronary-artery-disease' },
    category: 'สุขภาพหัวใจและหลอดเลือด',
    excerpt:
      'สรุปตรวจหัวใจ 4 ระดับ ตั้งแต่ตรวจเลือด-EKG จนถึงสวนหัวใจ เช็กว่าหลอดเลือดหัวใจตีบหรือไม่ พร้อมคำแนะนำตรวจก่อนทำประกัน — บทเรียนจากข่าวการเสียชีวิตของเร แมคโดนัลด์',
    publishedAt: '2026-08-21T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(checkUpService && {
      ctaService: { _type: 'reference', _ref: checkUpService._id },
    }),
    keyTakeaways: [
      'การตรวจหัวใจแบ่งได้เป็น 4 ระดับ ตั้งแต่ตรวจเลือด+EKG พื้นฐาน ไปจนถึงการสวนหัวใจฉีดสี ซึ่งเป็นมาตรฐานที่แม่นยำที่สุด',
      'คนทั่วไปส่วนใหญ่ตรวจแค่ระดับ 1 เท่านั้น ทั้งที่ระดับ 1 ตรวจไม่พบภาวะหลอดเลือดตีบที่ยังไม่แสดงอาการ',
      'CT Calcium Score (ระดับ 3) สามารถตรวจพบคราบหินปูนที่สะสมในหลอดเลือดก่อนมีอาการ และเป็นตัวทำนายความเสี่ยงโรคหัวใจในระยะ 10 ปีที่ผ่านการพิสูจน์ในงานวิจัยขนาดใหญ่',
      'ถ้าวางแผนทำประกันสุขภาพ ควรตรวจหัวใจให้ครบตามความเสี่ยงของตัวเองก่อนสมัครประกัน เพราะถ้าตรวจพบภาวะตีบหลังทำประกันไปแล้ว บริษัทประกันอาจปฏิเสธความคุ้มครองในส่วนนี้',
      'บทความนี้ไม่ใช่การวินิจฉัย ควรปรึกษาแพทย์เพื่อประเมินว่าตัวเองควรเริ่มตรวจที่ระดับไหน',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-chest-pain-emergency',
        question: 'เจ็บหน้าอกแบบไหนที่ต้องรีบไปโรงพยาบาลทันที?',
        shortAnswer:
          'หากมีอาการแน่นหน้าอกรุนแรง ร้าวไปกราม คอ ไหล่ หรือแขนซ้าย ร่วมกับเหงื่อออก ตัวเย็น หายใจไม่อิ่ม หรือเวียนศีรษะ และอาการไม่ดีขึ้นภายในไม่กี่นาที ควรไปโรงพยาบาลฉุกเฉินทันที ไม่ควรรอดูอาการเองที่บ้าน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-where-to-start',
        question: 'การตรวจคัดกรองโรคหัวใจมีกี่วิธี ควรเริ่มจากอะไร?',
        shortAnswer:
          'โดยทั่วไปแนะนำให้เริ่มจากการตรวจระดับ 1 (ตรวจเลือดพื้นฐาน + EKG) เป็นประจำทุกปี หากมีปัจจัยเสี่ยงหรืออาการผิดปกติ แพทย์จะพิจารณาแนะนำการตรวจระดับ 2 ขึ้นไปตามความเหมาะสมของแต่ละคน ไม่มีสูตรตายตัวที่ใช้ได้กับทุกคน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-calcium-score-pain',
        question: 'CT Calcium Score เจ็บไหม ต้องเตรียมตัวอย่างไร?',
        shortAnswer:
          'CT Calcium Score เป็นการตรวจที่ไม่เจ็บ ไม่ต้องฉีดสี ใช้เวลาไม่นาน แต่ควรงดคาเฟอีนก่อนตรวจตามคำแนะนำของสถานพยาบาล เนื่องจากคาเฟอีนอาจทำให้หัวใจเต้นเร็วขึ้นและกระทบความแม่นยำของภาพที่ได้',
      },
      {
        _type: 'faqItem',
        _key: 'faq-insurance-checkup',
        question: 'ตรวจสุขภาพก่อนทำประกัน ต้องตรวจอะไรบ้าง?',
        shortAnswer:
          'รายการตรวจที่บริษัทประกันกำหนดจะแตกต่างกันไปตามวงเงินความคุ้มครองและประวัติสุขภาพของผู้สมัครแต่ละคน ควรสอบถามรายการตรวจที่จำเป็นโดยตรงกับบริษัทประกัน แต่โดยหลักการทั่วไป การตรวจสุขภาพหัวใจระดับ 1 มักเป็นส่วนหนึ่งของชุดตรวจสุขภาพพื้นฐานที่ครอบคลุมอยู่แล้ว',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title:
          'Diagnostic Accuracy of Exercise Stress Testing, Stress Echocardiography, Myocardial Scintigraphy, and Cardiac Magnetic Resonance for Obstructive Coronary Artery Disease: Systematic Reviews and Meta-Analyses of 104 Studies Published from 1990 to 2025',
        source: 'Journal of Clinical Medicine',
        year: 2025,
        url: 'https://doi.org/10.3390/jcm14176238',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Utility of coronary artery calcium scoring in low-risk patients: The Multi-Ethnic Study of Atherosclerosis (MESA)',
        source: 'American Journal of Preventive Cardiology',
        year: 2025,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12557561',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title:
          'Diagnostic Accuracy of Computed Tomography (CT) Coronary Angiography Compared to Invasive Coronary Angiography for Detecting Coronary Artery Disease: A Systematic Review',
        source: 'Cureus',
        year: 2025,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11880638',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Contrast-Induced Nephropathy in Interventional Cardiology: Incidence, Risk Factors, and Identification of High-Risk Patients',
        source: 'PMC',
        year: 2024,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10823194',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'การวิเคราะห์แนวโน้มการเกิดโรคหัวใจขาดเลือด [Analysis of Trends in Ischemic Heart Disease Occurrence]',
        source: 'กองยุทธศาสตร์และแผนงาน กระทรวงสาธารณสุข',
        year: 2024,
        url: 'https://spd.moph.go.th/wp-content/uploads/2024/09/Analysis-of-Trends-in-Ischemic-Heart-Disease-Occurrence.pdf',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'หลอดเลือดหัวใจตีบ อาการเริ่มต้นโรคหัวใจที่ต้องรู้ไว [Coronary Artery Disease: Early Symptoms You Should Know]',
        source: 'รามา แชนแนล, คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี มหาวิทยาลัยมหิดล',
        year: 2024,
        url: 'https://www.rama.mahidol.ac.th/ramachannel/article/หลอดเลือดหัวใจตีบ-อาการ/',
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
      seoTitle: 'ตรวจหัวใจ 4 ระดับ เช็กหลอดเลือดหัวใจตีบ | Thrive Bangkok',
      seoDescription:
        'สรุปตรวจหัวใจ 4 ระดับ ตั้งแต่ตรวจเลือด-EKG จนถึงสวนหัวใจ เช็กว่าหลอดเลือดหัวใจตีบหรือไม่ พร้อมคำแนะนำตรวจก่อนทำประกันสุขภาพ',
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
