# Launch Fix Manual — items needing owner access or a decision

Companion to `docs/audits/master-audit.md` (2026-07-13 sweep). Everything repo-fixable
was fixed in the PR that added this file. The items below need Netlify/Cloudflare/Google
access, real-world data, or a business decision. Ordered by priority.

---

## 1. Turn Cloudflare Turnstile ON in production — ✅ DONE 2026-07-13 (env vars set by owner)

The built site has no Turnstile widget because `PUBLIC_TURNSTILE_SITE_KEY` was not set at
build time, and the API deliberately skips verification when `TURNSTILE_SECRET_KEY` is
unset. Result: `/api/leads` accepts unlimited unverified POSTs.

1. Cloudflare Dashboard → Turnstile → your widget → copy **Site Key** and **Secret Key**.
   - While there: under *Hostname Management* add `new.thrivewellnessth.com` (and
     optionally `*.netlify.app` so deploy previews can test the form end-to-end).
2. Netlify → **thrive-website** project → *Site configuration → Environment variables*:
   - `PUBLIC_TURNSTILE_SITE_KEY` = the site key — scope: **Builds** (this is baked into HTML at build time)
   - `TURNSTILE_SECRET_KEY` = the secret key — scope: **Functions**
3. Trigger a redeploy (Deploys → *Trigger deploy → Deploy site*). Env changes do NOT
   apply until a new build runs.
4. Verify: open any service page → the Turnstile checkbox should render above the
   submit button. Submit a test lead → should still succeed → mark it `spam` in Supabase.
5. Optional hardening (code change — ask Claude): make the API fail **closed** in
   production when `TURNSTILE_SECRET_KEY` is missing instead of silently skipping.

## 2. Rate-limit `/api/leads` — ✅ DONE 2026-07-13 (PR #65: per-IP throttle + duplicate-phone cooldown)

No throttling exists today; one script can create thousands of junk leads (and poison
Google Ads conversion data). Two options:

- **Netlify rate limiting** (simplest): Netlify → Project → *Security → Rate limiting*
  (or `netlify.toml` rules on paid plans) — limit `POST /api/leads` to ~5 requests/min/IP.
- **Code-level** (ask Claude): duplicate-phone cooldown before insert (reject if the same
  phone submitted within N minutes) + per-IP counter. Works on any plan.

## 3. PDPA / Google Consent Mode v2 — ✅ DONE 2026-07-13 (PR #65: denied-by-default + accept/decline banner)

Today GTM + the Google Ads tag fire before consent, and the banner has no "decline"
option. Decide the policy, then Claude can implement:

1. Decide: strict opt-in (tags fire only after accept — cleaner legally, loses some
   measurement) **or** Consent Mode v2 (tags load with `ad_storage`/`analytics_storage`
   defaulted to `denied`, flip to `granted` on accept — Google models lost conversions,
   recommended).
2. Banner needs an explicit decline button either way.
3. After implementation, re-test conversions in Tag Assistant in BOTH consent states.

## 4. Cutover checklist — 📅 SCHEDULED FOR OCTOBER 2026 (hard deadline: Wix expires November 2026)

**Timeline (noted 2026-07-15):** execute the cutover in October 2026 so the new site is
live, indexed, and redirects are proven BEFORE the Wix subscription lapses in November.
Do not wait for November — once Wix expires you lose the ability to inspect the old
site's URLs and content.

**Prep to do while Wix is still accessible (September at the latest):**
- Export the full list of live Wix URLs → this becomes the 301 redirect map (step 5).
- Save any Wix content/images not yet migrated.

**Decision still open (revisit in October):** an advisor proposed a separate ads-only
domain (e.g. thriveclinicbangkok.com) with policy-safe LPs linking to the main site.
Claude's assessment (2026-07-15): the "clean domain bridging to the real content"
pattern risks Google's *circumventing systems* policy (account-level suspension) and
splits SEO/entity signals — recommended alternative is scaling the existing `/lp/*`
policy-safe landing pages on the main domain (same benefits, one domain). Decide
before cutover; if the two-domain route is chosen anyway, the ads domain must be a
fully self-sufficient compliant site, not a doorway.

Everything is now normalized to the domain in ONE place, so cutover is short:

1. Decide the final public domain: keep `new.thrivewellnessth.com` or move to
   `www.thrivewellnessth.com` (recommended: www, with the old Wix DNS retired).
2. If moving to www: change `site:` in `astro/astro.config.mjs` (one line — canonicals,
   hreflang, and all JSON-LD @ids follow automatically now), update the two domain
   mentions in `astro/public/llms.txt`, and add the domain in Netlify → Domain management.
3. In `netlify.toml`: delete the line `X-Robots-Tag = "noindex, nofollow, noarchive"`
   under `[[headers]] for = "/*"` (KEEP the one under `for = "/api/*"`).
4. Replace `astro/public/robots.txt` content with:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://<final-domain>/sitemap-index.xml
   ```
5. Set up 301 redirects from the old Wix URLs/domain to the new site.
6. Google Search Console: add the property, verify, submit `sitemap-index.xml`.
7. Within a week: check GSC coverage report; confirm AI crawlers (GPTBot, ClaudeBot,
   PerplexityBot) appear in Netlify analytics/logs.

## 5. Medical-claim review — หมอนุ่น 🟡

The 5 flagged bare claims were already softened in the PR (gluta hero/stats/trust-bar,
iv-drip trust-bar + schema description, bach-flower "no side effects", oligoscan
"no side effects"). Still needs หมอนุ่น's judgment:

- Remaining **qualified** "ดูดซึม 100%" phrasing (always paired with the 10–30% oral
  comparison) on iv-drip/gluta/nad/vitamin pages — defensible, but confirm you're
  comfortable under the Medical Facilities Act ad rules.
- `iv-drip` hero stat "★ 4.9 คะแนนจากลูกค้า" — unsourced review claim. Either link a real
  review source (Google Maps rating) or remove.
- Meta description on /gluta and /iv-drip still says "ดูดซึม 100%" (SERP-visible copy).
- The three `[DRAFT — placeholder]` patient stories (food-intolerance, hormones-quiz,
  iv-drip frontmatter) still await real testimonials + review; they don't render, so the
  pages simply have no social-proof section until this is done.

## 6. Doctor entity data (for E-E-A-T) 🟡 — data needed, then a 5-min code task

Provide these and Claude wires them into the Physician JSON-LD site-wide:
1. Medical license number (เลขที่ใบอนุญาตประกอบวิชาชีพเวชกรรม) for พญ. ชนากานต์ ตระหง่านศรี.
2. `sameAs` profile URLs: Google Business Profile, Facebook page, MOPH clinic listing,
   any hospital/university profile.
3. One canonical credential string (jobTitle currently varies across pages).

## 7. Brand-name consistency — ✅ DONE 2026-07-13 (owner chose “Thrive Wellness Clinic”; normalized site-wide incl. llms.txt). Remaining: confirm Google Business Profile uses the same name.

JSON-LD is split between "Thrive Wellness Clinic" (36 pages) and "Thrive Wellness Center"
(home/about/contact). Check the exact name on your **Google Business Profile** and Thai
clinic license, pick one, and tell Claude — one normalization pass fixes all pages.
NAP consistency (name/address/phone matching GBP) is a local-SEO ranking factor.

## 8. Titles & meta descriptions — ✅ DONE 2026-07-13 (all 41 indexable pages: titles 45–60 chars, descriptions 140–160, Thai keyword first; check-up twins re-framed as แพ็กเกจ to reduce cannibalization)

38/41 titles are 61–92 chars (Google truncates ~60). The dual Thai+English pattern is the
cause — decide whether English keywords stay (expat audience) before trimming. Worst
first: /gluta (92), /chelation (85), /dna-test (84), /vitamins-and-micronutrients (84),
/urine-organic-test (82). Per-page targets are in each page's block in
`docs/audits/master-audit.md`. Pattern that fits: `<Thai keyword phrase> | Thrive Wellness` ≤ 60 chars.

## 9. Blog (Tier B) — 🔶 CODE SIDE DONE 2026-07-13 (BlogPosting+BreadcrumbList on posts, Blog/CollectionPage+ItemList on listings, domain from astro.config, doctor-name fix; meta-description fallback was already live). Still open: vkasama fills seoDescription in Sanity; verify /blog/female-hormone-panel-age-40 exists; re-audit 63 posts from a networked session.

1. Verify whether `feature/blog-tierb-seo` branch (adds BlogPosting/MedicalWebPage
   JSON-LD to blog layout) is still valid → rebase + merge, or ask Claude to redo it.
2. vkasama: fill `seoDescription` for all posts in Sanity (most are empty → no meta
   description on 63 posts).
3. Check `https://new.thrivewellnessth.com/blog/female-hormone-panel-age-40` — the
   hormones-quiz page links to it. If 404: publish the draft (exists in `docs/blog/`)
   in Sanity, or remove the teaser button.
4. Re-run `/thrive-launch-audit` from a networked machine to re-score all 63 posts.

## 10. Dependencies & housekeeping 🟢

- `cd astro && npm audit` → 3 high / 1 moderate (build-time only). Run `npm audit fix`,
  then `npx astro check && npm run build`, commit if green.
- Supabase PII retention (PDPA storage limitation): decide a window (e.g. anonymize
  `lost`/`spam` leads after 6–12 months) — Claude can write the SQL/cron.
- Dashboard API: single shared key, non-timing-safe comparison — rotate the key
  periodically; ask Claude for the `timingSafeEqual` patch.
- Root `_headers` file is NOT deployed and already drifted from `netlify.toml` — it now
  carries a warning comment; never copy it into `astro/public/`.

## 11. Google Ads follow-through (from the earlier funnel audit)

- Confirm "Submit lead form" shows **Recording conversions** and the 9-conversion gclid
  backfill landed against `mental-health-s`.
- Consolidate budgets: pause the two PMax campaigns + Demand Gen until 2+ weeks of clean
  Search conversion data exists; expand keywords on surviving campaigns (hbot has 1
  keyword, chelation 2, mental-health 2).
- Answer PR #62's question about the two AI Max experiments before 2026-08-04.
