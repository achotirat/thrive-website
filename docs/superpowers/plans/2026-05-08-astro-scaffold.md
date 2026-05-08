# Astro Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Astro project under `astro/` with global CSS, BaseLayout, Header, Footer, and a homepage shell that visually matches the existing static `index.html`.

**Architecture:** Astro static-output project in `astro/` subdirectory of existing repo. Existing root static HTML and `netlify.toml` are untouched. Design system is ported from `thrive-styles.css` as a single global CSS file. Components mirror existing markup class names exactly for visual parity.

**Tech Stack:** Astro 6, TypeScript strict, npm, Node 22 LTS, Google Fonts (Noto Sans Thai), CSS Custom Properties (from `thrive-styles.css`)

---

## File Structure

| Path | Status | Responsibility |
|---|---|---|
| `astro/` | Create | Astro project root |
| `astro/astro.config.mjs` | Create | Site URL, static output |
| `astro/tsconfig.json` | Create | TS strict (extends `astro/tsconfigs/strict`) |
| `astro/package.json` | Create (via scaffold) | Dependencies |
| `astro/src/styles/global.css` | Create | Verbatim copy of `thrive-styles.css` |
| `astro/src/layouts/BaseLayout.astro` | Create | `<html>`, `<head>`, font preload, global CSS import, `<slot/>` |
| `astro/src/components/Header.astro` | Create | `.top-bar` + `.navbar` + mobile drawer from `index.html:687-756` |
| `astro/src/components/Footer.astro` | Create | `<footer>` block from `index.html:919-953` |
| `astro/src/pages/index.astro` | Create | Homepage shell: BaseLayout + Header + hero + stats + Footer |
| `astro/public/Thrive-logo-160px.png` | Create (copy) | Logo used in Header + Footer |
| `astro/public/Thrive-Logo-600px.png` | Create (copy) | High-res logo |
| `astro/public/favicon-192.png` | Create (copy) | Favicon |
| `astro/public/og-image.jpg` | Create (copy) | OG image |
| `CLAUDE.md` | Create | Repo context pointer doc for Claude |

**NOT modified:** root `*.html`, root `thrive-styles.css`, root `netlify.toml`, `netlify/`, `supabase/`.

---

## Task 1: Create Feature Branch

**Files:** none

- [ ] **Step 1: Verify on main, branch clean**

```bash
git status
git branch
```
Expected: on `main`, working tree clean.

- [ ] **Step 2: Create and switch to feature branch**

```bash
git checkout -b feature/astro-scaffold
```
Expected: `Switched to a new branch 'feature/astro-scaffold'`

- [ ] **Step 3: Verify branch**

```bash
git branch
```
Expected: `* feature/astro-scaffold` shown.

---

## Task 2: Scaffold Astro Project

**Files:**
- Create: `astro/` (whole project from `npm create astro`)

- [ ] **Step 1: Run Astro scaffold in `astro/` subdirectory**

Run from repo root:
```bash
npm create astro@latest astro -- --template minimal --typescript strict --no-install --no-git
```

When prompted (if interactive despite flags), choose:
- Template: minimal
- TypeScript: Yes, strict
- Install deps: No (we do it separately)
- Initialize git: No

- [ ] **Step 2: Verify scaffold created**

```bash
ls astro/
```
Expected output includes: `src/`, `public/`, `astro.config.mjs`, `package.json`, `tsconfig.json`

- [ ] **Step 3: Install dependencies**

```bash
cd astro && npm install
```
Expected: `added N packages` with no critical audit issues. (`npm audit` warnings are ok; `critical` severity is not.)

- [ ] **Step 4: Verify dev server starts**

```bash
cd astro && npm run dev -- --port 4321
```
Expected: `🚀 astro  v5.x.x ready in Xms` and `Local http://localhost:4321/`
Press Ctrl+C to stop.

- [ ] **Step 5: Update `astro/astro.config.mjs`**

Replace the generated file with:

```js
// astro/astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://new.thrivewellnessth.com',
  output: 'static',
});
```

- [ ] **Step 6: Verify tsconfig.json extends strict**

```bash
cat astro/tsconfig.json
```
Expected content (or similar):
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {}
  }
}
```
If it extends `"astro/tsconfigs/base"` instead, change to `"astro/tsconfigs/strict"`.

- [ ] **Step 7: Commit**

```bash
git add astro/
git commit -m "chore: scaffold astro project"
```

---

## Task 3: Port thrive-styles.css to Global CSS

**Files:**
- Create: `astro/src/styles/global.css`

- [ ] **Step 1: Copy thrive-styles.css**

Run from repo root:
```bash
cp thrive-styles.css astro/src/styles/global.css
```

- [ ] **Step 2: Verify copy**

```bash
wc -l astro/src/styles/global.css
```
Expected: `1753` (same line count as source).

- [ ] **Step 3: Verify astro check still passes**

```bash
cd astro && npx astro check
```
Expected: `X errors, 0 warnings` where X=0 (CSS copy does not affect type check).

- [ ] **Step 4: Commit**

```bash
git add astro/src/styles/global.css
git commit -m "chore: port thrive-styles.css to astro global.css"
```

---

## Task 4: Copy Brand Assets to `astro/public/`

**Files:**
- Create: `astro/public/Thrive-logo-160px.png`
- Create: `astro/public/Thrive-Logo-600px.png`
- Create: `astro/public/favicon-192.png`
- Create: `astro/public/og-image.jpg`

- [ ] **Step 1: Copy assets**

Run from repo root:
```bash
cp image/Thrive-logo-160px.png astro/public/Thrive-logo-160px.png
cp image/Thrive-Logo-600px.png astro/public/Thrive-Logo-600px.png
cp favicon-192.png astro/public/favicon-192.png
cp og-image.jpg astro/public/og-image.jpg
```

- [ ] **Step 2: Verify**

```bash
ls astro/public/
```
Expected: `Thrive-logo-160px.png`, `Thrive-Logo-600px.png`, `favicon-192.png`, `og-image.jpg` (plus any files scaffold created).

- [ ] **Step 3: Commit**

```bash
git add astro/public/
git commit -m "chore: copy brand assets to astro/public"
```

---

## Task 5: Create BaseLayout.astro

**Files:**
- Create: `astro/src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the layout file**

Create `astro/src/layouts/BaseLayout.astro`:

```astro
---
export interface Props {
  title: string;
  description: string;
  ogImage?: string;
}

const {
  title,
  description,
  ogImage = '/og-image.jpg',
} = Astro.props;

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />

    <title>{title}</title>

    <link rel="canonical" href={canonicalURL} />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon-192.png" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:url" content={canonicalURL} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />

    <!-- Google Fonts: Noto Sans Thai -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap"
      rel="stylesheet"
    />

    <!-- Global styles -->
    <style is:global>
      @import url('/src/styles/global.css');
    </style>
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Note on CSS import:** Astro prefers import via `<style is:global>` with `@import` or direct `import` in frontmatter. If `@import url('/src/styles/global.css')` doesn't resolve during build, replace with frontmatter import:
```astro
---
import '../styles/global.css';
---
```
Use the frontmatter import approach if the style tag approach fails `astro check`.

- [ ] **Step 2: Run astro check**

```bash
cd astro && npx astro check
```
Expected: `0 errors`

If error about CSS import path: switch to frontmatter import in the `---` block:
```astro
---
import '../styles/global.css';
// ... rest of props
---
```

- [ ] **Step 3: Run build to verify BaseLayout alone**

```bash
cd astro && npm run build 2>&1 | tail -5
```
Expected: `✓ Completed in Xms` or similar success. No build errors.

- [ ] **Step 4: Commit**

```bash
git add astro/src/layouts/BaseLayout.astro
git commit -m "feat: BaseLayout with font preload and global css"
```

---

## Task 6: Create Header.astro

**Files:**
- Create: `astro/src/components/Header.astro`

Port verbatim from `index.html` lines 687–756 (`.top-bar` + `.navbar` + drawer). Convert `href="*.html"` links to Astro root-relative paths (e.g. `iv-drip.html` → `/iv-drip`). Convert `src="image/..."` → `src="/Thrive-logo-160px.png"`.

- [ ] **Step 1: Create Header component**

Create `astro/src/components/Header.astro`:

```astro
---
---

<!-- Top Bar -->
<div class="top-bar">
  <div class="top-bar-left">
    <span>📞 095-934-9640</span>
    <span>💬 LINE: @thrivewellnessth</span>
    <span>🕐 เปิดทุกวัน 10:00-19:30</span>
  </div>
  <div class="top-bar-right">
    <a href="#" class="social-icon" title="Facebook">f</a>
    <a href="#" class="social-icon" title="YouTube">▶</a>
    <a href="#" class="social-icon" title="Instagram">@</a>
  </div>
</div>

<!-- Navbar -->
<nav class="navbar" id="navbar">
  <div class="navbar__inner">
    <a href="/" class="navbar__logo">
      <img src="/Thrive-logo-160px.png" alt="Thrive Wellness Center" style="height:40px;width:auto;display:block;" />
    </a>
    <div class="navbar__links">
      <div class="nav-item">
        <a href="/iv-drip" class="nav-link">วิตามินดริป ▾</a>
        <div class="nav-dropdown">
          <a href="/nad"><span class="nav-dropdown__icon">🧬</span>NAD+ Therapy</a>
          <a href="/iv-drip#chelation"><span class="nav-dropdown__icon">🫀</span>Chelation คีเลชั่น</a>
          <a href="/iv-drip#gut"><span class="nav-dropdown__icon">🌿</span>Gut Health IV</a>
          <a href="/iv-drip#booster"><span class="nav-dropdown__icon">⚡</span>Essential Booster</a>
          <a href="/gluta"><span class="nav-dropdown__icon">✨</span>Glutathione</a>
          <a href="/iv-drip#stem"><span class="nav-dropdown__icon">🌸</span>Stem Cell Facial</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="/check-up" class="nav-link">ตรวจสุขภาพ ▾</a>
        <div class="nav-dropdown">
          <a href="/food-intolerance"><span class="nav-dropdown__icon">🔬</span>ภูมิแพ้อาหารแฝง IgG</a>
          <a href="/check-up#hormones"><span class="nav-dropdown__icon">⚗️</span>สมดุลฮอร์โมน</a>
          <a href="/nk-cell"><span class="nav-dropdown__icon">🛡️</span>ตรวจมะเร็ง NK Cell</a>
          <a href="/check-up#dna"><span class="nav-dropdown__icon">🧬</span>DNA Health &amp; Life</a>
          <a href="/personalized-vitamins"><span class="nav-dropdown__icon">💊</span>วิตามิน &amp; ต้านอนุมูล</a>
          <a href="/check-up#urine"><span class="nav-dropdown__icon">🧪</span>สมดุลลำไส้ Urine</a>
          <a href="/check-up#oligoscan"><span class="nav-dropdown__icon">📊</span>Oligoscan</a>
          <a href="/check-up#family"><span class="nav-dropdown__icon">👨‍👩‍👧</span>วางแผนมีบุตร</a>
        </div>
      </div>
      <a href="/hbot" class="nav-link">HBOT</a>
      <a href="/health-architect" class="nav-link" style="color:var(--teal);font-weight:600;">Health Architect ✦</a>
      <a href="/blog" class="nav-link">คลังความรู้</a>
      <a href="/about" class="nav-link">เกี่ยวกับเรา</a>
    </div>
    <div class="navbar__cta">
      <a href="tel:0959349640" class="btn btn-sm" style="border:1.5px solid var(--border);color:var(--text-2);border-radius:var(--r-pill);background:transparent;">095-934-9640</a>
      <a href="/contact" class="btn btn-primary btn-sm">ปรึกษาฟรี</a>
    </div>
    <button class="navbar__hamburger" onclick="toggleDrawer()">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- Mobile Drawer Overlay -->
<div class="drawer-overlay" id="overlay" onclick="toggleDrawer()"></div>

<!-- Mobile Drawer -->
<div class="mobile-drawer" id="drawer">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
    <strong style="color:var(--navy);font-family:var(--font-en);">THRIVE</strong>
    <button onclick="toggleDrawer()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">✕</button>
  </div>
  <div style="display:flex;flex-direction:column;gap:8px;">
    <a href="/" style="padding:12px;border-radius:8px;background:var(--navy-xl);color:var(--navy);font-weight:600;">🏠 หน้าแรก</a>
    <a href="/iv-drip" style="padding:12px;border-radius:8px;color:var(--text-2);">💉 วิตามินดริป</a>
    <a href="/nad" style="padding:12px 12px 12px 28px;border-radius:8px;color:var(--text-2);font-size:.875rem;">└ 🧬 NAD+ Therapy</a>
    <a href="/check-up" style="padding:12px;border-radius:8px;color:var(--text-2);">🔬 ตรวจสุขภาพ</a>
    <a href="/hbot" style="padding:12px;border-radius:8px;color:var(--text-2);">🫁 HBOT</a>
    <a href="/health-architect" style="padding:12px;border-radius:8px;color:var(--teal);font-weight:600;">✦ Health Architect</a>
    <a href="/blog" style="padding:12px;border-radius:8px;color:var(--text-2);">📚 คลังความรู้</a>
    <a href="/about" style="padding:12px;border-radius:8px;color:var(--text-2);">👥 เกี่ยวกับเรา</a>
    <a href="/contact" style="padding:12px;border-radius:8px;background:var(--teal);color:white;font-weight:600;text-align:center;margin-top:8px;">ปรึกษาฟรี →</a>
  </div>
</div>

<script>
  function toggleDrawer() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    if (drawer && overlay) {
      drawer.classList.toggle('open');
      overlay.classList.toggle('open');
    }
  }
  // Expose to global scope for onclick handlers
  (window as any).toggleDrawer = toggleDrawer;
</script>
```

- [ ] **Step 2: Run astro check**

```bash
cd astro && npx astro check
```
Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/Header.astro
git commit -m "feat: Header component"
```

---

## Task 7: Create Footer.astro

**Files:**
- Create: `astro/src/components/Footer.astro`

Port verbatim from `index.html` lines 919–953. Convert `src="image/..."` to `/Thrive-logo-160px.png`. Convert `*.html` links to root-relative.

- [ ] **Step 1: Create Footer component**

Create `astro/src/components/Footer.astro`:

```astro
---
---

<footer>
  <div class="footer-container">
    <div class="footer-col">
      <img src="/Thrive-logo-160px.png" alt="Thrive Wellness Center" style="height:44px;width:auto;margin-bottom:8px;display:block;" />
      <p class="footer-tagline">ดูแลสุขภาพแบบองค์รวมในระดับเซลล์</p>
      <div class="footer-socials">
        <a href="#" class="social-icon">f</a>
        <a href="#" class="social-icon">▶</a>
        <a href="#" class="social-icon">@</a>
      </div>
    </div>
    <div class="footer-col">
      <h4>บริการ</h4>
      <a href="/iv-drip">วิตามินดริป (IV Drip)</a><br />
      <a href="/check-up">ตรวจสุขภาพเชิงลึก</a><br />
      <a href="/hbot">HBOT ออกซิเจนบำบัด</a>
    </div>
    <div class="footer-col">
      <h4>คลังความรู้</h4>
      <a href="/blog">บทความสุขภาพ</a><br />
      <a href="#">สุขภาพจิต</a><br />
      <a href="#">ความรู้ Wellness</a>
    </div>
    <div class="footer-col">
      <h4>ติดต่อเรา</h4>
      <p>📞 095-934-9640</p>
      <p>💬 LINE: @thrivewellnessth</p>
      <p>📍 ชั้น 2 เดอะ คริสตัล เอกมัย-รามอินทรา</p>
      <p>🕐 เปิดทุกวัน 10:00–19:30</p>
    </div>
  </div>
  <div class="footer-copyright">
    © 2025 Thrive Wellness Center. All rights reserved.
  </div>
</footer>
```

- [ ] **Step 2: Run astro check**

```bash
cd astro && npx astro check
```
Expected: `0 errors`

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/Footer.astro
git commit -m "feat: Footer component"
```

---

## Task 8: Create index.astro Homepage Shell

**Files:**
- Create: `astro/src/pages/index.astro`
- Modify: `astro/src/pages/index.astro` (replace placeholder from scaffold)

Port hero section (`index.html:760-769`) + stats section (`index.html:772-787`). Use BaseLayout + Header + Footer.

- [ ] **Step 1: Create index.astro**

Replace the scaffold-generated `astro/src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---

<BaseLayout
  title="Thrive Wellness Center — ดูแลสุขภาพแบบองค์รวมในระดับเซลล์"
  description="คลินิกสุขภาพเชิงลึก Bangkok — ตรวจสุขภาพ, IV Drip, HBOT, Food Intolerance, ฮอร์โมน ดูแลสุขภาพในระดับเซลล์"
>
  <Header />

  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>ร่างกายคุณสมควรได้รับมากกว่าการตรวจเลือดปกติ</h1>
      <p>เราไม่ได้แค่ "ตรวจ" — เราช่วยคุณค้นหาต้นตอ วางแผน และดูแลสุขภาพในระดับที่คลินิกทั่วไปทำไม่ได้</p>
      <div class="hero-buttons">
        <a href="/contact" class="btn-primary">ปรึกษาแพทย์ฟรี →</a>
        <a href="/check-up" class="btn-secondary">ดูบริการทั้งหมด</a>
      </div>
    </div>
  </section>

  <!-- Stats Section -->
  <section class="stats">
    <div class="stats-container">
      <div class="stat-item">
        <h3>7+</h3>
        <p>ปีดูแลสุขภาพเชิงลึก</p>
      </div>
      <div class="stat-item">
        <h3>5,000+</h3>
        <p>คนที่ไว้ใจให้เราดูแล</p>
      </div>
      <div class="stat-item">
        <h3>20+</h3>
        <p>โปรแกรมเฉพาะบุคคล</p>
      </div>
    </div>
  </section>

  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Run astro check**

```bash
cd astro && npx astro check
```
Expected: `0 errors`

- [ ] **Step 3: Run full build**

```bash
cd astro && npm run build
```
Expected: `✓ Completed` (or similar). No errors. A `dist/` folder is created.

- [ ] **Step 4: Verify built output**

```bash
ls astro/dist/
```
Expected: `index.html` exists.

```bash
grep -c "Noto Sans Thai" astro/dist/index.html
```
Expected: `1` or more (font link present in output).

```bash
grep -c "navbar" astro/dist/index.html
```
Expected: `1` or more (Header rendered in output).

```bash
grep -c "footer-container" astro/dist/index.html
```
Expected: `1` or more (Footer rendered in output).

- [ ] **Step 5: Visual preview**

```bash
cd astro && npm run preview -- --port 4322
```
Open `http://localhost:4322` in browser. Compare side-by-side with root `index.html` (open as `file://` in another tab). Check:
- Top bar visible (phone number, LINE, hours)
- Navbar visible (logo, links, "ปรึกษาฟรี" button)
- Hero section: heading + paragraph + 2 buttons
- Stats row: 7+, 5000+, 20+
- Footer: 4 columns + copyright
- Font (Noto Sans Thai) loads — check DevTools Network tab, filter "fonts"
- Colors match (navy `#2d358c`, no broken CSS)
- No console errors in DevTools

Press Ctrl+C to stop preview.

- [ ] **Step 6: Commit**

```bash
git add astro/src/pages/index.astro
git commit -m "feat: index.astro homepage shell"
```

---

## Task 9: Add CLAUDE.md at Repo Root

**Files:**
- Create: `CLAUDE.md` (repo root, i.e. one level above `astro/`)

Run from `astro/` dir: go back to repo root first.

- [ ] **Step 1: Create CLAUDE.md at repo root**

Create `/Users/temtem/projects/thrive-website/thrive-website/CLAUDE.md`:

```markdown
# CLAUDE.md — Thrive Website Repo

## What this repo
Public marketing site for Thrive Wellness Center (Bangkok). Migrating from Wix to Astro.
**Source-of-truth plan:** `plan_08052026.md` — read this first if unsure about any decision.

## Stack (locked — do not change without updating plan)
- **Astro** (`astro/` subdir) — new public marketing site, static output
- **Sanity** (project `fc8ot1td`, dataset `production`) — Tier B content (blog, testimonials, doctors)
- **Netlify** — hosting for Astro + serverless `/api/*` functions
- **Supabase** — leads and workflow data only
- **Root static HTML** (`*.html` at root) — legacy reference only, do NOT delete or modify

## Repo layout
```
thrive-website/
├── astro/              Active Astro build (new public site)
├── netlify/functions/  Serverless API (leads, health check)
├── supabase/           SQL schema files
├── *.html              Legacy static pages (design/content reference)
├── thrive-styles.css   Design system source (1753 lines — do not delete)
├── plan_08052026.md    Current project plan (authoritative)
├── SITE-TRACKER.md     Page build + SEO progress
└── DOCTOR-NOON-PAGES.md  Doctor attribution tracker
```

## Branch + PR rules (plan §4 — non-negotiable)
- **Never push directly to `main`**
- Branch naming: `feature/<scope>` e.g. `feature/astro-scaffold`, `feature/food-intolerance-page`
- 1 feature = 1 branch = 1 PR
- Netlify deploy preview must pass before merge (once Astro Netlify site is live)
- **Satemshi (achotirat@gmail.com) = final approver** before any merge to `main`

## Team roles (plan §4)
| Person | Role | Git | Sanity |
|---|---|---|---|
| Satemshi | Owner, infra, API, approver | Admin | Admin |
| facadexth | Frontend UI (Astro components, pages) | Write, feature branches only | Viewer/Developer |
| vkasama | Content management | None needed | Editor |
| AI (Claude) | Code, migration, QA, docs | Same as facadexth — branch + PR only | None |

## Working rules for AI (Claude)
1. Read `plan_08052026.md` before starting work — know the current phase.
2. **Tier A pages** (`/food-intolerance`, `/adrenal-fatigue`, `/hbot`, etc.) = manual MDX in `astro/src/content/` — SEO-critical, no bulk generation.
3. **Tier B content** (blog, testimonials, doctors) = Sanity after schema stable.
4. **Never** put credentials, API keys, PMS data, or customer data in the public site.
5. **Preserve URLs** from static site — same slug = same path in Astro.
6. **CSS: port faithful** — use class names from `thrive-styles.css`, do not redesign or add Tailwind.
7. Run `npx astro check` and `npm run build` before every commit in `astro/`.
8. Commit frequently, small commits, descriptive messages.

## Current phase
**Phase 1 — Astro Project Bootstrap** (May 2026)
See `plan_08052026.md §10` for full phase checklist.

Next after Phase 1:
- Phase 2: Tier A pages (`/food-intolerance` first per plan §6)
- Parallel: Sanity `service` schema, Supabase `leads` table

## Common commands
```bash
# From repo root:
cd astro
npm install
npm run dev          # http://localhost:4321
npm run build        # builds to astro/dist/
npm run preview      # preview built output
npx astro check      # type-check all .astro files — must be 0 errors before commit
```

## Hard stops — do NOT do these
- Do NOT push to `main`
- Do NOT touch root `netlify.toml` until a dedicated Astro-deploy branch
- Do NOT delete or modify root `*.html` or `thrive-styles.css`
- Do NOT add Tailwind (decision locked: port `thrive-styles.css`)
- Do NOT rebuild dashboard in Next.js (out of scope — see plan §12)
- Do NOT query PMS/RDS live from dashboard page loads
- Do NOT put service-role Supabase keys in any frontend file
```

- [ ] **Step 2: Verify CLAUDE.md at repo root**

```bash
ls -la /path/to/repo/CLAUDE.md
# Run from astro/:
ls ../CLAUDE.md
```
Expected: file exists.

- [ ] **Step 3: Run astro check (no change expected)**

```bash
cd astro && npx astro check
```
Expected: `0 errors`

- [ ] **Step 4: Commit CLAUDE.md from repo root**

```bash
# From repo root:
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md"
```

---

## Task 10: Final Verification + Cleanup Commit

**Files:** no new files

- [ ] **Step 1: Full astro check**

```bash
cd astro && npx astro check
```
Expected: `0 errors, 0 warnings`

- [ ] **Step 2: Full build**

```bash
cd astro && npm run build
```
Expected: `✓ Completed` with no errors. `dist/index.html` exists.

- [ ] **Step 3: Verify root files unchanged**

```bash
# From repo root:
git diff main -- '*.html'
git diff main -- thrive-styles.css
git diff main -- netlify.toml
```
Expected: all three produce **empty output** (no changes to existing files).

- [ ] **Step 4: Check git log for this branch**

```bash
git log main..HEAD --oneline
```
Expected commits (in order, oldest first):
```
chore: scaffold astro project
chore: port thrive-styles.css to astro global.css
chore: copy brand assets to astro/public
feat: BaseLayout with font preload and global css
feat: Header component
feat: Footer component
feat: index.astro homepage shell
docs: add CLAUDE.md
```

- [ ] **Step 5: Open preview for final visual check**

```bash
cd astro && npm run preview -- --port 4322
```

Open `http://localhost:4322` in browser. Confirm all of these:
- [ ] Top bar visible: phone number, LINE, hours
- [ ] Navbar: Thrive logo (image loads), all nav links, "ปรึกษาฟรี" CTA button
- [ ] Mobile hamburger button visible (don't need to test open/close behavior)
- [ ] Hero: heading + paragraph + 2 call-to-action links
- [ ] Stats row: 7+, 5000+, 20+ with captions
- [ ] Footer: 4 columns, copyright line
- [ ] Noto Sans Thai font loads (DevTools → Network → filter "font" → see Google Fonts request)
- [ ] No CSS breakage (navy color, not default browser blue)
- [ ] No console errors

Press Ctrl+C to stop.

- [ ] **Step 6: Push branch**

```bash
git push -u origin feature/astro-scaffold
```

- [ ] **Step 7: Open PR on GitHub**

PR title: `feat: astro scaffold — Phase 1 foundation`

PR body:
```markdown
## Summary

- Scaffold Astro project under `astro/` (static output, TS strict, Node 20)
- Port `thrive-styles.css` to `astro/src/styles/global.css` (1753 lines, verbatim)
- Copy brand assets to `astro/public/`
- `BaseLayout.astro` — HTML shell, Noto Sans Thai font, OG tags
- `Header.astro` — top bar + navbar + mobile drawer (markup only, JS toggle basic)
- `Footer.astro` — 4-column footer
- `index.astro` — homepage shell: Header + hero + stats + Footer
- `CLAUDE.md` at repo root — future Claude session context

## What was NOT changed
- Root `*.html` unchanged
- Root `thrive-styles.css` unchanged
- Root `netlify.toml` unchanged

## How to review
1. `git checkout feature/astro-scaffold`
2. `cd astro && npm install && npm run dev`
3. Open `http://localhost:4321` — compare visually with root `index.html`
4. Check fonts, colors, header/footer layout

## Verification checklist
- [ ] `npx astro check` → 0 errors
- [ ] `npm run build` → success
- [ ] Visual parity: header + hero + stats + footer match static `index.html`
- [ ] Noto Sans Thai font loads
- [ ] No console errors

Closes Phase 1 scaffold exit criterion: "Astro staging can render homepage shell and shared components."
```

---

## Post-Merge: What Comes Next

After this PR merges to `main`, suggested next branches (see spec §12):

1. `chore/netlify-astro-site` — configure second Netlify site pointing at `astro/`, attach `new.thrivewellnessth.com` with `noindex`
2. `feature/seo-component` — full SEO + JSON-LD + canonical in BaseLayout
3. `feature/gtm-integration` — GTM container in BaseLayout
4. `feature/food-intolerance-page` — Tier A page #1 (blocked on scaffold + Sanity schema; highest traffic)

Parallel (Satemshi-owned, no code conflict):
- `feature/sanity-service-schema` — Sanity `service` type per plan §5
- `chore/supabase-leads-table` — run `supabase/leads_schema.sql`
