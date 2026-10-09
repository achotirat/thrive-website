---
name: thrive-site-optimize
description: >
  Implement approved findings from a thrive-site-review report on the Thrive Wellness
  Astro site (achotirat/thrive-website), with an approval gate before planning, before
  pushing, and before merge/deploy. Works on a feature branch, verifies with astro check,
  build and tests, opens a PR with a Netlify deploy preview, and logs every change in
  README.md. Use for "optimize", "แก้ตาม review", "fix R261009-A03", or deploying
  approved website fixes.
---

# Thrive Site Optimize

ขั้นที่ 3 ของ 3 (`thrive-site-inspect` → `thrive-site-review` → optimize)
**ทุกขั้นที่เปลี่ยนสิ่งที่คนอื่นเห็นต้องได้รับอนุมัติจากคุณเต็ม (Satemshi) ในรอบนั้นๆ** การอนุมัติครั้งก่อนไม่นับ

## กฎของ repo ที่ต้องทำตาม (จาก `CLAUDE.md`)

- ห้าม push ไป `main`, ใช้ branch `feature/<scope>` จาก `origin/main` ล่าสุด, 1 เรื่อง = 1 branch = 1 PR
- ห้ามแก้ `*.html` ที่ root และ `thrive-styles.css`, ห้ามเพิ่ม Tailwind
- คง URL เดิม, Tier A แก้ใน `astro/src/content/*.mdx`
- ก่อน commit: `npx astro check`, `npm run build`, `npm test` (ใน `astro/`)

## Gate 1: เลือกและวางแผน

1. อ่าน `docs/site-reports/<date>/review.md` ล่าสุด รับ ID ที่ผู้ใช้อนุมัติ (ถ้าไม่ระบุ ให้เสนอ P0/P1 ที่ `แก้ที่ = astro|netlify` ไม่เกิน 5 ข้อ)
2. จัดกลุ่มเป็น batch ตามเรื่อง (1 batch = 1 PR) เช่น `redirects`, `meta-titles`, `ad-copy-hbot`
3. แสดงแผนต่อ batch แล้ว**รออนุมัติ**:

```
Batch: <ชื่อ>  → branch feature/optimize-<ชื่อ>
Findings: R261009-A03, R261009-B01
ไฟล์ที่จะแก้: astro/src/content/services/hbot.mdx (บรรทัด 40 ถึง 62), ...
ก่อน → หลัง: (ยกข้อความจริงทุกจุดที่เปลี่ยนคำ)
ความเสี่ยง / วิธีย้อนกลับ: revert PR
```

ประเภทที่ต้องแยก batch และขออนุมัติพิเศษ:
- **ถ้อยคำหมวด D (กฎโฆษณา):** เสนอทางเลือก 2 แบบ ให้ผู้ใช้เลือก ห้ามเลือกเอง และบอกว่าควรให้ผู้เชี่ยวชาญตรวจก่อน merge
- **Cutover** (ลบ noindex, เปลี่ยนโดเมน, `robots.txt`, redirect ทั้งหมดจาก Wix, DNS): ทำตาม `docs/LAUNCH-FIX-MANUAL.md` §4 เท่านั้น ห้ามรวมกับเรื่องอื่น
- **Sanity** (blog/doctor/testimonial อยู่ใน dataset `production`): Claude ไม่มีสิทธิ์ Sanity ให้ส่งรายการแก้ (เอกสาร, field, ก่อน → หลัง) ให้ vkasama หรือคุณเต็มแก้ใน Studio หรือเขียนสคริปต์ใน `astro/scripts/` ที่มี `--dry-run` เป็นค่าเริ่มต้น และให้คุณเต็มรันเอง
- **คำแบรนด์ที่ยังเป็นร่าง** (tagline สั้น, Pillar C): ห้ามใส่บนเว็บ

## Implement

```bash
git fetch origin && git switch -c feature/optimize-<batch> origin/main
```

- แก้ให้น้อยที่สุดตามแผนที่อนุมัติ ถ้าเจอปัญหาอื่นระหว่างทาง ให้จดไว้ ห้ามแก้เพิ่มนอกแผน
- คงสไตล์ของไฟล์เดิม (frontmatter, component, class name)
- ถ้าแก้ title/description ให้คง keyword ที่หน้านั้นติดอันดับอยู่ (ดู `url-map.csv` / Ubersuggest)

## Verify (ต้องผ่านทุกข้อก่อนเสนอ commit)

```bash
cd astro && npx astro check && npm run build && npm test
```

- ตรวจ `astro/dist/` ว่าเปลี่ยนตามที่ตั้งใจ (grep title/meta/ข้อความในหน้า HTML ที่ build ออกมา)
- grep คำที่เลิกใช้และ pattern สูงใน `thrive-site-review/references/thai-medical-ad-flags.md` อีกครั้ง ต้องไม่เพิ่มขึ้น
- ถ้าแก้ redirect: ทดสอบด้วย `curl -sI` บน deploy preview ว่าได้ 301 ไป URL ที่ถูก
- ถ้าแก้ UI: screenshot 390px และ 1440px ผ่าน Chrome บน `npm run preview` หรือ deploy preview

ถ้า verify ไม่ผ่าน: หยุด รายงานผลจริงพร้อม output แล้ววางแผนใหม่ ห้ามข้าม

## บันทึกใน README.md

เพิ่ม entry ใหม่**ใต้หัวข้อ Claude Skills** (บนสุดของ change log) ตามรูปแบบเดิมของไฟล์:

```
## <YYYY-MM-DD> — <ชื่อ batch>

**คำสั่งจากผู้ใช้:** ...
**Findings:** R261009-A03, ...

### สิ่งที่เปลี่ยน
- `ไฟล์` — ก่อน → หลัง

### ผลการตรวจ
- astro check / build / test: ผ่าน
- deploy preview: <url>

### วิธีย้อนกลับ
- revert PR #<n>
```

แล้วอัปเดตสถานะใน `review.md` (คอลัมน์หรือหมายเหตุ: `แก้แล้ว PR #<n>`) โดยไม่เปลี่ยน ID

## Gate 2: commit + push + PR

แสดง `git diff --stat` และสรุป แล้ว**รออนุมัติ**ก่อน push จากนั้น:

```bash
git push -u origin feature/optimize-<batch>
gh pr create --base main --title "<type>(<scope>): ..." --body "<สรุป + findings + ผล verify + วิธีย้อนกลับ>"
```

รอ Netlify deploy preview แล้วตรวจหน้าที่แก้บน preview URL รายงานลิงก์ PR + preview

## Gate 3: merge = deploy

Merge เข้า `main` = deploy ขึ้น new.thrivewellnessth.com (และขึ้น www หลัง cutover)
- merge เมื่อผู้ใช้สั่งชัดเจนในข้อความนั้นเท่านั้น (`gh pr merge <n> --merge`) ไม่อย่างนั้นปล่อยให้คุณเต็ม merge เอง
- หลัง merge: curl หน้าที่แก้บน production ยืนยันว่าเปลี่ยนแล้ว รายงานผล
