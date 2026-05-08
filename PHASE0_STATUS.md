# Phase 0 Status — Security And Foundation

Updated: 2026-05-08

## Decisions

- Public Astro site host: Netlify.
- Lead/workflow API host: Netlify Functions exposed as `/api/*` and later `api.thrivewellnessth.com`.
- Lead/workflow database: Supabase Postgres only.
- Dashboard host: Netlify, existing Vite React app.
- No EC2/PEM access is required for the public lead/workflow API.
- The main staff backend/PMS machine must not be used for this API.
- `new.thrivewellnessth.com` should be a public review environment with `noindex` until cutover.

## Completed Locally

- [x] Added `netlify.toml` with `/api/leads` routed to a Netlify Function.
- [x] Added `netlify/functions/leads.js` lead capture endpoint.
- [x] Added `netlify/functions/health.js` health endpoint for uptime monitoring.
- [x] Added `.env.example` for server-side Netlify/Supabase secrets.
- [x] Added `supabase/leads_schema.sql` for the leads/workflow table baseline.
- [x] Confirmed `.gitignore` excludes `.env*`, PEM/key files, private folders, data exports, build outputs, and Netlify local state.
- [x] Confirmed existing `_headers` blocks indexing/caching for `/api/*`, `/data/*`, `/admin/*`, and `/private/*`.
- [x] Public DNS lookup: `thrivewellnessth.com` uses Cloudflare nameservers.

## Public DNS Observations

- Nameservers:
  - `dawn.ns.cloudflare.com`
  - `seth.ns.cloudflare.com`
- `www.thrivewellnessth.com` currently resolves through Cloudflare IPs.
- `app.thrivewellnessth.com` currently resolves through Cloudflare IPs.
- `new.thrivewellnessth.com` has no public A/CNAME record found.
- `api.thrivewellnessth.com` has no public A/CNAME record found.

This means DNS control is likely in Cloudflare, but account access still needs to be confirmed.

## Needs Account Access

- [ ] Confirm Cloudflare account access and registrar/DNS ownership.
- [ ] Configure Netlify project and custom domains:
  - `new.thrivewellnessth.com`
  - `api.thrivewellnessth.com`
- [ ] Create Supabase project for leads/workflow.
- [ ] Create the `leads` table using `supabase/leads_schema.sql`.
- [ ] Add Netlify environment variables from `.env.example`.
- [ ] Configure uptime monitoring for:
  - `https://new.thrivewellnessth.com`
  - `https://api.thrivewellnessth.com/api/health`
- [ ] Renew Wix through December 2026 as safety buffer.

## Notes

- The current static `contact.html` already posts to `/api/leads`.
- Turnstile verification is optional until `TURNSTILE_SECRET_KEY` is set.
- The function requires `name` and `phone`.
- Service-role keys must stay server-side in Netlify environment variables only.
