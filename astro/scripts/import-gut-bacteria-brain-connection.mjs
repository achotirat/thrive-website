#!/usr/bin/env node
/**
 * One-off Sanity import for the แบคทีเรียในลำไส้ส่งผลต่อสมองอย่างไร blog post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-gut-bacteria-brain-connection.mjs
 *
 * Token is loaded automatically from .env.local (SANITY_API_TOKEN).
 * Token needs: Editor role (or Documents Write + Assets Write).
 * Get one at: https://www.sanity.io/manage/project/fc8ot1td/api → Tokens → Add API token
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

async function buildBodyHtml(raw, imageUrlMap) {
  let text = stripHeadingIds(stripHtmlComments(raw))

  // Body starts at the intro paragraph
  const introMarker = 'แบคทีเรียในลำไส้ส่งผลต่อสมองผ่านระบบสื่อสารสองทิศทาง'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Could not find intro paragraph marker')
  let bodySection = text.slice(introIdx)

  // Stop before the FAQ section (rendered separately by Sanity/template)
  const faqMarker = '## FAQ'
  const faqIdx = bodySection.indexOf(faqMarker)
  if (faqIdx !== -1) bodySection = bodySection.slice(0, faqIdx)

  // Append the References section
  const refsMarker = '## References'
  const refsStart = text.indexOf(refsMarker)
  if (refsStart !== -1) {
    const refsMd = text.slice(refsStart).trim()
    bodySection = bodySection.trimEnd() + '\n\n---\n\n' + refsMd
  }

  // Replace local image filenames with Sanity CDN URLs
  for (const [filename, url] of Object.entries(imageUrlMap)) {
    bodySection = bodySection.replaceAll(filename, url)
  }

  // Collapse excessive blank lines
  bodySection = bodySection.replace(/\n{4,}/g, '\n\n\n')

  return mdToHtml(bodySection)
}

async function findUrineOrganicService() {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == "urine-organic-test"][0]{ _id, title }`
  )
  if (result) {
    console.log(`  ✓ Found urine-organic-test service: ${result._id} (${result.title})`)
  } else {
    console.log('  ⚠ urine-organic-test service not found — ctaService will be skipped')
  }
  return result
}

async function main() {
  // 1. Upload images
  console.log('\n── Uploading images ──')
  const [hero, diagram1, infographic, flowchart] = await Promise.all([
    uploadImage(
      'gut-bacteria-brain-connection-hero.webp',
      'หญิงไทยวัยสามสิบปลายนั่งในคาเฟ่กรุงเทพฯ ตอนเช้า ถือแก้วชาอย่างใคร่ครวญ — สะท้อนความเชื่อมโยงระหว่างสุขภาพลำไส้และสุขภาพสมอง',
    ),
    uploadImage(
      'gut-bacteria-brain-connection-diagram-1.webp',
      'แผนผังแสดงระบบประสาทในลำไส้เชื่อมต่อกับสมองผ่านเส้นประสาทวากัส โดยสัญญาณ 80% วิ่งขึ้นจากลำไส้สู่สมอง',
    ),
    uploadImage(
      'gut-bacteria-brain-connection-infographic.webp',
      'อินโฟกราฟิกแสดง 3 ชนิดของกรดไขมันสายสั้น (SCFA) — Butyrate, Propionate, Acetate — และบทบาทต่อสมอง',
    ),
    uploadImage(
      'gut-bacteria-brain-connection-flowchart.webp',
      'ผังแสดงห่วงโซ่จากจุลินทรีย์ไม่สมดุล → SCFA ลดลง → ลำไส้รั่ว → การอักเสบ → สมองอักเสบและอารมณ์แปรปรวน',
    ),
  ])

  // 2. Look up urine-organic-test service for ctaService
  console.log('\n── Looking up CTA service ──')
  const urineOrganicService = await findUrineOrganicService()

  // 3. Convert markdown body to HTML
  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'gut-bacteria-brain-connection.md'), 'utf8')
  const imageUrlMap = {
    'gut-bacteria-brain-connection-hero.webp': hero.asset.url,
    'gut-bacteria-brain-connection-diagram-1.webp': diagram1.asset.url,
    'gut-bacteria-brain-connection-infographic.webp': infographic.asset.url,
    'gut-bacteria-brain-connection-flowchart.webp': flowchart.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  // 4. Build and create the Sanity document
  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-gut-bacteria-brain-connection',
    title: "แบคทีเรียในลำไส้ส่งผลต่อสมองอย่างไร? ความลับของ 'สมองที่สอง'",
    slug: { _type: 'slug', current: 'gut-bacteria-brain-connection' },
    category: 'สุขภาพลำไส้',
    excerpt:
      'แบคทีเรียในลำไส้ส่งผลต่อสมองและอารมณ์อย่างไร? เข้าใจกลไก SCFA และ gut-brain axis เบื้องหลัง "สมองที่สอง" พร้อมวิธีตรวจสมดุลลำไส้ที่ Thrive Bangkok',
    publishedAt: '2026-06-08T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(urineOrganicService && {
      ctaService: { _type: 'reference', _ref: urineOrganicService._id },
    }),
    keyTakeaways: [
      'แบคทีเรียในลำไส้ส่งผลต่อสมองผ่าน 4 เส้นทางพร้อมกัน — และสัญญาณกว่า 80% วิ่งจากลำไส้ขึ้นสู่สมอง ไม่ใช่ลงมา',
      'กรดไขมันสายสั้น (SCFA) คือสารเคมีที่แบคทีเรียดีผลิตจากการย่อยใยอาหาร — มันสามารถข้ามเข้าสมองได้โดยตรง',
      'กว่า 90% ของเซโรโทนิน (สารแห่งความสุข) ถูกผลิตในลำไส้ ไม่ใช่ในสมอง',
      'งานวิจัยในผู้ป่วยไทยที่มีภาวะซึมเศร้าพบระดับแบคทีเรียผู้ผลิต SCFA ต่ำกว่าคนปกติอย่างมีนัยสำคัญ',
      'การตรวจ Organic Acids Test (OAT) วัดได้ว่าลำไส้กำลังส่งสารอะไรไปยังสมองของคุณบ้าง',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-scfa-food',
        question: 'ถ้าอยากเพิ่ม SCFA ต้องทานอะไร?',
        shortAnswer:
          'อาหารที่ช่วยเพิ่มการผลิต SCFA คืออาหารที่มีใยอาหาร (Prebiotic Fiber) สูง เช่น กล้วยดิบ ข้าวโอ๊ต กระเทียม หัวหอม และผักตระกูลถั่ว แบคทีเรียดีในลำไส้จะย่อยใยอาหารเหล่านี้และผลิต SCFA ออกมา หากลำไส้เสียสมดุลอย่างมีนัยสำคัญ การตรวจ OAT ก่อนช่วยให้รู้ว่าต้องเสริมตรงจุดไหน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-probiotic-general',
        question: 'โพรไบโอติกที่ขายทั่วไปช่วยได้ไหม?',
        shortAnswer:
          'โพรไบโอติกทั่วไปอาจช่วยได้ในระดับหนึ่ง แต่สายพันธุ์แบคทีเรียที่คุณต้องการขึ้นอยู่กับโปรไฟล์จุลินทรีย์เฉพาะของคุณ การตรวจ OAT ก่อนช่วยให้แพทย์เลือกสายพันธุ์ที่ตรงจุดได้ ปรึกษาแพทย์ก่อนเริ่มโพรไบโอติกในปริมาณสูงเสมอ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-gut-brain-depression',
        question: 'Gut-Brain Axis เกี่ยวข้องกับโรคซึมเศร้าจริงไหม หรือแค่ทฤษฎี?',
        shortAnswer:
          'มีงานวิจัยระดับ peer-reviewed หลายสิบชิ้นยืนยันความเชื่อมโยง แต่แนวทาง Gut-Brain เป็นส่วนเสริมของการดูแลสุขภาพแบบองค์รวม ไม่ใช่การทดแทนยาหรือการรักษาทางจิตเวช ปรึกษาแพทย์ก่อนปรับแผนการรักษาเสมอ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-oat-process',
        question: 'การตรวจ OAT ที่ Thrive ทำอย่างไร และใช้เวลานานไหม?',
        shortAnswer:
          'OAT เป็นการเก็บตัวอย่างปัสสาวะช่วงเช้าก่อนทานอาหารที่บ้าน ส่งมาที่ Thrive Wellness Center Bangkok ผลตรวจใช้เวลาประมาณ 2–3 สัปดาห์ จากนั้นแพทย์จะนัดอ่านผลและออกแบบแผนการดูแลเฉพาะบุคคล สอบถามได้ที่ LINE @thrivewellnessth หรือโทร 095-934-9640',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Short chain fatty acids: the messengers from down below',
        source: 'Frontiers in Neuroscience',
        year: 2023,
        url: 'https://doi.org/10.3389/fnins.2023.1197759',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'The Role of Short-Chain Fatty Acids From Gut Microbiota in Gut-Brain Communication',
        source: 'Frontiers in Endocrinology',
        year: 2020,
        url: 'https://doi.org/10.3389/fendo.2020.00025',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Identification of human gut bacteria that produce bioactive serotonin and promote colonic innervation',
        source: 'Cell Reports',
        year: 2025,
        url: 'https://doi.org/10.1016/j.celrep.2025.01205-7',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'From gut to glee: Is butyrate a promising antidepressant? A systematic review and mechanistic insights',
        source: 'Frontiers in Psychiatry',
        year: 2025,
        url: 'https://pubmed.ncbi.nlm.nih.gov/41429215/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Understanding the Impact of the Gut Microbiome on Mental Health: A Systematic Review',
        source: 'PMC',
        year: 2025,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11865252/',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Exploration of the gut microbiome in Thai patients with major depressive disorder uncovered a specific bacterial profile with depletion of the Ruminococcus genus as a putative biomarker (preprint)',
        source: 'medRxiv',
        year: 2022,
        url: 'https://www.medrxiv.org/content/10.1101/2022.11.06.22282014',
      },
      {
        _type: 'citation',
        _key: 'ref-7',
        title: '"Intestinal Microflora" as Health Indicator',
        source: 'Chulalongkorn University Faculty of Medicine',
        year: 2022,
        url: 'https://www.chula.ac.th/en/highlight/71551/',
      },
      {
        _type: 'citation',
        _key: 'ref-8',
        title: 'Exploring the functional diversity and metabolic activities of the human gut microbiome in Thai adults in response to a prebiotic diet',
        source: 'Microbiology Spectrum',
        year: 2024,
        url: 'https://journals.asm.org/doi/10.1128/spectrum.01599-24',
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
      seoTitle: "แบคทีเรียในลำไส้ส่งผลต่อสมอง: วิทยาศาสตร์ 'สมองที่สอง'",
      seoDescription:
        "แบคทีเรียในลำไส้ส่งผลต่อสมองและอารมณ์อย่างไร? เข้าใจกลไก SCFA และ gut-brain axis เบื้องหลัง 'สมองที่สอง' พร้อมวิธีตรวจสมดุลลำไส้ที่ Thrive Bangkok",
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
