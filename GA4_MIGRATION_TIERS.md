# GA4 Traffic Analysis — Migration Tier Plan
**Source:** GA4 Export `www.thrivewellnessth.com` | 28 มี.ค. – 24 เม.ย. 2569  
**วัตถุประสงค์:** จัดลำดับ 300 หน้า Wix สำหรับ migrate ไป Astro

---

## ภาพรวม

| Tier | จำนวนหน้า | วิธีทำ | เครื่องมือ |
|------|-----------|--------|-----------|
| **A** | ~22 หน้า | เขียนใหม่ใน Astro + toprank SEO audit | Manual + AI |
| **B** | ~50 หน้า | AI batch generate จาก content เดิม | toprank batch |
| **C** | ~228 หน้า | 301 redirect ไป Tier A/B | Nginx/Astro redirect |

> **สรุป:** ไม่ต้อง migrate 228 หน้า — แค่ redirect

---

## Tier A — ทำมือ (22 หน้า)

Service pages ที่มี traffic + revenue intent จริง — ต้องเขียนใหม่เต็มรูปแบบ

### 🔴 Priority สูงสุด (ทำก่อน)

| URL | Views | หมายเหตุ |
|-----|-------|---------|
| `/food-intolerance` | 3,903 | **~40% ของ traffic ทั้งหมด** — ทำก่อนเพื่อน |
| `/adrenal-fatigue` | 1,421 | — |
| `/hormones-quiz` | 1,344 | Quiz ที่ agency นับเป็น conversion — ต้องมี tracking ที่ถูกต้อง |
| `/hbot` | 705 | — |

### 🟠 Priority กลาง

| URL | Views | หมายเหตุ |
|-----|-------|---------|
| `/iv-drip` | 492 | Core service |
| `/` (homepage) | 465 | — |
| `/gluta` | 252 | — |
| `/chelation` | 187 | CPC สูง จาก Ads — ต้องปรับ copy |
| `/personalized-vitamins` | 148 | — |
| `/nad` | 120 | — |
| `/nk-cell` | 116 | — |

### 🟡 Priority รอง

| URL | Views | หมายเหตุ |
|-----|-------|---------|
| `/allergy-ige` | 74 | — |
| `/urine-organic-test` | 55 | — |
| `/vitamin-d` | 47 | — |
| `/doctors` | 45 | — |
| `/about` | 35 | — |
| `/check-up` | 38 | — |
| `/vitamins-and-micronutrients` | 42 | — |
| `/oligoscan` | 25 | — |
| `/cancer-screening` | 24 | — |
| `/dna-test` | 18 | — |
| `/contact` | 4 | ⚠️ ต่ำมาก — ต้องตรวจ UX และ internal linking |

---

## Tier B — AI Batch (top ~50 blog posts)

Blog posts `/post/*` ที่มี views > 50 — ใช้ toprank audit แล้ว AI rewrite

| URL | Views |
|-----|-------|
| `/post/กลืนลมพิษ` | 627 |
| `/post/abnormal-period` | 404 |
| `/post/mental-health` | 383 |
| `/post/apple-benefit` | 372 |
| `/post/ashwagandha` | 343 |
| `/post/smiling-depression` | 285 |
| `/post/zinc-checklist` | 272 |
| `/post/chili` | 243 |
| `/post/ประจำเดือน` | 215 |
| `/post/menorrhagia` | 210 |
| `/post/longcovid-19` | 200 |
| `/post/iv-drip` | 187 |
| `/post/อาหารที่มี probiotic` | 181 |
| `/post/เรื่อง sle` | 172 |
| ... (ดู CSV สำหรับรายการเต็ม) | — |

**เกณฑ์ cut-off:** views < 50 → ย้ายไป Tier C

---

## Tier C — Redirect (ประมาณ 228 หน้า)

ทุกหน้าที่ views < 20 ใน 28 วัน → 301 redirect ไปหน้า Tier A/B ที่ topic ใกล้เคียง

**ตัวอย่าง redirect logic:**
```
/post/vitamin-* → /personalized-vitamins
/post/hormone-* → /adrenal-fatigue หรือ /hormones-quiz
/post/iv-* → /iv-drip
/blog/categories/* → /blog
/members-area/* → / (homepage)
/health-concerns/* → หน้า service ที่ตรงกัน
```

---

## สิ่งที่ต้องระวัง

1. **`/food-intolerance` = 40% traffic** — ถ้าหน้านี้ down หรือ SEO drop จะกระทบหนักมาก
2. **`/hormones-quiz`** — ปัจจุบัน agency นับ quiz completion เป็น primary conversion → ต้องตั้ง conversion ใหม่ใน Google Ads account ใหม่
3. **`/contact` = 4 views** — ต่ำผิดปกติ ตรวจ internal link และ CTA ทุกหน้าก่อน migrate
4. **`/chelation`** — มี Ads budget ยิงอยู่แต่ CPC สูง — ควร pause ใน new Ads account และรอดู organic

---

## ลำดับการทำ

```
Phase 2A (พ.ค.–มิ.ย.)
├── toprank audit Tier A ทั้ง 22 หน้า
├── เขียน Astro components ตาม audit checklist
└── ตั้ง 301 redirect สำหรับ Tier C

Phase 2B (มิ.ย.–ก.ค.)
├── toprank batch audit Tier B (top 50 blog)
├── AI rewrite content
└── Human spot-check 10–15 หน้า

Phase 6 (ต.ค.–พ.ย. ก่อน Wix หมด)
└── DNS cutover + ปิด Wix
```

---

*อัปเดตล่าสุด: 2026-04-25*
