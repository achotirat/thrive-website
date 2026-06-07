#!/usr/bin/env node
/**
 * One-off Sanity import for the ไขมันพอกตับ (NAFLD) blog post.
 *
 * Run from the repo root:
 *   SANITY_API_TOKEN=<write-token> node astro/scripts/import-nafld-blog.mjs
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

function stripHeadingIds(text) {
  // Remove Pandoc-style custom heading IDs: ## Title {#my-id}
  return text.replace(/\s*\{#[^}]+\}/g, '')
}

async function buildBodyHtml(raw, imageUrlMap) {
  let text = stripHeadingIds(stripHtmlComments(raw))

  // Body starts at the intro paragraph (after H1, metadata, separator, and featured image)
  const introMarker = 'ไขมันพอกตับไม่ใช่โรคของคนดื่มเหล้าเท่านั้น'
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
    // Everything after ## References (comments already stripped, so safe to take to end)
    const refsMd = text.slice(refsStart).trim()
    bodySection = bodySection.trimEnd() + '\n\n---\n\n' + refsMd
  }

  // Replace local image filenames with Sanity CDN URLs
  for (const [filename, url] of Object.entries(imageUrlMap)) {
    bodySection = bodySection.replaceAll(filename, url)
  }

  // Collapse 3+ consecutive blank lines (remark artefact from stripped comments)
  bodySection = bodySection.replace(/\n{4,}/g, '\n\n\n')

  return mdToHtml(bodySection)
}

async function findCheckupService() {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == "check-up"][0]{ _id, title }`
  )
  if (result) {
    console.log(`  ✓ Found check-up service: ${result._id} (${result.title})`)
  } else {
    console.log('  ⚠ check-up service not found in Sanity — ctaService will be skipped')
  }
  return result
}

async function main() {
  // 1. Upload images
  console.log('\n── Uploading images ──')
  const [hero, diagram1, infographic, progression] = await Promise.all([
    uploadImage(
      'non-alcoholic-fatty-liver-hero.webp',
      'ไขมันพอกตับ — คนไทยนั่งที่ร้านกาแฟกรุงเทพฯ มองโทรศัพท์อย่างใคร่ครวญ มีชาเย็นและข้าววางอยู่ข้างหน้า',
    ),
    uploadImage(
      'fatty-liver-vs-normal-liver-diagram.webp',
      'แผนภาพเปรียบเทียบเซลล์ตับปกติกับเซลล์ตับที่มีไขมันสะสม',
    ),
    uploadImage(
      'nafld-non-alcohol-causes-infographic.webp',
      'อินโฟกราฟิกแสดง 4 สาเหตุหลักของ NAFLD ที่ไม่ใช่แอลกอฮอล์',
    ),
    uploadImage(
      'nafld-to-liver-cancer-progression-diagram.webp',
      'แผนภาพแสดงเส้นทางการลุกลาม จากตับปกติถึงมะเร็งตับ',
    ),
  ])

  // 2. Look up check-up service for ctaService field
  console.log('\n── Looking up CTA service ──')
  const checkupService = await findCheckupService()

  // 3. Convert markdown body to HTML
  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'non-alcoholic-fatty-liver-real-causes.md'), 'utf8')
  const imageUrlMap = {
    'non-alcoholic-fatty-liver-hero.webp': hero.asset.url,
    'fatty-liver-vs-normal-liver-diagram.webp': diagram1.asset.url,
    'nafld-non-alcohol-causes-infographic.webp': infographic.asset.url,
    'nafld-to-liver-cancer-progression-diagram.webp': progression.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  // 4. Build and create the Sanity document
  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-nafld-fatty-liver',
    title: 'ไขมันพอกตับ — ที่มาไม่ใช่แค่เหล้า และทำไมมันลุกลามเป็นมะเร็งตับได้',
    slug: { _type: 'slug', current: 'non-alcoholic-fatty-liver-real-causes' },
    category: 'ระบบย่อยอาหาร',
    excerpt:
      'ไขมันพอกตับเกิดจากน้ำตาล ไขมันทรานส์ และภาวะดื้ออินซูลิน ไม่ใช่แค่แอลกอฮอล์ เรียนรู้เส้นทางลุกลาม และวิธีตรวจก่อนสาย',
    publishedAt: '2026-06-07T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(checkupService && {
      ctaService: { _type: 'reference', _ref: checkupService._id },
    }),
    keyTakeaways: [
      'ไขมันพอกตับไม่ได้เกิดจากแอลกอฮอล์เพียงอย่างเดียว — น้ำตาล ข้าวขาว และภาวะดื้ออินซูลินคือต้นเหตุหลัก',
      'ในกลุ่มคนไทยที่เข้าตรวจสุขภาพ เกือบ 45% มีภาวะไขมันในตับ',
      'ไขมันพอกตับที่ไม่ได้รับการดูแลสามารถลุกลามเป็นตับอักเสบ ตับแข็ง และมะเร็งตับได้ใน 10–15 ปี',
      'ระยะแรกแทบไม่มีอาการ — การตรวจเลือดประจำปีคือวิธีเดียวที่รู้ก่อนสาย',
      'หยุดการลุกลามได้ด้วยการปรับอาหาร ออกกำลังกาย และดูแลสุขภาพลำไส้',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-nafld-no-alcohol',
        question: 'ไม่ดื่มเหล้าและไม่อ้วนเลย ยังเป็นไขมันพอกตับได้ไหม?',
        shortAnswer:
          'ได้ค่ะ/ครับ งานวิจัยในประชากรไทยพบว่าแม้น้ำหนักปกติ (BMI < 23) ก็สามารถมีไขมันพอกตับได้ เรียกว่า lean NAFLD ต้นเหตุมักเป็นการกินน้ำตาลและแป้งขัดสีสูง ภาวะดื้ออินซูลิน หรือความผิดปกติของจุลินทรีย์ในลำไส้',
      },
      {
        _type: 'faqItem',
        _key: 'faq-nafld-curable',
        question: 'ไขมันพอกตับรักษาหายได้ไหม?',
        shortAnswer:
          'ในระยะแรก ไขมันพอกตับสามารถลดลงและกลับสู่ปกติได้ด้วยการปรับพฤติกรรม การลดน้ำหนัก 5–10% มีหลักฐานว่าช่วยลดไขมันในตับได้อย่างมีนัยสำคัญ ควรปรึกษาแพทย์เพื่อประเมินระยะและวางแผนที่เหมาะสม',
      },
      {
        _type: 'faqItem',
        _key: 'faq-nafld-normal-liver-enzymes',
        question: 'ค่าตับปกติ แปลว่าไม่เป็นไขมันพอกตับใช่ไหม?',
        shortAnswer:
          'ไม่เสมอไป ในระยะแรก ค่า ALT และ AST อาจอยู่ในเกณฑ์ปกติได้ แม้ตับจะสะสมไขมันอยู่ การตรวจอัลตราซาวด์ร่วมกับ fasting insulin และ lipid panel ให้ภาพที่ครบกว่า',
      },
      {
        _type: 'faqItem',
        _key: 'faq-nafld-check-frequency',
        question: 'ควรตรวจบ่อยแค่ไหน?',
        shortAnswer:
          'สำหรับกลุ่มเสี่ยง (น้ำหนักเกิน เบาหวาน ไขมันในเลือดสูง) แนะนำตรวจค่าตับและมาร์กเกอร์เมตาบอลิซึมปีละครั้ง สำหรับผู้ที่ได้รับการวินิจฉัยแล้ว ความถี่ขึ้นอยู่กับระยะโรคและคำแนะนำของแพทย์',
      },
      {
        _type: 'faqItem',
        _key: 'faq-nafld-medication',
        question: 'ปัจจุบันมียารักษาไขมันพอกตับไหม?',
        shortAnswer:
          'ยังไม่มียาที่ได้รับการรับรองสำหรับ NAFLD/NASH โดยเฉพาะ ณ ปี 2026 การปรับพฤติกรรมยังคงเป็นแนวทางหลักที่มีหลักฐานรองรับมากที่สุด ปรึกษาแพทย์ก่อนรับประทานอาหารเสริมที่โฆษณาว่าบำรุงตับ',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title:
          'The prevalence and incidence of NAFLD worldwide: a systematic review and meta-analysis',
        source: 'The Lancet Gastroenterology & Hepatology',
        year: 2022,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10026948/',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title:
          'Metabolic dysfunction-associated fatty liver disease (MAFLD) in the adult population attending a health check-up program in Thailand: prevalence and fibrosis status',
        source: 'Scientific Reports',
        year: 2025,
        url: 'https://www.nature.com/articles/s41598-025-06874-1',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Added Fructose in Non-Alcoholic Fatty Liver Disease and in Metabolic Syndrome: A Narrative Review',
        source: 'Nutrients',
        year: 2022,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8950441/',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title:
          'Risks and clinical predictors of cirrhosis and hepatocellular carcinoma diagnoses in adults with diagnosed NAFLD: real-world study of 18 million patients in four European cohorts',
        source: 'BMC Medicine',
        year: 2019,
        url: 'https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-019-1321-x',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title:
          'Gut–Liver Axis and Non-Alcoholic Fatty Liver Disease: A Vicious Circle of Dysfunctions Orchestrated by the Gut Microbiome',
        source: 'Biology',
        year: 2022,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9687983/',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Gender differences in the prevalence of nonalcoholic fatty liver disease in the Northeast of Thailand',
        source: 'Asian Pacific Journal of Cancer Prevention',
        year: 2017,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5645706/',
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
      seoTitle: 'ไขมันพอกตับ ที่มาไม่ใช่แค่เหล้า — เส้นทางสู่มะเร็งตับ',
      seoDescription:
        'ไขมันพอกตับเกิดจากน้ำตาล ไขมันทรานส์ และภาวะดื้ออินซูลิน ไม่ใช่แค่แอลกอฮอล์ เรียนรู้เส้นทางลุกลาม และวิธีตรวจก่อนสาย',
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
