# Phase 0 Account Setup Checklist

This file covers account-side work that cannot be completed from the local repo alone.

## 1. Cloudflare DNS

Current public nameservers:

- `dawn.ns.cloudflare.com`
- `seth.ns.cloudflare.com`

Create these records after the Netlify site is created:

```text
new.thrivewellnessth.com  CNAME  <netlify-site-name>.netlify.app
api.thrivewellnessth.com  CNAME  <netlify-site-name>.netlify.app
```

Recommended Cloudflare setting during initial verification:

- Proxy status: DNS only first, then enable proxy after Netlify SSL is issued and tested.

Do not change `www.thrivewellnessth.com` until cutover.

## 2. Netlify

Create or connect the site from this repo.

Build settings for the current static phase:

```text
Publish directory: .
Functions directory: netlify/functions
```

Custom domains:

- `new.thrivewellnessth.com`
- `api.thrivewellnessth.com`

Environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_LEADS_TABLE=leads
LEAD_API_TOKEN
TURNSTILE_SECRET_KEY
```

Important:

- Keep service-role keys server-side only.
- Do not add Supabase service-role keys to frontend JavaScript.
- Set `new.thrivewellnessth.com` to `noindex` until cutover.

## 3. Supabase

Create one project for leads/workflow only.

Run:

```text
supabase/leads_schema.sql
```

Security baseline:

- RLS enabled on `public.leads`.
- No anon insert/select policy.
- Public form writes only through Netlify Functions.

## 4. Uptime Monitoring

Monitor:

```text
https://new.thrivewellnessth.com
https://api.thrivewellnessth.com/api/health
```

Suggested external monitors:

- Better Stack
- UptimeRobot
- Netlify monitoring if available on the active plan

## 5. Wix

- Renew through December 2026 as a safety buffer.
- Do not point `www` away from Wix until Phase 7 cutover.

