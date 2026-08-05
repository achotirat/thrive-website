# HYROX Blog Pillar Cluster (4 posts) — Doctor Attribution + CTA Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix live issues across the 4-post HYROX/heavy-training pillar cluster on the blog: (1) the bottom-of-post "Reviewed by" doctor card is hardcoded to หมอนุ่น sitewide and needs to become per-post configurable (defaulting to หมอนุ่น, opt-in to หมอบาย — all 4 pillar posts opt in to หมอบาย), (2) each post's single `ctaService` CTA renders 3× (top/mid/bottom, all identical) and needs capping to 2 non-duplicate CTAs, (3) the HYROX post's in-body practitioner quote falsely implies Thrive already treats HYROX/Hybrid Training patients — needs a wording fix while keeping Dr. Pijak as the quoted voice.

**Pillar cluster (4 posts, cross-linked from each other's body copy):**
| Sanity doc id | slug | current `ctaService` |
|---|---|---|
| `blog-hyrox-overtraining-hormone-imbalance` | `hyrox-overtraining-hormone-imbalance` | `adrenal-fatigue` |
| `blog-red-s-relative-energy-deficiency-sport` | `red-s-relative-energy-deficiency-sport` | `adrenal-fatigue` |
| `blog-low-testosterone-heavy-exercise-men` | `low-testosterone-heavy-exercise-men` | `hormones-quiz` |
| `blog-prevent-hormone-imbalance-heavy-training` | `prevent-hormone-imbalance-heavy-training` | `adrenal-fatigue` |

Confirmed via live Sanity query (2026-08-05): the RED-S and low-testosterone posts already quote Dr. Pijak correctly in their practitioner-voice section with no HYROX-patient claim to fix — only the HYROX post's quote needs the wording change from Task 5. The `prevent-hormone-imbalance-heavy-training` post has no practitioner-quote section at all.

**Architecture:** The blog post pipeline is: Sanity `blogPost` document → GROQ projection in `astro/src/lib/sanityBlogLoader.ts` → Zod-typed Astro content collection (`astro/src/content.config.ts`) → rendered by `astro/src/pages/blog/[slug].astro` inside `astro/src/layouts/BlogPostLayout.astro`. Two new optional Sanity fields (`reviewedByDoctor`, `secondaryCta`) thread through this whole pipeline with safe defaults, so every other blog post's output is byte-for-byte unchanged until a post explicitly opts in. Tasks 1-4 build this generic, reusable mechanism once; Task 5's patch script then applies it as *content* to all 4 pillar posts — no template/schema work is needed per additional post. The doctor bios/photos are NOT modeled in Sanity — they're plain literal data (matching the existing hardcoded pattern already used in `BlogPostLayout.astro` and `longevity-check-up.mdx`), now centralized in one new file so both doctors can be referenced by key.

**Tech Stack:** Astro 6 content collections + Zod, `@sanity/client` for the one-off content patch, existing `sanity/schemaTypes` (Sanity Studio v4).

## Global Constraints

- Never push to `main` — this work happens on branch `feature/hyrox-blog-doctor-cta-fix`, one PR, Satemshi approves per `CLAUDE.md`.
- Do not touch root `*.html`, `thrive-styles.css`, or root `netlify.toml`.
- No Tailwind — reuse existing `.doctor-card` / `.blog-cta` classes from `thrive-styles.css`; no new CSS needed for this plan.
- `npx astro check` must show 0 errors and `npm run build` must succeed before every commit in `astro/` (CLAUDE.md rule 7).
- AI (Claude) has no Sanity write token. Any change to *live Sanity content* (as opposed to schema/code files, which are normal repo files) must ship as a runnable Node script that the owner (Satemshi, `thrivewellnessth@gmail.com`) executes locally with `SANITY_API_TOKEN` — see `astro/scripts/patch-matcha-body.mjs` for the established pattern.
- Every commit that adds/changes a page with หมอนุ่น's or หมอบาย's profile must update the matching table in `SITE-TRACKER.md`'s "Doctor on File" section before commit (per repo convention already in place at `SITE-TRACKER.md:38` and `SITE-TRACKER.md:141`).
- Copy changes to the practitioner quote are user-approved wording (see Task 5) — do not improvise different phrasing.

---

### Task 1: Shared doctor profile data + optional `doctor` prop on `BlogPostLayout`

**Files:**
- Create: `astro/src/lib/doctors.ts`
- Modify: `astro/src/layouts/BlogPostLayout.astro:1-41` (imports/Props), `astro/src/layouts/BlogPostLayout.astro:179-186` (hardcoded `<DoctorAttribution>` call)

**Interfaces:**
- Produces: `DoctorProfile` type and `DOCTORS: Record<'noon' | 'pijak', DoctorProfile>` from `astro/src/lib/doctors.ts`, consumed by Task 4.
- Produces: `BlogPostLayout` accepts an optional `doctor?: DoctorProfile` prop; when omitted, behavior is identical to today (renders หมอนุ่น).

- [ ] **Step 1: Create the shared doctor data file**

```ts
// astro/src/lib/doctors.ts
export interface DoctorProfile {
  name: string
  title: string
  image: string
  imageAlt: string
  bio: string
  specializations: string[]
}

export type DoctorKey = 'noon' | 'pijak'

export const DOCTORS: Record<DoctorKey, DoctorProfile> = {
  noon: {
    name: 'พญ. ชนากานต์ ตระหง่านศรี',
    title: 'แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ',
    image: '/dr-chanakan-trangansri-thrive-400x400.jpg',
    imageAlt: 'พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ Thrive Wellness',
    bio: 'ผู้เชี่ยวชาญด้านเวชศาสตร์ชะลอวัยและโภชนาการ ดูแลการตรวจวิเคราะห์สุขภาพเชิงลึก พร้อมให้คำปรึกษาแผนสุขภาพเฉพาะบุคคลที่ Thrive Wellness Clinic',
    specializations: ['Anti-aging & Regenerative Medicine', 'Nutrition Wellness', 'Functional Medicine'],
  },
  pijak: {
    name: 'นายแพทย์พิจักษณ์ วงศ์วิศิษฎ์',
    title: 'Preventive & Regenerative Medicine (หมอบาย)',
    image: '/dr-pijak-wongvisit-thrive-400x400.jpg',
    imageAlt: 'นายแพทย์พิจักษณ์ วงศ์วิศิษฎ์ หมอบาย Thrive Wellness Clinic',
    bio: 'หมอบายดูแลด้วยมุมมอง Preventive Medicine — เชื่อมโยงผลฮอร์โมนและวิตามินเข้ากับพันธุกรรมและไลฟ์สไตล์ของแต่ละคน เพื่อวางแผนชะลอความเสื่อมและป้องกันปัญหาสุขภาพตั้งแต่เนิ่น ๆ ไม่ใช่แค่ดูตัวเลขแยกส่วน',
    specializations: ['Preventive Medicine', 'Hormone Balance', 'Regenerative Medicine', 'Genetic Counseling'],
  },
}
```

- [ ] **Step 2: Add the optional `doctor` prop to `BlogPostLayout`**

In `astro/src/layouts/BlogPostLayout.astro`, add the import near the other imports (after line 8):

```astro
import { DOCTORS, type DoctorProfile } from '../lib/doctors'
```

Add `doctor?: DoctorProfile` to the `Props` interface (after `faqItems?: { question: string; answer: string }[]` on line 24):

```ts
  faqItems?: { question: string; answer: string }[]
  doctor?: DoctorProfile
```

Add `doctor` to the destructured props (after `faqItems = [],` on line 40):

```ts
  faqItems = [],
  doctor,
```

- [ ] **Step 3: Use the prop instead of the hardcoded literal**

Replace the hardcoded `<DoctorAttribution>` block (current lines 179-186):

```astro
    <DoctorAttribution doctor={{
      name: 'พญ. ชนากานต์ ตระหง่านศรี',
      title: 'แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ',
      image: '/dr-chanakan-trangansri-thrive-400x400.jpg',
      imageAlt: 'พญ. ชนากานต์ ตระหง่านศรี หมอนุ่น แพทย์เวชศาสตร์ชะลอวัยและโภชนาการ Thrive Wellness',
      bio: 'ผู้เชี่ยวชาญด้านเวชศาสตร์ชะลอวัยและโภชนาการ ดูแลการตรวจวิเคราะห์สุขภาพเชิงลึก พร้อมให้คำปรึกษาแผนสุขภาพเฉพาะบุคคลที่ Thrive Wellness Clinic',
      specializations: ['Anti-aging & Regenerative Medicine', 'Nutrition Wellness', 'Functional Medicine'],
    }} />
```

with:

```astro
    <DoctorAttribution doctor={doctor ?? DOCTORS.noon} />
```

- [ ] **Step 4: Verify**

Run: `cd astro && npx astro check`
Expected: 0 errors.

Run: `cd astro && npm run build`
Expected: build succeeds; since no caller passes `doctor` yet, every existing blog post still renders หมอนุ่น (unchanged output).

- [ ] **Step 5: Commit**

```bash
git add astro/src/lib/doctors.ts astro/src/layouts/BlogPostLayout.astro
git commit -m "refactor(blog): extract doctor profiles, make bottom Reviewed-by card configurable"
```

---

### Task 2: Sanity schema — `reviewedByDoctor` + `secondaryCta` fields on `blogPost`

**Files:**
- Modify: `sanity/schemaTypes/documents/blogPost.ts:92` (insert after the `factCheckedBy` field, before `keyTakeaways`)

**Interfaces:**
- Produces: `blogPost` documents may now carry `reviewedByDoctor: 'noon' | 'pijak'` (defaults to `'noon'` in Studio) and `secondaryCta: { slug, title, description }`. Consumed by Task 3 (GROQ + Zod) and Task 5 (patch script).

- [ ] **Step 1: Add the two fields**

In `sanity/schemaTypes/documents/blogPost.ts`, insert after the `factCheckedBy` field block (currently lines 86-91) and before the `keyTakeaways` field:

```ts
    defineField({
      name: 'reviewedByDoctor',
      title: 'Reviewed by (bottom-of-post doctor card)',
      type: 'string',
      options: {
        list: [
          {title: 'พญ. ชนากานต์ ตระหง่านศรี (หมอนุ่น) — default', value: 'noon'},
          {title: 'นายแพทย์พิจักษณ์ วงศ์วิศิษฎ์ (หมอบาย)', value: 'pijak'},
        ],
        layout: 'radio',
      },
      initialValue: 'noon',
      description: 'Which doctor profile shows in the "Reviewed by" card at the bottom of this post.',
    }),
    defineField({
      name: 'secondaryCta',
      title: 'Secondary CTA (replaces the bottom CTA, removes the mid-article CTA)',
      type: 'object',
      description: 'Leave empty for the default behavior: the primary CTA service renders 3× (top/mid/bottom). When set, only 2 CTAs render on this post — the primary CTA service at top, and this one at bottom.',
      fields: [
        defineField({name: 'slug', title: 'Destination path (no leading slash, e.g. "hormones-quiz")', type: 'string'}),
        defineField({name: 'title', title: 'Button/card title', type: 'string'}),
        defineField({name: 'description', title: 'Card description', type: 'string'}),
      ],
    }),
```

- [ ] **Step 2: Verify**

Run: `cd sanity && npm run typecheck`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add sanity/schemaTypes/documents/blogPost.ts
git commit -m "feat(sanity): add reviewedByDoctor and secondaryCta fields to blogPost"
```

Note for the human running this plan: this schema change lives in the repo but Sanity Studio itself needs `cd sanity && npm run deploy` (interactive Sanity auth) to expose these fields in the Studio UI. The one-off patch script in Task 5 sets the field values directly via the API and does not require Studio to be redeployed first.

---

### Task 3: Wire the new fields through the GROQ loader and Zod schema

**Files:**
- Modify: `astro/src/lib/sanityBlogLoader.ts:5-34` (GROQ projection)
- Modify: `astro/src/content.config.ts:169-201` (`blogPostsCollection` Zod schema)

**Interfaces:**
- Consumes: Sanity fields `reviewedByDoctor`, `secondaryCta` from Task 2.
- Produces: `post.data.reviewedByDoctor: 'noon' | 'pijak'` and `post.data.secondaryCta: {slug, title, description} | undefined`, consumed by Task 4.

- [ ] **Step 1: Add both fields to the GROQ projection**

In `astro/src/lib/sanityBlogLoader.ts`, add to the projection object (after `ctaService-> { ... }`, currently lines 23-27):

```
  ctaService-> {
    "slug": slug.current,
    title,
    shortDescription
  },
  reviewedByDoctor,
  secondaryCta {
    slug,
    title,
    description
  },
```

- [ ] **Step 2: Add both fields to the Zod schema**

In `astro/src/content.config.ts`, add to `blogPostsCollection`'s schema object (after `ctaService: z.object({...}).optional(),`, currently lines 189-193):

```ts
    ctaService: z.object({
      slug: z.string(),
      title: z.string(),
      shortDescription: z.string().optional(),
    }).optional(),
    reviewedByDoctor: z.enum(['noon', 'pijak']).optional().default('noon'),
    secondaryCta: z.object({
      slug: z.string(),
      title: z.string(),
      description: z.string().optional(),
    }).optional(),
```

- [ ] **Step 3: Verify**

Run: `cd astro && npx astro check`
Expected: 0 errors.

Run: `cd astro && npm run build`
Expected: succeeds. Every existing post has no `reviewedByDoctor`/`secondaryCta` set in Sanity yet, so Zod defaults `reviewedByDoctor` to `'noon'` and leaves `secondaryCta` undefined — output for all posts is unchanged.

- [ ] **Step 4: Commit**

```bash
git add astro/src/lib/sanityBlogLoader.ts astro/src/content.config.ts
git commit -m "feat(blog): fetch reviewedByDoctor and secondaryCta from Sanity"
```

---

### Task 4: Consume the new fields in `[slug].astro` — configurable doctor card + max-2-CTA

**Files:**
- Modify: `astro/src/pages/blog/[slug].astro` (full file, 105 lines)

**Interfaces:**
- Consumes: `DOCTORS` from `astro/src/lib/doctors.ts` (Task 1), `d.reviewedByDoctor` / `d.secondaryCta` (Task 3), `BlogPostLayout`'s `doctor` prop (Task 1).

- [ ] **Step 1: Add the import and derive `reviewerDoctor` / `bottomCtaProps`**

Add the import after the existing imports (after line 4):

```astro
import { DOCTORS } from '../../lib/doctors'
```

After the existing `ctaProps` block (currently lines 32-38), add:

```ts
const secondaryCta = d.secondaryCta
const bottomCtaProps = secondaryCta
  ? {
      serviceSlug: secondaryCta.slug,
      serviceTitle: secondaryCta.title,
      serviceDescription: secondaryCta.description,
      blogSlug: d.slug.current,
    }
  : ctaProps

const reviewerDoctor = DOCTORS[d.reviewedByDoctor ?? 'noon']
```

- [ ] **Step 2: Pass `doctor` to `BlogPostLayout`**

Add `doctor={reviewerDoctor}` to the `<BlogPostLayout>` opening tag (currently lines 41-55), e.g. after `slug={d.slug.current}`:

```astro
  slug={d.slug.current}
  faqItems={faqItems}
  doctor={reviewerDoctor}
>
```

- [ ] **Step 3: Make the mid-article CTA conditional on `secondaryCta` being unset**

Replace the always-rendered mid-CTA template div (currently lines 69-72):

```astro
  <!-- Mid CTA: pre-rendered into a hidden wrapper, moved after 3rd H2 by JS -->
  <div id="blog-cta-mid-tpl" hidden aria-hidden="true">
    <BlogCTA {...ctaProps} position="mid" />
  </div>
```

with:

```astro
  <!-- Mid CTA: pre-rendered into a hidden wrapper, moved after 3rd H2 by JS.
       Skipped when secondaryCta is set, capping this post at 2 total CTAs. -->
  {!secondaryCta && (
    <div id="blog-cta-mid-tpl" hidden aria-hidden="true">
      <BlogCTA {...ctaProps} position="mid" />
    </div>
  )}
```

Leave the `<script>` block immediately below (lines 73-84) exactly as-is — it already guards on `if (tpl && bodyEl)`, so when the div above isn't rendered, `document.getElementById('blog-cta-mid-tpl')` returns `null` and the script no-ops.

- [ ] **Step 4: Use `bottomCtaProps` for the bottom CTA**

Change the final `<BlogCTA>` call (currently line 103) from:

```astro
  <BlogCTA {...ctaProps} position="bottom" />
```

to:

```astro
  <BlogCTA {...bottomCtaProps} position="bottom" />
```

- [ ] **Step 5: Verify**

Run: `cd astro && npx astro check`
Expected: 0 errors.

Run: `cd astro && npm run build`
Expected: succeeds. Task 5 (the Sanity content patch) hasn't run yet at this point in the plan, so `reviewedByDoctor`/`secondaryCta` are still unset on every post — including all 4 pillar posts. Output is unchanged for the whole site: 3 identical CTAs, หมอนุ่น card everywhere. Confirm this by picking any post directory from the build output and counting its CTAs:

```bash
ls astro/dist/blog/ | head -1
# then, using that directory name in place of <slug>:
grep -c "blog-cta__title" astro/dist/blog/<slug>/index.html
```

Expected: 3 (top/mid/bottom) — same count as before this change. After Task 5's script runs, rebuilding will show 2 CTAs and the หมอบาย card on the 4 pillar posts specifically.

- [ ] **Step 6: Commit**

```bash
git add astro/src/pages/blog/\[slug\].astro
git commit -m "feat(blog): wire per-post doctor card and 2-CTA override into blog template"
```

---

### Task 5: One-off Sanity content patch for all 4 pillar posts

**Files:**
- Create: `astro/scripts/patch-hyrox-pillar-posts.mjs`

**Interfaces:**
- Consumes: `@sanity/client`, `sanity/schemaTypes/documents/blogPost.ts` fields from Task 2 (`reviewedByDoctor`, `secondaryCta`), the 4 document ids from the pillar-cluster table above.
- Produces: 4 patched live Sanity documents. Run manually by the owner — not part of `npm run build`.

Each post's primary `ctaService` (top/mid/bottom today) becomes just the top CTA; `secondaryCta` becomes the bottom CTA and picks whichever of `adrenal-fatigue` / `hormones-quiz` is *not* already the primary, so no post repeats the same recommendation. All 4 get `reviewedByDoctor: 'pijak'`. Only the HYROX post also gets the `legacyHtml` wording fix (the other 3 don't contain the inaccurate claim — verified against live Sanity data on 2026-08-05).

- [ ] **Step 1: Write the patch script**

```js
#!/usr/bin/env node
// One-off: fix the 4-post HYROX/heavy-training pillar cluster —
//   1. bottom "Reviewed by" card -> หมอบาย on all 4 (was defaulting to หมอนุ่น)
//   2. cap CTAs at 2 per post, no duplicates (each currently repeats its single
//      ctaService 3x top/mid/bottom); the 2nd CTA becomes whichever of
//      adrenal-fatigue / hormones-quiz isn't already the post's primary
//   3. HYROX post only: remove the inaccurate "we already treat HYROX/Hybrid
//      Training patients" claim from the practitioner quote
//
// Run from the repo root:
//   node astro/scripts/patch-hyrox-pillar-posts.mjs
//
// Token is loaded automatically from .env.local (SANITY_API_TOKEN).
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (!process.env.SANITY_API_TOKEN) {
  try {
    const envPath = join(__dirname, '../../.env.local')
    const envText = readFileSync(envPath, 'utf8')
    for (const line of envText.split('\n')) {
      const match = line.match(/^SANITY_API_TOKEN=(.*)$/)
      if (match) process.env.SANITY_API_TOKEN = match[1].trim()
    }
  } catch {
    // .env.local not found — SANITY_API_TOKEN must already be in the environment
  }
}

if (!process.env.SANITY_API_TOKEN) {
  console.error('Error: SANITY_API_TOKEN not set (checked env and .env.local)')
  process.exit(1)
}

const client = createClient({
  projectId: 'fc8ot1td',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const HORMONE_QUIZ_CTA = {
  slug: 'hormones-quiz',
  title: 'แบบทดสอบฮอร์โมนฟรี',
  description: 'อ่อนเพลียเรื้อรัง น้ำหนักขึ้น อารมณ์แปรปรวน อาจเป็นสัญญาณฮอร์โมนไม่สมดุล ทำแบบทดสอบฟรี 2 นาที',
}

const ADRENAL_FATIGUE_CTA = {
  slug: 'adrenal-fatigue',
  title: 'ตรวจภาวะต่อมหมวกไตล้า',
  description: 'อ่อนเพลียเรื้อรัง ตื่นมาไม่สดชื่น อยากของหวานทั้งวัน อาจมาจาก Cortisol ไม่สมดุล ตรวจกับแพทย์ Anti-aging',
}

const POSTS = [
  {
    id: 'blog-hyrox-overtraining-hormone-imbalance',
    secondaryCta: HORMONE_QUIZ_CTA, // primary ctaService is adrenal-fatigue
    legacyHtmlFix: {
      find: 'ที่ซ้อมกีฬาแบบ HYROX หรือ Hybrid Training มักมาหาเรา',
      replace: 'ที่ออกกำลังกายหนักจนเริ่มมีอาการ Overtraining มักมาหาเรา',
    },
  },
  {
    id: 'blog-red-s-relative-energy-deficiency-sport',
    secondaryCta: HORMONE_QUIZ_CTA, // primary ctaService is adrenal-fatigue
  },
  {
    id: 'blog-low-testosterone-heavy-exercise-men',
    secondaryCta: ADRENAL_FATIGUE_CTA, // primary ctaService is hormones-quiz
  },
  {
    id: 'blog-prevent-hormone-imbalance-heavy-training',
    secondaryCta: HORMONE_QUIZ_CTA, // primary ctaService is adrenal-fatigue
  },
]

async function patchOne({ id, secondaryCta, legacyHtmlFix }) {
  const doc = await client.getDocument(id)
  if (!doc) throw new Error(`Document ${id} not found`)

  const setPayload = {
    reviewedByDoctor: 'pijak',
    secondaryCta,
  }

  if (legacyHtmlFix) {
    const legacyHtml = doc.legacyHtml ?? ''
    if (!legacyHtml.includes(legacyHtmlFix.find)) {
      throw new Error(
        `Expected substring not found in ${id}'s legacyHtml — has the post already been edited? Looking for: ${legacyHtmlFix.find}`
      )
    }
    setPayload.legacyHtml = legacyHtml.replace(legacyHtmlFix.find, legacyHtmlFix.replace)
  }

  await client.patch(id).set(setPayload).commit()

  console.log(`✓ Patched ${id}`)
  console.log(`  reviewedByDoctor -> pijak`)
  console.log(`  secondaryCta -> ${secondaryCta.slug}`)
  if (legacyHtmlFix) console.log(`  legacyHtml claim removed: ${legacyHtmlFix.find}`)
}

async function main() {
  for (const post of POSTS) {
    await patchOne(post)
  }
}

main().catch((e) => {
  console.error('\nError:', e.message)
  process.exit(1)
})
```

- [ ] **Step 2: Run it (owner only — requires `SANITY_API_TOKEN` with write access)**

Run: `node astro/scripts/patch-hyrox-pillar-posts.mjs`
Expected output: 4 blocks like:
```
✓ Patched blog-hyrox-overtraining-hormone-imbalance
  reviewedByDoctor -> pijak
  secondaryCta -> hormones-quiz
  legacyHtml claim removed: ที่ซ้อมกีฬาแบบ HYROX หรือ Hybrid Training มักมาหาเรา
✓ Patched blog-red-s-relative-energy-deficiency-sport
  reviewedByDoctor -> pijak
  secondaryCta -> hormones-quiz
✓ Patched blog-low-testosterone-heavy-exercise-men
  reviewedByDoctor -> pijak
  secondaryCta -> adrenal-fatigue
✓ Patched blog-prevent-hormone-imbalance-heavy-training
  reviewedByDoctor -> pijak
  secondaryCta -> hormones-quiz
```

If it errors with "Expected substring not found," that post's copy has already changed since this plan was written — stop and re-check the current live text before re-running. The script has no rollback; if it fails partway through, note which posts already printed `✓ Patched` before re-running (re-running is safe for those — `secondaryCta`/`reviewedByDoctor` are idempotent `set()` calls, but a second `legacyHtmlFix` pass on the HYROX post would fail its own "already edited" check, which is the correct behavior).

- [ ] **Step 3: Commit the script (not the live-content side effect — that already happened in Sanity)**

```bash
git add astro/scripts/patch-hyrox-pillar-posts.mjs
git commit -m "chore(sanity): patch doctor/CTA/copy across the 4-post HYROX pillar cluster"
```

---

### Task 6: Update the doctor tracker in `SITE-TRACKER.md`

**Files:**
- Modify: `SITE-TRACKER.md:141-144` (หมอบาย's "หน้าที่ใส่ข้อมูลหมอบายแล้ว" table)

**Interfaces:** None (documentation only).

- [ ] **Step 1: Add rows for all 4 pillar posts**

In `SITE-TRACKER.md`, the หมอบาย table currently reads (lines 141-144):

```
| หน้าที่ใส่ข้อมูลหมอบายแล้ว | วันที่ |
|--------------------------|-------|
| `longevity-check-up.mdx` (Astro service page) | 2026-07-31 |
| `about.astro` (Team section) | 2026-07-31 |
```

Add rows for all 4 pillar posts (the HYROX post already had his in-body quote since 2026-08-04; all 4 now also get the bottom "Reviewed by" card):

```
| หน้าที่ใส่ข้อมูลหมอบายแล้ว | วันที่ |
|--------------------------|-------|
| `longevity-check-up.mdx` (Astro service page) | 2026-07-31 |
| `about.astro` (Team section) | 2026-07-31 |
| `blog/hyrox-overtraining-hormone-imbalance` (Sanity blog post — quote + Reviewed-by card) | 2026-08-05 |
| `blog/red-s-relative-energy-deficiency-sport` (Sanity blog post — quote + Reviewed-by card) | 2026-08-05 |
| `blog/low-testosterone-heavy-exercise-men` (Sanity blog post — quote + Reviewed-by card) | 2026-08-05 |
| `blog/prevent-hormone-imbalance-heavy-training` (Sanity blog post — Reviewed-by card only, no in-body quote) | 2026-08-05 |
```

- [ ] **Step 2: Commit**

```bash
git add SITE-TRACKER.md
git commit -m "docs: track HYROX post in Dr. Pijak's doctor tracker"
```

---

## Final PR

After all 6 tasks are committed on `feature/hyrox-blog-doctor-cta-fix`:

1. Push the branch: `git push -u origin feature/hyrox-blog-doctor-cta-fix`
2. Open a PR against `main` (Satemshi approves per `CLAUDE.md`).
3. In the PR description, call out explicitly: **Task 5's script has not been run yet** (or has been run — state which) since it requires the owner's `SANITY_API_TOKEN` and directly edits live content outside of the PR diff. The Netlify deploy preview will only show the doctor/CTA/copy changes on all 4 pillar posts *after* that script has been run against production Sanity data.
