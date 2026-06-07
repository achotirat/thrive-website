#!/usr/bin/env node
/**
 * One-off Sanity import for the LDL blog post.
 *
 * Run from the repo root:
 *   SANITY_API_TOKEN=<write-token> node astro/scripts/import-ldl-blog.mjs
 *
 * Token needs: Editor role (or Documents Write + Assets Write).
 * Get one at: https://www.sanity.io/manage/project/fc8ot1td/api → Tokens → Add API token
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

async function buildBodyHtml(raw, imageUrlMap) {
  let text = stripHtmlComments(raw)

  // Body starts at the intro paragraph (after the H1, metadata, separator, and featured image)
  const introMarker = 'LDL สูงลดได้โดยไม่ต้องพึ่งยา'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Could not find intro paragraph marker')
  let bodySection = text.slice(introIdx)

  // Stop before the FAQ section (rendered separately by [slug].astro)
  const faqMarker = '## คำถามที่พบบ่อย'
  const faqIdx = bodySection.indexOf(faqMarker)
  if (faqIdx !== -1) bodySection = bodySection.slice(0, faqIdx)

  // Extract and append the References section (nice to show in article body)
  const refsMarker = '## References'
  const structuredDataMarker = '## Structured Data'
  const refsStart = text.indexOf(refsMarker)
  const refsEnd = text.indexOf(structuredDataMarker)
  if (refsStart !== -1) {
    const refsMd = text.slice(refsStart, refsEnd !== -1 ? refsEnd : undefined).trim()
    bodySection = bodySection.trimEnd() + '\n\n---\n\n' + refsMd
  }

  // Replace local image filenames with Sanity CDN URLs
  for (const [filename, url] of Object.entries(imageUrlMap)) {
    bodySection = bodySection.replaceAll(filename, url)
  }

  // Collapse 3+ consecutive blank lines into 2 (remark artefact from stripped comments)
  bodySection = bodySection.replace(/\n{4,}/g, '\n\n\n')

  return mdToHtml(bodySection)
}

async function main() {
  // 1. Upload images
  console.log('\n── Uploading images ──')
  const [featured, plaque, infographic, rootCauses] = await Promise.all([
    uploadImage('lower-ldl-naturally-featured.webp',
      'วิธีลด LDL ตามธรรมชาติ — infographic แสดงอนุภาค LDL และ HDL ในหลอดเลือด'),
    uploadImage('ldl-plaque-formation-diagram.webp',
      'ไดอะแกรมแสดงกระบวนการสะสมตะกรันในหลอดเลือดจาก LDL ที่ถูกออกซิไดซ์'),
    uploadImage('8-natural-ldl-methods-infographic.webp',
      'infographic สรุป 8 วิธีลด LDL ตามธรรมชาติพร้อมไอคอน'),
    uploadImage('ldl-root-causes-diagram.webp',
      'ไดอะแกรมแสดง 3 สาเหตุรากเหง้าที่มักถูกมองข้าม: โลหะหนัก ฮอร์โมนไทรอยด์ต่ำ และแบคทีเรียลำไส้ไม่สมดุล'),
  ])

  // 2. Convert markdown body to HTML
  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'lower-ldl-naturally.md'), 'utf8')
  const imageUrlMap = {
    'lower-ldl-naturally-featured.webp': featured.asset.url,
    'ldl-plaque-formation-diagram.webp': plaque.asset.url,
    '8-natural-ldl-methods-infographic.webp': infographic.asset.url,
    'ldl-root-causes-diagram.webp': rootCauses.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  // 3. Build and create the Sanity document
  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-lower-ldl-naturally',
    title: 'วิธีลด LDL ตามธรรมชาติ — 8 วิธีที่ได้ผล ไม่ต้องพึ่งยา',
    slug: { _type: 'slug', current: 'lower-ldl-naturally' },
    category: 'หัวใจและหลอดเลือด',
    excerpt: 'LDL สูงลดได้โดยไม่ต้องกินยา ด้วยอาหาร ออกกำลังกาย และการดูแลแบบ Functional Medicine — Thrive Wellness Clinic ลาดพร้าว',
    publishedAt: '2026-05-29T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: featured.asset._id },
      alt: featured.altText,
    },
    keyTakeaways: [
      'LDL สูงเกิดได้จากหลายสาเหตุ ไม่ใช่แค่กินอาหารมันเยิ้ม',
      'ใยอาหารละลายน้ำ ปลาทะเล การออกกำลังกาย และการลดน้ำตาล เป็นวิธีธรรมชาติที่มีงานวิจัยรองรับชัดเจน',
      'บางคนจำเป็นต้องตรวจโลหะหนัก ฮอร์โมนไทรอยด์ และสุขภาพลำไส้เพิ่มเติม ก่อน LDL จะลดลงได้จริง',
      'ค่า LDL เป้าหมายที่ "ปลอดภัย" แตกต่างกันตามระดับความเสี่ยงโรคหัวใจของแต่ละคน',
      'ปรึกษาแพทย์ก่อนปรับการรักษาหรือหยุดยาคอเลสเตอรอลทุกกรณี',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-cholesterol-no-meds',
        question: 'วิธีลดคอเลสเตอรอลโดยไม่กินยามีอะไรบ้าง?',
        shortAnswer: 'วิธีที่มีงานวิจัยรองรับได้แก่ การเพิ่มใยอาหารละลายน้ำ (ข้าวโอ๊ต ถั่วดำ เมล็ดเจีย) การออกกำลังกายแอโรบิก 150 นาทีต่อสัปดาห์ การลดน้ำตาลและแป้งขัดขาว การรับประทานปลาทะเลสัปดาห์ละ 2–3 มื้อ และการใช้น้ำมันมะกอกแทนไขมันอิ่มตัว หาก LDL ยังสูงหลังปรับวิถีชีวิตมาแล้ว 3 เดือน ควรพบแพทย์เพื่อหาสาเหตุอื่นที่ซ่อนอยู่',
      },
      {
        _type: 'faqItem',
        _key: 'faq-ldl-normal-range',
        question: 'LDL ปกติควรอยู่ที่เท่าไหร่?',
        shortAnswer: 'ตามแนวทาง RCPT 2024 เป้าหมาย LDL ขึ้นอยู่กับความเสี่ยงโรคหัวใจ: ความเสี่ยงต่ำ < 116 mg/dL, ปานกลาง < 100 mg/dL, ความเสี่ยงสูง < 70 mg/dL, และความเสี่ยงสูงมาก < 55 mg/dL',
      },
      {
        _type: 'faqItem',
        _key: 'faq-ldl-diseases',
        question: 'LDL สูงทำให้เกิดโรคอะไรได้บ้าง?',
        shortAnswer: 'LDL สูงเป็นปัจจัยเสี่ยงหลักของโรคหลอดเลือดหัวใจ โรคหลอดเลือดสมอง (stroke) และหลอดเลือดแดงส่วนปลายตีบ กระบวนการสะสมตะกรัน (atherosclerosis) เกิดได้หลายปีก่อนจะแสดงอาการ ดังนั้นการตรวจเชิงป้องกันตั้งแต่อายุ 35–40 ปีจึงสำคัญ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-best-foods-ldl',
        question: 'อาหารอะไรช่วยลด LDL ได้ดีที่สุด?',
        shortAnswer: 'กลุ่มที่มีหลักฐานสนับสนุนมากที่สุด: ข้าวโอ๊ต (beta-glucan สูง) ถั่วหลากสี อาโวคาโด น้ำมันมะกอก Extra Virgin วอลนัท และปลาทะเลน้ำลึก การปรับรูปแบบอาหารโดยรวมสำคัญกว่าการกิน superfood ชนิดเดียว',
      },
      {
        _type: 'faqItem',
        _key: 'faq-ldl-causes-beyond-diet',
        question: 'LDL สูงเกิดจากอะไร นอกจากอาหาร?',
        shortAnswer: 'นอกจากอาหาร LDL สูงยังเกิดจาก: พันธุกรรม ภาวะไทรอยด์ทำงานน้อย ความเครียดเรื้อรัง การนอนหลับน้อย โลหะหนักสะสม (ตะกั่ว แคดเมียม) และภาวะแบคทีเรียในลำไส้ไม่สมดุล สาเหตุเหล่านี้มักถูกตรวจพลาดในการดูแลสุขภาพปกติ',
      },
    ],
    references: [
      { _type: 'citation', _key: 'ref-1',
        title: 'Soluble Fiber Supplementation and Serum Lipid Profile: A Systematic Review and Dose-Response Meta-Analysis of Randomized Controlled Trials',
        source: 'Nutrients', year: 2023,
        url: 'https://pubmed.ncbi.nlm.nih.gov/36796439/' },
      { _type: 'citation', _key: 'ref-2',
        title: 'Effects of Aerobic Exercise on Blood Lipids in People with Overweight or Obesity: A Systematic Review and Meta-Analysis of Randomized Controlled Trials',
        source: 'BMC Cardiovascular Disorders', year: 2025,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11856645/' },
      { _type: 'citation', _key: 'ref-3',
        title: 'Heavy Metal Exposure and Cardiovascular Disease',
        source: 'Circulation Research', year: 2023,
        url: 'https://www.ahajournals.org/doi/10.1161/CIRCRESAHA.123.323617' },
      { _type: 'citation', _key: 'ref-4',
        title: 'HDL cholesterol: A potential mediator of the association between urinary cadmium concentration and cardiovascular disease risk',
        source: 'Environment International', year: 2020,
        url: 'https://pubmed.ncbi.nlm.nih.gov/33068977/' },
      { _type: 'citation', _key: 'ref-5',
        title: 'Effect of Gut Microbiota on Blood Cholesterol: A Review on Mechanisms',
        source: 'Nutrients', year: 2024,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10706635/' },
      { _type: 'citation', _key: 'ref-6',
        title: 'Subclinical Hypothyroidism and the Risk of Hypercholesterolemia',
        source: 'The Journal of Clinical Endocrinology & Metabolism', year: 2000,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1466694/' },
      { _type: 'citation', _key: 'ref-7',
        title: '2024 RCPT Clinical Practice Guidelines on Management of Dyslipidemia for Atherosclerotic Cardiovascular Disease Prevention',
        source: 'Journal of Clinical Lipidology', year: 2024,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11650434/' },
      { _type: 'citation', _key: 'ref-8',
        title: 'Diagnostic prediction model for screening of elevated LDL-C and non-HDL-C in young Thai adults between 20 and 40 years of age',
        source: 'PLOS ONE', year: 2025,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11784327/' },
      { _type: 'citation', _key: 'ref-9',
        title: 'Dietary interventions (plant sterols, stanols, omega-3 fatty acids, soy protein and dietary fibers) for familial hypercholesterolaemia',
        source: 'Cochrane Database of Systematic Reviews', year: 2020,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7063855/' },
    ],
    // Minimal portable text block — legacyHtml is what [slug].astro actually renders
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
      seoTitle: 'วิธีลด LDL ตามธรรมชาติ — 8 วิธีไม่ต้องพึ่งยา',
      seoDescription: 'LDL สูงลดได้โดยไม่ต้องกินยา ด้วยอาหาร ออกกำลังกาย และการดูแลแบบ Functional Medicine — Thrive Wellness Clinic ลาดพร้าว',
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
