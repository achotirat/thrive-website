# Thrive Digital Platform — Revised Plan v2 (21 Apr 2026)

Supersedes: `PLAN.md`, `Plan_revised21Apr2026.md`
Owner: achotirat@gmail.com
Team: 2 people + AI
Key deadlines: **Ads agency ends June 2026**, **Wix subscription ends ~Nov 2026**

---

## 1. What Changed vs Original PLAN.md

| หัวข้อ | PLAN.md เดิม | Revised v2 |
|--------|--------------|------------|
| Team size assumption | ไม่ระบุ | **2 คน + AI — scope ต้องแคบ** |
| Dashboard rebuild | Port ไปเป็น Next.js ทั้งระบบ | **Keep existing Vite React dashboard** — harden + extend เท่านั้น |
| Site rebuild | Astro+Sanity "later" | **Astro+Sanity เริ่มทันที** — ต้อง cutover ก่อน Nov |
| Ads tracking | ไม่พูดถึง | **Critical path** — ต้องพร้อมก่อน agency ออก มิ.ย. |
| Auth | Clerk/Supabase Auth | **Phase-based:** temporary gate now, **Clerk later** |
| Lead backend | Postgres ใหม่ | **Supabase** for leads/workflow + existing **RDS MySQL read-only** |
| Mobile redirect | อยู่ใน main plan | **Move to backlog experiment** |

**เหตุผล:** ทีมเล็กทำไม่ทันถ้า rebuild dashboard ไปด้วย + สร้าง site ใหม่ + ตั้ง ads stack ไปด้วย ต้องเลือกอย่างเดียวที่ rebuild เต็มสูบ = **ตัว site ใหม่ (Astro+Sanity)** เพราะ Wix deadline บังคับ

---

## 2. Core Decisions Locked in v2

### Deployment decision

| Layer | Decision |
|------|----------|
| Dashboard frontend | **Netlify** |
| New marketing site | **Netlify or Vercel** |
| API | **EC2 + Nginx + PM2/systemd** |
| Dashboard domain | `app.thrivewellnessth.com` |
| API domain | `api.thrivewellnessth.com` |

**Rule:** do not deploy the hardened dashboard frontend to production until `api.thrivewellnessth.com` is live and tested.

### Auth roadmap

| Phase | Dashboard auth | API auth |
|------|-----------------|----------|
| Phase 0 | Temporary frontend password gate | Static API token |
| Phase 1-3 | Temporary gate still acceptable | Static API token + origin restriction |
| Phase 4+ | Clerk login | Clerk-backed server-side auth |

**Meaning:** the current password gate is a temporary bridge only. It is not the target architecture.

### Tracking roadmap

**Must-have before June**
- GTM
- GA4
- UTM + gclid capture
- lead storage
- simple funnel reporting

**Later**
- Meta CAPI
- Google Ads Enhanced Conversions server-side
- Google Ads API cost join
- deeper attribution analysis

---

## 3. Goals (เรียงตาม priority จริง)

1. **Self-optimize ads ได้หลัง มิ.ย.** — ต้องมี tracking + lead capture + simple reporting ก่อน agency ออก
2. **Secure customer data** — ปิดการรั่วของ `public/data/*.json` และ deploy ของจริงให้เรียบร้อย
3. **Dashboard อ่านผ่าน authenticated API เท่านั้น**
4. **New site live ก่อน Nov** — Astro+Sanity ที่เร็วกว่า Wix
5. **Lead capture ทำงาน end-to-end** — form → API → database → dashboard
6. **Full cutover ก่อน Wix หมดอายุ**

---

## 4. Scope Cut

**ตัดออก**
- ❌ Next.js rebuild ของ dashboard
- ❌ Role system ใหญ่ (admin/manager/sales rep/marketing)
- ❌ Patient portal
- ❌ Writing กลับ PMS database
- ❌ Multi-touch attribution เต็มรูปแบบ

**เลื่อน**
- ⏸ CSV export และ advanced filters ใน lead inbox
- ⏸ Full migration content ทุกบทความในเฟสต้น
- ⏸ Mobile redirect experiment
- ⏸ Meta CAPI / Enhanced Conversions server-side แบบเต็ม

---

## 5. Architecture (Target State, Nov 2026)

```text
Public internet
    |
    |--> www.thrivewellnessth.com (Wix, transition period)
    |--> new.thrivewellnessth.com (Astro + Sanity)
    |--> app.thrivewellnessth.com (Dashboard frontend on Netlify)
                                      |
                                      | HTTPS
                                      v
                              api.thrivewellnessth.com
                              (EC2 + Nginx + Node/Express)
                                      |
                    -----------------------------------------
                    |                                       |
                    v                                       v
             Supabase Postgres                       RDS MySQL
             leads / workflow                        PMS analytics
                                                     read-only only
```

### Tracking
- Google Ads -> GTM -> GA4
- UTM/gclid/fbclid stored on lead
- Later: Enhanced Conversions + Meta CAPI

### Data access rule

- **Do not query PMS / RDS in realtime for dashboard page loads**
- Run sync **once per day at 22:00** after clinic closing time
- Dashboard reads from **private precomputed snapshot data** served by API
- Public website lead capture can still write new leads immediately, but historical PMS analytics should refresh on schedule, not on every request

---

## 6. EC2 Position and Operational Safety

### Short answer
EC2 **ใช้ได้** และ practical มากสำหรับ API ตัวนี้ แต่ **ต้องถือว่า clinic operations สำคัญกว่า dashboard/API เสมอ**

### Principle
ถ้า EC2 ตัวเดียวกันกำลังรันระบบที่กระทบเซลล์หน้าร้านอยู่แล้ว เราจะ **ไม่ deploy แบบแชร์ resource แบบมั่วๆ**

### Minimum safeguards before production
- แยก `thrive-api` เป็นคนละ `pm2` process
- ตั้ง memory restart limit
- วัด CPU / RAM / swap baseline ก่อน deploy
- เพิ่ม uptime monitoring
- จำกัด Node API traffic ผ่าน Nginx
- ให้ PMS/RDS sync รัน **22:00 ทุกวัน** หลังคลินิกปิด
- ห้าม dashboard ยิง query ไป DB production แบบ realtime
- ถ้าเครื่องปัจจุบัน RAM เหลือน้อย ให้ **upgrade instance ก่อน** หรือแยก API ไป host ใหม่

### Decision rule
- ถ้า deploy test แล้ว CPU/RAM ขยับน้อยและไม่มีผลกับ Java/PMS workload -> ใช้ EC2 เดิมได้
- ถ้า memory ตึง, swap หนัก, response time ระบบเดิมแย่ลง -> **ย้าย API ออก** หรือ upgrade EC2 ทันที

**Business rule:** ห้ามเอา dashboard/analytics workload ไปเสี่ยงทำให้ระบบหน้าร้านช้าลง

---

## 7. Phased Timeline

### Phase 0 — Security Fix & Deployment Foundation (NOW, 21–30 Apr)
**Blocker for everything else**

- [ ] Deploy commit `411641f` equivalent hardening changes now in current branch/history
- [ ] Push dashboard security fix to GitHub
- [ ] Set up `api.thrivewellnessth.com` -> EC2 + Nginx + Let's Encrypt
- [ ] Deploy `thrive-api` via `pm2` + systemd
- [ ] Change PMS/RDS sync schedule to **22:00 every day**
- [ ] Make dashboard/API read from private synced snapshot files or snapshot tables, not live DB queries per request
- [ ] Set Netlify env vars:
  - `VITE_DASHBOARD_API_BASE`
  - `VITE_DASHBOARD_API_TOKEN`
- [ ] Update dashboard CSP to allow `https://api.thrivewellnessth.com`
- [ ] Verify dashboard reads from API, not static JSON
- [ ] Confirm no old public `data/*.json` remains on deploy
- [ ] Measure EC2 baseline before and after API deploy
- [ ] Add uptime monitor

**Exit criteria:** dashboard loads through authenticated API only; no public JSON; PMS analytics refresh once daily at 22:00; EC2 impact acceptable

### Phase 1 — Tracking Foundation (May, before ads handover)
**Must-have only**

- [ ] Set up GA4 property
- [ ] Set up GTM container
- [ ] Install GTM on Wix
- [ ] Install GTM on `new.thrivewellnessth.com`
- [ ] Capture on lead:
  - `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
  - `gclid`, `fbclid`, `wbraid`, `gbraid`
  - `landing_page`, `referrer`, `device_type`, `user_agent`
  - `first_touch_at`, `submitted_at`
- [ ] Set up Google Ads conversion actions
- [ ] Build Funnel v1:
  - sessions
  - form starts
  - form submits
  - qualified leads
  - booked
  - visited
  - paid
- [ ] Use simple last-click attribution first

**Exit criteria:** one paid click can be tied to a lead record with UTM + click id

### Phase 1.5 — Tracking Enhancements (after handover is stable)

- [ ] Meta Pixel + Meta CAPI
- [ ] Google Ads Enhanced Conversions
- [ ] Google Ads API spend ingestion
- [ ] CPL / CPA / ROAS joins

### Phase 2 — Astro + Sanity Site Shell (May–Jun, parallel)

- [ ] Set up Sanity project
- [ ] Scaffold Astro site
- [ ] Create base pages:
  - `/`
  - `/services/*`
  - `/contact`
  - `/blog/*`
  - `/about`
- [ ] Create Sanity schemas:
  - `page`
  - `service`
  - `blogPost`
  - `testimonial`
  - `seoMeta`
- [ ] Build lead form -> `POST https://api.thrivewellnessth.com/api/leads`
- [ ] Add Turnstile captcha
- [ ] Add SEO baseline:
  - sitemap
  - canonical
  - OG/Twitter
  - JSON-LD

**Exit criteria:** homepage + one service page + contact form live and storing leads

### Phase 3 — Ads Handover (1 Jun)

- [ ] Get admin ownership of Google Ads account
- [ ] Export campaigns / keywords / creatives / settings
- [ ] Link Google Ads <-> GA4 ourselves
- [ ] Verify conversion tracking while agency is still available
- [ ] Set up Google Ads API read-only access
- [ ] Block weekly learning time for Google Skillshop

**Exit criteria:** full control of ads account and conversion stack

### Phase 4 — Lead Inbox + Self-Serve Ads Dashboard (Jun–Jul)

- [ ] Build Lead Inbox
- [ ] Staff actions:
  - assign
  - change status
  - add notes
  - set follow-up date
- [ ] Filters:
  - source
  - status
  - date range
- [ ] Build campaign performance view
- [ ] Run weekly ads review ritual

**Exit criteria:** one campaign can be managed in-house using internal data

### Data freshness policy

- **Lead inbox data:** near-real-time is acceptable for newly submitted website leads
- **PMS / customer analytics data:** refresh **once daily at 22:00**
- **Dashboard user expectation:** numbers are "updated nightly", not live to the minute
- Show `last_synced_at` clearly in the dashboard header

### Phase 5 — Content & SEO Migration (Jul–Sep)

- [ ] Migrate Wix blog posts
- [ ] Migrate service pages
- [ ] Preserve or map URLs
- [ ] Optimize Google Business Profile
- [ ] Do internal linking + local SEO audit

**Exit criteria:** all critical Wix content has a mapped destination

### Phase 6 — Full Cutover (Oct–Nov)

- [ ] Build complete 301 redirect map
- [ ] Test all forms
- [ ] Test all conversions
- [ ] Submit sitemap
- [ ] Point `www.thrivewellnessth.com` to new site
- [ ] Keep `new.*` as alias or redirect to `www`
- [ ] Monitor rankings / traffic / Core Web Vitals for 4 weeks

**Exit criteria:** Wix can expire without downtime

---

## 8. Lead Data Model (v1)

```text
lead_id
created_at
name
phone
line_id
email
service_interest
message

utm_source
utm_medium
utm_campaign
utm_term
utm_content
gclid
fbclid
wbraid
gbraid

landing_page
referrer
device_type
user_agent
session_id

consent_at
consent_version

status
assigned_to
followup_at
notes
```

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Agency does not hand over Ads admin cleanly | Medium | High | Start transfer now |
| Ads performance drops after self-takeover | High | High | Start with tighter budgets |
| Dashboard frontend deploys before API is ready | Medium | High | Lock deploy on API readiness |
| API on shared EC2 slows clinic operations | Medium | High | nightly sync at 22:00, no realtime PMS queries, baseline metrics, memory cap, monitoring, upgrade or move host if needed |
| SEO drop after cutover | Medium | High | full 301 map, preserve URLs where possible |
| Lead API spam | High | Medium | Turnstile + rate limit + validation |
| Team capacity too thin | High | High | keep scope cut discipline, review every 2 weeks |
| Wix expires before cutover is ready | Medium | High | renew with buffer |

---

## 10. Assumptions

- DNS for `thrivewellnessth.com` is manageable
- Current EC2 can be measured before adding new load
- Sanity free tier is enough at start
- Clerk free tier is enough at start
- Supabase is acceptable for lead workflow data
- PDPA wording still needs legal review

---

## 11. Not in This Plan

- Patient portal
- Online booking system
- Payment integration
- Customer self-service account
- Multi-location support
- Writing back to PMS database
- Full content approval workflow
- Mobile redirect by default

---

## 12. Immediate Next Actions (This Week)

1. Confirm DNS registrar
2. Locate PEM key for EC2 SSH
3. Get Ads admin invite from agency
4. Renew Wix through December as safety buffer
5. Create Sanity + Clerk + Supabase accounts
6. Calendar-block Google Skillshop time
7. Measure EC2 CPU / RAM / swap headroom
8. Decide fallback if EC2 is too tight:
   - upgrade instance
   - or move API to separate host
9. Update sync job from weekly to **daily 22:00**
10. Add `last_synced_at` display policy to dashboard UI

---

## 13. Backlog / Experiments

- Mobile redirect from Wix to `new.thrivewellnessth.com`
- Meta CAPI fine-tuning
- Enhanced Conversions server-side enrichment
- Keyword-level cost joins
