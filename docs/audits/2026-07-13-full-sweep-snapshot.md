# Thrive Launch Audit — Full Sweep Snapshot 2026-07-13

Last full sweep: 2026-07-13 (local production build — same commit as live deploy; Sanity blog posts not re-audited, see note)
Site: https://new.thrivewellnessth.com/

---

## Executive Summary

**This sweep (2026-07-13):** 41 Tier A pages + 2 blog listing pages, 8 dimensions + security (5 parallel agents).
**Tier A average:** 8.6/10 (was 8.0 on 2026-05-26) — **no page below 7.0**
**Blog posts (Tier B):** 63 Sanity posts NOT re-audited this sweep (sandbox had no network access to Sanity/live site); their 2026-05-30 scores are retained below and marked [stale]. Blog-post average from last sweep: 5.1/10 — still the weakest area.

**🚨 Launch blocker (unchanged, intentional):** entire site is `noindex,nofollow` (netlify.toml X-Robots-Tag) + `robots.txt Disallow: /`. Google organic and AI crawlers see nothing until cutover. All scores below describe what goes live when the flag lifts.

**Top cross-site issues found this sweep:**
1. Staging blocks: robots.txt 'Disallow: /' + X-Robots-Tag 'noindex,nofollow,noarchive' on /* in netlify.toml. Intentional pre-cutover, but cutover checklist MUST remove both or the site stays invisible to Google
2. Canonical/hreflang domain conflict: all canonicals point to staging new.thrivewellnessth.com while hreflang on ~35 pages points to www.thrivewellnessth.com; /, /about, /blog, /blog/mental-health, /contact use new. in hreflang instead — pick one final domain and regenerate all
3. hreflang 'en' declared on nearly every page but points to the same Thai URL (no English site exists); on /cancer-screening, /dna-test, /epispan it points to /en/* URLs that 404 — remove en hreflang until an English version ships
4. Sitemap (43 URLs) includes noindexed pages /thank-you and /lp/adrenal-fatigue — exclude noindex pages from sitemap-0.xml
5. 3 broken internal links: /nad-plus on /adrenal-fatigue (page is /nad), /hormones on /iv-drip (page is /check-up/hormones), /blog/female-hormone-panel-age-40 on /hormones-quiz (post doesn't exist)
6. dist/llms.txt is stale Wix-era content: wrong address ('The Crystal Ekkamai-Ramintra' vs Crystal Park Praditmanutham on /contact), wrong hours (10:00–19:30 vs 10:00–19:00), dead links /nad-plus and /knowledge — conflicting NAP data actively harms GEO/AI citation
7. Keyword cannibalization between root service pages and /check-up/* twins: /food-intolerance vs /check-up/food-intolerance share primary phrase 'ตรวจภูมิแพ้อาหารแฝง IgG 222 ชนิด'; /vitamins-and-micronutrients and /check-up/vitamins-and-micronutrients have byte-identical H1; /urine-organic-test pair targets same keyword — differentiate intent or canonicalize
8. Systematic title overlength: 38 of 41 Tier A titles are 61–92 chars (target 50–60) — SERP truncation across the site; worst: /gluta 92, /chelation 85, /dna-test 84, /vitamins-and-micronutrients 84
9. Recurring pattern: H1s are curiosity hooks without the primary keyword on ~14 pages (/hbot, /nk-cell, /allergy-ige, /epispan, /urine-organic-test, most /check-up/* packages) — good for CRO, costs relevance signal
10. Blog section is an indexable empty placeholder ('ยังไม่มีบทความ') included in sitemap, with no JSON-LD — publish at least 1-2 posts or noindex /blog and /blog/mental-health at launch
11. Body copy rarely says กรุงเทพ/Bangkok explicitly (~26 pages only say ลาดพร้าว/Crystal Park) — weakens 'clinic in Bangkok' entity association for AI answers
12. 36/41 indexable pages: hreflang href uses www.thrivewellnessth.com while canonical uses new.thrivewellnessth.com — conflicting signals, must unify before launch
13. hreflang en + th-TH + x-default all point to the same Thai URL; no English version exists — drop 'en' or ship real EN pages
14. Schema @id domain split: www. on ~38 pages vs new. on home/about/contact — clinic/doctor entity identity fragments across site
15. Clinic name inconsistent in JSON-LD: 'Thrive Wellness Clinic' (36 pages) vs 'Thrive Wellness Center' (home/about/contact)
16. Dr. Chanakan is @type Person everywhere, never Physician; no medical license identifier and no sameAs on any of 36 pages
17. Person jobTitle varies across pages (3+ EN/TH variants) — standardize one credential string
18. Titles exceed 60 chars on 38/43 pages (61-92 chars) — SERP truncation risk; Thai+EN dual-language titles are the cause
19. Meta descriptions off-target on ~26 pages: check-up sub-pages run 101-136 chars; about/allergy-ige/adrenal-fatigue run 166-183
20. 17 pages: FAQPage schema lists fewer Q&As than visible FAQ accordions (check-up subs 2 vs 3; bach-flower/therapist-consult 3 vs 6)
21. Both blog pages (Tier B) have zero JSON-LD — no BlogPosting, Article, or BreadcrumbList; /blog/mental-health also missing 'en' hreflang
22. 15 pages ship 1.7-12.6MB raw hero JPGs (worst /check-up/optimum-balance 12.6MB) - compress to <300KB before launch
23. Zero responsive images sitewide: no srcset/sizes/<picture>/WebP/AVIF; full-size JPGs served to mobile ad traffic
24. Oversized heroes double as og:image; 6 pages exceed the ~8MB FB/LINE scraper limit so link previews will drop the image
25. 24 of 39 FAQ pages: FAQPage JSON-LD is a truncated/reworded subset of visible FAQ - violates Google's content-match guideline
26. Only 3 of 39 FAQ pages have a price/cost question (/, /hbot, /nk-cell) - high-intent query gap for a paid-ads site
27. All 13 /check-up/* sub-pages have only 3-4 visible FAQs with 2-question JSON-LD - expand to 5+ and sync schema
28. /logo.svg is referenced by /lp/adrenal-fatigue but missing from dist (broken image on the ad landing page)
29. Alt text, og:image presence, lazy-loading and hero filenames are consistently good sitewide - no action needed there

**Medical-claim / ads-policy violations (fix before scaling ads):**
- `/gluta` — “ดูดซึม 100% ... ดูดซึมทันที” — Absolute 100% absorption + immediate-effect as unqualified hero badges
- `/gluta` — “สารต้านอนุมูลอิสระที่ทรงพลังที่สุดในร่างกาย” — 'Most powerful antioxidant' superlative, unqualified medical claim
- `/iv-drip` — “✓ ดูดซึม 100% ✓ เห็นผลทันที” — 100% absorption + 'immediate results' as unqualified efficacy claims in hero
- `/bach-flower` — “ไม่ใช่ยา ไม่มีผลข้างเคียง” — Absolute 'no side effects' safety guarantee, unsupported (Thai ad-law risk)
- `/oligoscan` — “ไม่เจ็บปวด ไม่มีผลข้างเคียง” — Absolute 'no side effects' safety claim, unqualified

---

## Security Findings — 2026-07-13

No secrets leak in the repo, dist, or git history, and Supabase RLS + service-role-only writes are correctly designed. The main risks are operational: the current build ships with Turnstile absent (widget not rendered in astro/dist) while the API fails open without TURNSTILE_SECRET_KEY and has no rate limiting, leaving /api/leads open to mass fake-lead spam; and GTM/Google Ads tags fire before PDPA consent with a notice-only banner. Headers are strong overall, but CSP relies on 'unsafe-inline' and the root _headers file is undeployed drift.

| Sev | Area | Finding | Fix |
|-----|------|---------|-----|
| 🔴 high | lead-api | Turnstile fails open and is absent from the current build | Fail closed in production (require TURNSTILE_SECRET_KEY, return 503 if unset), set both Turnstile env vars in Netlify build+functions, and verify the widget renders in deploy previews. |
| 🔴 high | lead-api | No rate limiting on POST /api/leads | Add Netlify rate limiting (netlify.toml [functions] rateLimit or Edge Function IP throttle, e.g. 5/min/IP) plus a simple duplicate-phone cooldown check before insert. |
| 🔴 high | client-side | GTM and Google Ads tags fire before PDPA consent; banner is notice-only | Implement Google Consent Mode v2: default ad_storage/analytics_storage to 'denied', update to 'granted' on accept, add a decline option, and gate tag firing on stored consent. |
| 🟡 medium | lead-api | Dashboard auth is one static shared key compared non-timing-safely | Use crypto.timingSafeEqual over hashed buffers; document key rotation; longer-term move dashboard reads behind per-user auth (e.g. Supabase Auth or Netlify Identity) instead of one shared token. |
| 🟡 medium | headers | CSP allows 'unsafe-inline' in script-src | Replace 'unsafe-inline' with sha256 hashes of each inline script (compute at build), or move inline scripts to self-hosted .js files; add report-to/report-uri to monitor breakage before enforcing. |
| 🟡 medium | headers | Undeployed root _headers file has already drifted from netlify.toml | Delete _headers or reduce it to a comment pointing at netlify.toml as the single source of truth for headers; never copy it into astro/public. |
| 🟡 medium | supabase | PII stored indefinitely with no retention or minimization policy | Define a retention period (e.g. anonymize lost/spam leads after 6-12 months) via pg_cron or a scheduled function; document PDPA data-subject deletion procedure; drop user_agent if unused. |
| 🟡 medium | dependencies | npm audit: 3 high / 1 moderate / 1 low in astro prod tree (fixes available) | Run npm audit fix in astro/ to pick up patched astro/vite/devalue/js-yaml, then npx astro check && npm run build; add a periodic audit step to CI. |
| 🟢 low | lead-api | Honeypot check is dead code — no form renders a 'website' field | Add a visually hidden <input type="text" name="website" tabindex="-1" autocomplete="off"> to LeadForm.astro and the quiz lead form. |
| 🟢 low | lead-api | Client controls created_at/consent_at timestamps | Let Postgres defaults set created_at (omit it from the insert); keep client consent_at but clamp it to now() ± a small tolerance server-side. |
| 🟢 low | lead-api | Supabase error detail passthrough and spoofable audit identity for key holders | Return generic messages for 5xx and map PostgREST errors to safe strings; length-cap and allowlist x-dashboard-user values, or derive identity from the auth credential. |
| ℹ️ info | platform | Entire site is noindexed (intentional staging guard) — must flip at cutover | At cutover: remove the global X-Robots-Tag, replace robots.txt, and keep noindex only on /api/* (function already sets it per-response). |

**Confirmed good practices:** Supabase RLS enabled with zero anon policies; No secrets in working tree, dist, or git history; CORS allowlisted, errors generic by default, no PII in logs; Strong security-header baseline beyond CSP; Disciplined input handling on the lead API.

---

## Page Scorecards

### Tier A — Service & Info Pages (41 pages)

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall | Last Audited |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|--------------|
| / | 7 | 8 | 9 | 9 | 10 | 9 | 8 | 9 | **8.6** | 2026-07-13 |
| /about | 7 | 8 | 8 | 10 | 10 | 9 | 8 | 8 | **8.5** | 2026-07-13 |
| /adrenal-fatigue | 8 | 9 | 8 | 10 | 10 | 8 | 10 | 9 | **9.0** | 2026-07-13 |
| /allergy-ige | 7 | 9 | 8 | 10 | 10 | 9 | 10 | 8 | **8.9** | 2026-07-13 |
| /bach-flower | 9 | 8 | 9 | 5.5 | 10 | 7 | 4 | 8 | **7.6** | 2026-07-13 |
| /cancer-screening | 8 | 9 | 8 | 10 | 10 | 9 | 10 | 8 | **9.0** | 2026-07-13 |
| /check-up | 8 | 9 | 8 | 10 | 10 | 9 | 10 | 8 | **9.0** | 2026-07-13 |
| /check-up/acne-solution | 7 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.1** | 2026-07-13 |
| /check-up/dna-health-life | 8 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.2** | 2026-07-13 |
| /check-up/food-intolerance | 7 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.1** | 2026-07-13 |
| /check-up/healthy-balance | 7 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.1** | 2026-07-13 |
| /check-up/heavy-metal-trace-elements | 8 | 10 | 8 | 7 | 10 | 7 | 10 | 8 | **8.5** | 2026-07-13 |
| /check-up/hormones | 8 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.2** | 2026-07-13 |
| /check-up/iconic-balance | 7 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.1** | 2026-07-13 |
| /check-up/immune-check-up | 7 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.1** | 2026-07-13 |
| /check-up/optimum-balance | 7 | 9 | 8 | 7 | 10 | 7 | 10 | 8 | **8.2** | 2026-07-13 |
| /check-up/special-test | 8 | 9 | 8 | 7 | 10 | 7 | 10 | 8 | **8.4** | 2026-07-13 |
| /check-up/urine-organic-test | 8 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.2** | 2026-07-13 |
| /check-up/vitamins-and-micronutrients | 7 | 9 | 8 | 7 | 10 | 6 | 10 | 8 | **8.1** | 2026-07-13 |
| /check-up/young-balance | 8 | 9 | 9 | 7 | 10 | 6 | 10 | 8 | **8.4** | 2026-07-13 |
| /chelation | 8 | 10 | 8 | 10 | 10 | 8 | 10 | 8 | **9.0** | 2026-07-13 |
| /contact | 9 | 8 | 10 | 8 | 10 | 10 | 6 | 8 | **8.6** | 2026-07-13 |
| /dna-test | 9 | 8 | 9 | 10 | 10 | 9 | 10 | 8 | **9.1** | 2026-07-13 |
| /epispan | 8 | 9 | 9 | 10 | 10 | 9 | 10 | 9 | **9.2** | 2026-07-13 |
| /fit132 | 9 | 10 | 9 | 8.5 | 10 | 8 | 10 | 9 | **9.2** | 2026-07-13 |
| /food-intolerance | 7 | 10 | 8 | 10 | 10 | 8 | 10 | 9 | **9.0** | 2026-07-13 |
| /gluta | 8 | 10 | 9 | 10 | 10 | 9 | 7 | 7 | **8.8** | 2026-07-13 |
| /hbot | 8 | 8 | 8 | 10 | 10 | 9 | 10 | 9 | **9.0** | 2026-07-13 |
| /hormones-quiz | 7 | 9 | 8 | 10 | 10 | 8 | 10 | 9 | **8.9** | 2026-07-13 |
| /iv-drip | 8 | 9 | 9 | 10 | 10 | 9 | 8 | 8 | **8.9** | 2026-07-13 |
| /lp/adrenal-fatigue | 7 | 6 | 6 | 10 | 9 | 10 | 7 | 8 | **7.9** | 2026-07-13 |
| /mental-health | 8 | 7 | 8 | 5.5 | 10 | 8 | 6 | 9 | **7.7** | 2026-07-13 |
| /nad | 9 | 9 | 9 | 10 | 10 | 8 | 10 | 7 | **9.0** | 2026-07-13 |
| /nk-cell | 7 | 10 | 8 | 10 | 10 | 10 | 10 | 8 | **9.1** | 2026-07-13 |
| /oligoscan | 8 | 10 | 9 | 10 | 10 | 9 | 8 | 8 | **9.0** | 2026-07-13 |
| /personalized-vitamins | 7 | 10 | 8 | 10 | 10 | 8 | 10 | 8 | **8.9** | 2026-07-13 |
| /thank-you | 8 | 5 | 6 | 10 | 10 | 10 | 5 | 8 | **7.8** | 2026-07-13 |
| /therapist-consult | 9 | 9 | 10 | 5.5 | 10 | 8 | 6 | 9 | **8.3** | 2026-07-13 |
| /urine-organic-test | 7 | 9 | 8 | 10 | 10 | 9 | 10 | 8 | **8.9** | 2026-07-13 |
| /vitamin-d | 8 | 9 | 8 | 10 | 10 | 8 | 10 | 8 | **8.9** | 2026-07-13 |
| /vitamins-and-micronutrients | 8 | 8 | 9 | 10 | 10 | 8 | 10 | 8 | **8.9** | 2026-07-13 |

### Tier B — Blog listing pages (audited this sweep; overall = 6 dims, SEO/GEO reference only)

| Page | SEO | GEO | Meta | Schema | Images | FAQ | E-E-A-T | Orig | Overall | Last Audited |
|------|-----|-----|------|--------|--------|-----|---------|------|---------|--------------|
| /blog | 4 | 4 | 8 | 3 | 10 | 10 | 6 | 10 | **7.8** | 2026-07-13 |
| /blog/mental-health | 4 | 4 | 6 | 1 | 10 | 10 | 6 | 10 | **7.2** | 2026-07-13 |

### Tier B — Blog Posts (from 2026-05-30 sweep — [stale], re-audit from a networked session)

_Overall = avg of 5 dimensions: Meta + Schema + Images + FAQ + E-E-A-T. SEO and GEO shown for reference only._

| Page | SEO† | GEO† | Meta | Schema | Images | FAQ | E-E-A-T | Overall | Last Audited |
|------|------|------|------|--------|--------|-----|---------|---------|--------------|
| /blog/_gaba | 5 | 10 | 0 | 0 | 8 | 7 | 9 | **4.8** | 2026-05-30 [stale] |
| /blog/_pcos | 8 | 10 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 [stale] |
| /blog/6_benefits_kombucha | 7 | 7 | 2 | 0 | 7 | 5 | 8 | **4.4** | 2026-05-30 [stale] |
| /blog/8-ลักษณะสุขภาพดี | 6 | 6 | 1 | 0 | 8 | 6 | 6 | **4.2** | 2026-05-30 [stale] |
| /blog/abnormal-period | 8 | 10 | 2 | 0 | 8 | 7 | 9 | **5.2** | 2026-05-30 [stale] |
| /blog/adrenal-fatigue-post | 8 | 10 | 2 | 0 | 8 | 7 | 9 | **5.2** | 2026-05-30 [stale] |
| /blog/apple-benefit | 7 | 9 | 2 | 0 | 6 | 7 | 8 | **4.6** | 2026-05-30 [stale] |
| /blog/ashwagandha | 8 | 10 | 2 | 0 | 10 | 0 | 7 | **3.8** ⚠️ | 2026-05-30 [stale] |
| /blog/bromelain | 8 | 10 | 2 | 0 | 8 | 7 | 9 | **5.2** | 2026-05-30 [stale] |
| /blog/check-immune-system | 8 | 8 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 [stale] |
| /blog/chili | 9 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 [stale] |
| /blog/chromium | 8 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 [stale] |
| /blog/cloggedarteries | 8 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 [stale] |
| /blog/coenzyme-q10 | 8 | 10 | 2 | 0 | 7 | 7 | 8 | **4.8** | 2026-05-30 [stale] |
| /blog/femaleshormones | 8 | 8 | 2 | 0 | 9 | 6 | 8 | **5.0** | 2026-05-30 [stale] |
| /blog/food-allergy-ige | 8 | 10 | 5 | 1 | 9 | 7 | 9 | **6.2** | 2026-05-30 [stale] |
| /blog/glutathione | 9 | 10 | 2 | 0 | 10 | 7 | 9 | **5.6** | 2026-05-30 [stale] |
| /blog/growth-factor | 6 | 7 | 0 | 0 | 6 | 6 | 7 | **3.8** ⚠️ | 2026-05-30 [stale] |
| /blog/growth-hormone-2 | 8 | 10 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 [stale] |
| /blog/herbal-compress-massage | 6 | 10 | 1 | 0 | 10 | 7 | 7 | **5.0** | 2026-05-30 [stale] |
| /blog/how-to-overcome-burn-out-syndrome | 8 | 9 | 2 | 1 | 7 | 7 | 6 | **4.6** | 2026-05-30 [stale] |
| /blog/human-growth-hormone | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 [stale] |
| /blog/immunesystem | 8 | 10 | 3 | 0 | 10 | 7 | 7 | **5.4** | 2026-05-30 [stale] |
| /blog/immunity | 8 | 8 | 2 | 0 | 8 | 6 | 8 | **4.8** | 2026-05-30 [stale] |
| /blog/insulin | 8 | 10 | 2 | 0 | 7 | 7 | 8 | **4.8** | 2026-05-30 [stale] |
| /blog/l-carnitine | 7 | 7 | 2 | 0 | 7 | 5 | 8 | **4.4** | 2026-05-30 [stale] |
| /blog/magnesium | 6 | 10 | 1 | 0 | 8 | 7 | 9 | **5.0** | 2026-05-30 [stale] |
| /blog/menorrhagia | 8 | 9 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 [stale] |
| /blog/menstrual-pain | 7 | 8 | 2 | 0 | 8 | 6 | 7 | **4.6** | 2026-05-30 [stale] |
| /blog/mental-health | 7 | 8 | 2 | 0 | 8 | 5 | 8 | **4.6** | 2026-05-30 [stale] |
| /blog/minerals | 8 | 7 | 2 | 0 | 9 | 6 | 8 | **5.0** | 2026-05-30 [stale] |
| /blog/mood-swings | 6 | 10 | 1 | 0 | 10 | 7 | 9 | **5.4** | 2026-05-30 [stale] |
| /blog/neurotransmitter | 8 | 9 | 2 | 0 | 10 | 7 | 8 | **5.4** | 2026-05-30 [stale] |
| /blog/neurotransmitters | 7 | 8 | 1 | 0 | 8 | 6 | 7 | **4.4** | 2026-05-30 [stale] |
| /blog/nkcell | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 [stale] |
| /blog/omega-3 | 8 | 8 | 2 | 0 | 8 | 5 | 7 | **4.4** | 2026-05-30 [stale] |
| /blog/pelvicinflammatorydisease | 8 | 9 | 3 | 1 | 9 | 7 | 9 | **5.8** | 2026-05-30 [stale] |
| /blog/periodpain | 8 | 10 | 2 | 0 | 8 | 6 | 9 | **5.0** | 2026-05-30 [stale] |
| /blog/pms-premenstrualsyndrome | 8 | 10 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 [stale] |
| /blog/postbiotic | 8 | 10 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 [stale] |
| /blog/preservatives | 8 | 10 | 3 | 1 | 9 | 7 | 7 | **5.4** | 2026-05-30 [stale] |
| /blog/progesterone | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 [stale] |
| /blog/silica | 6 | 10 | 0 | 0 | 10 | 7 | 9 | **5.2** | 2026-05-30 [stale] |
| /blog/sleepwalking | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 [stale] |
| /blog/smiling-depression | 8 | 9 | 2 | 0 | 9 | 7 | 8 | **5.2** | 2026-05-30 [stale] |
| /blog/syncope | 8 | 9 | 5 | 5 | 9 | 7 | 8 | **6.8** ⭐ | 2026-05-30 [stale] |
| /blog/testosterone-woman | 8 | 9 | 1 | 1 | 9 | 7 | 8 | **5.2** | 2026-05-30 [stale] |
| /blog/triglyceride | 6 | 10 | 1 | 0 | 10 | 7 | 7 | **5.0** | 2026-05-30 [stale] |
| /blog/tryptophan | 6 | 10 | 0 | 0 | 10 | 7 | 9 | **5.2** | 2026-05-30 [stale] |
| /blog/vitamin-a | 8 | 10 | 3 | 0 | 9 | 7 | 9 | **5.6** | 2026-05-30 [stale] |
| /blog/vitamin-b3 | 8 | 10 | 1 | 1 | 9 | 7 | 9 | **5.4** | 2026-05-30 [stale] |
| /blog/vitamin-b6 | 8 | 10 | 5 | 1 | 9 | 7 | 9 | **6.2** | 2026-05-30 [stale] |
| /blog/vitamin-d-immune | 6 | 7 | 1 | 0 | 7 | 6 | 6 | **4.0** | 2026-05-30 [stale] |
| /blog/zinc-checklist | 8 | 7 | 2 | 0 | 8 | 6 | 8 | **4.8** | 2026-05-30 [stale] |
| /blog/คู่มือทานวิตามินซี | 8 | 10 | 3 | 0 | 9 | 7 | 9 | **5.6** | 2026-05-30 [stale] |
| /blog/ตรวจภูมิแพ้อาหารแฝง-igg | 8 | 10 | 2 | 0 | 8 | 7 | 8 | **5.0** | 2026-05-30 [stale] |
| /blog/ปัญหาสิวประจำเดือน | 8 | 8 | 2 | 0 | 9 | 7 | 8 | **5.2** | 2026-05-30 [stale] |
| /blog/ผื่นลมพิษ | 6 | 10 | 1 | 0 | 9 | 7 | 7 | **4.8** | 2026-05-30 [stale] |
| /blog/ภูมิคุ้มกันพัง | 8 | 10 | 3 | 0 | 8 | 7 | 9 | **5.4** | 2026-05-30 [stale] |
| /blog/ลำไส้อักเสบ | 8 | 8 | 2 | 0 | 8 | 6 | 8 | **4.8** | 2026-05-30 [stale] |
| /blog/สเตียรอยด์ | 8 | 10 | 2 | 1 | 7 | 7 | 9 | **5.2** | 2026-05-30 [stale] |
| /blog/อาหารที่มี-probiotic | 8 | 7 | 2 | 0 | 7 | 6 | 8 | **4.6** | 2026-05-30 [stale] |
| /blog/ฮอร์โมนวัยทอง | 8 | 10 | 2 | 0 | 6 | 7 | 8 | **4.6** | 2026-05-30 [stale] |

---

## Page Detail Blocks

---

### / — 8.6/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 8 · Meta 9 · Schema 9 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 9

**Issues:**
- SEO: Title 65 chars — slightly over 60, will truncate
- SEO: H1 'เหนื่อยไม่หายไม่ใช่เรื่องปกติ' has no brand or service keyword
- SEO: Body ~677 words — thin for the homepage of a 40-page service site
- GEO: Opening block is a fragment list, not a 2-3 sentence 'what is Thrive' answer
- GEO: Hero copy doesn't state clinic + Bangkok + specialty in one quotable paragraph
- Meta: Title 65 chars (target 50-60)
- Schema: No BreadcrumbList schema (minor for home)
- Schema: Person node lacks image/sameAs; clinic named 'Center' here vs 'Clinic' on 36 pages

**Priority actions:**
1. Add a 2-3 sentence plain intro under H1: what Thrive is, where (Bangkok/Lat Phrao), for whom
2. Work brand or 'คลินิก Functional Medicine' into the H1
3. Expand homepage body toward 800+ words with self-contained service summaries
4. Align schema @id domain sitewide (home uses new., inner pages use www.)
5. Unify clinic name: 'Thrive Wellness Center' here vs 'Clinic' elsewhere
6. Add image/sameAs to Person node; trim title to 50-60 chars

---

### /about — 8.5/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 8 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 8

**Issues:**
- SEO: Title 71 chars — trim to 50-60
- SEO: Meta description 183 chars — will truncate at ~160
- SEO: Zero contextual links to service pages in body (nav links only)
- GEO: Intro is philosophy, not a direct 'what is Thrive Wellness Clinic' answer
- GEO: Only 1 stat/number in body — add founding year, patient counts, credentials
- Meta: Title 71 chars (target 50-60)
- Meta: Meta description 183 chars (target 140-160)
- Schema: 3 Person nodes (all doctors) but none carry license identifier or sameAs

**Priority actions:**
1. Rewrite intro as direct answer: clinic type, location, lead doctor, since when
2. Link 3-5 flagship services from the body text
3. Trim title to <=60 and description to 140-160 chars
4. Trim title to 50-60 chars (now 71)
5. Tighten meta description to 140-160 chars (now 183)
6. Add medical license identifier + sameAs to the 3 doctor Person nodes

---

### /adrenal-fatigue — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 9

**Issues:**
- SEO: Broken related-services link /nad-plus — actual page is /nad
- SEO: Title 78 chars — truncates
- SEO: Meta description 171 chars — slightly over
- GEO: First paragraph is a symptom hook; definition only arrives in 2nd paragraph
- Meta: Title 78 chars (target 50-60)
- Meta: Meta description 171 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: JSON-LD Q4 truncated vs visible ('รักษาได้ไหม?' drops 'ใช้เวลานานแค่ไหน') - sets mismatch

**Priority actions:**
1. Fix /nad-plus -> /nad link
2. Trim title to <=60 chars keeping 'ต่อมหมวกไตล้า Adrenal Fatigue'
3. Move the 1-sentence definition into the first paragraph
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 78)
6. Tighten meta description to 140-160 chars (now 171)

---

### /allergy-ige — 8.9/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 77 chars — truncates
- SEO: Meta description 175 chars — over 160
- SEO: H1 'จาม ผื่น หายใจไม่ออก...' lacks primary keyword ตรวจภูมิแพ้ IgE
- GEO: Body says Crystal Park/ลาดพร้าว but never กรุงเทพ/Bangkok
- Meta: Title 77 chars (target 50-60)
- Meta: Meta description 175 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: No price/cost question

**Priority actions:**
1. Add 'ตรวจภูมิแพ้ IgE' to the H1
2. Trim title and description into range
3. Mention กรุงเทพ once in body copy
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 77)
6. Tighten meta description to 140-160 chars (now 175)

---

### /bach-flower — 7.6/10 — Audited 2026-07-13

**Scores:** SEO 9 · GEO 8 · Meta 9 · Schema 5.5 · Images 10 · FAQ 7 · E-E-A-T 4 · Orig 8

**Issues:**
- SEO: Title 74 chars — trim to 50-60
- SEO: No in-prose contextual links; only the related-services block
- GEO: Doctor name absent from body text
- GEO: Body never says กรุงเทพ/Bangkok explicitly
- Meta: Title 74 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 3 Q&A pairs vs 6 visible accordions (target >=5)
- Schema: No BreadcrumbList schema

**Priority actions:**
1. Add doctor/therapist attribution to body
2. Trim title to <=60 chars
3. Add Bangkok mention alongside ลาดพร้าว
4. Sync FAQPage schema with visible FAQs (3 vs 6); grow to 5+ Q&As
5. Add BreadcrumbList + Person node for Dr. Chanakan
6. Fix hreflang URLs to match canonical domain (new. vs www.)

---

### /cancer-screening — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 71 chars — truncates
- SEO: Meta description 166 chars — slightly over
- SEO: hreflang en points to /en/cancer-screening which does not exist
- GEO: 2nd content block is a bare question heading, weakens quotability
- GEO: Body never says กรุงเทพ explicitly (Crystal Park only)
- Meta: Title 71 chars (target 50-60)
- Meta: Meta description 166 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals

**Priority actions:**
1. Fix or remove /en/ hreflang
2. Trim title/description into range
3. Merge the direct answer into one 2-3 sentence paragraph naming Bangkok
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 71)
6. Tighten meta description to 140-160 chars (now 166)

---

### /check-up — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 77 chars — truncates
- SEO: Meta description 116 chars — under 140
- GEO: Body never says กรุงเทพ explicitly despite title claiming it
- Meta: Title 77 chars (target 50-60)
- Meta: Meta description 116 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: Deep check OK: all 5 schema FAQs match visible text; single clinic definition per page
- FAQ: No price/cost question (key for a packages hub)

**Priority actions:**
1. Expand description to 140-160 chars
2. Trim title to <=60 keeping 'ตรวจสุขภาพ'
3. Add กรุงเทพ to body copy (hub page is strong otherwise: 16 contextual links)
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 77)
6. Grow meta description to 140-160 chars (now 116)

---

### /check-up/acne-solution — 8.1/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Meta description 117 chars — under 140
- SEO: Title 74 chars — truncates
- SEO: H1 lacks package name 'Acne Solution'
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 74 chars (target 50-60)
- Meta: Meta description 117 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Expand description to 140-160 with price/turnaround
2. Add 'Acne Solution' to H1
3. Trim title to <=60 chars
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (74) and grow description (117) to targets

---

### /check-up/dna-health-life — 8.2/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 79 chars — truncates
- SEO: Meta description 120 chars — under 140
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 79 chars (target 50-60)
- Meta: Meta description 120 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)
- Images: Page image weight 10.2MB >1.5MB; og:image same file exceeds 8MB scraper limit

**Priority actions:**
1. Trim title to <=60 chars
2. Expand description to 140-160
3. Add Bangkok mention to doctor/location blurb
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (79) and grow description (120) to targets

---

### /check-up/food-intolerance — 8.1/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title targets identical keyword as /food-intolerance ('ตรวจภูมิแพ้อาหารแฝง IgG 222 ชนิด') — cannibalization
- SEO: Meta description 101 chars — well under 140
- SEO: H1 lacks IgG/ภูมิแพ้อาหารแฝง keyword
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 66 chars (target 50-60)
- Meta: Meta description 101 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Differentiate title toward package/price intent vs the pillar /food-intolerance page
2. Expand description to 140-160 chars
3. Add keyword to H1
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (66) and grow description (101) to targets

---

### /check-up/healthy-balance — 8.1/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 79 chars — truncates
- SEO: H1 lacks program name 'Healthy Balance'
- SEO: Meta description 135 chars — just under 140
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 79 chars (target 50-60)
- Meta: Meta description 135 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Add 'Healthy Balance' to H1
2. Trim title to <=60 chars
3. Nudge description into 140-160 range
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (79) and grow description (135) to targets

---

### /check-up/heavy-metal-trace-elements — 8.5/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 10 · Meta 8 · Schema 7 · Images 10 · FAQ 7 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 75 chars — truncates
- SEO: Meta description 127 chars — under 140
- GEO: Minor: only 6 stats — could add per-metal thresholds for richer quoting
- Meta: Title 75 chars (target 50-60)
- Meta: Meta description 127 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)
- Images: Page image weight 5.0MB >1.5MB (hero JPG)

**Priority actions:**
1. Trim title to <=60 chars
2. Expand description to 140-160
3. Keep as GEO template — strongest page pattern on site
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (75) and grow description (127) to targets

---

### /check-up/hormones — 8.2/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Meta description 125 chars — under 140
- SEO: Title 65 chars — slightly over
- SEO: H1 is symptom hook; 'ตรวจฮอร์โมน' only implied
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 65 chars (target 50-60)
- Meta: Meta description 125 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible (deep check: 'abnormal results' Q missing from schema)

**Priority actions:**
1. Expand description to 140-160
2. Add 'ตรวจฮอร์โมน 18 ตัว' to H1
3. Trim title by ~5 chars
4. Expand FAQPage to 5+ Q&As; add missing 3rd visible FAQ to schema
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (65) and grow description (125) to targets

---

### /check-up/iconic-balance — 8.1/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 82 chars — truncates badly
- SEO: H1 lacks program name 'Iconic Balance'
- SEO: Meta description 120 chars — under 140
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 82 chars (target 50-60)
- Meta: Meta description 120 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Trim title to <=60 chars
2. Add 'Iconic Balance' to H1
3. Expand description to 140-160
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (82) and grow description (120) to targets

---

### /check-up/immune-check-up — 8.1/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Meta description 109 chars — well under 140
- SEO: Title 76 chars — truncates
- SEO: H1 lacks 'Immune Check-up' name
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 76 chars (target 50-60)
- Meta: Meta description 109 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Expand description to 140-160 with CD Profile detail
2. Trim title to <=60
3. Name the package in H1
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (76) and grow description (109) to targets

---

### /check-up/optimum-balance — 8.2/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 7 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 70 chars — over 60
- SEO: H1 lacks program name 'Optimum Balance'
- SEO: Meta description 136 chars — just under 140
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 70 chars (target 50-60)
- Meta: Meta description 136 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Add 'Optimum Balance' to H1
2. Trim title to <=60
3. Nudge description to 140-160
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (70) and grow description (136) to targets

---

### /check-up/special-test — 8.4/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 7 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Meta description 121 chars — under 140
- SEO: Title 66 chars — slightly over
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 66 chars (target 50-60)
- Meta: Meta description 121 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)
- Images: Page image weight 3.9MB >1.5MB (hero JPG)

**Priority actions:**
1. Expand description to 140-160
2. Trim title to <=60
3. Add Bangkok to location blurb
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (66) and grow description (121) to targets

---

### /check-up/urine-organic-test — 8.2/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 83 chars — truncates badly
- SEO: Near-duplicate keyword target of /urine-organic-test — cannibalization risk
- SEO: Meta description 121 chars — under 140
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 83 chars (target 50-60)
- Meta: Meta description 121 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Differentiate title toward package intent (price/50+ acids) vs pillar page
2. Trim title to <=60
3. Expand description to 140-160
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (83) and grow description (121) to targets

---

### /check-up/vitamins-and-micronutrients — 8.1/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: H1 byte-identical to /vitamins-and-micronutrients — duplicate H1 across two indexable pages
- SEO: Meta description 112 chars — under 140
- SEO: Title 71 chars — over 60
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 71 chars (target 50-60)
- Meta: Meta description 112 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 3 visible accordions (target >=5)

**Priority actions:**
1. Write a unique package-intent H1 to break duplication with the pillar page
2. Expand description to 140-160
3. Trim title to <=60
4. Expand FAQPage to 5+ Q&As; at minimum add the 3rd visible FAQ
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (71) and grow description (112) to targets

---

### /check-up/young-balance — 8.4/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 9 · Schema 7 · Images 10 · FAQ 6 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 73 chars — truncates
- SEO: H1 lacks program name 'Young Balance'
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 73 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 2 Q&A pairs vs 4 visible accordions (target >=5)
- Images: Page image weight 3.9MB >1.5MB (hero JPG)
- FAQ: 4 FAQs but JSON-LD has only 2 (subset)

**Priority actions:**
1. Add 'Young Balance' to H1
2. Trim title to <=60
3. Add Bangkok mention
4. Expand FAQPage to 5+ Q&As; sync with 4 visible FAQs
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title to 50-60 chars (now 73)

---

### /chelation — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 10 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 85 chars — among longest on site, truncates badly
- SEO: H1 lacks 'คีเลชั่น' keyword (topic words only)
- SEO: Meta description 166 chars — slightly over
- Meta: Title 85 chars (target 50-60)
- Meta: Meta description 166 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: JSON-LD rewords 2 Qs ('Chelation IV' vs 'Chelation Therapy') - sets mismatch
- FAQ: No price/cost question

**Priority actions:**
1. Trim title to <=60 keeping 'คีเลชั่น EDTA'
2. Add คีเลชั่น to H1
3. Trim description to <=160
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 85)
6. Tighten meta description to 140-160 chars (now 166)

---

### /contact — 8.6/10 — Audited 2026-07-13

**Scores:** SEO 9 · GEO 8 · Meta 10 · Schema 8 · Images 10 · FAQ 10 · E-E-A-T 6 · Orig 8

**Issues:**
- SEO: No contextual links to service pages from body
- SEO: Minor: no doctor name on the contact page
- GEO: Doctor name absent — add for entity completeness
- GEO: Few numbers beyond phone/hours
- Schema: No Person/Physician node for Dr. Chanakan (MedicalClinic+LocalBusiness+ContactPage present — fit for purpose)
- Images: No content images (map/storefront photo would help; no deduction)
- Orig: Inherited (utility page, minimal editorial content)

**Priority actions:**
1. Add doctor name + 2-3 service links to body
2. Keep title (53 chars, in range) and NAP block as-is — best-optimized meta on site
3. Ensure LocalBusiness schema NAP matches llms.txt after llms.txt fix
4. Optionally add Person node for Dr. Chanakan
5. Align @id domain with rest of site (this page uses new., most use www.)
6. Optionally add clinic exterior/map image

---

### /dna-test — 9.1/10 — Audited 2026-07-13

**Scores:** SEO 9 · GEO 8 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 84 chars — truncates badly
- SEO: hreflang en points to /en/dna-test which does not exist
- GEO: First paragraph explains genes, not 'what is the DNA test' — definition delayed
- GEO: Only 2 stats with units in body — add report counts, turnaround, price
- Meta: Title 84 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: No price/cost question
- Orig: Nutrigenomics gene panels are standard industry list; original phrasing

**Priority actions:**
1. Trim title to <=60 chars
2. Fix or remove /en/ hreflang
3. Lead with a 2-sentence test definition and add concrete numbers
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 84)
6. Add price/cost FAQ question

---

### /epispan — 9.2/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 10 · Orig 9

**Issues:**
- SEO: H1 lacks 'EpiSpan' keyword
- SEO: hreflang en points to /en/epispan which does not exist
- SEO: Title 64 chars — slightly over
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 64 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: No price/cost question
- Orig: Unique TruDiagnostic + Thai (Chula/Mahidol) framing; original, no verbatim match

**Priority actions:**
1. Add EpiSpan to H1
2. Fix or remove /en/ hreflang
3. Trim title by ~4 chars
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 64)
6. Add price/cost FAQ question

---

### /fit132 — 9.2/10 — Audited 2026-07-13

**Scores:** SEO 9 · GEO 10 · Meta 9 · Schema 8.5 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 9

**Issues:**
- SEO: Title 76 chars — truncates
- SEO: No in-prose links beyond related-services block
- Meta: Title 76 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 4 Q&A pairs vs 6 visible accordions (target >=5)
- Images: Page image weight 6.1MB >1.5MB (hero JPG)
- FAQ: JSON-LD has only 4 of 6 visible Qs
- FAQ: No price/cost question

**Priority actions:**
1. Trim title to <=60 keeping 'FIT 132'
2. Add 1-2 in-prose links to /food-intolerance comparison content
3. Use this page as the template for other service pages
4. Sync FAQPage schema with visible FAQs (4 vs 6); grow to 5+ Q&As
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title to 50-60 chars (now 76)

---

### /food-intolerance — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 10 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 9

**Issues:**
- SEO: Meta description 115 chars — under 140
- SEO: Shares primary keyword+title with /check-up/food-intolerance — cannibalization
- SEO: H1 lacks 'IgG'/'แฝง' precision
- Meta: Title 65 chars (target 50-60)
- Meta: Meta description 115 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: Deep check: 2 of 5 schema FAQ Q&As (symptoms/causes) not in visible FAQ accordion — align text
- FAQ: JSON-LD swaps 2 Qs (symptoms/causes) not in visible FAQ - guideline risk

**Priority actions:**
1. Expand description to 140-160 chars
2. Resolve cannibalization: make this the pillar, re-target the /check-up twin
3. Add 'ตรวจภูมิแพ้อาหารแฝง IgG' to H1
4. Align schema FAQ Q4-Q5 with visible on-page FAQ text
5. Fix hreflang URLs to match canonical domain (new. vs www.)
6. Trim title (65) and grow description (115) to targets

---

### /gluta — 8.8/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 10 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 7 · Orig 7

**Issues:**
- SEO: Title 92 chars — longest on site, truncates badly
- SEO: No in-prose contextual links beyond related block
- Meta: Title 92 chars (target 50-60) — longest on site
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: No price/cost question
- Orig: Glutathione claims (master antioxidant/3-amino/tyrosinase/100%) are genre-standard boilerplate
- E-E-A-T: Superlative violation: '100% absorption' + 'most powerful antioxidant' bare claims

**Priority actions:**
1. Cut title to <=60: 'กลูต้าไธโอนดริป IV กรุงเทพ | Thrive Wellness Clinic'
2. Keep the P1 definition pattern — exemplary direct answer
3. Add 1 in-prose link to /iv-drip or /nad
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 92, worst on site)
6. Add price/cost FAQ question

---

### /hbot — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 8 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 10 · Orig 9

**Issues:**
- SEO: H1 'นอนพัก 60 นาที...' never names HBOT — weakest H1/keyword match on site
- SEO: Meta description 168 chars — slightly over
- GEO: Opening answer paragraph also never names HBOT — AI can't attribute the quote
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 61 chars (target 50-60)
- Meta: Meta description 168 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: JSON-LD swaps 1 Q ('รู้สึกอย่างไร' replaces combo-therapy Q) - mismatch

**Priority actions:**
1. Add 'HBOT' to H1 and to the first paragraph
2. Trim description to <=160
3. Add Bangkok mention
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title by 1-2 chars (now 61)
6. Tighten meta description to 140-160 chars (now 168)

---

### /hormones-quiz — 8.9/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 9

**Issues:**
- SEO: Broken link to /blog/female-hormone-panel-age-40 (post doesn't exist)
- SEO: Title 66 chars — slightly over
- SEO: Meta description 163 chars — slightly over
- GEO: Direct answer is quiz-pitch; brief 'what hormones do' definition would help quoting
- Meta: Title 66 chars (target 50-60)
- Meta: Meta description 163 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: JSON-LD Q5 truncated vs visible - sets mismatch

**Priority actions:**
1. Remove or retarget the dead blog link
2. Trim title/description into range
3. Add a 2-sentence hormone-imbalance definition above the quiz
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title (66) and description (163) to targets
6. Sync JSON-LD wording with visible FAQ

---

### /iv-drip — 8.9/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 8

**Issues:**
- SEO: Broken link /hormones — actual page is /check-up/hormones
- SEO: Title 68 chars — slightly over
- GEO: First paragraph is benefit-led; never defines IV drip therapy plainly
- Meta: Title 68 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: No price/cost question
- Orig: IV 100%/15-30% bioavailability framing genre-standard across IV clinics; original wording
- E-E-A-T: Superlative violation: bare '100% / เห็นผลทันที' hero claims

**Priority actions:**
1. Fix /hormones -> /check-up/hormones link
2. Add a 1-sentence 'IV Drip คือ...' definition to the opening
3. Trim title to <=60
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 68)
6. Add price/cost FAQ question

---

### /lp/adrenal-fatigue — 7.9/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 6 · Meta 6 · Schema 10 · Images 9 · FAQ 10 · E-E-A-T 7 · Orig 8

**Issues:**
- SEO: noindex + canonical to /adrenal-fatigue — correct for ads LP, but page sits in sitemap
- SEO: Meta description 110 chars — under range (low impact given noindex)
- GEO: Thin by design (225 words), no FAQ — acceptable for a noindexed ad LP
- Meta: Meta description 110 chars (target 140-160)
- Meta: Canonical points to /adrenal-fatigue — cross-canonical LP, intentional; page is noindex
- Meta: No hreflang — correct for a noindexed page
- Images: Broken img src /logo.svg - file missing from dist (LP header logo)
- Orig: Inherited; trimmed paid-landing variant of /adrenal-fatigue (intentionally similar, not full dup)

**Priority actions:**
1. Remove from sitemap-0.xml (noindex pages don't belong there)
2. Leave noindex/canonical as-is — correct setup
3. No content changes needed; judged fit for ad-LP purpose
4. No schema action needed — noindex + cross-canonical is correct LP setup
5. Confirm canonical-to-service-page is intended before launch
6. Fix/add /logo.svg or point to /Thrive-logo-160px.png

---

### /mental-health — 7.7/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 7 · Meta 8 · Schema 5.5 · Images 10 · FAQ 8 · E-E-A-T 6 · Orig 9

**Issues:**
- SEO: Title 61 chars — borderline
- SEO: Overlaps topically with /therapist-consult — watch cannibalization
- GEO: No clinic location (ลาดพร้าว/กรุงเทพ) anywhere in body
- GEO: No doctor/therapist name in body
- GEO: Zero stats/numbers with units in body
- Meta: Title 61 chars (target 50-60)
- Meta: Meta description 139 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals

**Priority actions:**
1. Add location + practitioner name to body text
2. Add concrete numbers (session length, price range, availability)
3. Differentiate intent vs /therapist-consult (hub vs service)
4. Sync FAQPage with visible FAQs (3 vs 5); grow to 5+ Q&As
5. Add BreadcrumbList + Person node (Dr. Chanakan or therapist)
6. Fix hreflang URLs to match canonical domain (new. vs www.)

---

### /nad — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 9 · GEO 9 · Meta 9 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 7

**Issues:**
- SEO: Title 79 chars — truncates
- SEO: Inbound link bug elsewhere: /adrenal-fatigue links to /nad-plus instead of /nad
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 79 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: JSON-LD rewords 3 Qs ('NAD+ IV Drip' vs 'NAD+ Therapy') - sets mismatch
- FAQ: No price/cost question
- Orig: 'อายุ40/NAD+ ลด50%' stat & phrasing mirror multiple Thai clinic sites (shared boilerplate)

**Priority actions:**
1. Trim title to <=60 keeping 'NAD+ IV Drip กรุงเทพ'
2. Fix the /nad-plus inbound reference (and same URL in llms.txt)
3. Add Bangkok mention to body
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 79)
6. Sync JSON-LD wording with visible FAQ

---

### /nk-cell — 9.1/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 10 · Meta 8 · Schema 10 · Images 10 · FAQ 10 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: H1 lacks 'NK Cell' keyword
- SEO: Meta description 170 chars — over 160
- SEO: Title 68 chars — slightly over
- Meta: Title 68 chars (target 50-60)
- Meta: Meta description 170 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Orig: Inherited from spot-check

**Priority actions:**
1. Add 'ตรวจ NK Cell' to H1
2. Trim description to <=160
3. Trim title to <=60
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title (68) and description (170) to targets
6. None - use this page's 7-Q FAQ (incl. price) as the template for other pages

---

### /oligoscan — 9.0/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 10 · Meta 9 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 8 · Orig 8

**Issues:**
- SEO: Title 80 chars — truncates
- SEO: H1 describes benefit but omits 'OligoScan' name
- Meta: Title 80 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: No price/cost question
- Orig: Inherited from spot-check
- E-E-A-T: Superlative violation: 'ไม่มีผลข้างเคียง' absolute safety claim

**Priority actions:**
1. Trim title to <=60 keeping 'OligoScan'
2. Add OligoScan to H1
3. Keep 3-minute/21-mineral stats pattern — strong for AI quoting
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 80)
6. Add price/cost FAQ question

---

### /personalized-vitamins — 8.9/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 10 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Meta description 180 chars — far over 160
- SEO: Title 80 chars — truncates
- SEO: H1 lacks 'Personalized Vitamins' service name
- Meta: Title 80 chars (target 50-60)
- Meta: Meta description 180 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: No price/cost or explicit who-is-it-for question
- Orig: Inherited from spot-check

**Priority actions:**
1. Cut description to 140-160
2. Trim title to <=60
3. Add service name to H1
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title (80) and description (180) to targets
6. Add price + 'ใครควรตรวจ' questions

---

### /thank-you — 7.8/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 5 · Meta 6 · Schema 10 · Images 10 · FAQ 10 · E-E-A-T 5 · Orig 8

**Issues:**
- SEO: Correctly noindexed, but included in sitemap-0.xml
- Meta: Title 38 chars, description 99 chars — acceptable for noindex utility page
- Meta: No hreflang — correct for a noindexed page
- Orig: Inherited (utility confirmation page, minimal editorial content)
- E-E-A-T: No hreflang tags

**Priority actions:**
1. Remove from sitemap
2. No other changes — fit for purpose
3. Optionally add next-step service links for users
4. No action needed — noindex utility page; minimal meta is fine
5. None
6. Add hreflang or noindex the thank-you page

---

### /therapist-consult — 8.3/10 — Audited 2026-07-13

**Scores:** SEO 9 · GEO 9 · Meta 10 · Schema 5.5 · Images 10 · FAQ 8 · E-E-A-T 6 · Orig 9

**Issues:**
- SEO: H1 lacks 'นักบำบัด' keyword (emotional hook only)
- SEO: Title says 'ราคา' but page shows limited price specifics
- GEO: No therapist/doctor name in body — weakens E-E-A-T entity
- GEO: No กรุงเทพ in body (ลาดพร้าว only)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: FAQPage has only 3 Q&A pairs vs 6 visible accordions (target >=5)
- Schema: No BreadcrumbList schema
- Schema: No Person/Physician schema naming Dr. Chanakan Trangansri

**Priority actions:**
1. Add 'คุยกับนักบำบัด' to H1
2. Name the therapist in body text
3. Add explicit session pricing to match title promise (title 57 chars — already in range)
4. Sync FAQPage with visible FAQs (3 vs 6); grow to 5+ Q&As
5. Add BreadcrumbList + Person node
6. Fix hreflang URLs to match canonical domain (new. vs www.)

---

### /urine-organic-test — 8.9/10 — Audited 2026-07-13

**Scores:** SEO 7 · GEO 9 · Meta 8 · Schema 10 · Images 10 · FAQ 9 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 82 chars — truncates badly
- SEO: H1 is pure symptom hook, no keyword
- SEO: Near-duplicate target of /check-up/urine-organic-test
- GEO: Definition arrives in 2nd paragraph, not first
- GEO: No กรุงเทพ in body
- Meta: Title 82 chars (target 50-60)
- Meta: Meta description 139 chars (target 140-160, 1 char short)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals

**Priority actions:**
1. Trim title to <=60 keeping 'Urine Organic Acids Test'
2. Add test name to H1
3. Differentiate vs /check-up twin (pillar vs package)
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 82)
6. Add 1+ chars to description (139) to hit 140-160

---

### /vitamin-d — 8.9/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 9 · Meta 8 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: Title 75 chars — truncates
- SEO: Meta description 133 chars — just under 140
- GEO: No กรุงเทพ/Bangkok in body text
- Meta: Title 75 chars (target 50-60)
- Meta: Meta description 133 chars (target 140-160)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- FAQ: JSON-LD Q2 has typo 'เท่าไหร' (missing tone mark) breaking exact match
- FAQ: No price or who-is-it-for question

**Priority actions:**
1. Trim title to <=60
2. Nudge description to 140-160
3. Keep the 40-60% deficiency stat lead — strong GEO pattern
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title (75) and grow description (133) to targets
6. Fix JSON-LD typo to match visible Q

---

### /vitamins-and-micronutrients — 8.9/10 — Audited 2026-07-13

**Scores:** SEO 8 · GEO 8 · Meta 9 · Schema 10 · Images 10 · FAQ 8 · E-E-A-T 10 · Orig 8

**Issues:**
- SEO: H1 byte-identical to /check-up/vitamins-and-micronutrients — duplicate across indexable pages
- SEO: Title 84 chars — truncates badly
- GEO: No clinic location (ลาดพร้าว/กรุงเทพ) anywhere in body — only page besides /mental-health missing it
- GEO: Definition arrives in 2nd paragraph
- Meta: Title 84 chars (target 50-60)
- Meta: hreflang points to www. domain but canonical is new. — conflicting signals
- Schema: Extra MedicalWebPage node present — fine, no conflict
- FAQ: No price/cost or who-is-it-for question

**Priority actions:**
1. Write unique H1 (this is the guide/pillar; keep package H1 on the /check-up twin)
2. Add location mention to body
3. Trim title to <=60
4. Fix hreflang URLs to match canonical domain (new. vs www.)
5. Trim title to 50-60 chars (now 84)
6. Add price + 'ใครควรตรวจ' questions

---

### /blog — 7.8/10 — Audited 2026-07-13

**Scores:** SEO 4 · GEO 4 · Meta 8 · Schema 3 · Images 10 · FAQ 10 · E-E-A-T 6 · Orig 10

**Issues:**
- SEO: Empty placeholder ('ยังไม่มีบทความ') yet indexable and in sitemap — thin content
- SEO: Title 37 chars, description 81 chars — both under range
- SEO: No links to service pages; no JSON-LD
- GEO: No content an AI can quote — intro is one vague sentence
- GEO: No entities beyond brand name
- Meta: Title 37 chars (target 50-60)
- Meta: Meta description 81 chars (target 140-160)
- Schema: Zero JSON-LD; judged on fitness: listing needs Blog/CollectionPage + BreadcrumbList, both absent

**Priority actions:**
1. Publish 1-2 posts before launch or noindex /blog until content exists
2. Expand title/description with keyword 'บทความสุขภาพ' to 50-60/140-160 chars
3. Add Blog/CollectionPage JSON-LD and links to flagship services
4. Add Blog or CollectionPage + BreadcrumbList JSON-LD
5. Expand title (37) to 50-60 and description (81) to 140-160 chars
6. Add ItemList of posts to aid discovery

---

### /blog/mental-health — 7.2/10 — Audited 2026-07-13

**Scores:** SEO 4 · GEO 4 · Meta 6 · Schema 1 · Images 10 · FAQ 10 · E-E-A-T 6 · Orig 10

**Issues:**
- SEO: Empty category placeholder, indexable and in sitemap
- SEO: Title 43 chars, description 119 chars — under range
- SEO: hreflang set differs from rest of site (missing 'en' entry)
- GEO: No article content; intro paragraph is generic
- GEO: No location/doctor entities
- Meta: Title 43 chars (target 50-60)
- Meta: Meta description 119 chars (target 140-160)
- Meta: Missing hreflang: en (other pages declare all three)

**Priority actions:**
1. Publish the mental-health post or noindex the category until it has content
2. Lengthen title to 50-60 chars with keyword สุขภาพจิต
3. Add >=3 links to /mental-health, /therapist-consult, /bach-flower
4. Add BlogPosting schema (headline, author=Dr. Chanakan, datePublished, image)
5. Add BreadcrumbList; add missing 'en' hreflang or drop hreflang set
6. Lengthen title (43) and description (119) toward targets

---

## Blog Section — Universal Actions (All 63 Posts)

> All 63 blog posts confirmed live on `new.thrivewellnessth.com` as of 2026-05-30. ✅

### Code Fixes Required (Facade — branch `feature/blog-tierb-seo` ready)

| # | Severity | Action | Expected Impact |
|---|----------|--------|-----------------|
| 1 | 🔴 Critical | **Merge `feature/blog-tierb-seo`** — adds `MedicalWebPage` JSON-LD, sitemap, `loading="lazy"` | Schema 0→7+ on all 63 posts |
| 2 | 🔴 Critical | **Investigate hreflang rendering** — BlogPostLayout passes hreflang to SEO.astro but tags not appearing in rendered HTML | Meta +2 on all 63 posts |
| 3 | 🔴 Critical | **Investigate twitter:card and og:description** — SEO.astro may not be outputting these | Meta +2 on all 63 posts |
| 4 | 🔴 Critical | **Investigate canonical tag** — not appearing in rendered HTML of most posts | Meta +1 on all 63 posts |

### Content Fixes Required (vkasama — in Sanity CMS)

| # | Severity | Action |
|---|----------|--------|
| 1 | 🔴 Critical | **Populate `seoDescription` field** for all 63 posts in Sanity → fixes meta description + og:description |
| 2 | 🟡 High | **Add price/cost FAQ question** to all posts (e.g., "ตรวจ X ราคาเท่าไหร่? ที่ Thrive") |
| 3 | 🟡 High | **Add "สำหรับใคร" (who is suitable) FAQ question** to all posts |
| 4 | 🟡 High | **Add ≥4 scientific citations** to posts currently showing 0 citations |
| 5 | 🟢 Medium | **Upload hero images** for posts still using generic Sanity CDN hero (no keyword filename) |

---

### /blog/ashwagandha — 3.8/10 ⚠️ CRITICAL — Audited 2026-05-30

**Scores:** SEO 8 · GEO 10 · Meta 2 · Schema 0 · Images 10 · FAQ 0 · E-E-A-T 7

**Critical issue:** No FAQ section in page body. Citations use non-scientific sources (healthline.com, forbes.com). FAQ score 0/10 alone drops this post to 3.8 overall.

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Content (vkasama) | **Add FAQ section with ≥5 Q&A pairs** — ashwagandha benefits, dosage, side effects, contraindications, price. |
| 2 | 🔴 Critical | Content (vkasama) | **Replace citations** — healthline/forbes are not scientific. Add ≥4 PubMed references. |
| 3 | 🔴 Critical | Content (vkasama) | **Add seoDescription** (140–160 chars) in Sanity. |
| 4 | 🔴 Critical | Facade | **Merge feature/blog-tierb-seo** to get MedicalWebPage JSON-LD on this page. |

---

### /blog/growth-factor — 3.8/10 ⚠️ CRITICAL CONTENT RISK — Audited 2026-05-30

**Scores:** SEO 6 · GEO 7 · Meta 0 · Schema 0 · Images 6 · FAQ 6 · E-E-A-T 7

**Critical issues:** No OG tags (og:image, og:title, og:description all absent), only 3 FAQ questions, no scientific citations, logo images missing alt text.

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🔴 Critical | Content (vkasama) | **Review and remove unsupported medical claims** — Thai FDA advertising compliance risk. |
| 2 | 🔴 Critical | Content (vkasama) | **Add ≥4 scientific citations** for growth factor / placenta therapy. |
| 3 | 🔴 Critical | Content (vkasama) | **Expand FAQ to ≥5 Q&A pairs** including price and who-is-suitable. |
| 4 | 🔴 Critical | Content (vkasama) | **Add seoDescription** in Sanity → fixes og:description, meta description. |
| 5 | 🟡 High | Facade | **Fix logo alt attributes** — 2 logo images have no alt text. |

---

### /blog/syncope — 6.8/10 ⭐ Best Tier B — Audited 2026-05-30

**Scores:** SEO 8 · GEO 9 · Meta 5 · Schema 5 · Images 9 · FAQ 7 · E-E-A-T 8

**Best blog post on the site.** Has Article + BreadcrumbList JSON-LD, canonical tag, og: tags, and meta description. Use as reference for what populated Sanity data should look like.

| # | Severity | Who | Action |
|---|----------|-----|--------|
| 1 | 🟡 High | Facade | **Add FAQPage JSON-LD** (via feature/blog-tierb-seo branch) |
| 2 | 🟡 High | Content (vkasama) | **Add price/cost and who-is-suitable FAQ questions** |
| 3 | 🟡 High | Content (vkasama) | **Add ≥4 formal journal citations** (currently stats without named sources) |
| 4 | 🟡 High | Facade | **Investigate hreflang and twitter:card** not rendering |

---

_Full detail blocks for remaining 60 blog posts available on request. All share the universal blog actions above._
