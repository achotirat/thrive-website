# Phase 3 — Ads From Scratch: Tracking & Google Ads Setup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** By June 1 have 3 Thrive-owned Google Ads campaigns live with verified end-to-end conversion tracking (click → GCLID in Supabase → Google Ads conversion fires). Agency campaigns stop around June 11 — Thrive must not have a traffic gap.

**Architecture:** Two tracks run in parallel — (A) code: GTM snippet in Astro + event rename verification, (B) operational: Satemshi sets up Google Ads account, GA4, and GTM container. Track A unblocks Track B. Nothing in this plan touches the Netlify lead function or Supabase schema (attribution is already working).

**Tech Stack:** Google Tag Manager (container ID needed from Satemshi), GA4 (property ID needed), Google Ads (new account under achotirat@gmail.com), Astro `BaseLayout.astro`.

---

## ⚠️ Blockers and Prerequisites

| Blocker | Who | Needed for |
|---------|-----|-----------|
| GTM container ID (format: `GTM-XXXXXX`) | Satemshi creates at tagmanager.google.com | Task 1 |
| GA4 property ID confirmed + data stream live | Satemshi confirms in GA4 | Task 3 |
| Google Ads account created under achotirat@gmail.com | Satemshi creates at ads.google.com | Tasks 4–6 |
| Astro pages deployed to new.thrivewellnessth.com | Phase 2 PR merged | Task 6 |

**Do Task 1 only after Satemshi provides the GTM container ID.**

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `astro/src/layouts/BaseLayout.astro` | Add GTM `<head>` snippet + `<body>` noscript tag |
| Reference | `astro/src/components/LeadForm.astro` | Verify `lead_submit` event name (renamed in homepage plan) |
| Create | `docs/phase3-google-ads-setup.md` | Campaign structure reference doc for Satemshi |

---

## Track A — Code (AI)

### Task 1: Add GTM snippet to BaseLayout

**Prerequisite:** Satemshi must provide the GTM container ID before this task. Replace `GTM-XXXXXX` below with the real ID.

**Files:**
- Modify: `astro/src/layouts/BaseLayout.astro`

- [ ] **Step 1.1: Add GTM head snippet**

In `astro/src/layouts/BaseLayout.astro`, add the GTM `<head>` script immediately after `<head>` and before `<meta charset="UTF-8" />`. Replace `GTM-XXXXXX` with the actual container ID:

```astro
  <head>
    <!-- Google Tag Manager -->
    <script is:inline>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXX');</script>
    <!-- End Google Tag Manager -->
    <meta charset="UTF-8" />
    <!-- rest of head unchanged -->
```

- [ ] **Step 1.2: Add GTM noscript tag**

In `astro/src/layouts/BaseLayout.astro`, add the noscript fallback as the very first child of `<body>`:

```astro
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <slot />
    <!-- existing inline script unchanged -->
```

- [ ] **Step 1.3: Verify build**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website/astro && npm run build 2>&1 | tail -10
```

Expected: build succeeds, exit 0.

- [ ] **Step 1.4: Verify the GTM snippet appears in built output**

```bash
grep -r "GTM-XXXXXX" /Users/temtem/projects/thrive-website/thrive-website/astro/dist/ | head -3
```

Expected: at least one match confirming the snippet was included in the static output. Replace `GTM-XXXXXX` with the real container ID in this grep too.

- [ ] **Step 1.5: Commit**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git add astro/src/layouts/BaseLayout.astro
git commit -m "feat: add GTM container snippet to BaseLayout head and body"
```

---

### Task 2: Verify lead_submit event fires correctly

**Prerequisite:** Homepage plan Task 1 (form_submit → lead_submit rename) must be merged.

**Files:**
- Reference only: `astro/src/components/LeadForm.astro`

- [ ] **Step 2.1: Confirm event name in LeadForm**

```bash
grep -n "lead_submit\|form_submit" /Users/temtem/projects/thrive-website/thrive-website/astro/src/components/LeadForm.astro
```

Expected output — only `lead_submit`, no `form_submit`:
```
201:          event: 'lead_submit',
```

- [ ] **Step 2.2: Check BaseLayout also pushes expected events**

```bash
grep -n "content_view\|content_engaged\|line_click\|call_click\|gtm-event" \
  /Users/temtem/projects/thrive-website/thrive-website/astro/src/layouts/BaseLayout.astro | head -20
```

Expected: `content_view` and `content_engaged` in the inline script; `line_click` / `call_click` fired via `data-gtm-event` delegation on click.

- [ ] **Step 2.3: Create GTM trigger reference doc**

Create `docs/phase3-google-ads-setup.md` with the following content — this is the handoff document Satemshi uses to configure GTM triggers and Google Ads:

```markdown
# Phase 3 — GTM + Google Ads Setup Reference

## GTM Triggers to configure in GTM container

These events are already pushed to `window.dataLayer` by the Astro site.
Configure a Custom Event trigger for each in GTM, then create GA4 Event tags.

| Event name | When fired | GTM trigger type |
|------------|-----------|-----------------|
| `content_view` | Every page load | Custom Event — Event Name: `content_view` |
| `content_engaged` | User scrolls >50% of page | Custom Event — Event Name: `content_engaged` |
| `form_start` | User focuses any field in a lead form | Custom Event — Event Name: `form_start` |
| `lead_submit` | Lead form submitted successfully | Custom Event — Event Name: `lead_submit` |
| `line_click` | Any LINE button clicked | Custom Event — Event Name: `line_click` |
| `call_click` | Any phone/tel link clicked | Custom Event — Event Name: `call_click` |
| `service_click` | Service card on homepage clicked | Custom Event — Event Name: `service_click` |
| `walkin_click` | Walk-in map link on contact page clicked | Custom Event — Event Name: `walkin_click` |
| `faq_expand` | FAQ item opened | Custom Event — Event Name: `faq_expand` |

## GA4 Tag configuration in GTM

For each trigger above, create a GA4 Event tag:
- Tag type: Google Analytics: GA4 Event
- Measurement ID: [your GA4 property ID]
- Event name: use the same name as the trigger (e.g. `lead_submit`)
- Event parameters (for lead_submit): `service` = `{{dlv - service}}`, `page_path` = `{{dlv - page_path}}`

## Google Ads Conversion Actions

Import from GA4 into Google Ads (Tools > Conversions > Import > Google Analytics 4):
- Primary: `lead_submit` — use for Smart Bidding optimisation
- Secondary: `line_click`, `call_click` — observe only

## Campaign Structure (3 initial campaigns)

### Campaign 1: ภูมิแพ้อาหารแฝง
- Landing page: https://new.thrivewellnessth.com/food-intolerance
- Ad groups:
  - ตรวจภูมิแพ้อาหารแฝง (TH)
  - food intolerance test bangkok (EN)
  - IgG test thailand (EN)
- Match types: Exact + Phrase (no Broad)
- Negative keywords: ฟรี, ราคาถูก, DIY, home test

### Campaign 2: Adrenal Fatigue + ฮอร์โมน
- Landing pages: /adrenal-fatigue, /hormones-quiz
- Ad groups:
  - ต่อมหมวกไตล้า adrenal fatigue (TH)
  - ตรวจฮอร์โมน hormone check (TH/EN)
  - hormone test bangkok (EN)
- Negative keywords: ฟรี, อาหารเสริม

### Campaign 3: IV Drip + HBOT
- Landing pages: /iv-drip, /hbot
- Ad groups:
  - IV drip vitamin bangkok (EN)
  - ดริปวิตามิน iv drip กรุงเทพ (TH)
  - HBOT hyperbaric oxygen bangkok (EN)
  - ออกซิเจนความดันสูง HBOT (TH)
- Negative keywords: ฟรี, ราคาถูก

## Bidding Strategy
- Start: Manual CPC
- Switch to Target CPA after 30 conversions accumulated per campaign
- Starting daily budget: confirm with Satemshi before launch

## June 1–11 Overlap — Document Agency Campaigns
Before agency campaigns stop, screenshot or export:
- Campaign names and structure
- Ad group names
- Top keywords (by conversions and impressions)
- Ad copy variations
- Average CPC and conversion rate per campaign
- Save to docs/agency-campaign-reference.md
```

- [ ] **Step 2.4: Commit the reference doc**

```bash
cd /Users/temtem/projects/thrive-website/thrive-website
git add docs/phase3-google-ads-setup.md
git commit -m "docs: add Phase 3 GTM triggers, GA4 tags, and Google Ads campaign reference for Satemshi"
```

---

## Track B — Operational (Satemshi)

These tasks cannot be done by AI. They require logging into Google services.

### Task 3: GA4 property setup

- [ ] **Step 3.1:** Log into [analytics.google.com](https://analytics.google.com) with achotirat@gmail.com
- [ ] **Step 3.2:** Confirm GA4 property for `thrivewellnessth.com` exists and is collecting data (Admin > Data Streams > Web > verify hits in Realtime)
- [ ] **Step 3.3:** Note the Measurement ID (format: `G-XXXXXXXXXX`) — needed for GTM GA4 tags

---

### Task 4: GTM container setup

- [ ] **Step 4.1:** Log into [tagmanager.google.com](https://tagmanager.google.com) with achotirat@gmail.com
- [ ] **Step 4.2:** Create a new GTM Web container for `thrivewellnessth.com` (if none exists)
- [ ] **Step 4.3:** Copy the Container ID (format: `GTM-XXXXXX`) — provide to AI to complete Task 1 in Track A
- [ ] **Step 4.4:** In GTM, create Custom Event triggers for all 9 events listed in `docs/phase3-google-ads-setup.md`
- [ ] **Step 4.5:** Create GA4 Event tags for each trigger using the Measurement ID from Step 3.3
- [ ] **Step 4.6:** Publish the GTM container (Submit → Publish)

---

### Task 5: Google Ads account creation

- [ ] **Step 5.1:** Go to [ads.google.com](https://ads.google.com), sign in with achotirat@gmail.com
- [ ] **Step 5.2:** Create a new Google Ads account (select "Expert mode" to avoid Smart Campaigns)
- [ ] **Step 5.3:** Set billing currency to THB, billing country Thailand
- [ ] **Step 5.4:** Link the Google Ads account to the GA4 property (Google Ads > Tools > Linked accounts > Google Analytics 4)
- [ ] **Step 5.5:** Import GA4 conversion: Tools > Conversions > + New conversion > Import > Google Analytics 4 > select `lead_submit` > import
- [ ] **Step 5.6:** Set `lead_submit` conversion as Primary (for Smart Bidding); set `line_click` and `call_click` as Secondary (observe only)

---

### Task 6: Build and launch 3 campaigns

Use the campaign structure in `docs/phase3-google-ads-setup.md`.

- [ ] **Step 6.1:** Create Campaign 1 (ภูมิแพ้อาหารแฝง) — pause until Task 7 verification passes
- [ ] **Step 6.2:** Create Campaign 2 (Adrenal Fatigue + ฮอร์โมน) — pause until Task 7 verification passes
- [ ] **Step 6.3:** Create Campaign 3 (IV Drip + HBOT) — pause until Task 7 verification passes
- [ ] **Step 6.4:** Confirm landing pages are live at new.thrivewellnessth.com (Phase 2 PR must be merged)

---

### Task 7: End-to-end conversion verification

This is the June 1 gate. All three steps must pass before campaigns go live.

- [ ] **Step 7.1:** Open any Astro page on new.thrivewellnessth.com with a test GCLID param, e.g.:
  `https://new.thrivewellnessth.com/food-intolerance?gclid=TEST123&utm_source=google&utm_medium=cpc`

- [ ] **Step 7.2:** Submit the lead form with test data (use a fake name/phone). Check Supabase `leads` table — confirm the row exists with `gclid = 'TEST123'` and `utm_source = 'google'`.

- [ ] **Step 7.3:** In GA4 Realtime view, confirm `lead_submit` event fired.

- [ ] **Step 7.4:** In Google Ads Conversions, confirm a conversion was recorded (may take up to 24h; use the Google Tag Assistant Chrome extension for immediate verification).

- [ ] **Step 7.5:** Once all 3 steps pass — set all 3 campaigns to Active. **DO NOT go live before this gate passes.**

---

### Task 8: June 1–11 overlap — document agency campaigns

Do this as soon as you have access to the agency's account (even view-only).

- [ ] **Step 8.1:** Screenshot all campaign names, ad group names, and top 20 keywords sorted by conversions
- [ ] **Step 8.2:** Copy all ad copy variations (headlines + descriptions) into `docs/agency-campaign-reference.md`
- [ ] **Step 8.3:** Note average CPC and conversion rate per campaign
- [ ] **Step 8.4:** Run your 3 Thrive campaigns in parallel — adjust bids based on observed agency CPCs
- [ ] **Step 8.5:** After June 11 (agency stops): verify Thrive campaigns are running and generating impressions

---

### Task 9: Weekly review ritual (ongoing after June 11)

- [ ] **Step 9.1:** Every Monday — check Google Ads dashboard: impressions, clicks, conversions, spend
- [ ] **Step 9.2:** Cross-reference with Supabase `leads` table — confirm lead counts match
- [ ] **Step 9.3:** Pause keywords with >50 clicks and 0 conversions
- [ ] **Step 9.4:** Increase daily budget on ad groups with CPL below target
- [ ] **Step 9.5:** At 30+ conversions per campaign — switch bidding to Target CPA

---

## Exit Criteria Checklist

- [ ] GTM container snippet live on all Astro pages (`astro check` + build pass)
- [ ] All 9 dataLayer events confirmed in GTM preview mode
- [ ] `lead_submit` conversion action importing from GA4 into Google Ads
- [ ] Test lead submitted → GCLID in Supabase → conversion recorded in Google Ads
- [ ] 3 campaigns created, reviewed by Satemshi, and set to Active by June 1
- [ ] Agency campaign structure documented in `docs/agency-campaign-reference.md`
