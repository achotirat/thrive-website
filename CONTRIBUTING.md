# Contributing

## Workflow

Use small branches and focused commits.

```bash
git checkout -b feature/short-description
git status
git add .
git commit -m "Describe the change"
git push origin feature/short-description
```

Open a pull request before merging into `main`.

The GitHub workflow in `.github/workflows/phase0-ci.yml` runs basic Phase 0 checks on pushes and pull requests.

## Local Files

Do not commit:

- `.env` or `.env.*`
- private keys / PEM files
- customer exports
- dashboard JSON snapshots
- `.DS_Store`
- local tooling state

Use `.env.example` to document required environment variables without real secrets.

## Current Project Shape

This repo currently contains the static Thrive website plus Phase 0 Netlify/Supabase foundation files.

Important docs:

- `plan_08052026.md`
- `PHASE0_STATUS.md`
- `PHASE0_ACCOUNT_SETUP.md`
- `ASTRO_NETLIFY_SANITY_WORKFLOW.md`
- `SECURITY.md`

## Deployment Notes

The planned hosting stack is:

- Public site: Netlify
- Lead API: Netlify Functions
- Leads/workflow database: Supabase
- DNS: Cloudflare

Do not point `www.thrivewellnessth.com` away from the current production site until the cutover phase.
