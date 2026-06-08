# Design Spec: Homepage, Contact Page, Phase 3 Plan
Date: 2026-05-15
Status: Approved by Satemshi

---

## 1. Homepage (`/` → `astro/src/pages/index.astro`)

### Goal
Convert both paid-search visitors (intent: book) and organic visitors (intent: browse) into leads. The homepage is the last major missing page in Phase 2.

### Layout: Explore-then-convert (approved)
Hero → Services → Doctor trust → Testimonials → Lead form → Footer

### Sections

#### 1.1 Hero
- Background: dark teal gradient (matching brand)
- H1: **"เหนื่อยไม่หาย ไม่ใช่เรื่องปกติ"**
- Subline: references top symptoms (ภูมิแพ้แฝง · ฮอร์โมนแปรปรวน · Adrenal Fatigue) and positions Thrive as finding root cause, not just treating symptoms
- 2 CTA buttons: primary "นัดปรึกษาฟรี" (scrolls to lead form) · secondary "ดูบริการทั้งหมด" (scrolls to services)
- 3 stat badges: "7+ ปีดูแลสุขภาพเชิงลึก" · "5,000+ คนที่ไว้ใจให้เราดูแล" · "20+ โปรแกรมเฉพาะบุคคล"
- Hero image: existing `/og-image.jpg` as fallback; use clinic photo when available

#### 1.2 Services Section
Layout: featured card (food-intolerance) + compact 2-column grid

**Featured card** — `/food-intolerance`:
- Large horizontal card with icon, Thai name, EN name, one-line hook ("ท้องอืด ผิวลาย เหนื่อยตลอด? อาจเกิดจากอาหารที่กินทุกวัน")
- "ดูเพิ่มเติม →" button linking to `/food-intolerance`
- Rationale: 40% of all site traffic, highest conversion intent

**Compact grid** — remaining top services (2-col, icon + Thai name + link):
1. Adrenal Fatigue (`/adrenal-fatigue`)
2. ตรวจฮอร์โมน (`/hormones-quiz`)
3. HBOT (`/hbot`)
4. IV Drip (`/iv-drip`)
5. Glutathione IV (`/gluta`)
6. "ดูทั้งหมด 14+ บริการ →" tile linking to `/about` (the about page lists all 15 services; a dedicated /services page is out of scope this cycle)

Section label: "บริการ" | H2: "เลือกโปรแกรมที่ตรงกับคุณ"

#### 1.3 Doctor Trust Section
- Reuse the `DoctorAttribution` component pattern from existing service pages
- Photo: `dr-chanakan-trangansri-thrive-400x400.jpg`
- Name: พญ. ชนากานต์ ตระหง่านศรี (หมอนุ่น)
- Specialisations: Anti-aging & Regenerative Medicine · Nutrition Wellness · Lifestyle Medicine · Hormone Balance
- Short trust copy: why Functional Medicine, root-cause approach
- CTA: "ปรึกษาหมอนุ่นฟรี" → scrolls to lead form

#### 1.4 Testimonials
3 mockup cards (placeholder until real testimonials are available):
- Card 1: Female patient, food intolerance programme, symptom resolution story
- Card 2: Male patient, IV drip + adrenal fatigue, energy improvement story
- Card 3: Female patient, hormone check + personalized vitamins, wellbeing story
Each card: quote (Thai), first name + initial, service name tag, 5-star rating

Mark with HTML comment `<!-- TODO: replace with real testimonials from Sanity when available -->`

#### 1.5 Lead Form
- Reuse `<LeadForm>` component with `serviceSlug="homepage"`
- Standard fields: name, phone, LINE, message, consent checkbox, Turnstile
- Attribution hidden fields pre-filled from sessionStorage (existing behaviour)

#### 1.6 FAQ (5 questions)
General clinic FAQ covering:
1. ต้องนัดล่วงหน้าไหม?
2. Thrive ต่างจากคลินิกทั่วไปอย่างไร?
3. ราคาโดยประมาณเป็นอย่างไร?
4. ผลตรวจออกเร็วแค่ไหน?
5. มีบริการสำหรับชาวต่างชาติไหม?

### SEO
- `<title>`: Thrive Wellness Center Bangkok — ดูแลสุขภาพแบบองค์รวมในระดับเซลล์
- Meta description: covers root-cause approach, key services, location
- Canonical: `/`
- JSON-LD: MedicalClinic (full) + WebSite + BreadcrumbList
- OG/Twitter: full 7-tag set, image `/og-image.jpg`
- `noIndex: false`

---

## 2. Contact Page (`/contact` → `astro/src/pages/contact.astro`)

### Goal
Close appointment intent. Every internal CTA links here. Must remove all friction between "I want to book" and "I have booked."

### Layout: Channels-first (approved)
LINE + Phone prominently at top → Address/hours → Lead form → Getting here → Footer

### Sections

#### 2.1 Page Header
- H1: "ติดต่อและนัดหมาย"
- Subline: "เลือกช่องทางที่สะดวกที่สุดสำหรับคุณ"
- No service-hero image needed — keep it focused on action

#### 2.2 Channels Block (primary conversion section)
3 big tap-friendly channel cards side-by-side (or stacked on mobile):

| Channel | Colour | Label | Action |
|---------|--------|-------|--------|
| LINE | `#06c755` (LINE green) | LINE @thrivewellnessth | `https://line.me/R/ti/p/@thrivewellnessth` |
| โทร | Brand teal `#0d4a47` | 095-934-9640 | `tel:+66959349640` |
| Walk-in | Amber | เดอะ คริสตัล ชั้น 2 | Google Maps link |

All 3 have `data-gtm-event` attributes: `line_click`, `call_click`, `walkin_click`

#### 2.3 Clinic Info Bar
4-column info strip:
- 📍 ที่ตั้ง: ชั้น 2 อาคาร B เดอะ คริสตัล เอกมัย-รามอินทรา กรุงเทพฯ 10230
- ⏰ เวลา: เปิดทุกวัน 10:00–19:00 น.
- 📞 โทร: 095-934-9640
- 💬 LINE: @thrivewellnessth

#### 2.4 Lead Form
- `<LeadForm serviceSlug="contact" formTitle="แบบฟอร์มนัดหมาย" />`
- Intro copy: "ต้องการให้เราติดต่อกลับ? ฝากข้อมูลไว้ได้เลย ทีมงานจะตอบกลับภายใน 1 วันทำการ"

#### 2.5 Getting Here
3-col transport cards (existing content, keep):
- MRT: สถานีรามอินทรา กม. 4
- BTS: ลงสถานีเอกมัย
- รถยนต์: ที่จอดรถภายในเดอะ คริสตัล

#### 2.6 Final CTA
`<CTASection>` — LINE-focused:
- Headline: "สะดวกคุยทาง LINE?"
- Primary: เพิ่มเพื่อน LINE
- Secondary: โทร 095-934-9640

### SEO
- Keep existing JSON-LD (MedicalClinic + ContactPage + BreadcrumbList) — already correct
- Fix address in JSON-LD: currently says "เดอะ คริสตัล เอกมัย-รามอินทรา" — must match canonical address "199 ถนนประดิษฐ์มนูธรรม ลาดพร้าว กรุงเทพฯ 10230"
- `noIndex: false`

---

## 3. Phase 3 — Ads From Scratch (Revised)

### Context
The ads agency ends June 2026. There is no account handover — Google Ads must be built from zero under Thrive's ownership. A 10-day overlap (Jun 1–11) lets Thrive observe and document the agency's campaigns before they stop.

### Exit Criteria
By June 1: 3 Thrive-owned Google Ads campaigns are live, conversion tracking is verified end-to-end (test click → GCLID in Supabase → Google Ads conversion), and Astro landing pages are deployed to `new.thrivewellnessth.com`.

### Week 1 — May 15–22: Tracking Infrastructure

| Task | Owner | Notes |
|------|-------|-------|
| GTM snippet installed on Astro staging + prod | Satemshi | Add to `BaseLayout.astro` head |
| GA4 property confirmed, data stream live | Satemshi | Verify pageview events firing |
| GTM trigger: `form_start` | AI/Satemshi | Already pushed to dataLayer in LeadForm.astro |
| GTM trigger: `lead_submit` | AI/Satemshi | **LeadForm.astro currently fires `form_submit` — must be renamed to `lead_submit` to match master_plan.md canonical event names before GTM trigger is configured** |
| GTM trigger: `line_click` | AI/Satemshi | `data-gtm-event="line_click"` on all LINE buttons |
| GTM trigger: `call_click` | AI/Satemshi | `data-gtm-event="call_click"` on all tel: links |
| New Google Ads account created under Thrive | Satemshi | Use achotirat@gmail.com as owner |
| Google Ads ↔ GA4 linked | Satemshi | Via Google Ads > Tools > Linked accounts |
| Conversion action `lead_submit` in Google Ads | Satemshi | Import from GA4 goal |

### Week 2 — May 22–29: Campaign Structure + Creatives

Use the shared UTM naming rules in `docs/utm-naming-standard.md` for all final campaign URLs.

**3 initial campaigns:**

| Campaign | Landing page | Keyword focus |
|----------|-------------|---------------|
| ภูมิแพ้อาหารแฝง | `/food-intolerance` | ตรวจภูมิแพ้อาหารแฝง, food intolerance test bangkok, IgG test |
| Adrenal Fatigue + ฮอร์โมน | `/adrenal-fatigue`, `/hormones-quiz` | ต่อมหมวกไตล้า, adrenal fatigue, ตรวจฮอร์โมน, hormone test bangkok |
| IV Drip + HBOT | `/iv-drip`, `/hbot` | IV drip bangkok, vitamin drip, HBOT bangkok, ออกซิเจนความดันสูง |

Each campaign: 3 ad groups, 3 RSA ad variations per group, exact + phrase match keywords, negative keyword list (free, DIY, cheap).

Bidding: Manual CPC to start. Move to Target CPA after 30+ conversions accumulated.
Budget: Satemshi to confirm daily budget per campaign.

### June 1 Checklist (Before Campaigns Go Live)
- [ ] All 3 campaigns reviewed and approved by Satemshi
- [ ] Conversion tracking verified: submit test lead → confirm GCLID in Supabase + conversion fires in Google Ads
- [ ] Astro pages deployed to `new.thrivewellnessth.com` (landing pages live)
- [ ] All campaigns set to Active

### June 1–11 Overlap: Document Agency Campaigns
- Screenshot agency campaign structure, ad groups, keywords, bids, ad copy
- Note which campaigns/keywords drove conversions
- Run Thrive campaigns in parallel — use overlap data to adjust bids
- Deliverable: saved reference doc of agency campaign structure

### After June 11: Ongoing Ritual
- Weekly review: leads from Supabase vs Google Ads spend
- Optimise: pause low-CTR keywords, increase budget on converting ad groups
- Campaign 4 (chelation, NK cell, DNA test) once first 3 are stable
- Move to Target CPA bidding at 30+ conversions
- Add call extensions and sitelink extensions to all campaigns

---

## 4. Implementation Notes

### Files to create/modify
- `astro/src/pages/index.astro` — full rebuild (currently stub)
- `astro/src/pages/contact.astro` — rebuild with channels-first layout
- `docs/phase3-google-ads-setup.md` — Google Ads setup checklist for Satemshi

### Dependencies
- `LeadForm.astro`, `DoctorAttribution.astro`, `CTASection.astro`, `FAQSection.astro` — all exist, reuse as-is
- Doctor photo `dr-chanakan-trangansri-thrive-400x400.jpg` — already in `image/`
- GTM snippet — Satemshi to provide GTM container ID before homepage is deployed

### Out of scope for this spec
- Blog or Sanity integration
- Google Maps embed (contact page uses address text + link)
- Real testimonials (mockups until Sanity Tier B content phase)
- Meta Pixel / CAPI
