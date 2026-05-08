# Thrive Wellness Homepage — Change Log

บันทึกการเปลี่ยนแปลงและบทเรียนจากการทำงานร่วมกับ Claude (Cowork mode) สำหรับเว็บไซต์ Thrive Wellness Clinic

---

## 2026-04-18 — เปลี่ยนฟอนต์ทั้งเว็บเป็น Noto Sans Thai

**คำสั่งจากผู้ใช้:** แก้ฟอนต์ในไฟล์ `thrive-styles.css` เป็น Noto Sans Thai ทั้งหมด โดยใช้น้ำหนักต่างๆ กัน
**ทางเลือกที่เลือก:** ตัวเลือก A — แทนที่ทั้งหมด (aggressive) — รวมถึง heading ภาษาอังกฤษและ accent serif ด้วย

### สิ่งที่เปลี่ยน

**`thrive-styles.css`**
- ปรับ header comment จาก v1.0 → v1.1 พร้อมระบุว่าใช้ Noto Sans Thai
- ตัวแปรฟอนต์ใน `:root`:
  - `--font-en: 'Noto Sans Thai', sans-serif;` (เดิม Montserrat)
  - `--font-th: 'Noto Sans Thai', sans-serif;` (เดิม Sarabun)
  - `--font-serif: 'Noto Sans Thai', sans-serif;` (เดิม Playfair Display)
- ปรับคอมเมนต์ "Thai headings get Sarabun" → สะท้อนว่าทุกฟอนต์ใช้ family เดียวกันแล้ว

**ไฟล์ HTML ที่อัปเดต Google Fonts `<link>` (9 ไฟล์)**

URL ใหม่ที่ใช้ทุกหน้า:
```
https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap
```

- `index.html` — อัปเดต `<link>` + ตัวแปร `--font-en`/`--font-th` ใน inline `<style>`
- `contact.html` — อัปเดต `<link>` + ตัวแปร inline
- `blog.html` — อัปเดต `<link>` + ตัวแปร inline
- `hbot.html` — อัปเดต `<link>` + ตัวแปร inline
- `iv-drip.html` — อัปเดต `<link>` (ไม่มี inline vars)
- `nad-plus.html` — อัปเดต `<link>` + แก้ inline `font-family:'Playfair Display',serif` → `'Noto Sans Thai',sans-serif`
- `knowledge.html` — อัปเดต `<link>`
- `about.html` — อัปเดต `<link>`
- `health-architect.html` — อัปเดต `<link>` + แก้ inline Playfair เป็น Noto Sans Thai
- `check-up.html` — อัปเดต `<link>`

### น้ำหนักฟอนต์ที่โหลด

300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold) — ครอบคลุม utility class `.fw-300` ถึง `.fw-700` ที่มีอยู่ใน CSS และน้ำหนักต่างๆ ที่ใช้ในสไตล์ existing

### บทเรียน / หมายเหตุ

- CSS ใช้ระบบ design tokens ผ่าน CSS custom properties (`--font-en`, `--font-th`, `--font-serif`) ทำให้การเปลี่ยนฟอนต์ครั้งเดียวใน `:root` กระทบทั่วทั้งเว็บ
- ระวัง: 4 ไฟล์ (index, contact, blog, hbot) มีการประกาศ `:root` vars ซ้ำใน inline `<style>` ซึ่ง override ค่าจาก `thrive-styles.css` — ต้องแก้แยกต่างหาก
- ระวัง: 2 ไฟล์ (nad-plus, health-architect) มี `font-family` แบบ inline เขียน Playfair Display ตรงๆ ไม่ได้ใช้ตัวแปร — ต้องค้นหาเพิ่ม
- การลบ Playfair Display ออกจาก URL ทำให้ italic headings ที่ใช้ accent หายเสน่ห์ bookish ไปเล็กน้อย แต่รองรับคำไทยได้ถูกต้องมากขึ้น
- ตรวจสอบสุดท้าย: `grep -n "Montserrat|Sarabun|Playfair"` คืน 0 ผลลัพธ์

### วิธีย้อนกลับ (ถ้าต้องการ)

หากผลลัพธ์ทางสายตาไม่เป็นอย่างที่ต้องการ สามารถย้อนกลับได้ด้วยการกู้คืนไฟล์จาก git history (ถ้ามี) หรือใช้ตัวแปรที่เคยใช้:
- `--font-en: 'Montserrat', sans-serif;`
- `--font-th: 'Sarabun', sans-serif;`
- `--font-serif: 'Playfair Display', Georgia, serif;`
- Google Fonts URL เดิมอยู่ในบันทึกนี้ด้านบน (ก่อนแก้)

---

## 2026-04-18 — Finish static HTML + WordPress Blueprint

**คำสั่งจากผู้ใช้:** Finish the current static HTML rebuild, use it as the design blueprint for WordPress

**งานที่ทำ:**

### 1. Cross-link Audit & Fixes
- ตรวจสอบ href ทั้งหมดใน 10 ไฟล์ HTML — พบ links ใช้งานได้ครบ
- เพิ่ม anchor IDs ใน `knowledge.html` ที่หายไป: `#anti-aging`, `#hormone`, `#gut`, `#mental` (ต้องเพิ่มเพราะ footer ของทุกหน้าลิงก์หา anchors เหล่านี้ แต่ไม่มีอยู่จริง)
- เพิ่ม `id="topics"` ให้ Topic Clusters section ใน knowledge.html

### 2. LINE QR Code บน contact.html
- แทนที่ `<div>QR Code Placeholder</div>` ด้วย `<img>` จาก LINE Official CDN
- URL รูป: `https://qr-official.line.me/gs/M_vjc2081u_GW.png?oat_content=qr`
- ลิงก์ QR ไปที่: `https://lin.ee/zEO6gmz`
- เพิ่ม "หรือกด เพิ่มเพื่อน LINE" text link ด้านล่าง
- **หมายเหตุ:** LINE URL หลักทั้งหมดในเว็บยังคงเป็น `line.me/R/ti/p/@thrivewellnessth` ตามที่ผู้ใช้ยืนยันว่าถูกต้อง

### 3. Content Gaps — เติมเนื้อหา
- **iv-drip.html:** เพิ่ม section "ดริปกับเรา ง่ายกว่าที่คิด" (4-step process: ปรึกษาแพทย์ → ดริป → รู้สึกต่าง → โปรแกรมระยะยาว) ก่อน FAQ
- **check-up.html:** เพิ่ม section Testimonials 3 reviews (ผู้ใช้ IgG, ฮอร์โมน, DNA) ก่อน FAQ
- **knowledge.html:** หน้านี้มีเนื้อหาครบดีแล้ว — ไม่ได้แก้

### 4. Visual Polish — thrive-styles.css
สิ่งที่เพิ่มเข้าไปใน CSS:
- `.section--white` — class ที่ pages ใช้แต่ไม่เคย define ใน CSS
- `.trust-bar__inner` — alias สำหรับ `.trust-bar__items` (pages ใช้ `__inner` แต่ CSS define แค่ `__items`)
- `.trust-bar__item` + `.trust-bar__icon` — aliases สำหรับ `.trust-item` และ `.trust-item__icon`
- `.page-hero__label` — class สำหรับ uppercase label เหนือ H1 ใน page heroes
- `.page-hero__hint` — class สำหรับ hint text ใต้ subtitle (ใช้ใน knowledge.html)
- CSS breadcrumb auto-separator — `.breadcrumb > * + *::before { content: '›' }` แก้ปัญหา separator หายในหลายหน้า
- `.grid-2col` + `.grid-2col--wide` — responsive 2-col layout utility class (สำหรับ WP ใช้แทน inline style)
- Mobile media query ปรับปรุง: เพิ่ม `.trust-bar__inner` ใน gap-reduce rule

### 5. WordPress Blueprint Document
- สร้าง `Thrive-WordPress-Blueprint.docx` ใน Thrive Wellness clinic folder
- 10 sections: Overview, Architecture, Hosting, Design Tokens, Global Components, Page-by-Page Spec, ACF Fields, SEO, Quirks & Gotchas, Implementation Checklist
- แนะนำ: SiteGround Singapore + Kadence Theme + Kadence Blocks + ACF + Yoast SEO

---

### บทเรียน / หมายเหตุสำหรับ session ถัดไป

- `knowledge.html` ตอนนี้มี anchor IDs แล้ว (#anti-aging, #hormone, #gut, #mental) — อยู่เป็น `<span>` invisible anchors ก่อน article grid
- LINE URL มี 2 แบบ: `line.me/R/ti/p/@thrivewellnessth` (standard, ใช้ทั่วเว็บ) และ `lin.ee/zEO6gmz` (short link, ใช้แค่ QR contact page)
- CSS ใน thrive-styles.css ตอนนี้ define `.section--white` แล้ว — safe to use
- Inline grids (`style="display:grid;grid-template-columns:1fr 1fr"`) ยังไม่ responsive บน mobile — noted ใน WP spec ให้ใช้ Kadence Columns แทน
- WordPress Blueprint อยู่ที่: `/mnt/Thrive Wellness clinic/Thrive-WordPress-Blueprint.docx`

---

## Working preferences (กับ Claude)

- ถามก่อนทำเสมอ (clarify before creating)
- วางแผนก่อนลงมือ (plan first, execute later)
- เก็บ log การเปลี่ยนแปลงในไฟล์นี้ เพื่อให้ session ถัดไปเรียนรู้จาก context เดิมได้
