# Inspect snapshot 2026-10-09

ข้อเท็จจริงเท่านั้น ยังไม่ได้ประเมินหรือให้คะแนน (เป็นงานของ `thrive-site-review`)

## แหล่งข้อมูล

| แหล่ง | เวลา | สถานะ |
|---|---|---|
| Crawl www (Wix) ตาม sitemap | 9 ต.ค. 2026 ประมาณ 13:42 ถึง 13:55 | ครบ 442 URL |
| Crawl new (Astro) ตาม sitemap | 9 ต.ค. 2026 ประมาณ 14:10 (รอบที่ 3 หลังแก้ parser) | ครบ 208 URL |
| Ubersuggest Traffic Overview, Top Pages (196), Keywords (250) | ข้อมูลเดือน ก.ย. 2026 | ครบ |
| Ubersuggest Backlinks | 9 ต.ค. 2026 | ได้ตัวเลขสรุปและ anchor ส่วนตาราง All Links ไม่โหลด (ลอง 2 ครั้ง) |
| Ubersuggest Site Audit (Wix) | crawl ล่าสุด 9 ต.ค. 2026 12:20 (ไม่ได้สั่งรันใหม่) | export ครบ 13 ไฟล์ |

ข้อจำกัด: Ubersuggest มีข้อมูลเฉพาะเว็บ Wix เพราะเว็บใหม่เป็น noindex, Est. visits เป็นค่าประมาณของ Ubersuggest ไม่ใช่ข้อมูลจาก GA4/Search Console

## ตัวเลขหลัก

| | www (Wix) | new (Astro) |
|---|---|---|
| URL ใน sitemap | 442 (200: 440, 301: 2) | 208 (เป็นหน้า meta refresh 83 หน้า, หน้าเนื้อหา 125 หน้า) |
| เวลาตอบกลับ median | 3.1 วินาที | 0.7 วินาที |
| Organic traffic/เดือน (Ubersuggest) | 1,504 (organic 65.5% / paid 34.5%) | ไม่มี (noindex) |
| Organic keywords | 1,816 (ก.ย. 2026) | ไม่มี |
| Domain Authority / Referring domains / Backlinks | 21 / 753 / 3,777 (nofollow 917) | ไม่มี |

## สิ่งที่เห็นจากข้อมูลดิบ

**Traffic กระจุก**
- บทความ `/post/apple-benefit` หน้าเดียวได้ 1,445 จาก 4,176 est. visits รวมทั้งเว็บ (35%) 5 หน้าแรกรวมกันได้ประมาณ 58%
- keyword ที่ติดอันดับส่วนใหญ่เป็นบทความความรู้ทั่วไป (แอปเปิ้ลแดง, สารสื่อประสาท, พริก) หน้าบริการที่ติดคือ `/gluta` (#2 "glutathione คือ")
- จำนวน keyword ลดลงต่อเนื่องจากประมาณ 5K (ธ.ค. 2025) เหลือ 1.8K (ก.ย. 2026)

**Backlinks**
- จำนวน referring domain เพิ่มจากประมาณ 100 เป็น 750 ตั้งแต่ ก.ย. 2025 ส่วนใหญ่ DA 1 ถึง 20
- anchor text ที่พบบ่อยที่สุดเป็นข้อความขายลิงก์ ("high quality dofollow backlinks ... pbn network ...") และโดเมน `.xyz`
- หน้าที่มี backlink มากที่สุด: `/post/mental-health` (324), `/immunesystem` (235), `/post/abnormal-period` (179), `/` (79)

**เว็บ Wix (www)**
- ไม่มี meta description 109 หน้า, description ยาวเกิน 160 ตัวอักษร 224 หน้า, title ยาวเกิน 60 ตัวอักษร 84 หน้า, title สั้นกว่า 30 ตัวอักษร 63 หน้า
- ไม่มี JSON-LD 94 หน้า, 434 หน้ามีรูปที่ไม่มี alt, หน้าแรกไม่มี H1
- Site Audit: 610 หน้า: สำเร็จ 365, redirect 12, เสีย 52, ถูกบล็อก 181 (ส่วนใหญ่เป็น `/blog/hashtags/*` ที่ตั้ง noindex)
- พบ URL `members-area/*` ที่ดูเป็นบัญชีสแปมใน 4xx list
- redirect ที่มีอยู่แล้ว: `/book-online` → `/`, `/hormones-check-up` → `/hormones-quiz`

**เว็บใหม่ (new)**
- ทุกหน้าเนื้อหามี description, H1, canonical, JSON-LD และ alt ครบ, canonical และ hreflang ใช้โดเมนเดียวกันทุกหน้า
- title ยาวเกิน 60 ตัวอักษร 47 หน้า, description ยาวเกิน 160 ตัวอักษร 29 หน้า, มี H1 มากกว่า 1 ตัว 5 หน้า, ไม่มีลิงก์ LINE 30 หน้า
- `/post/<slug>` (83 หน้า) ตอบ **200 + meta refresh** ไป `/blog/<slug>` ไม่ใช่ 301 และหน้าเหล่านี้อยู่ใน `sitemap-0.xml`
- `/sitemap.xml` เป็นไฟล์เก่า 14 URL ของ www (รวม `/nad-plus` ที่ไม่มีแล้ว) แยกจาก `sitemap-index.xml`
- sitemap ใส่ `/` ท้าย URL (`/about/`) แต่ canonical ไม่ใส่ (`/about`)
- ทั้งเว็บยังเป็น noindex (`X-Robots-Tag` + `robots.txt Disallow: /`) ตามแผนก่อน cutover

## URL map (Wix → Astro)

ไฟล์เต็ม: `private/site-reports/2026-10-09/url-map.csv`

| match_type | URL | est. visits | backlinks |
|---|---|---|---|
| exact (path เดียวกัน) | 22 | 399 | 85 |
| mapped (meta refresh, pattern หรือ slug เดียวกัน) | 70 | 3,188 | 807 |
| none (ยังไม่มีหน้าคู่) | 310 | 589 | 15 |
| drop (hashtag/category/member) | 40 | 0 | 0 |

- รวม traffic ที่มีหน้าคู่แล้ว: 3,587 จาก 4,176 est. visits (86%)
- **none 310 URL:** บทความ `/post/*` 265, `/health-concerns/*` 11, `/specialized-iv-drip/*` 8, `/service-page/*` 5 ที่เหลือเป็นหน้าบริการเดี่ยว เช่น `/mistletoe`, `/hifu-treatment`, `/promotion`, `/pricing-plans`
- 50 URL ใน none ยังมี traffic หรือ backlink
- 17 แถวมีหมายเหตุ `verify` (จับคู่อัตโนมัติจาก slug หรือ pattern) ต้องให้คนตรวจ
- ลองจับคู่จาก title แล้ว ไม่ได้ผล (ได้ 2 คู่และผิดทั้งคู่) จึงไม่ได้ใช้

URL ที่ยังไม่มีหน้าคู่และมี traffic สูงสุด 15 อันดับ:

| Wix URL | Est. visits | Backlinks | keyword หลัก |
|---|---|---|---|
| `/post/แร่ธาตุ` | 177 | 0 | แร่ ธาตุ คือ อะไร (#7) |
| `/post/คู่มือทานวิตามินซี-ชนิดไหนไม่ควรทานด้วยกัน` | 72 | 0 | วิตามินที่ไม่ควรกินคู่กัน (#8) |
| `/post/ประจำเดือนเคลื่อน-ไม่มาตามนัด-ปวดท้องประจำเดือน-...` | 68 | 0 | ปวดท้อง หน่วง แต่ไม่ได้เป็น ประจําเดือน (#17) |
| `/post/hangover` | 44 | 0 | สร่าง เมา (#29) |
| `/post/vitamin-b12` | 33 | 0 | ขาดวิตามินบี12 ต้องกินอะไร (#26) |
| `/post/ฺboostภูมิคุ้มกัน` | 23 | 0 | วิตามินเสริมภูมิคุ้มกัน ยี่ห้อไหนดี (#4) |
| `/igg-antibody-covid` | 19 | 0 | igg คือ (#4) |
| `/post/ประโยชน-ของ-coq10` | 16 | 1 | co q 10 (#23) |
| `/post/bcaa-essential` | 15 | 0 | bcaa (#8) |
| `/post/mercury` | 15 | 0 | ปรอทคืออะไร (#9) |
| `/post/cortisol` | 12 | 0 | ฮอร์โมน คอร์ติซอล คือ (#17) |
| `/post/อาหารเสริม` | 9 | 0 | supplementation คือ (#7) |
| `/mistletoe` | 8 | 0 | mistletoe คือ (#8) |
| `/post/stressdisorder` | 8 | 0 | เครียดสะสม (#23) |
| `/post/oxytocin` | 5 | 5 | ออกซิโทซิน หน้าที่ (#9) |

## ไฟล์

ใน repo (`docs/site-reports/2026-10-09/`):
- `crawl-old.json` / `.csv`: ข้อมูลต่อหน้าของ Wix 442 URL
- `crawl-new.json` / `.csv`: ข้อมูลต่อหน้าของ Astro 208 URL

ใน `private/site-reports/2026-10-09/` (ไม่อยู่ใน git):
- `url-map.csv`
- `ubersuggest/overview.md`, `top-pages.csv`, `keywords.csv`, `site-audit/*.csv` (+ `site-audit.zip`)
