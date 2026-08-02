#!/usr/bin/env node
/**
 * One-off Sanity import for the ผมร่วงจากฮอร์โมน blog post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-hairloss.mjs
 *
 * Token is loaded automatically from .env.local (SANITY_API_TOKEN).
 * Images are found in Sanity by filename; if not found, they are uploaded
 * from docs/blog/. This post has only 1 image (hero) — no inline images.
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

  // Body starts at intro paragraph
  const introMarker = 'ผมร่วงจากฮอร์โมนตรวจได้ด้วยการเจาะเลือด'
  const introIdx = text.indexOf(introMarker)
  if (introIdx === -1) throw new Error('Could not find intro paragraph marker')
  let bodySection = text.slice(introIdx)

  // Cut out the "## FAQ" section (raw Q&A text + the markdown bottom-CTA
  // block that follows it): [slug].astro already renders FAQ from the
  // `faq` array as an accordion, and the bottom CTA from `ctaService` via
  // <BlogCTA position="bottom">. Leaving this markdown section in
  // legacyHtml causes the FAQ to render a second time as plain paragraphs
  // right before the accordion (confirmed reproduced on the already-published
  // female-hormone-panel-age-40 post too — a bug in the shared import
  // script template, not specific to this post).
  const faqMarker = '## FAQ'
  const referencesMarker = '## References'
  const faqIdx = bodySection.indexOf(faqMarker)
  const referencesIdx = bodySection.indexOf(referencesMarker)
  if (faqIdx !== -1 && referencesIdx !== -1 && faqIdx < referencesIdx) {
    bodySection = bodySection.slice(0, faqIdx) + bodySection.slice(referencesIdx)
  }

  // Stop before Image Prompts section (end of real content)
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
  // 1. Resolve hero image (find existing or upload)
  console.log('\n── Resolving images ──')
  const hero = await getOrUploadImage(
    'hairloss-hero.webp',
    'หญิงเอเชียยิ้มมั่นใจ ถือปลายผมยาวสลวยเป็นประกาย สื่อถึงผลลัพธ์เส้นผมแข็งแรงหลังจากดูแลฮอร์โมนให้สมดุล',
  )

  // 2. Look up hormones-quiz service for ctaService
  console.log('\n── Looking up CTA service ──')
  const hormonesQuizService = await findService('hormones-quiz')

  // 3. Convert markdown body to HTML
  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'hairloss.md'), 'utf8')
  const imageUrlMap = {
    'hairloss-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  // 4. Build and create the Sanity document
  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-hairloss',
    title: 'ผมร่วงจากฮอร์โมน สาเหตุ อาการ และตรวจฮอร์โมนอะไรบ้างให้ตรงจุด',
    slug: { _type: 'slug', current: 'hairloss' },
    category: 'สุขภาพฮอร์โมน',
    excerpt:
      'ผมร่วงเยอะผิดปกติมักมีต้นตอจากฮอร์โมน ไม่ใช่แค่แชมพูหรือสระผมผิดวิธี รู้จัก 5 ฮอร์โมนหลักที่ทำให้ผมร่วงในแต่ละช่วงอายุ และควรตรวจฮอร์โมนตัวไหนก่อนเสียเงินซื้อผลิตภัณฑ์มาลองผิดลองถูก',
    publishedAt: '2026-08-02T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(hormonesQuizService && {
      ctaService: { _type: 'reference', _ref: hormonesQuizService._id },
    }),
    keyTakeaways: [
      'ผมร่วงมากกว่า 100 เส้นต่อวันถือว่าผิดปกติ และฮอร์โมนคือหนึ่งในสาเหตุหลักที่พบบ่อยที่สุด',
      'ฮอร์โมนที่ทำให้ผมร่วงต่างกันตามช่วงอายุ: DHT ในวัย 20-30, เอสโตรเจนลดหลังคลอดในวัย 30-40, เพอริเมโนพอสในวัย 40-50, วัยทองเต็มตัวในวัย 50 ปีขึ้นไป',
      'การซื้อแชมพูหรืออาหารเสริมมาลองผิดลองถูกโดยไม่รู้สาเหตุที่แท้จริง มักไม่ได้ผลเพราะไม่ได้แก้ที่ต้นตอ',
      'การตรวจฮอร์โมนหาสาเหตุที่แท้จริง ควบคู่กับการเสริมวิตามินแร่ธาตุที่ขาด ให้ผลลัพธ์ตรงจุดกว่าการดูแลแบบเดา',
      'ผมร่วงจากฮอร์โมนส่วนใหญ่ดูแลจัดการได้ หากตรวจพบสาเหตุตั้งแต่เนิ่นๆ',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-can-it-be-cured',
        question: 'ผมร่วงจากฮอร์โมน รักษาหายไหม?',
        shortAnswer:
          'ผมร่วงจากฮอร์โมนส่วนใหญ่ดูแลจัดการได้ดีขึ้นเมื่อพบสาเหตุและจัดการตั้งแต่เนิ่นๆ เช่น ผมร่วงหลังคลอดมักกลับสู่ภาวะปกติเองภายใน 6-12 เดือนเมื่อฮอร์โมนกลับสู่สมดุล ส่วนผมร่วงจากพันธุกรรมหรือวัยทองอาจต้องดูแลต่อเนื่องระยะยาว ควรปรึกษาแพทย์เพื่อวางแผนที่เหมาะกับสาเหตุของแต่ละคน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-which-hormones',
        question: 'ผมร่วงจากฮอร์โมนตัวไหนบ้าง?',
        shortAnswer:
          'ฮอร์โมนหลักที่เกี่ยวข้องกับผมร่วง ได้แก่ DHT (ฮอร์โมนแอนโดรเจนที่ทำให้รูขุมขนเล็กลงในผู้มีแนวโน้มพันธุกรรม) ฮอร์โมนไทรอยด์ (TSH, Free T3, Free T4) เอสโตรเจนและโปรเจสเตอโรนในผู้หญิง และเทสโทสเตอโรนที่ลดลงตามวัยในผู้ชาย',
      },
      {
        _type: 'faqItem',
        _key: 'faq-postpartum-duration',
        question: 'ผมร่วงหลังคลอดนานแค่ไหนถึงหาย?',
        shortAnswer:
          'อาการผมร่วงหลังคลอดมักเริ่มชัดเจนช่วง 3-4 เดือนหลังคลอด และค่อยๆ กลับสู่ภาวะปกติภายใน 6-12 เดือน เมื่อระดับเอสโตรเจนกลับสู่สมดุล หากผ่านไปเกิน 1 ปีแล้วผมยังร่วงมากหรือไม่งอกกลับ ควรปรึกษาแพทย์เพื่อตรวจหาสาเหตุอื่นร่วมด้วย',
      },
      {
        _type: 'faqItem',
        _key: 'faq-testing-process',
        question: 'ตรวจฮอร์โมนผมร่วง เจ็บไหม ต้องเตรียมตัวอย่างไร?',
        shortAnswer:
          'การตรวจฮอร์โมนผมร่วงเป็นการเจาะเลือดตามปกติ ใช้เวลาประมาณ 10-15 นาที ไม่ต้องอดอาหารในกรณีส่วนใหญ่ ยกเว้นแพทย์แนะนำเป็นพิเศษ สำหรับผู้หญิงที่ยังมีประจำเดือน แพทย์อาจแนะนำวันที่เหมาะสมของรอบเดือนเพื่อให้ผลตรวจฮอร์โมนเพศแม่นยำที่สุด',
      },
      {
        _type: 'faqItem',
        _key: 'faq-stress-vs-hormone',
        question: 'ผมร่วงจากฮอร์โมน ต่างจากผมร่วงเพราะเครียดอย่างไร?',
        shortAnswer:
          'ทั้งสองอย่างอาจทำให้เกิดผมร่วงแบบกระจายคล้ายกัน (Telogen Effluvium) เพราะความเครียดรุนแรงก็กระตุ้นการเปลี่ยนแปลงของฮอร์โมนคอร์ติซอลได้เช่นกัน ความแตกต่างคือผมร่วงจากความเครียดมักดีขึ้นเองเมื่อจัดการความเครียดได้ ขณะที่ผมร่วงจากฮอร์โมนอื่น เช่น ไทรอยด์หรือวัยทอง มักต้องตรวจและจัดการที่ต้นเหตุโดยตรงจึงจะดีขึ้นชัดเจน',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Androgenetic Alopecia',
        source: 'StatPearls [Internet]. Treasure Island (FL): StatPearls Publishing',
        year: 2024,
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK430924/',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Telogen Effluvium: A Review',
        source: 'Journal of Clinical and Diagnostic Research',
        year: 2015,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4606321/',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Impact of Thyroid Dysfunction on Hair Disorders',
        source: 'Cureus',
        year: 2023,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10492440/',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title:
          'Female Pattern Hair Loss and Androgen Excess: A Report From the Multidisciplinary Androgen Excess and PCOS Committee',
        source: 'The Journal of Clinical Endocrinology & Metabolism',
        year: 2019,
        url: 'https://pubmed.ncbi.nlm.nih.gov/30785992/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'Menopause and hair loss in women: Exploring the hormonal transition',
        source: 'Maturitas',
        year: 2025,
        url: 'https://pubmed.ncbi.nlm.nih.gov/40318238/',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'A random study of Asian male androgenetic alopecia in Bangkok, Thailand',
        source: 'Dermatologic Surgery',
        year: 2002,
        url: 'https://pubmed.ncbi.nlm.nih.gov/12269873/',
      },
      {
        _type: 'citation',
        _key: 'ref-7',
        title: 'Clinical Characteristics of Female Patterned Hair Loss in Thai Patients',
        source: 'Siriraj Medical Journal',
        year: 2021,
        url: 'https://he02.tci-thaijo.org/index.php/sirirajmedj/article/download/255496/173594',
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
      seoTitle: 'ผมร่วงจากฮอร์โมน สาเหตุ + ตรวจฮอร์โมนผมร่วง ที่ไหนดี | Thrive Wellness Bangkok',
      seoDescription:
        'ผมร่วงจากฮอร์โมนเกิดจากอะไร ต้องตรวจฮอร์โมนตัวไหนบ้าง พร้อมวิธีดูแลผมร่วงให้ตรงจุดกว่าซื้อผลิตภัณฑ์มาลองเอง โดย Thrive Wellness',
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
