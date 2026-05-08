# Security Notes

This static website must not contain production credentials, private keys, raw customer exports, or dashboard JSON snapshots.

## Before Deploying

- Keep secrets in the deployment provider or backend environment variables only.
- Do not commit `.env*`, private keys, `PROJECT_LOG.md`, or `/data` exports.
- Rotate any credential that was previously written into notes, logs, screenshots, or shared documents.
- Serve leads through an authenticated backend or a protected serverless endpoint. The static site may post to `/api/leads`, but it must not contain database credentials or API keys.
- Keep CRM, customer, phone, and PMS/RDS data out of public static files.

## Current Static-Site Guardrails

- `_headers` sets baseline browser security headers for Netlify-style deployments.
- `robots.txt` blocks private, admin, API, and data paths from crawlers.
- `.gitignore` excludes local secrets, private key formats, and sensitive export folders.
