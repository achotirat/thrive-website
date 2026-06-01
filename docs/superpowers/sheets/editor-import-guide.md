# Google Ads Editor — Import guide for 3 priority campaigns

Owner: user / Satemshi · Branch: `feature/services-lp-template`
Target launch: **2026-06-01**

## Pre-requisites

- Google Ads Editor installed (https://ads.google.com/home/tools/ads-editor/)
- Logged in to the Thrive Google Ads account (the one iTOPPLUS managed)
- vkasama has filled the headlines / descriptions in `Thrive Ads Master 2026` sheet (https://docs.google.com/spreadsheets/d/1pw0ztSkkrDBoW-kXDUjmFt6cJLdx-JcDTHSOvOD-CQ8/edit) for the 3 priority campaigns
- Conversion tracking working in GA4 (verify in GA4 DebugView before launch)

## What's in `editor-templates/`

Numbered in the order to import:

1. `01-campaigns-priority.csv` — campaign-level settings (budget, locations, bid strategy)
2. `02-ad-groups-priority.csv` — one ad group per Search campaign
3. `03-keywords-priority.csv` — keywords for both Search campaigns
4. `04-responsive-search-ads-priority.csv` — Responsive Search Ad template (placeholders for vkasama copy)
5. `05-pmax-iv-drip-priority.csv` — Performance Max IV Drip asset group reference (PMax is harder to bulk-import; this is a checklist, not a direct paste)
6. `06-rsa-all-campaigns.csv` — approved vkasama copy for all 8 campaigns, kept as the master copy archive and set to **Paused**
7. `06a-rsa-search-campaigns.csv` — Search campaign RSA import file only
8. `06b-pmax-copy-reference.csv` — PMax copy reference for Google Ads UI / asset-group setup, not a direct RSA import
9. `06c-demand-gen-copy-reference.csv` — Demand Gen copy reference for Google Ads UI / asset setup, not a direct RSA import

All three priority campaigns are pre-set to **Paused** status. Switch to **Enabled** only after a final review and tracking verification.

All Week 2 ad-copy files are also pre-set to **Paused**. Price and testimonial copy in these files has been reviewed, but campaigns should still remain paused until Editor preview, tracking, and final URL suffix checks pass.

## Step-by-step

### 0. Before opening Editor

- In the `Thrive Ads Master 2026` Sheet, copy vkasama's headlines/descriptions into the `[VKASAMA …]` placeholders in `04-responsive-search-ads-priority.csv`. Save as a working copy on your desktop.
- For PMax IV Drip: upload all required image / video / logo assets to the Google Ads asset library first (Tools → Library → Asset library).

### 1. Open Google Ads Editor → Sync the account

- File → Open / Add Account → pick the Thrive Wellness account
- Get latest changes (top-right cloud icon). Wait until sync is done.

### 2. Import campaigns (Step 1 CSV)

- Menu: **Account → Import → From file** (or **Cmd/Ctrl-Shift-I**)
- Select `01-campaigns-priority.csv`
- In the "Map columns" dialog, confirm each header matches the Editor's expected field. Most will match by name — for any unmapped column, pick the matching destination from the dropdown.
- Click **Process**. Review the proposed changes in the Editor preview pane — three new campaigns should appear in **Paused** status with the budgets / locations as in the CSV.

### 3. Import ad groups (Step 2 CSV)

- Repeat the import flow with `02-ad-groups-priority.csv`.
- Verify one ad group is created under each Search campaign. (IV Drip PMax does not use ad groups in the same sense — it uses asset groups, handled separately in step 5.)

### 4. Import keywords (Step 3 CSV)

- Import `03-keywords-priority.csv`.
- Review match types (Broad / Phrase / Exact) and per-keyword Max CPC overrides.
- Negative keywords are NOT in this CSV — add common ones via Tools → Shared Library → Negative keyword lists if needed (e.g. "ฟรี", "ราคาถูก", "ทำเอง").

### 5. Import RSAs (Step 4 CSV)

- Make sure all `[VKASAMA …]` placeholders are replaced with real copy. The Editor will reject ads that exceed 30 chars (headline) or 90 chars (description).
- Import `04-responsive-search-ads-priority.csv`.
- Review each ad — Editor shows ad-strength preview. Aim for "Good" or "Excellent" by varying angle (pain / outcome / authority / specificity / urgency — see design spec section 3.2).

### 6. Configure PMax IV Drip (Step 5 reference)

PMax campaigns are not fully bulk-importable via CSV in Editor as of 2026; use the file as a checklist.

- In Editor, open the new `iv-drip-pm` campaign → Asset groups → Create asset group `iv-drip-default`.
- Add assets according to `05-pmax-iv-drip-priority.csv`. Upload from Asset library.
- Add 5 short headlines, 1 long headline, 5 descriptions (copy from vkasama's sheet).
- Add 1+ video each in 9:16 and 16:9 ratios — required for placement coverage.
- Audience signals: add an audience based on existing food-intolerance / hormone converters from GA4 (if you have a remarketing list ready).

### 7. Verify before pushing live

Before pressing **Post** (top-right):

- Tracking: GA4 DebugView shows `lead_submit`, `line_click`, `call_click` firing on the 3 LP pages (`/food-intolerance`, `/hormones-quiz`, `/iv-drip`).
- LPs deployed: visit https://www.thrivewellnessth.com/food-intolerance — confirm the new Traffic Secrets blocks render (symptom checklist, story, offer, risk reversal).
- Final URL suffix: confirm `utm_source=google&...{campaignid}...` is set on each campaign.
- Status: all 3 campaigns still **Paused**.

### 8. Post changes + flip to Enabled

- Click **Post** (top-right). Editor pushes the changes to Google Ads.
- Wait 5–10 minutes for Google Ads to validate.
- In Google Ads UI (or back in Editor after sync), change each campaign Status from Paused → Enabled.
- Monitor first 24h: impressions, CTR, conversions. If something looks broken, pause and iterate.

## Common gotchas

- **Location names**: Google Ads Editor expects either full location IDs (e.g. `1011693` for Bangkok) OR exact location names matching its targeting taxonomy. If the CSV import fails on locations, search the location in Editor's UI first to confirm the spelling and replace in the CSV.
- **Headlines too long**: Thai text counts by character, not byte. 30 chars in Thai is short — write tightly.
- **Pinning**: RSAs allow pinning specific headlines to positions 1, 2, or 3. Use sparingly — pinning everywhere kills Google's ability to optimise.
- **Daily budget vs monthly spend**: 150฿/day × 30.4 days ≈ 4,560฿/month. Plan accordingly.

## After launch (Week 2 plan)

See spec section 5 Week 2 — add the remaining 5 campaigns (Chelation, HBOT, Mental Health, Food Intolerance PMax, Demand Gen).

### Week 2 file split

- Import Search RSAs from `06a-rsa-search-campaigns.csv`.
- Use `06b-pmax-copy-reference.csv` when configuring Food Intolerance PMax and IV Drip PMax asset groups in Google Ads UI / Editor's PMax editor.
- Use `06c-demand-gen-copy-reference.csv` when configuring Demand Gen creative assets.
- Keep `06-rsa-all-campaigns.csv` as the reviewed master source. Do not use it as the first import file unless you intentionally want to preview every row together.
