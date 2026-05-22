# UTM Naming Standard

Date: 2026-05-22
Owner: Thrive marketing

Use these values for every paid ad URL so lead attribution stays clean in Supabase and the dashboard.

## Source And Medium

| Channel | utm_source | utm_medium |
| --- | --- | --- |
| Google Ads Search | google | cpc |
| Google Ads Performance Max | google | cpc |
| Meta mixed campaign | meta | paid_social |
| Facebook Ads only | facebook | paid_social |
| Instagram Ads only | instagram | paid_social |
| LINE Ads | line | paid_social |
| LINE chat/direct link | line | chat |
| Organic Google | google | organic |

Default paid setup:

- Google Ads: `utm_source=google&utm_medium=cpc`
- Meta/Facebook/Instagram Ads: `utm_source=meta&utm_medium=paid_social`
- LINE Ads: `utm_source=line&utm_medium=paid_social`

## Campaign Names

Use lowercase words separated by underscores:

```text
service_month_year_objective
```

Examples:

```text
iv_drip_may_2026_leads
food_intolerance_may_2026_leads
checkup_may_2026_leads
```

## Example URLs

Google Ads:

```text
https://www.thrivewellnessth.com/iv-drip?utm_source=google&utm_medium=cpc&utm_campaign=iv_drip_may_2026_leads
```

Meta Ads:

```text
https://www.thrivewellnessth.com/food-intolerance?utm_source=meta&utm_medium=paid_social&utm_campaign=food_intolerance_may_2026_leads
```

LINE Ads:

```text
https://www.thrivewellnessth.com/check-up?utm_source=line&utm_medium=paid_social&utm_campaign=checkup_may_2026_leads
```

## Rules

- Use lowercase values only.
- Use underscores, not spaces, in `utm_campaign`.
- Do not mix equivalent source names such as `fb`, `Facebook`, `meta_ads`, and `Meta`.
- Use `utm_source=meta` when Facebook and Instagram are managed together.
- Use `utm_source=facebook` or `utm_source=instagram` only when the campaigns are intentionally separated by platform.

## QA

For each new campaign:

1. Open the final ad URL in a browser.
2. Submit a test lead.
3. Check Supabase `leads` for `utm_source`, `utm_medium`, `utm_campaign`, and `landing_page`.
4. Check Lead Inbox attribution fields for the same lead.
