# Google Ads Editor — Import guide for 3 priority campaigns

Owner: user / Satemshi · Branch: `feature/services-lp-template`
Target launch: **2026-06-01**

## Pre-requisites

- Google Ads Editor installed (https://ads.google.com/home/tools/ads-editor/)
- Logged in to the Thrive Google Ads account (the one iTOPPLUS managed)
- vkasama has filled the headlines / descriptions in `Thrive Ads Master 2026` sheet (https://docs.google.com/spreadsheets/d/1pw0ztSkkrDBoW-kXDUjmFt6cJLdx-JcDTHSOvOD-CQ8/edit) for the 3 priority campaigns
- Conversion tracking working in GA4 (verify in GA4 DebugView before launch)

## If Editor says "The entity does not exist for Campaign"

This means the RSA/ad rows were imported before Google Ads Editor had the matching campaign shells in the local account draft.

For the all-search RSA file, use this order:

1. Import `01a-search-campaigns.csv`.
2. Import `02a-search-ad-groups.csv`.
3. Retry `06a-rsa-search-campaigns.csv`.

Do not import `06a-rsa-search-campaigns.csv` first. The current failed rows can be discarded from the preview/results export and retried after steps 1-2 above.

## What's in `editor-templates/`

Numbered in the order to import:

1. `01-campaigns-priority.csv` — Search campaign-level settings for Food Intolerance + Hormone (budget, locations, bid strategy)
2. `02-ad-groups-priority.csv` — one ad group per priority Search campaign
3. `03-keywords-priority.csv` — keywords for both Search campaigns
4. `04-responsive-search-ads-priority.csv` — placeholder Responsive Search Ad template only; do not import unless every `[VKASAMA ...]` placeholder has been replaced
5. `05-pmax-iv-drip-priority.csv` — Performance Max IV Drip asset group reference (PMax is harder to bulk-import; this is a checklist, not a direct paste)
6. `06-rsa-all-campaigns.csv` — approved vkasama copy for all 8 campaigns, kept as the master copy archive and set to **Paused**
7. `06a-rsa-search-campaigns.csv` — Search campaign RSA import file only
8. `06b-pmax-copy-reference.csv` — PMax copy reference for Google Ads UI / asset-group setup, not a direct RSA import
9. `06c-demand-gen-copy-reference.csv` — Demand Gen copy reference for Google Ads UI / asset setup, not a direct RSA import
10. `01a-search-campaigns.csv` — Search-only campaign shell for all 5 Search campaigns used by `06a`
11. `02a-search-ad-groups.csv` — Search-only ad groups for all 5 Search campaigns used by `06a`

All importable priority Search campaigns are pre-set to **Paused** status. Switch to **Enabled** only after a final review and tracking verification.

IV Drip PMax is not included in `01-campaigns-priority.csv` because the downloaded Google Ads Editor campaign template only supports creating Search, Display, and Video campaigns by CSV. Create/configure IV Drip PMax manually using `05-pmax-iv-drip-priority.csv` as the reference checklist.

All Week 2 ad-copy files are also pre-set to **Paused**. Price and testimonial copy in these files has been reviewed, but campaigns should still remain paused until Editor preview, tracking, and final URL suffix checks pass.

## By-hand method

Use this method if CSV import keeps producing mapping errors. The CSVs remain useful as copy/reference files, but campaign creation happens directly in Google Ads UI or Google Ads Editor.

### Search campaigns to create

Use these settings for the Search campaigns:

| Campaign | Budget | Landing page | Ad group |
|---|---:|---|---|
| `food-intol-s` | 150฿/day | `https://new.thrivewellnessth.com/food-intolerance` | `food-intolerance-general` |
| `hormone-s` | 200฿/day | `https://new.thrivewellnessth.com/hormones-quiz` | `hormone-imbalance-general` |
| `chelation-s` | 150฿/day | `https://new.thrivewellnessth.com/chelation` | `chelation-general` |
| `hbot-s` | 150฿/day | `https://new.thrivewellnessth.com/hbot` | `hbot-general` |
| `mental-health-s` | 150฿/day | `https://new.thrivewellnessth.com/mental-health` | `mental-health-general` |

For priority launch only, create `food-intol-s` and `hormone-s` first. Keep all campaigns **Paused** until tracking is verified.

### Search campaign settings

- Objective: Prefer **Leads** if Google still offers **Search** as a campaign type.
- If **Leads** only offers **Performance Max**, go back and choose **Create a campaign without guidance**, then select **Search**.
- Campaign type: **Search**
- Status: **Paused**
- Networks: **Google Search** + **Search partners**
- Location: Bangkok, Nonthaburi, Pathum Thani
- Language: Thai + English
- CSV import note: Google Ads Editor expects language codes in import files, so the campaign CSVs use `th; en`.
- Budget type: Daily
- Bidding: Maximize Conversions
- EU political ads: No
- Final URL suffix: `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}`

Do not continue with Performance Max for the Search campaign shells. PMax is only for `iv-drip-pm` in this launch plan.

### Build each Search campaign by hand

1. Create the campaign using the settings above.
2. Create the matching ad group from the table above.
3. Add keywords from `03-keywords-priority.csv` for priority campaigns. For Week 2, use the `keywords` tab/source sheet as the reference.
4. Create one Responsive Search Ad per ad group.
5. Copy headlines/descriptions from `04-responsive-search-ads-priority.csv` for priority campaigns or `06a-rsa-search-campaigns.csv` for all 5 Search campaigns.
6. Confirm each RSA has 15 headlines, 4 descriptions, Path 1, Path 2, and the correct final URL.
7. Leave status **Paused**.

### Food Intolerance: import into an existing campaign

Use this if `food-intol-s` has already been created by hand and you want to import the remaining setup.

Important: the campaign name in Google Ads must be exactly `food-intol-s`. If you created it with another name, either rename the campaign in Google Ads or edit the `Campaign` column in these files before importing.

Import in this order:

1. `food-intol-existing-01-ad-group.csv`
2. `food-intol-existing-02-keywords.csv`
3. `food-intol-existing-05-rsa-approved.csv`
4. Optional: `food-intol-existing-04-campaign-negative-keywords.csv`

If you already created the `food-intolerance-general` ad group by hand, skip `food-intol-existing-01-ad-group.csv` and start with keywords.

The RSA file points to `https://new.thrivewellnessth.com/food-intolerance` and all imported items are set to **Paused**. Do not use `04-responsive-search-ads-priority.csv` directly because it contains `[VKASAMA ...]` placeholders.

If `03-keywords-priority.csv` shows Food Intolerance as **6 OK / 2 errors**, continue to the next step. The failed broad symptom keywords were removed from the import files because they can trigger generic errors / health-policy review noise.

### Hormone: full import method

Use this if you do not want to create the Hormone campaign by hand.

Import in this order:

1. `hormone-import-01-campaign.csv`
2. `hormone-import-02-ad-group.csv`
3. `hormone-import-03-keywords.csv`
4. `hormone-import-04-rsa.csv`
5. Optional: `hormone-import-05-campaign-negative-keywords.csv`

The campaign is created as `hormone-s`, budget `200฿/day`, Search only, Maximize Conversions, Bangkok + Nonthaburi + Pathum Thani, Thai + English (`th; en` in the CSV), and **Paused**.

The RSA file points to `https://new.thrivewellnessth.com/hormones-quiz`.

If keyword import shows **6 successful / 2 errors**, do not retry the English broad keywords. Continue to the RSA step. The English rows were removed from the import files because they can trigger generic import errors / policy review noise in this account.

Policy note: do not add `hormone test bangkok` or `bhrt clinic thailand` back into Google Ads. They triggered **Health in personalized advertising** / sensitive health information policy warnings. Keep the hormone campaign focused on the six Thai keywords in `hormone-import-03-keywords.csv`.

### IV Drip PMax by hand

Create `iv-drip-pm` manually. Use `05-pmax-iv-drip-priority.csv` and `06b-pmax-copy-reference.csv` as reference files.

- Campaign type: Performance Max
- Status: Paused
- Budget: 100฿/day
- Landing page: `https://new.thrivewellnessth.com/iv-drip`
- Asset group: `iv-drip-default`
- Add image, logo, and video assets from the Google Ads asset library.
- Add PMax headlines/descriptions from the reference file.
- Add audience signals if GA4 remarketing/converter lists are available.

### Before enabling anything

- GA4 DebugView shows `lead_submit`, `line_click`, and `call_click`.
- Final URL suffix is present on Search campaigns.
- Landing pages load correctly on production.
- Campaigns, ad groups, keywords, and ads are still **Paused**.

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
- In the "Map columns" dialog, confirm each header matches the Editor's expected field. Headers now use the exact downloaded Editor template names, including `Budget`, `Campaign start date`, `Language`, `Location`, and `EU political ads`.
- Click **Process**. Review the proposed changes in the Editor preview pane — two new Search campaigns should appear in **Paused** status with the budgets / locations as in the CSV.

### 3. Import ad groups (Step 2 CSV)

- Repeat the import flow with `02-ad-groups-priority.csv`.
- Verify one ad group is created under each Search campaign. (IV Drip PMax does not use ad groups in the same sense — it uses asset groups, handled separately in step 5.)

### 4. Import keywords (Step 3 CSV)

- Import `03-keywords-priority.csv`.
- Review match types (Broad / Phrase / Exact) and per-keyword Max CPC overrides.
- Negative keywords are NOT in this CSV — add common ones via Tools → Shared Library → Negative keyword lists if needed (e.g. "ฟรี", "ราคาถูก", "ทำเอง").

### 5. Import RSAs (Step 4 CSV)

- Make sure all `[VKASAMA …]` placeholders are replaced with real copy. The Editor will reject ads that exceed 30 chars (headline) or 90 chars (description).
- Import a filled/approved RSA file. Do not import `04-responsive-search-ads-priority.csv` if it still contains `[VKASAMA ...]` placeholders.
- Review each ad — Editor shows ad-strength preview. Aim for "Good" or "Excellent" by varying angle (pain / outcome / authority / specificity / urgency — see design spec section 3.2).

### 6. Configure PMax IV Drip (Step 5 reference)

PMax campaigns are not fully bulk-importable via CSV in Editor as of 2026; use the file as a checklist.

- In Google Ads UI or Editor's PMax flow, create the new `iv-drip-pm` campaign manually → Asset groups → Create asset group `iv-drip-default`.
- Add assets according to `05-pmax-iv-drip-priority.csv`. Upload from Asset library.
- Add 5 short headlines, 1 long headline, 5 descriptions (copy from vkasama's sheet).
- Add 1+ video each in 9:16 and 16:9 ratios — required for placement coverage.
- Audience signals: add an audience based on existing food-intolerance / hormone converters from GA4 (if you have a remarketing list ready).

### 7. Verify before pushing live

Before pressing **Post** (top-right):

- Tracking: GA4 DebugView shows `lead_submit`, `line_click`, `call_click` firing on the 3 LP pages (`/food-intolerance`, `/hormones-quiz`, `/iv-drip`).
- LPs deployed: visit https://new.thrivewellnessth.com/food-intolerance — confirm the new Traffic Secrets blocks render (symptom checklist, story, offer, risk reversal).
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

- If you get `The entity does not exist for "Campaign: ..."` while importing `06a`, import `01a-search-campaigns.csv` first, then `02a-search-ad-groups.csv`, then retry `06a-rsa-search-campaigns.csv`.
- Import Search RSAs from `06a-rsa-search-campaigns.csv`.
- Use `06b-pmax-copy-reference.csv` when configuring Food Intolerance PMax and IV Drip PMax asset groups in Google Ads UI / Editor's PMax editor.
- Use `06c-demand-gen-copy-reference.csv` when configuring Demand Gen creative assets.
- Keep `06-rsa-all-campaigns.csv` as the reviewed master source. Do not use it as the first import file unless you intentionally want to preview every row together.

### Search RSA import order for all 5 Search campaigns

Use this order when importing the reviewed Search RSA file:

1. Import `01a-search-campaigns.csv`.
2. Import `02a-search-ad-groups.csv`.
3. Import `06a-rsa-search-campaigns.csv`.

All three files are set to **Paused** so the account can be reviewed before anything starts serving.
