# หน้าที่มีข้อมูล พญ. ชนากานต์ ตระหง่านศรี (หมอนุ่น)

**Chanakan Trangansri, MD.**  
JSON-LD `@id`: `https://www.thrivewellnessth.com/#dr-chanakan`  
Doctor photo: `image/dr-chanakan-trangansri-thrive-400x400.jpg`

---

## ✅ หน้าที่ใส่ข้อมูลหมอนุ่นแล้ว

| ไฟล์ HTML | URL | ส่วนที่ใส่ | วันที่ |
|-----------|-----|-----------|--------|
| `food-intolerance.html` | `/food-intolerance` | Doctor section + JSON-LD Person | 2026-05-08 |
| `adrenal-fatigue.html` | `/adrenal-fatigue` | Doctor section + JSON-LD Person | 2026-05-08 |

---

## ⏳ หน้าที่ยังรอ rebuild (ยังไม่มีข้อมูลหมอนุ่น)

| ไฟล์ HTML | URL | หมายเหตุ |
|-----------|-----|---------|
| `index.html` | `/` | ควรมี brief doctor mention |
| `about.html` | `/about` | ควรมี full doctor profile |
| `hbot.html` | `/hbot` | ควรมี doctor attribution |
| `iv-drip.html` | `/iv-drip` | ควรมี doctor attribution |
| `check-up.html` | `/check-up` | ควรมี doctor attribution |
| `nad-plus.html` | `/nad` | ควรมี doctor attribution |
| `health-architect.html` | `/health-architect` | ควรมี doctor attribution |

---

## วิธีเพิ่มข้อมูลหมอนุ่น (checklist)

เมื่อ rebuild หน้าใดก็ตาม ให้ใส่ทั้ง 2 ส่วนนี้:

### 1. JSON-LD Person (ใน `@graph`)
```json
{
  "@type": "Person",
  "@id": "https://www.thrivewellnessth.com/#dr-chanakan",
  "name": "พญ. ชนากานต์ ตระหง่านศรี",
  "alternateName": "Chanakan Trangansri, MD.",
  "jobTitle": "แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ",
  "worksFor": {"@id": "https://www.thrivewellnessth.com/#clinic"},
  "knowsAbout": [
    "Anti-aging and Regenerative Medicine",
    "Nutrition Wellness",
    "Lifestyle Medicine",
    "Anti-Aging Hormone Balance",
    "Weight Management",
    "Chelation and Detoxification"
  ],
  "image": "https://www.thrivewellnessth.com/image/dr-chanakan-trangansri-thrive-400x400.jpg"
}
```

### 2. Doctor Section HTML (copy-paste)
```html
<div style="display:flex;gap:32px;align-items:flex-start;background:var(--white);border:1px solid var(--border);border-radius:var(--r-xl);padding:36px 32px;box-shadow:var(--sh-md);flex-wrap:wrap">
  <div style="flex-shrink:0;text-align:center">
    <img
      src="image/dr-chanakan-trangansri-thrive-400x400.jpg"
      alt="พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น Thrive Wellness Clinic"
      style="width:140px;height:140px;border-radius:50%;object-fit:cover;border:3px solid var(--teal-l);box-shadow:var(--sh-md);"
      loading="lazy">
    <p style="margin-top:10px;font-size:.78rem;color:var(--text-3);">หมอนุ่น</p>
  </div>
  <div style="flex:1;min-width:240px">
    <h3 style="font-size:1.15rem;font-weight:800;color:var(--navy);margin-bottom:4px;">พญ. ชนากานต์ ตระหง่านศรี</h3>
    <p style="font-size:.85rem;color:var(--teal-d);font-weight:600;margin-bottom:16px;">Chanakan Trangansri, MD.</p>
    <p style="font-size:.875rem;color:var(--text-2);margin-bottom:14px;line-height:1.7">[ใส่ประโยคอธิบายความเชี่ยวชาญที่เกี่ยวข้องกับหน้านั้นๆ]</p>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      <span style="background:var(--teal-l);color:var(--teal-d);padding:5px 13px;border-radius:var(--r-pill);font-size:.75rem;font-weight:600;">Anti-aging Medicine</span>
      <span style="background:var(--teal-l);color:var(--teal-d);padding:5px 13px;border-radius:var(--r-pill);font-size:.75rem;font-weight:600;">Nutrition Wellness</span>
      <span style="background:var(--teal-l);color:var(--teal-d);padding:5px 13px;border-radius:var(--r-pill);font-size:.75rem;font-weight:600;">Lifestyle Medicine</span>
      <span style="background:var(--navy-l);color:var(--navy);padding:5px 13px;border-radius:var(--r-pill);font-size:.75rem;font-weight:600;">Hormone Balance</span>
      <span style="background:var(--navy-l);color:var(--navy);padding:5px 13px;border-radius:var(--r-pill);font-size:.75rem;font-weight:600;">Weight Management</span>
      <span style="background:var(--navy-l);color:var(--navy);padding:5px 13px;border-radius:var(--r-pill);font-size:.75rem;font-weight:600;">Chelation &amp; Detox</span>
    </div>
  </div>
</div>
```

อัปเดตตาราง "✅ หน้าที่ใส่ข้อมูลหมอนุ่นแล้ว" ด้านบนทุกครั้งที่ rebuild หน้าใหม่เสร็จ
