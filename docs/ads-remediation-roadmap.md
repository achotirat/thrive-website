# Google Ads remediation roadmap

This document is the public implementation brief for the Thrive website and Ads account. The account audit and all spend, CPA, search-term exports, and lead-quality evidence stay in `private/` and out of Git. Raw lead counts alone cannot establish commercial success.

## Outcome and measurement

The site should count one paid lead conversion for each **new, successfully stored, eligible web lead**. A duplicate API response, a honeypot response, a direct visit to `/thank-you`, and a page refresh must not create another conversion. The Crystal booth flow remains a separate event and is not a paid Ads lead. Ads optimization should ultimately use qualified inquiries and booked appointments, reported as aggregates by campaign.

The existing `/api/leads` response supplies `ok`, `lead_id`, and `duplicate`. This is the authoritative success signal. The website must not send names, phone numbers, health answers, quiz results, or an internal lead ID to Google Ads. A random conversion transaction ID may be used solely for deduplication. Preserve the current PDPA consent behavior and the Google tag ID and label already configured in the account.

## Workstreams and order

1. **Website measurement:** implement the [lead measurement plan](superpowers/plans/2026-10-10-google-ads-lead-measurement.md) on a separate feature branch. Verify form, quiz, duplicate, booth, direct URL, and refresh behavior in a deploy preview.
2. **Tag validation:** inspect the live GTM container and Google Ads conversion action together. A controlled submission must produce one Google Ads conversion request and one distinct stored lead. Check consent granted and denied paths without transmitting medical details.
3. **Aggregate quality reconciliation:** compare distinct stored leads, qualified inquiries, and booked appointments by `utm_campaign` or click ID over the same date windows. Record only counts and rates in `private/`. The owner supplies the clinic's qualification rule and acceptable cost per booked appointment.
4. **Mental Health relevance:** review the full search-term report and customer outcomes against the owner's private qualification criteria. Prepare an exact campaign-level negative list for searches that seek free tests or a service the clinic does not offer. Review ad and landing-page wording so it describes the actual consultation and audience. Inspect age settings only as an available control; do not use health-condition-based remarketing or personalized audiences. Recheck policy and actual lead quality before any budget increase.
5. **Other campaign diagnosis:** inspect final URLs, forms, query intent, policy status, and actual lead counts for each campaign with no reported conversions. Prepare separate pause, rebuild, or continue recommendations based on verified clinic outcomes.
6. **Policy and creative:** inspect the disapproved IV Drip asset and destination against Google's displayed policy reasons. Submit a specific compliant asset revision or appeal proposal for owner review. Send any medical outcome testimonial to the clinic's advertising approver.
7. **Budget and bidding:** prepare an exact before/after change list only after measurement and quality checks. Prefer moving spend within the existing owner-approved ceiling. Do not apply account changes through this planning PR.

## Review gates

- Website code: `npm test`, `npm run check`, `npm run build` in `astro/`, then Netlify deploy preview and one controlled conversion test before merge.
- Account changes: separate review with campaign, match type, exact terms or copy, current and proposed budget, and estimated monthly impact. Apply only owner-approved items, then verify them in Change history.
- Privacy: commit no Ads exports, financial figures, raw leads, health responses, contact identifiers, or credentials. Keep evidence and counts in ignored `private/`.

This PR is a planning artifact. It makes no website tracking or Ads account changes.
