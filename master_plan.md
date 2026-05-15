# Thrive Digital Platform Plan — 8 May 2026

Last updated: 2026-05-15

Supersedes: `PLAN.md`, `Plan_revised21Apr2026v2.md`  
Incorporates: `GA4_MIGRATION_TIERS.md`, `PHASE0_STATUS.md`, `PHASE1_STATUS.md`, `PHASE2_STATUS.md`, `SITE-TRACKER.md`  
Owner: Satemshi / achotirat@gmail.com  
Team: Satemshi + facadexth + vkasama + AI  
Key deadlines: Ads agency ends June 2026, Wix subscription ends around Nov 2026

Status source of truth: this file. Older status/tracker files are retained only as historical references.

Working roles:

- Satemshi: Admin / Technical Lead / System Owner / Final Approver
- facadexth: Frontend Developer / UI Developer
- vkasama: Content Manager in Sanity
- AI: coding, migration, QA, documentation, and review assistant

---

## 1. Current Decision

The public Thrive website should move to **Astro now**, not later.

Previous plan kept the public website static during lead/API work and treated Astro + Sanity as a future migration. This revised plan changes that direction:

- Build the new public marketing site in **Astro immediately**.
- Preserve current static HTML pages only as design/content reference.
- Use GA4 traffic tiers to decide what gets rebuilt manually, batch migrated, or redirected.
- Build lead capture and tracking into the Astro rebuild from the start.
- Keep the existing Vite React dashboard; harden and extend it instead of rebuilding in Next.js.

Reason: the site must be ready before Wix expires, and doing static work first then migrating again creates duplicate effort.

---

## 2. Strategic Priorities

1. **Do not lose paid-search visibility after the agency handover in June 2026.**
2. **Protect the highest-traffic Wix pages during migration, especially `/food-intolerance`.**
3. **Launch an Astro public site before Wix expires.**
4. **Capture leads end-to-end with attribution: form -> API -> Supabase -> dashboard.**
5. **Stop exposing customer or PMS-derived data through public static JSON.**
6. **Keep dashboard scope narrow: improve the existing Vite app, do not rebuild it now.**

---

## 3. Locked Architecture

```text
Public visitors
    |
    |--> www.thrivewellnessth.com
          - Wix during transition
          - Astro after final cutover
    |
    |--> new.thrivewellnessth.com
          Astro pre-cutover production candidate
          Hosted on Netlify
          Publicly accessible for review, but noindex until cutover
    |
    |--> app.thrivewellnessth.com
          Existing Vite React dashboard on Netlify
          Temporary password gate first, Clerk later
    |
    |--> api.thrivewellnessth.com
          Serverless API on Netlify Functions
          Rewrites expose clean /api/* routes
          No EC2/PEM required for lead/workflow API
          Static API token first, Clerk-backed auth later if needed
          |
          |--> Supabase Postgres
          |      leads, lead status, notes, assignments, campaign attribution
          |
          |--> RDS MySQL
                 PMS analytics, read-only only
                 synced nightly, never queried live for dashboard page loads
```

### Data Access Rules

- Public Astro site must not contain database credentials, private keys, raw CRM exports, or PMS data.
- Lead submission can be near real time.
- PMS/customer analytics refresh once daily at **22:00** after clinic closing.
- Dashboard reads authenticated API responses or private precomputed snapshots only.
- Show `last_synced_at` clearly in dashboard reporting views.

---

## 4. Public Website Direction

### Immediate Stack

- Astro for the public marketing website.
- Netlify for Astro hosting, deploy previews, redirects, headers, and serverless lead API.
- Supabase for leads/workflow only.
- Sanity for editable marketing content after the first SEO-critical Astro pages are stable.
- Existing static HTML/CSS is the visual and content reference.
- Keep URL preservation as a first-class migration requirement.

### Content Management Decision

Use a phased content model:

1. **Tier A service pages:** Astro content collections / MDX in the repo first.
   - Best for SEO-critical pages that need careful manual review.
   - Version controlled.
   - Easier to preserve exact URLs and avoid CMS schema delays.
2. **Tier B blog posts, testimonials, doctors, FAQs:** Sanity after the Astro shell is stable.
   - Best when the team needs browser-based editing.
   - Good for reusable structured content, references, drafts, and previews.
3. **Leads/workflow:** never in Sanity.
   - Leads, statuses, assignments, notes, and funnel data belong in Supabase only.

### Astro Site Shape

Core routes:

- `/`
- `/food-intolerance`
- `/adrenal-fatigue`
- `/hormones-quiz`
- `/hbot`
- `/iv-drip`
- `/gluta`
- `/chelation`
- `/personalized-vitamins`
- `/nad`
- `/nk-cell`
- `/check-up`
- `/about`
- `/contact`
- `/blog`
- `/post/[slug]`

Core components:

- Global layout
- Header/nav
- Footer
- Service hero
- CTA blocks
- Lead form
- FAQ
- Testimonial cards
- Doctor/clinic trust sections
- SEO component
- JSON-LD helpers

### Sanity Content Types

Start Sanity only after Tier A pages are underway. Keep the schema narrow:

- `service`
- `blogPost`
- `testimonial`
- `doctor`
- `seoMeta`
- `redirectMapping` if redirect management should be editable

Avoid overbuilding editorial workflows in the first release.

---

## 5. GA4 Migration Tiers

Source: GA4 export for `www.thrivewellnessth.com`, 28 Mar - 24 Apr 2026.

### Tier A — Manual Astro Rebuild

These pages carry the most traffic and/or revenue intent. They should be written manually, SEO-audited, and tested carefully.

Highest priority:

| URL | Views | Migration Rule |
| --- | ---: | --- |
| `/food-intolerance` | 3,903 | Build first. Protect rankings. This is about 40% of traffic. |
| `/adrenal-fatigue` | 1,421 | Build in first service batch. |
| `/hormones-quiz` | 1,344 | Rebuild with proper conversion tracking. |
| `/hbot` | 705 | Build in first service batch. |

Next priority:

| URL | Views | Migration Rule |
| --- | ---: | --- |
| `/iv-drip` | 492 | Core service page. |
| `/` | 465 | Homepage. |
| `/gluta` | 252 | Service landing page. |
| `/chelation` | 187 | Ads/CPC risk; copy must be reviewed. |
| `/personalized-vitamins` | 148 | Service landing page. |
| `/nad` | 120 | Map carefully against current `/nad-plus`. |
| `/nk-cell` | 116 | Service landing page. |

Secondary priority:

| URL | Views |
| --- | ---: |
| `/allergy-ige` | 74 |
| `/urine-organic-test` | 55 |
| `/vitamin-d` | 47 |
| `/doctors` | 45 |
| `/vitamins-and-micronutrients` | 42 |
| `/check-up` | 38 |
| `/about` | 35 |
| `/oligoscan` | 25 |
| `/cancer-screening` | 24 |
| `/dna-test` | 18 |
| `/contact` | 4 |

Note: `/contact` has unusually low traffic. During Astro rebuild, audit internal links and CTAs so appointment intent does not dead-end.

### Tier B — AI-Assisted Blog Migration

Top `/post/*` pages with meaningful traffic should be migrated using a batch workflow, then spot-checked by humans.

Known high-priority examples:

- `/post/กลืนลมพิษ`
- `/post/abnormal-period`
- `/post/mental-health`
- `/post/apple-benefit`
- `/post/ashwagandha`
- `/post/smiling-depression`
- `/post/zinc-checklist`
- `/post/chili`
- `/post/ประจำเดือน`
- `/post/menorrhagia`
- `/post/longcovid-19`
- `/post/iv-drip`
- `/post/อาหารที่มี probiotic`
- `/post/เรื่อง sle`

Rule: migrate roughly the top 50 blog posts first. Posts below the traffic cutoff can redirect to the closest Tier A/B destination.

### Tier C — Redirect Instead of Migrating

About 228 low-traffic Wix pages should not be rebuilt one by one.

Redirect examples:

```text
/post/vitamin-*        -> /personalized-vitamins
/post/hormone-*        -> /adrenal-fatigue or /hormones-quiz
/post/iv-*             -> /iv-drip
/blog/categories/*     -> /blog
/members-area/*        -> /
/health-concerns/*     -> closest service page
```

Every meaningful Wix URL must either:

- keep the same URL on Astro,
- map to a new Astro URL,
- or receive a 301 redirect.

---

## 6. Tracking And Ads Plan

### Must-Have Before Agency Handover

- GA4 property confirmed.
- GTM container installed on Wix and Astro staging.
- Google Ads conversion actions configured.
- UTM and click ID persistence across landing pages and forms.
- Lead records store attribution data.
- Basic funnel report works.

Lead attribution fields:

```text
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
first_touch_at
submitted_at
```

Funnel v1:

```text
searched / paid click / organic landing
content view
content engaged
form start
quiz start
quiz completion
form submit
LINE click
call click
lead created
qualified lead
booked lead
visited customer
paid customer
```

Use simple last-click attribution first, while preserving first-touch fields for later analysis.

Recommended event names:

```text
search_landing
content_view
content_engaged
form_start
quiz_start
quiz_complete
lead_submit
line_click
call_click
lead_qualified
appointment_booked
customer_visited
customer_paid
```

Primary conversion hierarchy:

1. `lead_submit` and `quiz_complete` for early ad optimization.
2. `appointment_booked` once sales follow-up is consistently tracked.
3. `customer_visited` as the strongest operational conversion.
4. `customer_paid` when revenue matching is reliable enough.

### Later Tracking Enhancements

- Meta Pixel + Meta CAPI
- Google Ads Enhanced Conversions server-side
- Google Ads API spend ingestion
- CPL / CPA / ROAS joins
- Keyword-level cost analysis

---

## 7. Lead Capture Plan

### API Endpoint

Astro lead forms submit to:

```text
POST https://api.thrivewellnessth.com/api/leads
```

Implementation decision:

- Host this endpoint as Netlify Functions behind the `api.thrivewellnessth.com` custom domain.
- Store leads and workflow data in Supabase.
- Do not use EC2 for the public lead/workflow API unless Netlify Functions become insufficient.
- Do not use the main staff backend/PMS machine.

### Protections

- Turnstile captcha.
- Server-side validation.
- Rate limiting.
- Origin restriction during temporary-token phase.
- No secrets in frontend code.

### Lead Data Model v1

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

## 8. Dashboard Plan

Do not rebuild the dashboard in Next.js in this cycle.

Use the existing Vite React dashboard and focus on:

- Removing public `/data/*.json` exposure.
- Routing production reads through authenticated API.
- Showing `last_synced_at`.
- Adding a lead inbox.
- Adding basic campaign/funnel reporting.

Temporary auth is acceptable only as a bridge:

| Phase | Dashboard Auth | API Auth |
| --- | --- | --- |
| Early migration | Temporary frontend password gate | Static API token + origin restriction |
| Hardened release | Clerk login | Clerk-backed server-side auth |

Do not deploy the hardened dashboard frontend to production until `api.thrivewellnessth.com` is live and tested.

---

## 9. Phased Timeline

### Phase 0 — Security And Foundation, May 2026

- [ ] Confirm DNS registrar and DNS control.
- [ ] Use Netlify as the host for Astro and the lead/workflow API.
- [ ] Configure `new.thrivewellnessth.com` on Netlify as a noindex pre-cutover production candidate.
- [ ] Configure `api.thrivewellnessth.com` on Netlify for serverless `/api/*` routes.
- [ ] Confirm no EC2/PEM access is needed for the public lead/workflow API.
- [ ] Do not use the main staff backend/PMS machine.
- [ ] Create Supabase project for leads/workflow only.
- [ ] Move dashboard data access away from public static JSON.
- [ ] Set PMS/RDS sync to daily **22:00**.
- [ ] Add uptime monitoring.
- [ ] Keep secrets in env vars only.
- [ ] Renew Wix through December 2026 as a safety buffer.

Exit criteria: Netlify API foundation is reachable, monitored, isolated from staff-critical systems, and does not risk clinic operations.

### Phase 1 — Astro Project Bootstrap, May 2026

- [ ] Scaffold Astro project.
- [ ] Bring over current static design tokens and assets.
- [ ] Build layout, header, footer, CTA, SEO, and form components.
- [ ] Use Astro content collections / MDX for initial Tier A pages.
- [ ] Plan Sanity schema, but do not let Sanity setup block Tier A migration.
- [ ] Add GTM to Astro.
- [ ] Preserve `robots.txt`, `llms.txt`, sitemap behavior, and security headers.
- [ ] Create redirect strategy file.

Exit criteria: Astro staging can render homepage shell and shared components.

### Phase 2 — Tier A Pages And Lead Form, May-Jun 2026

**Page builds (all complete):**
- [x] Build `/food-intolerance` first.
- [x] Build `/adrenal-fatigue`.
- [x] Build `/hormones-quiz` with conversion tracking.
- [x] Build `/hbot`.
- [x] Build homepage.
- [x] Build `/iv-drip`, `/gluta`, `/chelation`, `/personalized-vitamins`, `/nad`, `/nk-cell`.
- [x] Build `/about`, `/check-up`, `/contact` and fix internal CTA visibility.

**Form and tracking (complete):**
- [x] Connect lead form to API.
- [x] Store UTM/click IDs on submitted leads.
- [x] Add JSON-LD, canonical, OG/Twitter metadata.
- [x] Turnstile captcha integration.

**Assets (complete):**
- [x] Replace temporary hero images with final design-safe crops per `docs/hero-image-spec.md`.

**Deployment workflow (pending):**
- [ ] Commit all Phase 2 pages, content, and images to feature branch.
- [ ] Open PR for Netlify deploy preview and review.
- [ ] Re-test end-to-end lead submission on deployed pages.

Exit status: locally complete. All 20 pages built, all hero images in place, form plumbing and attribution fields ready. Awaiting feature branch commit and PR.

### Phase 3 — Ads Handover, By 1 Jun 2026

- [ ] Get admin ownership of Google Ads.
- [ ] Export campaigns, keywords, creatives, and settings.
- [ ] Link Google Ads and GA4 under Thrive-owned access.
- [ ] Verify conversion tracking while agency is still available.
- [ ] Set up read-only Google Ads API access if feasible.
- [ ] Start weekly ads review ritual.

Exit criteria: Thrive can manage at least one campaign using owned tracking and lead data.

### Phase 4 — Lead Inbox And Funnel Reporting, Jun-Jul 2026

- [ ] Build lead inbox in existing dashboard.
- [ ] Add lead statuses.
- [ ] Add assignment, notes, and follow-up date.
- [ ] Add filters by source, status, and date.
- [ ] Build funnel v1 report.
- [ ] Show campaign performance from stored attribution fields.
- [ ] Show `last_synced_at` for PMS-derived analytics.

Exit criteria: staff can follow up website leads and review basic campaign performance internally.

### Phase 5 — Tier B Blog Migration And Redirect Map, Jul-Sep 2026

- [ ] Set up Sanity for blog posts, testimonials, doctors, and reusable FAQs.
- [ ] Batch migrate top ~50 blog posts.
- [ ] Human spot-check 10-15 high-value posts.
- [ ] Create redirects for low-value Tier C pages.
- [ ] Map all known Wix URLs.
- [ ] Audit internal links.
- [ ] Audit local SEO and Google Business Profile.

Exit criteria: all critical Wix content has a destination or redirect.

### Phase 6 — Cutover Preparation, Oct 2026

- [ ] Test all lead forms.
- [ ] Test GA4/GTM events.
- [ ] Test Google Ads conversions.
- [ ] Crawl Astro site for broken links.
- [ ] Validate 301 redirects.
- [ ] Submit sitemap.
- [ ] Load-test key pages lightly.
- [ ] Review Core Web Vitals.

Exit criteria: Astro site is safe to become `www`.

### Phase 7 — Full Cutover, Oct-Nov 2026

- [ ] Point `www.thrivewellnessth.com` to Astro.
- [ ] Redirect or alias `new.thrivewellnessth.com`.
- [ ] Monitor rankings, traffic, conversions, and Core Web Vitals for 4 weeks.
- [ ] Keep Wix available until the monitoring period is stable.

Exit criteria: Wix can expire without downtime or major SEO loss.

---

## 10. Operational Safeguards

Default rule: do not put the new lead/dashboard API on the same machine as staff-critical clinic systems.

For the selected Netlify + Supabase setup:

- Keep lead/workflow API in Netlify Functions.
- Keep lead/workflow database in Supabase.
- Keep service-role keys only in Netlify environment variables.
- Enable Supabase RLS on exposed tables.
- Use server-side functions for writes that require privileged keys.
- Keep PMS/RDS sync at 22:00.
- Never run dashboard page-load queries directly against production PMS/RDS.
- Move to a dedicated API host only if Netlify Functions become insufficient.

Business rule: dashboard and analytics workloads must not degrade clinic operations.

---

## 11. Scope Cuts

Not in this cycle:

- Next.js dashboard rebuild.
- Patient portal.
- Online payment.
- Online booking system.
- Writing back to PMS database.
- Full role hierarchy.
- Full multi-touch attribution.
- Full editorial approval workflow.
- Mobile redirect experiment by default.

Defer until after cutover:

- Meta CAPI fine-tuning.
- Enhanced Conversions server-side enrichment.
- Google Ads cost joins.
- Advanced dashboard filters and CSV exports.

---

## 12. Key Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| `/food-intolerance` loses rankings | Very high | Build first, preserve URL if possible, manual SEO audit, monitor closely. |
| Ads agency handover is incomplete | High | Request admin ownership immediately and verify conversions before June. |
| Tracking breaks during dual Wix/Astro period | High | Install GTM on both, use consistent events, test lead attribution end-to-end. |
| API host resource pressure affects clinic operations | High | Use Netlify Functions + Supabase so the public API is isolated from staff-critical systems. |
| Team capacity is too thin | High | Keep Tier A manual, Tier B batch, Tier C redirect. Review scope every 2 weeks. |
| Wix expires before cutover is stable | High | Renew through December as buffer. |
| Lead spam | Medium | Turnstile, validation, rate limits. |
| PDPA wording is incomplete | Medium | Add consent capture now; legal review before public cutover. |

---

## 13. Immediate Next Actions

**Phase 2 wrap-up (in progress):**
1. Commit all Phase 2 pages, content, and images to feature branch `feature/phase2-tier-a-pages`.
2. Push branch to origin and open PR for Netlify deploy preview.
3. Review deploy preview, then merge after Satemshi approval.
4. Re-test end-to-end lead submission from deployed Astro pages — confirm records appear in Supabase with attribution.

**After Phase 2 merge:**
5. Invite facadexth to GitHub repository (if not already done): `https://github.com/achotirat/thrive-website`.
6. Invite vkasama to Sanity project `fc8ot1td` as Editor / Content Manager (if not already done).
7. Confirm GTM container ID/access and install GTM snippet in Astro production branch.
8. Create redirect strategy file and complete Wix URL inventory for Tier C pages.
9. Add redirect from legacy `/nad-plus` to canonical `/nad`.
10. Request Google Ads admin access from agency and verify conversion tracking before 1 Jun 2026.

---

## 14. Working Rule

For every migration decision, use this order:

1. Protect revenue and lead flow.
2. Protect SEO on Tier A pages.
3. Keep operational systems safe.
4. Prefer narrow, shippable phases over broad rewrites.
5. Use AI for batch migration, but manually review pages with traffic or medical/commercial risk.
