#!/usr/bin/env node
/**
 * One-off Sanity import for the "HBOT หลังทำศัลยกรรมความงาม" post.
 *
 * Run from the repo root:
 *   node astro/scripts/import-hbot-after-cosmetic-surgery.mjs
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

  const introMarker = 'ถ้าเพิ่งทำศัลยกรรมความงามมาแล้วอยากให้แผลยุบไวขึ้น'
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
    'hbot-after-cosmetic-surgery-hero.webp',
    'ผู้หญิงไทยวัย 30 ปลายนั่งพักฟื้นอยู่ริมหน้าต่างห้องนั่งเล่นย่านกรุงเทพฯ แสงเช้านุ่มนวล มือแตะแก้มเบาๆ ด้วยสีหน้าสงบและมั่นใจ ไม่มีผ้าพันแผลหรือรอยช้ำให้เห็นชัด',
  )

  console.log('\n── Looking up CTA service ──')
  const hbotService = await findService('hbot')

  console.log('\n── Building HTML body ──')
  const raw = await readFile(join(BLOG_DIR, 'hbot-after-cosmetic-surgery.md'), 'utf8')
  const imageUrlMap = {
    'hbot-after-cosmetic-surgery-hero.webp': hero.asset.url,
  }
  const legacyHtml = await buildBodyHtml(raw, imageUrlMap)
  console.log(`  ✓ ${legacyHtml.length} chars`)

  console.log('\n── Creating Sanity document ──')
  const doc = {
    _type: 'blogPost',
    _id: 'blog-hbot-after-cosmetic-surgery',
    title: 'HBOT หลังทำศัลยกรรมความงาม: เร่งแผลหายจาก 36.9 วัน เหลือ 13.3 วันจริงไหม?',
    slug: { _type: 'slug', current: 'hbot-after-cosmetic-surgery' },
    category: 'เวชศาสตร์ฟื้นฟู',
    excerpt:
      'งานวิจัยเปรียบเทียบพบว่าคนไข้ที่ทำ HBOT หลังศัลยกรรมความงามแผลหายเฉลี่ย 13.3 วัน เทียบกับ 36.9 วันในกลุ่มที่ไม่ได้ทำ อ่านกลไกการทำงาน ข้อบ่งใช้ที่แพทย์ยอมรับ และตารางเริ่มทำที่เหมาะกับแต่ละหัตถการ',
    publishedAt: '2026-08-07T00:00:00.000Z',
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: hero.asset._id },
      alt: hero.altText,
    },
    ...(hbotService && {
      ctaService: { _type: 'reference', _ref: hbotService._id },
    }),
    reviewedByDoctor: 'pijak',
    keyTakeaways: [
      'งานวิจัยเปรียบเทียบคนไข้ทำหน้า (facelift) ปี 2023 พบว่ากลุ่มที่ทำ HBOT แผลหายเฉลี่ย 13.3 วัน เทียบกับ 36.9 วันในกลุ่มที่ไม่ได้ทำ (มีนัยสำคัญทางสถิติ) แต่กลุ่มตัวอย่างมีเพียง 20 คน',
      'กลไกคือออกซิเจนความดันสูงทำให้ออกซิเจนละลายในน้ำเลี้ยงเนื้อเยื่อได้มากขึ้น ลดบวม ลดอักเสบ กระตุ้นการสร้างเส้นเลือดใหม่และคอลลาเจน',
      'ข้อบ่งใช้ที่วงการแพทย์ยอมรับชัดเจนที่สุดคือ "เนื้อเยื่อ/กราฟต์ที่เลือดไปเลี้ยงไม่พอ" ซึ่ง UHMS จัดเป็นข้อบ่งชี้ลำดับความสำคัญสูงสุด (Category 1)',
      'สำหรับหัตถการอื่น เช่น เสริมจมูกหรือดูดไขมัน ยังไม่มีงานวิจัยตรงแบบ facelift แต่กลไกการหายของแผลเหมือนกัน จึงเป็นการนำหลักฐานมาประยุกต์ใช้ ไม่ใช่ผลที่พิสูจน์แล้วในหัตถการนั้นๆ โดยตรง',
      'HBOT เป็น "ตัวเสริม" การพักฟื้น ไม่ใช่ตัวรักษาหรือทดแทนเทคนิคการผ่าตัดที่ดี',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-nose-swelling-days',
        question: 'ทำจมูกกี่วันถึงยุบ?',
        shortAnswer:
          'บวมมากที่สุดในช่วง 1-7 วันแรก จากนั้นค่อยๆ ยุบต่อเนื่องอีก 1-2 สัปดาห์ ส่วนรูปทรงสุดท้ายมักต้องรอ 1-3 เดือนกว่าจะเข้าที่เต็มที่ HBOT อาจช่วยร่นระยะเวลานี้ได้ตามหลักการเดียวกับที่พบในงานวิจัย facelift แต่ยังไม่มีตัวเลขที่พิสูจน์แล้วเฉพาะเจาะจงสำหรับการเสริมจมูก',
      },
      {
        _type: 'faqItem',
        _key: 'faq-lipo-swelling-days',
        question: 'ดูดไขมันบวมกี่วันหาย?',
        shortAnswer:
          'บวมช้ำมากที่สุดในช่วง 3-7 วันแรก ลดลงเรื่อยๆ ใน 2-3 สัปดาห์ และอาจใช้เวลา 1-3 เดือนกว่าจะยุบเกือบหมด การใส่ชุดกระชับ ประคบเย็น และนอนศีรษะสูงยังเป็นวิธีพื้นฐานที่ควรทำควบคู่ไปกับ HBOT',
      },
      {
        _type: 'faqItem',
        _key: 'faq-price-sessions',
        question: 'HBOT ราคาเท่าไหร่ ทำกี่ครั้ง?',
        shortAnswer:
          'ราคาต่อครั้งและจำนวนครั้งที่แนะนำแตกต่างกันตามชนิดหัตถการและอาการของแต่ละคน โปรโตคอลในงานวิจัย facelift ใช้เฉลี่ยประมาณ 7 ครั้งตลอดคอร์ส แนะนำให้ปรึกษาแพทย์เพื่อประเมินแผนที่เหมาะกับคุณโดยเฉพาะ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-safety-contraindications',
        question: 'HBOT อันตรายไหม ใครห้ามทำ?',
        shortAnswer:
          'โดยทั่วไปถือว่าปลอดภัยเมื่อทำภายใต้การดูแลของแพทย์ แต่มีข้อห้ามในบางภาวะ เช่น ปอดมีถุงลมโป่งพองบางชนิดที่เสี่ยงต่อการฉีกขาดจากแรงดัน หรือกำลังได้รับยาเคมีบำบัดบางตัวที่ตีกับออกซิเจนความดันสูง ควรแจ้งประวัติสุขภาพทั้งหมดให้แพทย์ทราบก่อนเริ่มเสมอ',
      },
      {
        _type: 'faqItem',
        _key: 'faq-when-to-start',
        question: 'ต้องรอให้แผลหายก่อนถึงเริ่ม HBOT ได้ไหม?',
        shortAnswer:
          'ไม่ต้องรอ — ทั้งงานวิจัย facelift และข้อบ่งชี้ของ UHMS สำหรับเนื้อเยื่อเสี่ยงขาดเลือดต่างแนะนำให้เริ่มให้เร็วที่สุดหลังผ่าตัดหรือหลังพบสัญญาณผิดปกติ เพราะช่วงที่เนื้อเยื่อต้องการออกซิเจนมากที่สุดคือช่วงแรกหลังผ่าตัด ไม่ใช่ตอนที่แผลเริ่มหายแล้ว',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title:
          'Assessing the Efficacy of Hyperbaric Oxygen Therapy on Facelift Outcomes: A Case–Control Study Comparing Outcomes in Patients With and Without Hyperbaric Oxygen Therapy',
        source: 'Aesthetic Surgery Journal Open Forum',
        year: 2023,
        url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10387739/',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Hyperbaric Oxygen Therapy in Surgical Wound Healing and Tissue Salvage: A Structured Narrative Review',
        source: 'Cureus',
        year: 2026,
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13109970/',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Compromised Grafts and Flaps — Indications for Hyperbaric Oxygen Therapy',
        source: 'Undersea and Hyperbaric Medical Society (UHMS)',
        year: 2020,
        url: 'https://www.uhms.org/12-compromised-grafts-and-flaps.html',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Hyperbaric Therapy for Skin Grafts and Flaps',
        source: 'StatPearls, NCBI Bookshelf',
        year: 2024,
        url: 'https://www.ncbi.nlm.nih.gov/books/NBK470219/',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'ศูนย์เวชศาสตร์ความดันบรรยากาศสูง',
        source: 'โรงพยาบาลสมเด็จพระปิ่นเกล้า กรมแพทย์ทหารเรือ',
        year: 2026,
        url: 'https://www.spph.go.th/services-view.php?id=241',
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
      seoTitle: 'HBOT หลังทำศัลยกรรม เร่งแผลหายไวเกือบ 3 เท่า? | Thrive Bangkok',
      seoDescription:
        'งานวิจัยพบ HBOT ช่วยแผลหลังศัลยกรรมหายไวขึ้นเกือบ 3 เท่า อ่านกลไก ข้อบ่งใช้ และตารางเริ่มทำที่เหมาะสม ก่อนตัดสินใจที่ Thrive Wellness',
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
