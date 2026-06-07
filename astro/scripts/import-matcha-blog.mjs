#!/usr/bin/env node
/**
 * One-off Sanity import for the สารอาหารในมัทฉะ (Matcha Nutrients) blog post.
 *
 * Run from the repo root:
 *   SANITY_API_TOKEN=<write-token> node astro/scripts/import-matcha-blog.mjs
 *
 * Token needs: Editor role (or Documents Write + Assets Write).
 * Get one at: https://www.sanity.io/manage/project/fc8ot1td/api → Tokens → Add API token
 *
 * Images must exist in docs/blog/ before running:
 *   - matcha-nutrients-vitamins-hero.webp
 *   - matcha-nutrients-diagram-1.webp
 *   - matcha-nutrients-infographic.webp
 *   - matcha-absorption-flowchart.webp
 */

import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'
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
  console.error('Error: SANITY_API_TOKEN environment variable is required.')
  console.error('Get a write token at: https://www.sanity.io/manage/project/fc8ot1td/api')
  process.exit(1)
}

const client = createClient({
  projectId: 'fc8ot1td',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function uploadImage(filename, altText) {
  console.log(`Uploading ${filename}...`)
  const asset = await client.assets.upload('image', createReadStream(join(BLOG_DIR, filename)), {
    filename,
    contentType: 'image/webp',
  })
  console.log(`  ✓ ${asset._id}  ${asset.url}`)
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

function stripFrontmatter(text) {
  return text.replace(/^---[\s\S]*?---\n/, '')
}

async function buildBodyHtml(raw, imageUrlMap) {
  let text = stripFrontmatter(stripHeadingIds(stripHtmlComments(raw)))

  // Body starts at the intro paragraph (after H1, metadata, TOC, CTA, separator)
  const introMarker = 'มัทฉะมีสารอาหารหลายชนิด'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Could not find intro paragraph marker')
  let bodySection = text.slice(introIdx)

  // Stop before the FAQ section (rendered separately by [slug].astro)
  const faqMarker = '## คำถามที่พบบ่อย'
  const faqIdx = bodySection.indexOf(faqMarker)
  if (faqIdx !== -1) bodySection = bodySection.slice(0, faqIdx)

  // Extract and append the References section
  const refsMarker = '## References'
  const refsStart = text.indexOf(refsMarker)
  if (refsStart !== -1) {
    const refsMd = text.slice(refsStart, text.indexOf('## Image Prompts')).trim()
    bodySection = bodySection.trimEnd() + '\n\n---\n\n' + refsMd
  }

  // Replace local image filenames with Sanity CDN URLs
  for (const [filename, url] of Object.entries(imageUrlMap)) {
    bodySection = bodySection.replaceAll(filename, url)
  }

  bodySection = bodySection.replace(/\n{4,}/g, '\n\n\n')

  return mdToHtml(bodySection)
}

async function findOligoScanService() {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == "oligoscan"][0]{ _id, title }`
  )
  if (result) {
    console.log(`  ✓ Found oligoscan service: ${result._id} (${result.title})`)
  } else {
    console.log('  ⚠ oligoscan service not found in Sanity — ctaService will be skipped')
  }
  return result
}

async function main() {
  // 1. Upload images
  console.log('\n── Uploading images ──')
  const [hero, diagram1, infographic, flowchart] = await Promise.all([
    uploadImage(
      'matcha-nutrients-vitamins-hero.webp',
      'หญิงไทยวัย 30 ปีนั่งในร้านกาแฟกรุงเทพฯ ยามเช้า ถือชามมัทฉะสีเขียวสด มองด้วยสายตาใคร่ครวญและอบอุ่น',
    ),
    uploadImage(
      'matcha-nutrients-diagram-1.webp',
      'แผนภาพเปรียบเทียบการดูดซึมสารอาหาร: มัทฉะ (100% จากใบทั้งใบ) vs ชาเขียวทั่วไป (20–30% ที่ละลายน้ำ)',
    ),
    uploadImage(
      'matcha-nutrients-infographic.webp',
      'อินโฟกราฟิกแสดงสารอาหาร 7 ชนิดในมัทฉะ 1 กรัม ได้แก่ วิตามิน K A C แคลเซียม แมกนีเซียม โพแทสเซียม และ EGCG',
    ),
    uploadImage(
      'matcha-absorption-flowchart.webp',
      'แผนภาพแสดงปัจจัยที่กระทบการดูดซึมสารอาหารจากมัทฉะ: วิธีดื่ม สุขภาพลำไส้ และเกรดมัทฉะ',
    ),
  ])

  // 2. Look up OligoScan service for ctaService field
  console.log('\n── Looking up CTA service ──')
  const oligoscanService = await findOligoScanService()

  // 3. Convert markdown body to HTML
  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'matcha-nutrients-vitamins.md'), 'utf8')
  const imageUrlMap = {
    'matcha-nutrients-vitamins-hero.webp': hero.asset.url,
    'matcha-nutrients-diagram-1.webp': diagram1.asset.url,
    'matcha-nutrients-infographic.webp': infographic.asset.url,
    'matcha-absorption-flowchart.webp': flowchart.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  // 4. Build and create the Sanity document
  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-matcha-nutrients-vitamins',
    title: 'สารอาหารในมัทฉะมีอะไรบ้าง และร่างกายได้รับจริงแค่ไหน?',
    slug: { _type: 'slug', current: 'matcha-nutrients-vitamins' },
    category: 'โภชนาการ',
    excerpt:
      'มัทฉะอุดมวิตามิน A C K แคลเซียม และ EGCG แต่ร่างกายดูดซึมได้จริงแค่ไหน? ไขข้อสงสัยพร้อมวิธีตรวจระดับวิตามินจริงที่ Thrive Bangkok',
    publishedAt: '2026-06-07T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(oligoscanService && {
      ctaService: { _type: 'reference', _ref: oligoscanService._id },
    }),
    keyTakeaways: [
      'มัทฉะให้ EGCG สารต้านอนุมูลอิสระสูงกว่าชาเขียวทั่วไปถึง 137 เท่า เนื่องจากดื่มใบชาทั้งใบในรูปแบบผง',
      'วิตามิน K โดดเด่นที่สุด — 58 µg ต่อกรัม รวมถึงวิตามิน A, C และแร่ธาตุสำคัญ',
      'การดื่มมัทฉะกับนมลดการดูดซึม EGCG อย่างมีนัยสำคัญ เพราะ casein จับกับ catechin',
      '1–2 แก้วต่อวันเหมาะสมสำหรับคนส่วนใหญ่ — ผู้รับประทาน warfarin ควรปรึกษาแพทย์ก่อน',
      'มัทฉะเสริมสารอาหารได้ดี แต่การตรวจ OligoScan เป็นวิธีเดียวที่รู้ระดับวิตามินจริงในร่างกาย',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-matcha-nutrients',
        question: 'มัทฉะมีสารอาหารอะไรบ้าง?',
        shortAnswer:
          'มัทฉะ 1 กรัมให้วิตามิน K (58 µg), วิตามิน A (beta-carotene ~580 µg), วิตามิน C (~1 mg), แคลเซียม (4.2 mg), แมกนีเซียม (2.3 mg), โพแทสเซียม (27 mg) และ EGCG ในปริมาณสูง นอกจากนี้ยังมี L-Theanine ประมาณ 36 mg ต่อแก้ว',
      },
      {
        _type: 'faqItem',
        _key: 'faq-matcha-daily',
        question: 'ดื่มมัทฉะทุกวันได้ไหม ดื่มวันละกี่แก้ว?',
        shortAnswer:
          'ได้ — 1–2 แก้วต่อวันเหมาะสมและปลอดภัยสำหรับผู้ใหญ่สุขภาพดีส่วนใหญ่ ไม่ควรดื่มเกิน 5 แก้วต่อวัน ควรปรึกษาแพทย์หากมีโรคประจำตัว กำลังตั้งครรภ์ หรือรับประทานยาที่อาจมีปฏิกิริยากับวิตามิน K หรือคาเฟอีน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-matcha-vs-green-tea',
        question: 'มัทฉะกับชาเขียวต่างกันอย่างไร?',
        shortAnswer:
          'ทั้งคู่มาจากต้นชา Camellia sinensis ชนิดเดียวกัน แต่มัทฉะบดใบชาทั้งใบเป็นผงและดื่มทั้งผง ทำให้ได้สารอาหาร 100% ของใบชา ขณะที่ชาเขียวทั่วไปชงแล้วกรองทิ้ง ได้เฉพาะสารที่ละลายน้ำออกมา',
      },
      {
        _type: 'faqItem',
        _key: 'faq-egcg',
        question: 'EGCG คืออะไร และมีประโยชน์อย่างไร?',
        shortAnswer:
          'EGCG (Epigallocatechin Gallate) คือสารต้านอนุมูลอิสระหลักในมัทฉะ งานวิจัยพบว่ามีคุณสมบัติต้านการอักเสบ และอาจช่วยลดความเสี่ยงโรคหัวใจและโรคเบาหวานชนิดที่ 2 หลักฐานในมนุษย์ส่วนใหญ่มาจากการศึกษาระยะสั้น ยังต้องการงานวิจัยระยะยาวเพิ่มเติม',
      },
      {
        _type: 'faqItem',
        _key: 'faq-absorption',
        question: 'ร่างกายดูดซึมวิตามินจากมัทฉะได้มากแค่ไหน?',
        shortAnswer:
          'ขึ้นอยู่กับหลายปัจจัย การดื่มกับนมลดการดูดซึม EGCG อย่างมีนัยสำคัญเพราะ casein จับกับ catechin สุขภาพลำไส้ก็มีผลสำคัญ การตรวจระดับสารอาหารโดยตรงด้วย OligoScan เป็นวิธีเดียวที่รู้ได้แน่ชัด',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Epigallocatechin-Gallate (EGCG): An Essential Molecule for Human Health and Well-Being',
        source: 'International Journal of Molecular Sciences',
        year: 2025,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12470402/',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Health Benefits and Chemical Composition of Matcha Green Tea: A Review',
        source: 'Molecules',
        year: 2021,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7796401/',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Antioxidant Properties and Nutritional Composition of Matcha Green Tea',
        source: 'Foods',
        year: 2020,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7231151/',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Matcha Green Tea: Chemical Composition, Phenolic Acids, Caffeine and Fatty Acid Profile',
        source: 'Nutrients',
        year: 2024,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11049459/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Effects of L-Theanine Administration on Stress-Related Symptoms and Cognitive Functions in Healthy Adults: A Randomized Controlled Trial',
        source: 'Nutrients',
        year: 2019,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6836118/',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'The Cognitive-Enhancing Outcomes of Caffeine and L-theanine: A Systematic Review',
        source: 'PMC',
        year: 2022,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8794723/',
      },
      {
        _type: 'citation',
        _key: 'ref-7',
        title: 'Catechin Bioavailability Following Consumption of a Green Tea Extract Confection Is Reduced in Obese Persons',
        source: 'PMC',
        year: 2022,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9774199/',
      },
      {
        _type: 'citation',
        _key: 'ref-8',
        title: 'The Comparison of Epigallocatechin Gallate Levels in Matcha Powders in the Thai Market',
        source: 'Mae Fah Luang University Postgraduate Research',
        year: 2025,
        url: 'https://postgrads.mfu.ac.th/wp-content/uploads/2025/07/6652003252.pdf',
      },
      {
        _type: 'citation',
        _key: 'ref-9',
        title: 'l-theanine: From tea leaf to trending supplement – does the science match the hype?',
        source: 'PMC',
        year: 2025,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12892352/',
      },
      {
        _type: 'citation',
        _key: 'ref-10',
        title: 'ชาเขียวไม่ใช่มัทฉะ: ความต่างที่คุณควรรู้ [Green Tea is Not Matcha: Differences You Should Know]',
        source: 'สถาบันการจัดการความรู้ด้านสุขภาพ กรมสุขภาพจิต (HRDI)',
        year: 2023,
        url: 'https://hkm.hrdi.or.th/Knowledge/detail/722',
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
      seoTitle: 'สารอาหารในมัทฉะมีอะไรบ้าง วิตามิน EGCG และการดูดซึมจริง',
      seoDescription:
        'มัทฉะอุดมวิตามิน A C K แคลเซียม และ EGCG แต่ร่างกายดูดซึมได้จริงแค่ไหน? ไขข้อสงสัยพร้อมวิธีตรวจระดับวิตามินจริงที่ Thrive Bangkok',
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
