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
