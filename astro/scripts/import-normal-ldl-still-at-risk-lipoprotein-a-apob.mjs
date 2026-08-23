#!/usr/bin/env node
/**
 * One-off Sanity import for "LDL ปกติ แต่ทำไมยังเสี่ยงหลอดเลือดหัวใจตีบ?" (Lp(a)/ApoB follow-up).
 *
 * Run from the repo root:
 *   node astro/scripts/import-normal-ldl-still-at-risk-lipoprotein-a-apob.mjs
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
    'หลายคนตรวจสุขภาพประจำปีแล้วเห็นค่า LDL อยู่ในเกณฑ์ปกติ'
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
    'normal-ldl-still-at-risk-lipoprotein-a-apob-hero.webp',
    'ผู้ชายไทยวัย 50 ต้นนั่งอยู่ที่โต๊ะอาหารเช้าในบ้าน ถือผลตรวจสุขภาพในมือ มองด้วยสีหน้าครุ่นคิดสงสัย ไม่ตื่นตระหนก แสงธรรมชาติยามเช้าในครัวกรุงเทพฯ',
  )

  console.log('\n── Looking up CTA service ──')
  const checkUpService = await findService('check-up')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(
    join(BLOG_DIR, 'normal-ldl-still-at-risk-lipoprotein-a-apob.md'),
    'utf8',
  )
  const imageUrlMap = {
    'normal-ldl-still-at-risk-lipoprotein-a-apob-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-normal-ldl-still-at-risk-lipoprotein-a-apob',
    title: 'LDL ปกติ แต่ทำไมยังเสี่ยงหลอดเลือดหัวใจตีบ? รู้จัก Lp(a) และ ApoB ที่ LDL อาจมองข้าม',
    slug: { _type: 'slug', current: 'normal-ldl-still-at-risk-lipoprotein-a-apob' },
    category: 'สุขภาพหัวใจและหลอดเลือด',
    excerpt:
      'บางคนตรวจ LDL แล้วปกติ แต่ยังเสี่ยงหลอดเลือดหัวใจตีบ เพราะ LDL วัดได้แค่ปริมาณไขมัน ไม่ได้วัดจำนวนอนุภาค (ApoB) หรือปัจจัยทางพันธุกรรมอย่าง Lipoprotein(a)',
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
      'LDL ปกติไม่ได้แปลว่าไม่มีความเสี่ยงหลอดเลือดหัวใจตีบเสมอไป เพราะ LDL วัดแค่ "ปริมาณไขมันรวม" ไม่ใช่ "จำนวนอนุภาคไขมัน" ที่ก่อให้เกิดการอุดตันจริง',
      'Lipoprotein(a) หรือ Lp(a) เป็นปัจจัยเสี่ยงที่ถูกกำหนดโดยพันธุกรรม 70–90% เกาะผนังหลอดเลือดได้ง่ายกว่า LDL ทั่วไป และมีความเป็นไปได้ที่จะก่อให้เกิดการอุดตันมากกว่า LDL หลายเท่า',
      'แนวทางของ European Atherosclerosis Society แนะนำให้ตรวจ Lp(a) เพียงครั้งเดียวในชีวิตก็เพียงพอ เพราะค่านี้แทบไม่เปลี่ยนแปลงตามพฤติกรรมการใช้ชีวิต',
      'ApoB นับ "จำนวน" อนุภาคไขมันตัวร้ายที่หมุนอยู่ในกระแสเลือดทั้งหมด งานวิจัยขนาดใหญ่ใน UK Biobank พบว่าเมื่อ ApoB กับ LDL ให้ผลไม่ตรงกัน ApoB คือตัวที่ทำนายความเสี่ยงโรคหัวใจได้แม่นยำกว่า',
      'คนที่มีประวัติครอบครัวเป็นโรคหัวใจก่อนวัยอันควร หรือมีอาการหลอดเลือดตีบทั้งที่ LDL ปกติ ควรปรึกษาแพทย์เพื่อพิจารณาตรวจ Lp(a) และ ApoB เพิ่มเติม',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-lpa-treatable',
        question: 'Lp(a) สูง รักษาให้หายได้ไหม?',
        shortAnswer:
          'ปัจจุบันยังไม่มียาที่ลดค่า Lp(a) โดยตรงที่ใช้แพร่หลายในทางคลินิก เพราะเป็นค่าที่ควบคุมโดยพันธุกรรมเป็นหลัก การดูแลที่ทำได้คือควบคุมปัจจัยเสี่ยงอื่นที่ปรับได้ (LDL, ความดัน, น้ำตาล, การสูบบุหรี่) ให้เข้มงวดกว่าค่าเฉลี่ยทั่วไป ควรปรึกษาแพทย์เพื่อวางแผนดูแลที่เหมาะกับตัวเอง',
      },
      {
        _type: 'faqItem',
        _key: 'faq-test-both-together',
        question: 'ต้องตรวจทั้ง Lp(a) และ ApoB พร้อมกันไหม?',
        shortAnswer:
          'ไม่จำเป็นต้องตรวจพร้อมกันเสมอไป ทั้งสองตัวให้ข้อมูลคนละมุม — Lp(a) บอกความเสี่ยงทางพันธุกรรมที่คงที่ตลอดชีวิต ส่วน ApoB บอกจำนวนอนุภาคไขมันในช่วงเวลานั้น ควรปรึกษาแพทย์ว่าจำเป็นต้องตรวจตัวไหนตามประวัติและความเสี่ยงส่วนบุคคล',
      },
      {
        _type: 'faqItem',
        _key: 'faq-hereditary-children',
        question: 'ลูกจะมีความเสี่ยง Lp(a) สูงเหมือนพ่อแม่ไหม?',
        shortAnswer:
          'เนื่องจาก Lp(a) ถูกกำหนดโดยพันธุกรรมเป็นหลัก หากพ่อหรือแม่มีค่า Lp(a) สูง บุตรก็มีโอกาสได้รับการถ่ายทอดทางพันธุกรรมนี้เช่นกัน ครอบครัวที่ทราบว่ามีคนในบ้านมี Lp(a) สูง จึงควรแจ้งสมาชิกครอบครัวคนอื่นให้พิจารณาตรวจด้วย',
      },
      {
        _type: 'faqItem',
        _key: 'faq-cost-pain',
        question: 'ตรวจ Lp(a) และ ApoB มีค่าใช้จ่ายสูงไหม เจ็บไหม?',
        shortAnswer:
          'ทั้งสองรายการเป็นการตรวจเลือดแบบมาตรฐาน เจาะเลือดครั้งเดียวเหมือนตรวจไขมันทั่วไป ไม่ต้องงดน้ำงดอาหารเป็นพิเศษสำหรับ Lp(a) ค่าใช้จ่ายแตกต่างกันไปตามสถานพยาบาล ควรสอบถามรายละเอียดโดยตรงก่อนเข้ารับการตรวจ',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Lipoprotein(a) in Atherosclerotic Diseases: From Pathophysiology to Diagnosis and Treatment',
        source: 'PMC',
        year: 2023,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9918959',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title:
          'Lipoprotein(a) in atherosclerotic cardiovascular disease and aortic stenosis: a European Atherosclerosis Society consensus statement',
        source: 'European Heart Journal',
        year: 2022,
        url: 'https://www.atherosclerosis-journal.com/article/S0021-9150(23)00182-X/fulltext',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Apolipoprotein B outperforms low density lipoprotein particle number as a marker of cardiovascular risk in the UK Biobank',
        source: 'PubMed',
        year: 2025,
        url: 'https://pubmed.ncbi.nlm.nih.gov/40887080/',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Lp(a) คืออะไร? ไขมันพันธุกรรม ตรวจครั้งเดียวรู้ความเสี่ยงโรคหัวใจทั้งชีวิต [What is Lp(a)? Genetic Fat, One-Time Test for Lifetime Heart Risk]',
        source: 'วิชัยเวช อินเตอร์เนชั่นแนล หนองแขม',
        year: 2024,
        url: 'https://vichaivej-nongkhaem.com/health-info/lipoprotein-a-heart-risk-test',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'ทำความรู้จัก ApoB สำคัญกว่า LDL อย่างไร [Understanding ApoB: Why It Matters More Than LDL]',
        source: 'วิชัยเวช อินเตอร์เนชั่นแนล หนองแขม',
        year: 2024,
        url: 'https://vichaivej-nongkhaem.com/health-info/apob-vs-ldl',
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
      seoTitle: 'LDL ปกติ แต่เสี่ยงหลอดเลือดหัวใจตีบ ทำไม? | Thrive',
      seoDescription:
        'LDL ปกติแต่ยังเสี่ยงหลอดเลือดหัวใจตีบได้ เพราะ Lp(a) สูงจากพันธุกรรม หรือ ApoB สูงที่นับจำนวนอนุภาคไขมันแม่นกว่า LDL รู้จักตัวชี้วัดที่ LDL มองข้าม',
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
