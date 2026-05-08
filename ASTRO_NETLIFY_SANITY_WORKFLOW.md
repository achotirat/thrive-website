# Workflow การทำเว็บ Astro + Netlify + Sanity

โปรเจกต์นี้แบ่งหน้าที่ชัดเจน:

- **Satemshi:** admin / developer / backend / deployment
- **vkasama:** ดูแล content ทั้งหมดใน Sanity

## เครื่องมือที่ใช้

- **Astro:** ใช้ทำ frontend website
- **Sanity:** ใช้จัดการ content
- **Netlify:** ใช้ deploy เว็บไซต์
- **Git repo:** ใช้เก็บ source code และ track การเปลี่ยนแปลง

## หน้าที่ของ Satemshi

Satemshi ดูแลฝั่ง technical ทั้งหมด เช่น:

- ตั้งค่า Git repo
- พัฒนาเว็บด้วย Astro
- เชื่อม Astro กับ Sanity
- ตั้งค่า Netlify deployment
- ดูแล domain, environment variables, API keys
- สร้าง schema/content structure ใน Sanity
- แก้ bug และดูแลระบบหลังบ้าน
- ตรวจและ deploy production

## หน้าที่ของ vkasama

vkasama ดูแล content ใน Sanity เช่น:

- เพิ่ม/แก้ไขข้อความบนเว็บไซต์
- เพิ่มรูปภาพ
- จัดการหน้า service / treatment / blog / promotion
- ตรวจความถูกต้องของ content
- กด publish content ใน Sanity ตาม workflow ที่ตกลงกัน

vkasama ไม่จำเป็นต้องแก้ code และไม่จำเป็นต้องใช้ Git โดยตรง

## Workflow การทำงาน

1. Satemshi สร้างโครงสร้างเว็บและ content schema ใน Sanity
2. vkasama เพิ่มหรือแก้ไข content ผ่าน Sanity Studio
3. เมื่อ content ถูก publish แล้ว เว็บไซต์จะดึงข้อมูลจาก Sanity
4. Netlify build/deploy เว็บไซต์ตาม setup ที่ Satemshi ตั้งไว้
5. ถ้ามีการเปลี่ยนโครงสร้างหน้าเว็บหรือ schema ใหม่ Satemshi เป็นคนทำ
6. ถ้าเป็นการแก้ข้อความ รูป หรือบทความ vkasama ทำผ่าน Sanity ได้เลย

## สิทธิ์การเข้าถึง

แนะนำให้กำหนดสิทธิ์แบบนี้:

| Person | Git repo | Netlify | Sanity |
| --- | --- | --- | --- |
| Satemshi | Admin | Admin | Admin |
| vkasama | ไม่จำเป็น | ไม่จำเป็น หรือ view-only ถ้าต้องดู deploy | Editor / Content Manager |

## กติกาเรื่อง Content

ก่อน publish content ควรเช็ก:

- ข้อความถูกต้อง
- รูปภาพเหมาะสม
- ชื่อ service / treatment ถูกต้อง
- ราคา, promotion, contact info ถูกต้อง
- SEO title / description ถ้ามี
- slug URL ไม่ซ้ำและอ่านง่าย

ตัวอย่าง slug ที่ดี:

```text
iv-drip
laser-hair-removal
facial-treatment
weight-management
```

## สิ่งที่ vkasama ควรรู้

- แก้ content ผ่าน Sanity เท่านั้น
- ไม่ต้องแก้ไฟล์ code
- ไม่ต้อง push Git
- ถ้าอยากเพิ่ม field ใหม่ เช่น ราคา, หมวดหมู่, before/after, FAQ ให้แจ้ง Satemshi เพื่อเพิ่ม schema
- ถ้า content publish แล้วเว็บยังไม่เปลี่ยนทันที อาจต้องรอ build/deploy หรือแจ้ง Satemshi ให้ตรวจ Netlify
- รูปภาพควรตั้งชื่อให้เข้าใจง่าย และเลือกขนาด/คุณภาพเหมาะสม

## สรุปสั้นๆ

Satemshi ดูแลระบบและโค้ดทั้งหมด  
vkasama ดูแล content ทั้งหมดผ่าน Sanity

vkasama ไม่ต้องยุ่งกับ Git, Netlify หรือ code โดยตรง แค่ใช้ Sanity เป็นหลังบ้านสำหรับเพิ่ม/แก้ไข content ส่วน Satemshi ดูแลโครงสร้างเว็บ ระบบ deploy และ technical setup ทั้งหมด

