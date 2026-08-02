#!/usr/bin/env node
import { createClient } from '@sanity/client'
import { createReadStream, readFileSync, existsSync } from 'fs'
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
    console.log(`  ✓ Found existing asset: ${existing._id}`)
    return { asset: existing, altText }
  }
  const filePath = join(BLOG_DIR, filename)
  if (!existsSync(filePath)) {
    console.warn(`  ⚠ Image not found, skipping: ${filename}`)
    return null
  }
  console.log(`  Uploading ${filename}...`)
  const asset = await client.assets.upload('image', createReadStream(filePath), {
    filename,
    contentType: 'image/webp',
  })
  console.log(`  ✓ Uploaded: ${asset._id}`)
  return { asset, altText }
}

async function findService(slug) {
  const result = await client.fetch(
    `*[_type == "service" && slug.current == $slug][0]{ _id, title }`,
    { slug },
  )
  if (result) console.log(`  ✓ Found service: ${result._id} (${result.title})`)
  else console.log(`  ⚠ Service "${slug}" not found — ctaService skipped`)
  return result
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

async function buildBodyHtml(raw) {
  let text = raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*\{#[^}]+\}/g, '')
  const h1Idx = text.indexOf('\n# ')
  if (h1Idx !== -1) text = text.slice(h1Idx)

  // Cut out the "## FAQ" section — [slug].astro renders FAQ separately as
  // an accordion from the faq[] field, so leaving it in legacyHtml causes
  // it to render a second time as plain paragraphs. Keep the References
  // section that follows it.
  const faqMarker = '## FAQ'
  const refsMarker = '## References'
  const faqIdx = text.indexOf(faqMarker)
  const refsIdx = text.indexOf(refsMarker)
  if (faqIdx !== -1 && refsIdx !== -1 && faqIdx < refsIdx) {
    text = text.slice(0, faqIdx) + text.slice(refsIdx)
  }

  const endIdx = text.indexOf('## Image Prompts')
  if (endIdx !== -1) text = text.slice(0, endIdx)
  return mdToHtml(text)
}

async function main() {
  const slug = 'leaky-gut-immunity'
  console.log(`\n📦 Importing blog post: ${slug}\n`)

  console.log('Uploading images...')
  const heroResult = await getOrUploadImage(
    'leaky-gut-immunity-hero.webp',
    'ผู้หญิงไทยในครัวกรุงเทพฯ เตรียมอาหารที่ดีต่อสุขภาพลำไส้ ผักสด อาหารหมักดอง สะท้อนการดูแลภูมิคุ้มกันผ่านลำไส้',
  )
  if (!heroResult) {
    console.error('Hero image is required but not found. Aborting.')
    process.exit(1)
  }

  console.log('\nLooking up CTA service...')
  const service = await findService('urine-organic-test')

  console.log('\nBuilding body HTML...')
  const raw = await readFile(join(BLOG_DIR, `${slug}.md`), 'utf8')
  const legacyHtml = await buildBodyHtml(raw)
  console.log(`  ✓ Body HTML length: ${legacyHtml.length} chars`)

  const doc = {
    _type: 'blogPost',
    _id: `blog-${slug}`,
    title: 'ลำไส้รั่ว ส่งผลต่อภูมิคุ้มกันอย่างไร — และจะรู้ได้ยังไงว่าลำไส้ตัวเองมีปัญหา',
    slug: { _type: 'slug', current: slug },
    category: 'ภูมิคุ้มกัน',
    excerpt:
      'ลำไส้รั่ว (Leaky Gut) คืออะไร ส่งผลต่อภูมิคุ้มกันอย่างไร อาการที่บ่งชี้ และวิธีดูแลลำไส้ให้แข็งแรง รวมถึงการตรวจ Urine Organic Acids ที่ Thrive Bangkok',
    publishedAt: new Date('2026-06-10').toISOString(),
    mainImage: {
      _type: 'imageWithAlt',
      asset: { _type: 'reference', _ref: heroResult.asset._id },
      alt: heroResult.altText,
    },
    ...(service && { ctaService: { _type: 'reference', _ref: service._id } }),
    keyTakeaways: [
      'ลำไส้รั่วคือภาวะที่ผนังลำไส้บาง ทำให้อนุภาคที่ไม่ควรผ่านเข้าสู่กระแสเลือดได้',
      '70–80% ของเซลล์ภูมิคุ้มกันทั้งหมดอยู่ในลำไส้ — สุขภาพลำไส้จึงส่งผลโดยตรงต่อภูมิคุ้มกัน',
      'อาหารสมัยใหม่ ยา NSAID ความเครียด และแอลกอฮอล์ ล้วนทำให้ผนังลำไส้บางได้',
      'การตรวจ OAT ช่วยประเมินสมดุลลำไส้และระบบเมตาบอลิซึมโดยไม่ต้องเจาะเลือด',
      'การปรับอาหารและวิถีชีวิตมักเห็นผลภายใน 4–8 สัปดาห์',
    ],
    faq: [
      {
        _type: 'faqItem',
        _key: 'faq-1',
        question: 'ลำไส้รั่วตรวจได้ยังไง?',
        shortAnswer:
          'มีหลายวิธี ได้แก่ Lactulose-Mannitol Urine Test และ Urine Organic Acids Test (OAT) ที่ให้ข้อมูลสมดุลจุลินทรีย์และสุขภาพเมตาบอลิซึมโดยรวม ที่ Thrive เราใช้ OAT เป็นหลัก',
      },
      {
        _type: 'faqItem',
        _key: 'faq-2',
        question: 'ถ้ากินโปรไบโอติกแล้ว ลำไส้จะดีขึ้นไหม?',
        shortAnswer:
          'โปรไบโอติกช่วยได้ในบางกรณี แต่สายพันธุ์ที่เหมาะสมขึ้นอยู่กับปัญหาของแต่ละคน การกินโดยไม่รู้ว่าลำไส้มีปัญหาแบบไหน เหมือนการกินยาโดยไม่รู้ว่าเป็นโรคอะไร',
      },
      {
        _type: 'faqItem',
        _key: 'faq-3',
        question: 'ลำไส้รั่วกับภูมิแพ้อาหาร เกี่ยวกันไหม?',
        shortAnswer:
          'มีความเชื่อมโยง การซึมผ่านของลำไส้ที่เพิ่มขึ้นอาจส่งผลต่อการตอบสนองภูมิคุ้มกันต่ออาหาร ซึ่งอาจเป็นส่วนหนึ่งของภูมิแพ้อาหารแฝง (IgG) กลไกยังซับซ้อนและยังมีการศึกษาอยู่',
      },
      {
        _type: 'faqItem',
        _key: 'faq-4',
        question: 'ต้องงดกลูเตนทั้งหมดไหมถ้าลำไส้รั่ว?',
        shortAnswer:
          'ไม่จำเป็นสำหรับทุกคน คนที่มี celiac disease หรือ non-celiac gluten sensitivity ควรหลีกเลี่ยง แต่คนทั่วไปไม่จำเป็นต้องงดกลูเตนทั้งหมด ควรตรวจดูว่าตัวเองมีความไวต่อกลูเตนจริงก่อน',
      },
      {
        _type: 'faqItem',
        _key: 'faq-5',
        question: 'ต้องใช้เวลานานแค่ไหนกว่าลำไส้จะดีขึ้น?',
        shortAnswer:
          'โดยทั่วไปมักเห็นความเปลี่ยนแปลงในอาการภายใน 4–8 สัปดาห์หลังปรับอาหารและวิถีชีวิต แต่การฟื้นฟูเต็มที่อาจใช้เวลา 3–6 เดือน ขึ้นอยู่กับแต่ละคน',
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref-1',
        title: 'Leaky gut and autoimmune diseases',
        source: 'Clinical Reviews in Allergy & Immunology, 42(1), 71–78',
        year: 2012,
        url: 'https://doi.org/10.1007/s12016-011-8291-x',
      },
      {
        _type: 'citation',
        _key: 'ref-2',
        title: 'Leaky gut: mechanisms, measurement and clinical implications in humans',
        source: 'Gut, 68(8), 1516–1526',
        year: 2019,
        url: 'https://doi.org/10.1136/gutjnl-2019-318427',
      },
      {
        _type: 'citation',
        _key: 'ref-3',
        title: 'Allergy and the gastrointestinal system',
        source: 'Clinical & Experimental Immunology, 153(Suppl 1), 3–6',
        year: 2008,
        url: 'https://doi.org/10.1111/j.1365-2249.2008.03713.x',
      },
      {
        _type: 'citation',
        _key: 'ref-4',
        title: 'Intestinal permeability — a new target for disease prevention and therapy',
        source: 'BMC Gastroenterology, 14, 189',
        year: 2014,
        url: 'https://doi.org/10.1186/s12876-014-0189-7',
      },
      {
        _type: 'citation',
        _key: 'ref-5',
        title: 'แนวทางการดูแลสุขภาพทางเดินอาหาร [Guidelines for Gastrointestinal Health Care]',
        source: 'กรมการแพทย์ กระทรวงสาธารณสุข',
        year: 2022,
        url: 'https://www.dms.go.th',
      },
      {
        _type: 'citation',
        _key: 'ref-6',
        title: 'Diet–microbiota interactions as moderators of human metabolism',
        source: 'Nature, 535(7610), 56–64',
        year: 2016,
        url: 'https://doi.org/10.1038/nature18846',
      },
    ],
    legacyHtml,
    seo: {
      _type: 'seoMeta',
      seoTitle: 'ลำไส้รั่ว ส่งผลต่อภูมิคุ้มกันอย่างไร อาการ และวิธีดูแล',
      seoDescription:
        'ลำไส้รั่ว (Leaky Gut) คืออะไร ส่งผลต่อภูมิคุ้มกันอย่างไร อาการที่บ่งชี้ และวิธีดูแลลำไส้ให้แข็งแรง รวมถึงการตรวจ Urine Organic Acids ที่ Thrive Bangkok',
      noIndex: false,
      schemaType: 'BlogPosting',
      includeInSitemap: true,
      sitemapPriority: 0.8,
    },
  }

  console.log('\nWriting to Sanity...')
  const result = await client.createOrReplace(doc)
  console.log(`\n✅ Done! Document ID: ${result._id}`)
  console.log(`   Slug: /blog/${slug}`)
}

main().catch((err) => {
  console.error('\n❌ Import failed:', err.message)
  process.exit(1)
})
