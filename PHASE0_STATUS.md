# Phase 0 Status — Security And Foundation

Updated: 2026-05-10

## Decisions

- Public Astro site host: Netlify.
- Lead/workflow API host: Netlify Functions exposed as `/api/*` and later `api.thrivewellnessth.com`.
- Lead/workflow database: Supabase Postgres only.
- Dashboard host: Netlify, existing Vite React app.
- No EC2/PEM access is required for the public lead/workflow API.
- The main staff backend/PMS machine must not be used for this API.
- `new.thrivewellnessth.com` should be a public review environment with `noindex` until cutover.

## Completed Locally

- [x] Initialized local git repository.
- [x] Pushed repository to GitHub: `https://github.com/achotirat/thrive-website`.
- [x] Added `CONTRIBUTING.md`, pull request template, and Phase 0 GitHub Actions checks.
- [x] Verified `api.thrivewellnessth.com/api/health` returns a healthy JSON response.
- [x] Verified `new.thrivewellnessth.com` returns HTTP 200 from Netlify.
- [x] Added global `X-Robots-Tag: noindex, nofollow, noarchive` for the Netlify pre-cutover site.
- [x] Added scheduled GitHub Actions uptime monitoring for `new.thrivewellnessth.com` and `api.thrivewellnessth.com/api/health`.
- [x] Added `netlify.toml` with `/api/leads` routed to a Netlify Function.
- [x] Added `netlify/functions/leads.js` lead capture endpoint.
- [x] Added `netlify/functions/health.js` health endpoint for uptime monitoring.
- [x] Added `.env.example` for server-side Netlify/Supabase secrets.
- [x] Added `supabase/leads_schema.sql` for the leads/workflow table baseline.
- [x] Created Supabase leads/workflow project.
- [x] Created `public.leads` using `supabase/leads_schema.sql`.
- [x] Verified test leads insert into `public.leads`.
- [x] Verified lead attribution fields: `utm_*`, `referrer`, `landing_page`, and `source_page`.
- [x] Confirmed `.gitignore` excludes `.env*`, PEM/key files, private folders, data exports, build outputs, and Netlify local state.
- [x] Confirmed existing `_headers` blocks indexing/caching for `/api/*`, `/data/*`, `/admin/*`, and `/private/*`.
- [x] Public DNS lookup: `thrivewellnessth.com` uses Cloudflare nameservers.

## Public DNS Observations

- Nameservers:
  - `dawn.ns.cloudflare.com`
  - `seth.ns.cloudflare.com`
- `www.thrivewellnessth.com` currently resolves through Cloudflare IPs.
- `app.thrivewellnessth.com` currently resolves through Cloudflare IPs.
- `new.thrivewellnessth.com` resolves to `thrive-website.netlify.app`.
- `api.thrivewellnessth.com` resolves to `thrive-website.netlify.app`.

This means DNS control is in Cloudflare and the Phase 0 Netlify subdomains are configured.

## Verified DNS / HTTP

- `new.thrivewellnessth.com` resolves to `thrive-website.netlify.app`.
- `api.thrivewellnessth.com` resolves to `thrive-website.netlify.app`.
- `https://api.thrivewellnessth.com/api/health` returns `{"ok":true,...}`.
- `https://new.thrivewellnessth.com` returns HTTP 200 from Netlify.

Cutover note: remove the global noindex header from `_headers` before pointing `www.thrivewellnessth.com` to this Netlify deployment.

## Needs Account Access

- [x] Confirm Cloudflare DNS control.
- [x] Configure Netlify project and custom domains:
  - `new.thrivewellnessth.com`
  - `api.thrivewellnessth.com`
- [x] Create Supabase project for leads/workflow.
- [x] Create the `leads` table using `supabase/leads_schema.sql`.
- [x] Add Netlify environment variables from `.env.example`.
- [x] Configure uptime monitoring for:
  - `https://new.thrivewellnessth.com`
  - `https://api.thrivewellnessth.com/api/health`
- [ ] Renew Wix through December 2026 as safety buffer. See `WIX_RENEWAL_CHECKLIST.md`.

## Phase 0 Exit Status

Technical Phase 0 is complete:

- Netlify preview domain is live and noindexed.
- Netlify API domain is live.
- Lead API health endpoint is verified.
- Supabase lead capture is verified.
- Uptime monitoring is configured in GitHub Actions.
- Secrets are stored in Netlify environment variables, not in Git.

The only remaining Phase 0 item is the Wix billing renewal, which requires account owner/payment access.

## Notes

- The current static `contact.html` already posts to `/api/leads`.
- Lead capture is verified end-to-end from `new.thrivewellnessth.com/contact` into Supabase.
- Attribution capture is verified for landing URL UTM flow before contact form submission.
- Turnstile verification is optional until `TURNSTILE_SECRET_KEY` is set.
- The function requires `name` and `phone`.
- Service-role keys must stay server-side in Netlify environment variables only.
