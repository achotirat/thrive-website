---
name: thrive-site-review
description: >
  Audit the Thrive Wellness websites from the latest thrive-site-inspect snapshot across
  four dimensions: SEO/technical and cutover readiness, brand and copy against Brand
  Cortex v2, UX/conversion, and Thai medical-advertising risk (flags only, not legal
  advice). Produces a prioritized findings list with stable IDs that thrive-site-optimize
  can act on. Read-only. Use for "review the site", "audit เว็บ", "ตรวจ brand/copy",
  "ตรวจกฎโฆษณา", or before approving any website changes.
---

# Thrive Site Review

ขั้นที่ 2 ของ 3 (`thrive-site-inspect` → review → `thrive-site-optimize`)
**Read-only:** ประเมินและเขียนรายงานเท่านั้น ห้ามแก้ไฟล์ในเว็บ

## Step 0: Input

1. หา snapshot ล่าสุด `docs/site-reports/<date>/inspect.md` ถ้าไม่มีหรือเก่ากว่า 14 วัน ให้ถามว่าจะรัน `/thrive-site-inspect` ก่อนไหม
2. อ่าน `private/brand/brand-cortex-v2.md` และ `references/thai-medical-ad-flags.md`
   ไฟล์นี้อยู่ใน `private/` (ไม่อยู่ใน git เพราะ repo เป็น public) ถ้าเครื่องนี้ไม่มีไฟล์ ให้ขอจากคุณเต็ม ระหว่างนั้นตรวจได้แค่คำที่เลิกใช้: `มหัศจรรย์`, `น่าอัศจรรย์`, `Miraculous`, `เป็นเลิศ`, `Extraordinary` และให้รายงานว่าหมวดแบรนด์ตรวจไม่ครบ
3. อ่าน `docs/audits/master-audit.md` (ผลของ `thrive-launch-audit`) และ `docs/LAUNCH-FIX-MANUAL.md` §4
4. ถามขอบเขต: ทั้ง 4 หมวด (ค่าเริ่มต้น) หรือเลือกบางหมวด / ทั้งเว็บ หรือบางหน้า

## หมวด A: SEO / technical / พร้อม cutover

**ไม่ทำซ้ำงานของ `thrive-launch-audit`:** ถ้า master-audit อายุไม่เกิน 30 วัน ให้ยกข้อที่ยังไม่แก้มาเป็น finding (ตรวจกับ crawl ล่าสุดว่ายังเป็นอยู่จริง) ถ้าเก่ากว่านั้นให้แนะนำรัน `/thrive-launch-audit` แยก

ตรวจเพิ่มจาก crawl และ URL map:
- URL ของ Wix ที่มี traffic หรือ backlink แต่ `match_type = none` → ไม่มีที่ redirect (P0 ก่อน cutover)
- redirect map ยังไม่อยู่ใน `netlify.toml` หรือ `_redirects`
- canonical, hreflang, sitemap และ JSON-LD `@id` ใช้โดเมนไม่ตรงกัน หรือมี/ไม่มี trailing slash ไม่ตรงกัน
- sitemap มี URL ของโดเมนอื่น (`offHostSitemapUrls`) หรือมีหน้า noindex
- หน้า Wix ที่ติดอันดับ keyword สำคัญ: หน้าใหม่ครอบคลุม keyword นั้นไหม (title/H1/เนื้อหา)
- เทียบ title/description ของหน้าเดียวกันระหว่างเว็บเก่าและใหม่ ห้ามทำให้หน้าที่ติดอันดับอยู่แย่ลงโดยไม่มีเหตุผล

## หมวด B: Brand และ copy

ตรวจกับข้อที่ **ยืนยันแล้ว** ใน `private/brand/brand-cortex-v2.md` เท่านั้น:
- คำที่เลิกใช้ (grep ทั้ง `astro/src` และ HTML ของ blog จาก crawl)
- Tagline ใน home, about, footer, `<meta>` และ JSON-LD `slogan` ต้องตรงกับฉบับยืนยัน
- ชื่อแบรนด์สะกดตรงกัน (`Thrive Wellness Clinic`)
- น้ำเสียง: Sage นำเนื้อหา + Caregiver นำน้ำเสียง, ห้ามขู่ให้กลัว, ห้ามเร่งขาย, ห้ามน้ำเสียง Magician/Hero
- กลุ่มเป้าหมาย: หน้าหลักและหน้าบริการหลักพูดกับผู้หญิง 35 ถึง 55 ปีที่มีปัญหาสุขภาพรบกวนใจได้ชัดไหม
- Differentiation 3 ข้อปรากฏบนหน้า home/about ไหม

ข้อที่เป็นร่าง (tagline สั้น, Pillar C ฯลฯ) ให้รายงานเป็น "ข้อสังเกต" ห้ามเป็น finding ที่ต้องแก้

## หมวด C: UX / conversion

ใช้ Chrome (แท็บใหม่) ที่ 390px และ 1440px กับ home + 5 หน้าที่มี traffic สูงสุดจาก Ubersuggest (ใช้หน้าใหม่ที่ map แล้ว):
- CTA หลัก (LINE / โทร / ฟอร์ม) เห็นได้ในจอแรกบนมือถือ
- ฟอร์ม `LeadForm`: label, error, Turnstile ใช้ได้ (**ห้ามกดส่งจริง**)
- ข้อมูลที่จำเป็นก่อนตัดสินใจ: ราคาหรือช่วงราคา, ขั้นตอน, แพทย์ผู้ดูแล, ที่อยู่/เวลาเปิด ตรงกันทุกหน้า
- ลิงก์เสีย, รูปแตก, ข้อความล้นจอบนมือถือ, console error
- tracking: GA4/Ads tag โหลด (ดูจาก network) และ `/thank-you` เป็น noindex

## หมวด D: กฎโฆษณาสถานพยาบาลไทย (flag เท่านั้น)

ทำตาม `references/thai-medical-ad-flags.md` ทุก finding ในหมวดนี้:
- ติดป้าย `ต้องให้ผู้เชี่ยวชาญตรวจ` และใส่คำเตือนในรายงานว่าไม่ใช่คำแนะนำทางกฎหมาย
- ระบุไฟล์และบรรทัด (`astro/src/content/services/x.mdx:62`) หรือ URL + ข้อความที่ยกมา
- ให้ความสำคัญกับ Proof ของ Pillar B (Stem Cell/Exosome, ฮอร์โมน, Nutraceuticals) ก่อน

## Severity

| ระดับ | ความหมาย |
|---|---|
| P0 | ทำให้ cutover เสีย traffic/index, หรือความเสี่ยงกฎโฆษณาระดับสูง |
| P1 | กระทบ conversion หรือ ranking ของหน้าที่มี traffic, ขัดแบรนด์ข้อที่ยืนยันแล้ว |
| P2 | ปรับแล้วดีขึ้น แต่ไม่ด่วน |
| P3 | ข้อสังเกต / รอการตัดสินใจ |

## Output

เขียน `docs/site-reports/<date>/review.md`:

```
# Site review <date>  (อิงจาก inspect <date>)
> หมวด D เป็นการ flag ถ้อยคำเพื่อให้ผู้เชี่ยวชาญตรวจ ไม่ใช่คำแนะนำทางกฎหมาย

## สรุป        จำนวน finding แยก P0 ถึง P3 x หมวด, 3 ข้อที่ควรทำก่อน
## Findings     ตารางเดียว เรียง P0 → P3
| ID | P | หมวด | หน้า/ไฟล์ | หลักฐาน | ทำไมสำคัญ | แนวทางแก้ | แก้ที่ | ขนาดงาน |
## ข้อสังเกต (ร่างแบรนด์, เรื่องที่ต้องตัดสินใจ)
```

- `ID` = `R<YYMMDD>-<หมวด><เลข>` เช่น `R261009-A03` ห้ามเปลี่ยน ID หลังเขียนแล้ว เพราะ optimize อ้างอิง ID นี้
- `แก้ที่` = `astro` (โค้ด/MDX ใน repo), `sanity` (blog/doctor/testimonial), `netlify` (redirect/header), `owner` (ต้องตัดสินใจ/กฎหมาย/บัญชี)
- `หลักฐาน` ต้องตรวจซ้ำได้: file:line, URL + ข้อความที่ยกมา หรือ screenshot
- ห้ามมี finding ที่ไม่มีหลักฐาน

จบด้วยสรุปในแชตไม่เกิน 10 บรรทัด แล้วถามว่าจะอนุมัติ ID ไหนให้ `/thrive-site-optimize` ทำ
