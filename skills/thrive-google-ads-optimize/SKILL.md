---
name: thrive-google-ads-optimize
description: >
  Audit and optimize the Thrive Wellness Clinic Google Ads account (AW-18181967822)
  through the owner's logged-in Chrome: conversion-tracking health, wasted spend and
  negative keywords, keywords/match types, RSA copy (Google healthcare policy, Thai
  medical-ad rules, Brand Cortex v2), budgets/bids, geo/schedule, landing-page fit, and
  final-URL changes needed at the Wix-to-Astro cutover. Read-only until the owner approves
  an exact change list; every change that affects spend needs explicit approval. Use for
  "optimize Google Ads", "ปรับแอด", "ดู search terms", "แอดโดน disapprove", "CPA สูง".
---

# Thrive Google Ads Optimize

ทำงานคู่กับชุด `thrive-site-*`: ปัญหาที่ต้องแก้บนหน้าเว็บ (landing page, ฟอร์ม, tracking code) ให้ส่งต่อเป็น finding ไปที่ `thrive-site-optimize` skill นี้แก้เฉพาะสิ่งที่อยู่ในบัญชี Google Ads

**ทุกการเปลี่ยนแปลงในบัญชีใช้เงินจริง:** อ่านอย่างเดียวจนกว่าคุณเต็ม (Satemshi) จะอนุมัติรายการเปลี่ยนแปลงที่ระบุตัวเลขชัดเจนในรอบนั้น

## ข้อเท็จจริงของระบบ (ตรวจจาก repo 9 ต.ค. 2026)

| เรื่อง | ค่า / ที่อยู่ |
|---|---|
| Google Ads tag | `AW-18181967822` ใน `astro/src/layouts/BaseLayout.astro` (Consent Mode v2, `url_passthrough`) |
| Conversion หลัก | โหลดหน้า `/thank-you` หลังส่งฟอร์มสำเร็จ (`send_to: AW-18181967822/dzvQCKLTorkcEM6f691D` ใน `astro/src/pages/thank-you.astro`) |
| Attribution | `LeadForm` และ quiz เก็บ `gclid` + UTM ลงตาราง `leads` ใน Supabase |
| มาตรฐาน UTM | `docs/utm-naming-standard.md` (`utm_source=google&utm_medium=cpc&utm_campaign=<service>_<month>_<year>_leads`) |
| Brief แคมเปญ | `docs/google-ads-campaign-brief.html` (8 แคมเปญ: Food Intolerance, Hormones, IV Drip, HBOT, Gluta, NAD+ ฯลฯ) |
| Landing page สำหรับแอด | `/lp/*` (noindex, canonical ไปหน้าบริการ) |
| ประวัติปัญหา policy | คำว่า "Therapy/treatment" เคยทำให้โดน policy จึงเปลี่ยนเป็น "IV Drip/Program" (commit `eb87f88`) |
| Cutover | ต.ค. 2026 (Wix หมด พ.ย.) ดู `docs/LAUNCH-FIX-MANUAL.md` §4 และเรื่องโดเมนสำหรับแอดที่ยังไม่ได้ตัดสินใจ |

**repo นี้เป็น public:** ห้าม commit ตัวเลขค่าใช้จ่าย, CPA, export ของ Google Ads หรือข้อมูล lead ให้เก็บใน `private/ads-reports/<YYYY-MM-DD>/` (ถูก gitignore แล้ว)

## Step 0: ขอบเขต

ถามครั้งเดียว (ถ้ายังไม่ได้บอก):
- โหมด: `audit` (ค่าเริ่มต้น อ่านอย่างเดียว + เสนอ) หรือ `apply` (ใช้รายการที่อนุมัติแล้วจากรายงานก่อนหน้า)
- ช่วงเวลา: 30 วันล่าสุด เทียบกับ 30 วันก่อนหน้า (ค่าเริ่มต้น)
- แคมเปญ: ทั้งหมด หรือระบุ
- งบรวมต่อเดือนที่ยอมรับได้ (ใช้เป็นเพดาน ห้ามเสนอเกิน)

## Step 1: เก็บข้อมูล (read-only, ผ่าน Chrome)

1. โหลด skill `claude-in-chrome` และเครื่องมือ Chrome ใน ToolSearch ครั้งเดียว, `tabs_context_mcp`, เปิด**แท็บใหม่**ที่ https://ads.google.com/
2. ถ้ายังไม่ login หรือมีหลายบัญชี: **หยุดแล้วให้ผู้ใช้ login/เลือกบัญชีเอง** ห้ามพิมพ์รหัสผ่านหรือรหัส 2FA
3. เก็บข้อมูล (ใช้ปุ่ม Download/CSV ถ้ามี แล้วย้ายไฟล์จาก `~/Downloads` ไป `private/ads-reports/<date>/`):
   - **Campaigns:** status, type, budget/วัน, bid strategy, cost, impr, clicks, CTR, avg CPC, conversions, cost/conv, search impr share, lost IS (budget), lost IS (rank)
   - **Search terms:** ทุกคำในช่วงเวลา พร้อม cost, clicks, conversions, match type ที่ตรง
   - **Keywords:** match type, status, Quality Score และองค์ประกอบ 3 ตัว, cost, conv
   - **Ads & assets:** ข้อความ RSA ทุก headline/description, ad strength, **policy status** (Disapproved / Eligible (limited) พร้อมเหตุผล)
   - **Goals → Conversions:** แต่ละ conversion action: status (Recording/No recent conversions/Inactive), primary หรือ secondary, counting, จำนวนใน 30 วัน
   - **Settings:** locations (presence หรือ interest), language, ad schedule, devices, audiences ที่ผูกไว้, auto-apply recommendations
   - **Final URLs** ของทุก ad/asset/sitelink และ **Change history** 30 วันล่าสุด
4. Lead จริง: ขอจำนวน lead ต่อ `utm_campaign` (และสถานะว่านัดได้หรือไม่ ถ้ามี) จาก thrive-dashboard หรือให้ผู้ใช้ export จาก Supabase เป็น**ยอดรวมเท่านั้น** ห้ามดึงหรือบันทึกชื่อ เบอร์ หรือข้อมูลสุขภาพของลูกค้า
5. ห้ามกด Apply ใน Recommendations, ห้ามเปิด auto-apply, ห้ามแก้ billing หรือ account access, ห้ามรับข้อเสนอ "เพิ่มงบ" ใดๆ ในขั้นนี้ ถ้าเจอ dialog ที่จะเปลี่ยนค่า ให้ปิดหรือหยุดแล้วถาม

## Step 2: วิเคราะห์ (ตามลำดับนี้ เพราะถ้า tracking เสีย ตัวเลขอื่นเชื่อไม่ได้)

**A. Tracking health (ทำก่อนเสมอ)**
- conversion action หลักเป็น Recording และเป็น Primary ตัวเดียวสำหรับ lead หรือไม่ มี action ซ้ำที่นับ lead เดียวกันสองครั้งไหม
- เทียบจำนวน conversion ใน Ads กับ lead ใน Supabase ที่มี `utm_source=google` หรือ `gclid` ต่อแคมเปญ ถ้าต่างกันเกิน 20% ให้หาสาเหตุ (consent ถูกปฏิเสธ, ส่งฟอร์มที่ไม่ไป `/thank-you`, กด LINE/โทรที่ไม่ได้นับ)
- ถ้า lead ส่วนใหญ่มาทาง LINE/โทร: เสนอ conversion เพิ่มสำหรับคลิก LINE/tel (ทำในเว็บ → ส่งต่อ `thrive-site-optimize`)
- โอกาสต่อยอด: นำเข้า offline conversion ด้วย `gclid` ของ lead ที่นัดได้จริง ให้ bidding เรียนรู้จาก lead ที่มีคุณภาพ (เสนอเป็นแผน ไม่ทำเอง)

**B. ค่าใช้จ่ายที่เสียเปล่า**
- search terms ที่ใช้เงินแต่ 0 conversion หรือไม่ตรงบริการ → เสนอ negative keyword (ระบุ exact/phrase และระดับ campaign หรือ account) กลุ่มที่พบบ่อย: หางาน/สมัครงาน, ฟรี, ทำเอง/DIY, ราคาถูก, ชื่อโรงพยาบาลหรือคลินิกอื่น, คำที่ไม่ได้อยู่กรุงเทพ, เรื่องที่ไม่ใช่บริการของคลินิก
- ระวังอย่าตัดคำที่เป็นเชิงความรู้แต่ยังได้ lead (เช็ค conversion ก่อนเสนอ)

**C. Keywords และโครงสร้าง**
- keyword ที่ใช้เงินแต่ไม่ได้ผล, broad match ที่ไม่มี smart bidding คุม, keyword ทับกันข้ามแคมเปญ
- search term ที่ได้ conversion แต่ยังไม่มีเป็น keyword → เสนอเพิ่ม
- Quality Score ต่ำ: แยกว่าเป็นเพราะ ad relevance, expected CTR หรือ landing page experience (ข้อหลังส่งต่อฝั่งเว็บ)

**D. ข้อความโฆษณา (RSA และ assets)** ตรวจ 3 ชั้นทุกข้อความ:
1. **Google Healthcare & medicines policy:** ห้ามโฆษณาการรักษาที่ยังไม่พิสูจน์หรือยังเป็นการทดลอง (stem cell, cellular therapy, gene therapy และอื่นๆ) ดังนั้น Stem Cell/Exosome ห้ามขึ้นแอด ระวังคำว่า therapy/treatment/รักษา กับ IV, chelation, NAD+, HBOT ถ้าโดน disapprove ให้อ่านเหตุผลใน policy detail ก่อนเสนอแก้ ห้ามเดา
2. **กฎโฆษณาสถานพยาบาลไทย:** ใช้ `skills/thrive-site-review/references/thai-medical-ad-flags.md` (แอดก็ถือเป็นโฆษณาสถานพยาบาล) flag เท่านั้น ไม่ใช่คำแนะนำทางกฎหมาย
3. **Brand Cortex v2:** ใช้ `private/brand/brand-cortex-v2.md` (ไฟล์นี้อยู่ใน `private/` (ไม่อยู่ใน git เพราะ repo เป็น public) ถ้าเครื่องนี้ไม่มีไฟล์ ให้ขอจากคุณเต็ม ระหว่างนั้นตรวจได้แค่คำที่เลิกใช้: `มหัศจรรย์`, `น่าอัศจรรย์`, `Miraculous`, `เป็นเลิศ`, `Extraordinary` และให้รายงานว่าหมวดแบรนด์ตรวจไม่ครบ) ห้ามใช้คำที่เลิกใช้ ห้ามขู่ให้กลัว ห้ามใช้ข้อความที่เป็นร่าง
- ข้อความใหม่ต้องมีข้อเท็จจริงเฉพาะของ Thrive (จาก brief หรือหน้าเว็บ เช่น จำนวนรายการตรวจ ระยะเวลาผล) ไม่ใช่ข้อความกลางๆ ที่คลินิกไหนก็ใช้ได้ ห้ามแต่งตัวเลขหรือรีวิวขึ้นเอง ถ้าไม่มีข้อมูลให้ถาม
- นับความยาว: headline ไม่เกิน 30, description ไม่เกิน 90 (ภาษาไทยนับเป็นตัวอักษร รวมสระและวรรณยุกต์ตามที่ Google นับ ให้ตรวจในช่องกรอกจริงก่อนบันทึก)

**E. งบ, bidding, การกระจาย**
- แคมเปญที่ CPA ดีแต่ lost IS (budget) สูง → เสนอย้ายงบจากแคมเปญที่ CPA แย่ (**ย้ายงบภายในเพดานเดิมก่อน** การเพิ่มงบรวมต้องระบุตัวเลขต่อวันและต่อเดือน)
- bid strategy ตรงกับปริมาณ conversion ไหม (smart bidding ต้องมี conversion พอ ถ้าน้อยเกินไปให้เสนอ Maximize clicks/Manual CPC พร้อมเหตุผล)
- location: ควรเป็น "Presence" ในกรุงเทพและปริมณฑลหรือรัศมีจากคลินิก (The Crystal ลาดพร้าว/ประดิษฐ์มนูธรรม) ไม่ใช่ "Presence or interest"
- schedule: ถ้ามี call asset ให้ตรงกับเวลาเปิดคลินิกจริง (ตรวจกับหน้า `/contact`)
- device: เทียบ CPA มือถือกับเดสก์ท็อป

**F. Audience (กฎของ Google ที่เสี่ยงโดนระงับ)**
- ห้าม remarketing, Customer Match หรือ custom segment ที่อิงการเข้าชมหน้าบริการสุขภาพหรืออาการ (นโยบาย personalized advertising ด้านสุขภาพ) ถ้าพบให้เป็น P0
- ใช้ audience แบบ observation ตามข้อมูลประชากร (หญิง 35 ถึง 55 ปีตาม Brand Cortex) ได้ แต่ห้ามใช้หมวดที่อิงสภาวะสุขภาพ

**G. Landing page และ cutover**
- final URL ทุกตัวต้องได้ 200 ตรง (ไม่ redirect ข้ามโดเมน) เปิดเร็ว และตรงกับ ad group (ตรวจด้วย `curl -sI`)
- **cutover:** แอดที่ยังชี้ www (Wix) ต้องเปลี่ยน final URL เป็น URL ใหม่ของ Astro ในวันเดียวกับที่ย้ายโดเมน ใช้ `url-map.csv` จาก `thrive-site-inspect` ทำเป็นตาราง old → new ต่อ ad/sitelink และเตรียมเป็น batch แยก
- เรื่องโดเมนแยกสำหรับแอดที่ยังไม่ได้ตัดสินใจ: ให้คงคำแนะนำใน `LAUNCH-FIX-MANUAL.md` (ใช้ `/lp/*` บนโดเมนหลัก) และเสนอให้เจ้าของตัดสินใจ ห้ามตัดสินใจเอง
- ปัญหาบนหน้าเว็บ (ข้อความไม่ตรงแอด, CTA ไม่ชัด, ฟอร์มช้า) → เขียนเป็น finding ส่งต่อ `thrive-site-optimize`

## Step 3: รายงาน

เขียน `private/ads-reports/<date>/ads-review.md`:

```
# Google Ads review <date> (ช่วงข้อมูล <from> ถึง <to>)
> การ flag ด้านกฎโฆษณาไม่ใช่คำแนะนำทางกฎหมาย

## สรุปตัวเลข    cost, conv, CPA, CTR ต่อแคมเปญ (เทียบช่วงก่อน) + lead จริงจาก Supabase
## Tracking       ผลข้อ A (ถ้าเสีย ให้ขึ้นก่อนทุกอย่าง)
## Findings       | ID | P | หมวด | แคมเปญ/ad group | หลักฐาน | เสนอให้ทำ | ผลต่องบ | ผลที่คาด |
## ส่งต่อฝั่งเว็บ   รายการที่ต้องทำใน thrive-site-optimize
## รอเจ้าของตัดสินใจ
```

- `ID` = `G<YYMMDD>-<เลข>` เช่น `G261009-04` ห้ามเปลี่ยนหลังเขียนแล้ว
- `ผลต่องบ`: `ไม่เปลี่ยน` / `ย้าย X บาท/วัน จาก A ไป B` / `เพิ่ม X บาท/วัน (≈ Y บาท/เดือน)`
- `P0` = tracking เสีย, แอดโดน disapprove ในแคมเปญหลัก, เสี่ยงโดนระงับบัญชี, final URL เสีย
- ห้ามมี finding ที่ไม่มีหลักฐานจากตัวเลขหรือหน้าจอ

จบด้วยสรุปในแชตไม่เกิน 10 บรรทัด แล้วถามว่าจะอนุมัติ ID ไหน

## Step 4: Apply (เฉพาะ ID ที่อนุมัติในรอบนี้)

1. แสดงรายการเปลี่ยนแปลงสุดท้ายแบบที่ตรวจได้ทีละบรรทัด แล้ว**รอคำว่าอนุมัติ**:
   ```
   G261009-04  Campaign "IV Drip" → เพิ่ม negative [phrase] "สมัครงาน", "ฟรี"
   G261009-07  Campaign "Food Intolerance" → งบ 500 → 700 บาท/วัน (+6,000 บาท/เดือน)
   ```
2. ทำผ่าน UI ทีละรายการ ตรวจหน้าจอยืนยันหลังบันทึกทุกครั้ง ถ้ามี dialog ที่ไม่ตรงกับที่อนุมัติ (เช่น ให้เพิ่มงบหรือเปิด auto-apply) ให้หยุดแล้วถาม
3. ทางเลือก: ถ้ารายการเยอะ ให้ทำเป็นไฟล์สำหรับ Google Ads Editor (CSV) ให้ผู้ใช้ import เอง
4. ห้ามทำสิ่งนี้แม้จะอนุมัติรายการอื่นแล้ว เว้นแต่ระบุไว้ในรายการโดยตรง: สร้างหรือลบแคมเปญ, เปลี่ยน conversion action หรือ goal, เปลี่ยน bid strategy, เปิด auto-apply, แก้ billing, account access, การเชื่อมบัญชี
5. หลังทำ: ถ่ายภาพหน้าจอหรือจด Change history ที่ตรงกับแต่ละ ID

## Step 5: บันทึกและติดตาม

- เพิ่ม entry ใน `README.md` ของ repo (ไม่มีตัวเลขเงินหรือ CPA เพราะ repo เป็น public):
  ```
  ## <YYYY-MM-DD> — Google Ads: <เรื่อง>
  **คำสั่งจากผู้ใช้:** ...
  **สิ่งที่เปลี่ยน:** ID + คำอธิบาย (เช่น "เพิ่ม negative 14 คำในแคมเปญ IV Drip")
  **รายละเอียดตัวเลข:** private/ads-reports/<date>/ads-review.md
  **ติดตามผล:** <date + 14 วัน>
  ```
- เปลี่ยน bidding หรืองบมากกว่า 20% ทำให้ระบบต้องเรียนรู้ใหม่ ให้รออย่างน้อย 7 ถึง 14 วันก่อนสรุปผล และไม่เปลี่ยนแคมเปญเดิมซ้ำในช่วงนั้น
- รอบถัดไปของ skill นี้ต้องเริ่มด้วยการเทียบผลของ ID ที่ทำไปแล้วกับก่อนทำ
