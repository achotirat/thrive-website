// Replace "เวชศาสตร์เชิงฟังก์ชัน" in the legacyHtml of the 2 live blog posts.
// Dry run by default; pass --write to patch (needs SANITY_API_TOKEN).
import { createClient } from '@sanity/client'
const SUBS = [
  ['แนวทางเวชศาสตร์เชิงฟังก์ชัน (Functional Medicine)', 'แนวทางการแพทย์แบบองค์รวม (Functional Medicine)'],
  ['แนวทางเวชศาสตร์เชิงฟังก์ชัน (functional medicine — การแพทย์ที่มุ่งหาต้นเหตุ', 'แนวทางการแพทย์แบบองค์รวม (Functional Medicine — การแพทย์ที่มุ่งหาต้นเหตุ'],
  ['— ทีมแพทย์เวชศาสตร์เชิงฟังก์ชัน, Thrive', '— ทีมแพทย์ Functional Medicine, Thrive'],
]
const IDS = ['blog-hairloss', 'blog-nafld-fatty-liver']
const write = process.argv.includes('--write')
const client = createClient({ projectId: 'fc8ot1td', dataset: 'production', apiVersion: '2024-01-01', useCdn: false, token: process.env.SANITY_API_TOKEN })
if (write && !process.env.SANITY_API_TOKEN) { console.error('SANITY_API_TOKEN not set'); process.exit(1) }
for (const base of IDS) {
  for (const id of [base, `drafts.${base}`]) {
    const doc = await client.getDocument(id)
    if (!doc) continue
    let html = doc.legacyHtml || ''
    const changes = []
    for (const [a, b] of SUBS) if (html.includes(a)) { html = html.split(a).join(b); changes.push(`  - "${a}"\n    → "${b}"`) }
    const left = (html.match(/เวชศาสตร์(?:เชิง)?ฟังก์ชั่?น/g) || []).length
    console.log(`${id}: ${changes.length} change(s), ${left} left`)
    changes.forEach((c) => console.log(c))
    if (write && changes.length) {
      await client.patch(id).ifRevisionId(doc._rev).set({ legacyHtml: html }).commit()
      console.log('  ✓ patched')
    }
  }
}
