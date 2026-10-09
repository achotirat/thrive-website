---
name: thrive-site-inspect
description: >
  Read-only data collection for both Thrive Wellness websites: the current Wix site
  (www.thrivewellnessth.com) and the new Astro site (new.thrivewellnessth.com). Crawls
  both sitemaps for on-page SEO facts, pulls traffic/keyword/backlink data from Ubersuggest
  through the owner's logged-in Chrome, and builds the Wix-to-Astro URL map needed for
  301 redirects at cutover. Writes a dated snapshot that thrive-site-review consumes.
  Use for "inspect the site", "เก็บข้อมูลเว็บ", before any review, or before cutover.
---

# Thrive Site Inspect

ขั้นที่ 1 ของ 3 (inspect → `thrive-site-review` → `thrive-site-optimize`)
**ทั้งหมดเป็น read-only:** ห้ามแก้โค้ด ห้ามแก้ Sanity ห้ามกดปุ่มที่เปลี่ยนสถานะใน Ubersuggest หรือ Wix

## ข้อเท็จจริงของระบบ (ตรวจแล้ว 9 ต.ค. 2026)

| | เว็บปัจจุบัน | เว็บใหม่ |
|---|---|---|
| URL | https://www.thrivewellnessth.com | https://new.thrivewellnessth.com |
| แพลตฟอร์ม | Wix (หมดอายุ พ.ย. 2026) | Astro 6 static + Sanity (blog) บน Netlify |
| Repo | ไม่มี | `achotirat/thrive-website` (`astro/`, `sanity/`) |
| Sitemap | `/sitemap.xml` (index ซ้อนหลายไฟล์) | `/sitemap-index.xml` → `/sitemap-0.xml` |
| Index | indexable | noindex จนถึง cutover (`netlify.toml` + `robots.txt`) |

Ubersuggest มีข้อมูลเฉพาะเว็บ Wix (เว็บใหม่เป็น noindex จึงไม่มี traffic)
แผน cutover อยู่ที่ `docs/LAUNCH-FIX-MANUAL.md` §4

## Step 0: ยืนยันขอบเขต

ถามผู้ใช้ครั้งเดียว (ถ้ายังไม่ได้บอก):
- เป้าหมาย: `both` (ค่าเริ่มต้น), `old` หรือ `new`
- เก็บ Ubersuggest ด้วยไหม (ค่าเริ่มต้น: ใช่)

กำหนด `OUT=docs/site-reports/<YYYY-MM-DD>` ใน repo thrive-website (สร้าง branch ก่อนเขียนไฟล์ถ้าอยู่บน `main`)

## Step 1: Crawl (ทั้งสองเว็บพร้อมกันได้)

```bash
node skills/thrive-site-inspect/scripts/crawl.mjs https://www.thrivewellnessth.com $OUT/crawl-old
node skills/thrive-site-inspect/scripts/crawl.mjs https://new.thrivewellnessth.com $OUT/crawl-new
```

สคริปต์อ่าน sitemap, เก็บเฉพาะ URL ของโดเมนตัวเอง (URL โดเมนอื่นใน sitemap บันทึกไว้ใน `offHostSitemapUrls`) และเก็บต่อหน้า:
status/redirect, title/description + ความยาว, robots meta, X-Robots-Tag, canonical, hreflang, H1, ชนิด JSON-LD,
จำนวนตัวอักษรเนื้อหา (ภาษาไทยไม่มีช่องว่างระหว่างคำ จึงนับตัวอักษร), รูปไม่มี alt, ลิงก์ภายใน, ลิงก์ LINE/tel

Wix ช้า (ประมาณ 3 วินาทีต่อหน้า) ถ้ามีมากกว่า 150 URL ให้รันใน background
ถ้าต้องการลองก่อนให้ใส่ `--limit 10`

## Step 2: Ubersuggest ผ่าน Chrome (เว็บ Wix เท่านั้น)

1. โหลด skill `claude-in-chrome` และเครื่องมือ Chrome ในการเรียก ToolSearch ครั้งเดียว แล้วเรียก `tabs_context_mcp` และเปิด**แท็บใหม่**
2. ไปที่ https://app.neilpatel.com/ ถ้ายังไม่ login ให้**หยุดและขอให้ผู้ใช้ login เอง** ห้ามพิมพ์รหัสผ่าน
3. โดเมน `thrivewellnessth.com`, location Thailand, language Thai เก็บข้อมูลจาก:
   - **Traffic Overview:** organic keywords, organic traffic/เดือน, domain authority, backlinks
   - **Top Pages by Traffic:** URL, est. visits, จำนวน keyword, backlinks (ทุกหน้าที่มี traffic)
   - **Keywords (ranking):** keyword, volume, position, URL (top 100 เรียงตาม est. visits)
   - **Backlinks:** referring domains (top 50) และ URL ปลายทาง
   - **Site Audit:** อ่านผลล่าสุดที่มีอยู่ ห้ามกดรัน audit ใหม่ถ้าผู้ใช้ไม่ได้สั่ง
4. ถ้ามีปุ่ม export CSV ให้ใช้ (ไฟล์ลง `~/Downloads`) แล้วย้ายไปที่ `private/site-reports/<date>/ubersuggest/` ถ้าไม่มีให้ใช้ `get_page_text` แล้วบันทึกเป็น CSV ในที่เดียวกัน (repo เป็น public และ `private/` ถูก gitignore ไว้ ใน `inspect.md` ใส่แค่ตัวเลขสรุป)
5. ห้ามแก้ project, ห้ามเพิ่มหรือลบโดเมน, ห้ามเปลี่ยน plan/การตั้งค่าใดๆ ถ้าเจอ popup ชำระเงินหรือ dialog ให้หยุดแล้วถาม
6. ถ้าเครื่องมือ Chrome ใช้ไม่ได้ 2 ถึง 3 ครั้ง ให้หยุด บันทึกว่า "Ubersuggest: ไม่ได้เก็บ" แล้วทำขั้นต่อไป

## Step 3: URL map (Wix → Astro)

สร้าง `$OUT/url-map.csv` คอลัมน์: `old_url, old_status, est_visits, top_keyword, backlinks, new_url, match_type, note`

- `match_type`: `exact` (slug เดียวกัน), `mapped` (คนละ slug แต่หัวข้อเดียวกัน), `none` (ยังไม่มีหน้าใหม่), `drop` (ไม่ต้อง redirect เช่น หน้า member หรือ booking ของ Wix)
- เทียบกับ redirect ที่มีอยู่แล้วใน `netlify.toml` และ `astro/public/_redirects` (ถ้ามี)
- เรียง URL ที่มี traffic หรือ backlink และยัง `none` ไว้บนสุด เพราะเป็นความเสี่ยงหลักตอน cutover

## Step 4: สรุป snapshot

เขียน `$OUT/inspect.md`:

```
# Inspect snapshot <date>
## แหล่งข้อมูล      (crawl เวลาไหน, Ubersuggest เก็บได้/ไม่ได้, ข้อจำกัด)
## ตัวเลขหลัก       (จำนวน URL แต่ละเว็บ, organic traffic, keywords, backlinks)
## สิ่งที่เห็นจากข้อมูลดิบ (ข้อเท็จจริงเท่านั้น ยังไม่ประเมิน เช่น "12 หน้าไม่มี meta description")
## URL map         (exact/mapped/none/drop + รายการ none ที่มี traffic)
## ไฟล์             (ลิงก์ไปยัง csv/json)
```

ห้ามให้คะแนนหรือเสนอวิธีแก้ในขั้นนี้ งานนั้นเป็นของ `thrive-site-review`
จบด้วยการแสดงตัวเลขหลัก 5 ถึง 8 บรรทัด แล้วถามว่าจะรัน `/thrive-site-review` ต่อเลยไหม

## ห้ามทำ

- ห้าม commit ไฟล์จาก `~/Downloads` ที่มีข้อมูลบัญชีหรือข้อมูลลูกค้า
- ห้ามยิงฟอร์ม lead หรือ booking บนเว็บใดๆ (จะสร้าง lead ปลอมใน Supabase/LINE)
- ห้าม crawl ถี่กว่าที่สคริปต์ตั้งไว้ (3 concurrent, หน่วง 400ms)
