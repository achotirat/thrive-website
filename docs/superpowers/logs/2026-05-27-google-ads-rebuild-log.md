# Google Ads Campaign Rebuild — Execution Log

**Spec:** [`docs/superpowers/specs/2026-05-27-google-ads-campaign-rebuild-design.html`](../specs/2026-05-27-google-ads-campaign-rebuild-design.html)
**Plan:** Spec is used as the plan directly (per user, 2026-05-27).
**Deadlines:** 2026-06-01 (3 priority campaigns live) · 2026-06-11 (all 8 live, agency contract ends).

Append a new dated entry below each working session. Newest at bottom.

---

## 2026-05-27 — Session 1: Brainstorm + spec written

**Done:**
- Reviewed agency baseline report `Plus-Adtech30Mar-29Apr.pdf` (8 campaigns, 572 conversions, 25,343฿ spend).
- Brainstormed scope: rebuild from scratch (not copy), 8 campaigns, by 2026-06-11.
- Decided architecture: Google Sheet → CSV → Google Ads Editor; 6 LPs via Astro content collection; Traffic Secrets (Hook–Story–Offer + bait) per LP.
- Confirmed IDs: GTM `GTM-MKHTH4P9`, GA4 `G-KTNWCHE7TM` (already live + tested).
- Spec written + self-reviewed + approved.

**Decisions captured:**
- Week 1 priority = Food Intolerance Search + Hormone Search + IV Drip **PMax** (IV Drip uses PMax to inherit conversion-volume strength from agency baseline).
- Quiz starts lightweight (embedded Google Form / Typeform); full quiz engine deferred to Phase 5.
- A/B Layer A (RSA auto-rotate) from day 1; Layer B (Experiments) after 2026-06-11.

**Blockers cleared:**
- ~~GTM container ID (was blocked)~~ → unblocked, `GTM-MKHTH4P9`.
- ~~GA4 measurement ID~~ → confirmed `G-KTNWCHE7TM`, already firing pageviews.

**Next:** Task #6 — install GTM snippet in `BaseLayout.astro`.

---

## 2026-05-27 — Session 1b: Spec amendments

- Reformatted Week 1 / Week 2 timelines as **numbered lists** in spec (per user request, easier to read + reference).
- Added **vkasama** as content-writer collaborator owning campaign copy in the Sheet master. Claude no longer owns copy generation — Claude is on-demand brainstorming aid only. หมอนุ่น/user reviews for medical compliance.
- Pulled forward "Create Google Sheet master" to **Day 1 (05-27)** so vkasama is unblocked immediately and can work in parallel with GTM/LP build.

**Next:** Create Google Sheet master (4 tabs with schema headers) → share with vkasama → continue with GTM install.

---

## 2026-05-27 — Session 1c: Sheet master created

- Sheet name: **Thrive Ads Master 2026**
- URL: https://docs.google.com/spreadsheets/d/1pw0ztSkkrDBoW-kXDUjmFt6cJLdx-JcDTHSOvOD-CQ8/edit
- Sheet ID: `1pw0ztSkkrDBoW-kXDUjmFt6cJLdx-JcDTHSOvOD-CQ8`
- vkasama share: **v.kasama@gmail.com** (role: Editor) — user to add via Sheet UI
- TSV snapshots saved to `docs/superpowers/sheets/` for version reference (campaigns, ad_copy, keywords, assets)
- `campaigns` tab pre-seeded with all 8 target campaigns (Week 1/2 marked)
- `ad_copy` tab seeded with skeleton 19 rows for `food-intol-s` showing the 5-angle pattern — vkasama replicates pattern for the other 7 campaigns
- `keywords` + `assets` tabs seeded with examples only

**Next:** User pastes TSV content into each tab in the Sheet → share to vkasama → resume Task #6 (install GTM).

---

## 2026-05-27 — Session 1d: GTM already installed (discovered)

Inspected `thrive-website/astro/src/layouts/BaseLayout.astro` and found:

- ✅ `GTM-MKHTH4P9` snippet was already committed in `a105379` ("feat: add GTM container snippet GTM-MKHTH4P9 to BaseLayout") — Task #6 already done by prior session/dev.
- ✅ `lead_submit` event already pushes to dataLayer in `LeadForm.astro:204` and `thank-you.astro:36`.
- ✅ Generic click-handler in `BaseLayout.astro:108-118` fires any `[data-gtm-event]` element to dataLayer.
- ✅ Existing events wired: `cta_click`, `call_click`, `line_click`, `walkin_click`, `service_click`, `faq_expand`, plus auto `content_view` + `content_engaged` on scroll 50%.

**Naming alignment:** spec said `phone_click` but code uses `call_click` (5+ places). Renamed all `phone_click` → `call_click` in spec (Section 1, 4.2, 4.3, 5 Week 1 list).

**Quiz promoted:** quiz functionality moved out of this spec to its own future major-feature design doc (Section 2.6 added). Reason: Apr 2026 baseline shows quiz drives 92.66% of conversions — too important to scope under "lightweight embed". Tracking as Task #13.

**Remaining on tracking:**
- Code side: nothing — all primary events are already firing.
- GTM UI side (Satemshi): create tags in GTM container that listen for `lead_submit`, `line_click`, `call_click` dataLayer events and forward to GA4 `G-KTNWCHE7TM`. Then mark as Key events in GA4 and import to Google Ads as conversions.

**Branch hygiene:** repo currently on `main` with untracked docs. Per CLAUDE.md (never push to main, feature branch + PR only), next step is to create `feature/google-ads-rebuild-docs`, commit spec/log/sheets, push, and open PR for Satemshi to approve.

**Next:** Create feature branch + commit docs → user approves push → continue to Task #7 (LP template).

---

## 2026-05-27 — Session 1e: Docs PR #29 merged + Task #7 re-scoped after project discovery

**Docs PR:** branch `feature/google-ads-rebuild-docs` pushed and merged via PR #29 (commit `7ceb7e1`).

**Project discovery (changes Task #7 scope):**
- Existing content collection at `src/content/services/` already has 18 MDX files (40–60 KB each, full Tier A pages with seo / hero / doctor / faqs frontmatter).
- Per-service pages at `src/pages/<slug>.astro` (~50 lines, thin wrapper composing ServiceHero / FAQSection / DoctorAttribution / CTASection / LeadForm / ServiceCard).
- URLs are `/<slug>` (root level), preserved from legacy site per CLAUDE.md rule.
- 4 of 6 LP slugs already exist: food-intolerance, iv-drip, chelation, hbot.
- Hormone LP → use existing `/hormones-quiz` (user choice A — fastest, content already rich).
- Mental Health → must create new MDX + page wrapper (Task #14).

**Spec amendments (in branch `feature/services-lp-template`):**
- URL convention: `/services/<slug>` → `/<slug>` (5 places).
- Section 2.4 tech implementation rewritten: extend existing schema + add 4 new Traffic Secrets components (SymptomChecklist, EpiphanyStory, OfferStack, RiskReversal) instead of building `[slug].astro` template from scratch.
- Layer 2 ASCII diagram updated to reflect existing setup.
- Week 1 Day-05-28 task reworded.
- Inventory table URLs corrected.
- `campaigns.tsv` `landing_page` column corrected to root URLs.

**Task #14 added:** create `/mental-health` MDX + page wrapper (Week 2).

**Next:** Start Task #7 — inspect current `src/content/config.ts` (likely missing), define services collection Zod schema with optional Traffic Secrets fields, build 4 new components, wire conditionally into existing service-page wrappers.

---

## 2026-05-27 — Session 1f: Task #7 + Task #8 (priority LP draft content)

**Task #7 — components built (PR #?):**
- Branch `feature/services-lp-template`, commit `b97b4c6`.
- 4 LP components in `astro/src/components/lp/`: SymptomChecklist, EpiphanyStory, OfferStack, RiskReversal.
- Wired conditionally into food-intolerance.astro, iv-drip.astro, hormones-quiz.astro.
- Initially skipped Zod schema (Task #7 commit b97b4c6 used type cast workaround) — but during Task #8 found that `astro/src/content.config.ts` already exists and enforces strict typing. Proper fix applied in Task #8 commit: added 4 optional LP block schemas to `content.config.ts`, removed the type cast, deleted `astro/src/types/lp-blocks.ts`. `npx astro check` and `npm run build` both pass with the clean schema.
- CSS added to `astro/src/styles/global.css` (~200 lines under "Landing Page Blocks" section).

**Task #8 — priority LP content (DRAFT, in same branch):**
- Added 4 LP blocks (symptomChecklist / epiphanyStory / offerStack / riskReversal) to MDX frontmatter for food-intolerance.mdx, iv-drip.mdx, hormones-quiz.mdx.
- All epiphanyStory entries marked `[DRAFT — placeholder]` in title. **Must not ship to production until vkasama collects real patient testimonials from clinic and หมอนุ่น approves wording.**
- Other blocks (symptoms, offer, risk reversal) written from existing MDX body + FAQs — still need หมอนุ่น medical review for accuracy.
- Quote attributions marked "placeholder คนไข้ Thrive Wellness Clinic" for the same reason.

**Central pricing introduced (Q2 answer):**
- New file `astro/src/data/pricing.json` — single source of truth for service prices.
- New helper `astro/src/lib/pricing.ts` exposing `getServicePricing(slug)`.
- Page wrappers merge: `priceFrom: d.offerStack.priceFrom ?? pricing?.from` — MDX can override per-page (e.g. promos).
- 6 services seeded with `draft: true` flag — vkasama / user update actual prices and remove draft flag.

**Quiz coordination:**
- Detected another agent's work-in-progress in `hormones-quiz.astro` (added `QuizEngine` import + render); preserved as-is per instruction.
- Other agent's files (`astro/src/lib/quizEngine.mjs`, `astro/tests/`, modified `astro/package.json`) left unstaged in this branch — not in scope of Task #7/#8.

**Next:** commit Task #8 content + push to `feature/services-lp-template` → open PR (or continue to Task #14 mental-health page / Task #5 Ads Editor import).

---

## 2026-05-28 — Session 2: Task #11 — Google Ads Editor import prep

Built the bulk-import CSV templates for the 3 priority campaigns plus a step-by-step guide. Files in `docs/superpowers/sheets/editor-templates/` (numbered in import order):

1. `01-campaigns-priority.csv` — Food Intolerance Search 150฿, Hormone Search 200฿, IV Drip PMax 100฿; all start in **Paused** state.
2. `02-ad-groups-priority.csv` — one ad group per Search campaign.
3. `03-keywords-priority.csv` — 16 seed keywords across the 2 Search campaigns, mix of phrase / broad / exact match.
4. `04-responsive-search-ads-priority.csv` — RSA template with `[VKASAMA …]` placeholders to be filled from the Google Sheet master before import.
5. `05-pmax-iv-drip-priority.csv` — PMax asset-group checklist (PMax has limited CSV import; the file is a reference, not a direct paste).

Guide: `docs/superpowers/sheets/editor-import-guide.md`.

**Open dependencies before launch:**
- vkasama: complete copy in `Thrive Ads Master 2026` sheet for the 3 priority campaigns; replace `[VKASAMA …]` placeholders in CSV before importing.
- Satemshi: confirm GTM tags are forwarding `lead_submit` / `line_click` / `call_click` to GA4, then import the GA4 conversion into Google Ads.
- หมอนุ่น: medical review of the LP draft content (Task #8 commits).
- IV Drip PMax assets: upload images / videos / logos to the Google Ads Asset library.

All three campaigns deliberately start Paused — flip to Enabled only after verifying conversion tracking and LP rendering in production.

---
