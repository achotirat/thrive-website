# Thrive Sanity Studio

Sanity manages editable marketing content only. Leads, customer records, PMS data, workflow status, notes, and attribution data belong in Supabase/API systems, not here.

## Project

- Sanity project: `Thrive-website`
- Project ID: `fc8ot1td`
- Dataset: `production`

## First Schema Scope

Document types:

- `clinicProfile`
- `service`
- `blogPost`
- `testimonial`
- `doctor`
- `topic`
- `condition`
- `symptom`
- `redirectMapping`

Reusable object types:

- `seoMeta`
- `imageWithAlt`
- `faqItem`
- `richText`
- `citation`
- `externalLink`

The `service` document is the main contract for the first Astro UI work:

```text
title
slug
category
shortDescription
description
benefits
price
duration
mainImage
gallery
faq
seoTitle / seoDescription via seo
```

## SEO / GEO Content Model

Sanity is also the source of truth for structured content that helps Google, Maps, and AI answer engines understand the clinic:

- `clinicProfile` stores the shared clinic entity data used for MedicalClinic / LocalBusiness JSON-LD.
- `service.schemaType` tells the frontend whether a service should render as Service, MedicalProcedure, MedicalTest, or MedicalTherapy.
- `topic`, `condition`, and `symptom` connect pages into an internal knowledge graph.
- `doctor` records credentials, specialties, languages, and same-as profiles for E-E-A-T signals.
- `blogPost` and `service` support medical reviewer, reviewed date, citations, FAQ, and related entities.
- `seoMeta` supports canonical URL, robots controls, sitemap hints, social overrides, hreflang, and schema hints.

Medical pages should have a reviewer and reviewed date before final production publish whenever they make health, diagnosis, treatment, or safety claims.

## Local Commands

Run commands from this directory:

```bash
npm install
npm run dev
```

The Studio should open locally at the URL printed by the Sanity CLI.

The CLI config enables Sanity Studio auto-updates so deployed Studio builds can receive safe Studio updates without rebuilding for every patch/minor release.

## Content Rules

- Use clean slugs that match planned Astro URLs, such as `iv-drip`, `food-intolerance`, or `adrenal-fatigue`.
- Keep Tier A service pages manually reviewed before publish.
- Use redirect mappings only for public Wix URLs that will not be rebuilt.
- Do not store private keys, raw CRM exports, lead records, or PMS/customer data in Sanity.
