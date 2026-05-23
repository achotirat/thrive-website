# Blog Import Report

Generated: 2026-05-23T16:32:23Z
Mode: write published
Files parsed: 10
Documents written: 10

## Summary

| File | Slug | Category | Body blocks | FAQ | Image | Warnings |
| --- | --- | --- | ---: | ---: | --- | --- |
| `new html from vkasama/blog-tierB-bucket1/blog-probiotic-foods.html` | `อาหารที่มี-probiotic` | โภชนาการ | 82 | 6 | probiotic-foods-hero-1200x630.jpg | - |
| `new html from vkasama/blog-tierB-bucket2/blog-vitamin-a.html` | `vitamin-a` | โภชนาการ | 18 | 0 | vitamin-a-hero-1200x630.jpg | no FAQ detected; source HTML has no FAQ/FAQPage section |
| `new html from vkasama/blog-tierB-bucket1/blog-l-carnitine.html` | `l-carnitine` | โภชนาการ | 59 | 6 | l-carnitine-hero-1200x630.jpg | - |
| `new html from vkasama/blog-tierB-bucket1/blog-menstrual-pain.html` | `menstrual-pain` | สตรีสุขภาพ | 40 | 6 | menstrual-pain-hero-1200x630.jpg | - |
| `new html from vkasama/blog-tierB-bucket2/blog-urticaria-hives.html` | `ผื่นลมพิษ` | ภูมิคุ้มกัน | 35 | 0 | urticaria-hives-hero-1200x630.jpg | no FAQ detected; source HTML has no FAQ/FAQPage section |
| `new html from vkasama/blog-tierB-bucket2/blog-triglyceride.html` | `triglyceride` | หัวใจและหลอดเลือด | 32 | 0 | triglyceride-hero-1200x630.jpg | no FAQ detected; source HTML has no FAQ/FAQPage section |
| `new html from vkasama/blog-tierB-bucket1/blog-chromium.html` | `chromium` | โภชนาการ | 35 | 6 | chromium-hero-1200x630.jpg | - |
| `new html from vkasama/blog-tierB-bucket1/blog-clogged-arteries.html` | `cloggedarteries` | หัวใจและหลอดเลือด | 36 | 6 | clogged-arteries-hero-1200x630.jpg | - |
| `new html from vkasama/blog-tierB-bucket1/blog-love-neurotransmitter.html` | `neurotransmitter` | สุขภาพจิต | 37 | 6 | love-neurotransmitter-hero-1200x630.jpg | - |
| `new html from vkasama/blog-tierB-bucket2/blog-immune-system.html` | `immunesystem` | ภูมิคุ้มกัน | 44 | 6 | immune-system-hero-1200x630.jpg | - |

## Document Writes

- `blogPost.probiotic`
- `blogPost.vitamin-a`
- `blogPost.l-carnitine`
- `blogPost.menstrual-pain`
- `blogPost.post-1vlup14`
- `blogPost.triglyceride`
- `blogPost.chromium`
- `blogPost.cloggedarteries`
- `blogPost.neurotransmitter`
- `blogPost.immunesystem`

## Verification

- Sanity published `blogPost` count: 30
- `npm run check`: 0 errors, 0 warnings, 0 hints
- `npm run build` with Sanity env: loaded 30 blog posts, built 83 pages
- Spot-checks:
  - `/blog/อาหารที่มี-probiotic/`: 200, hero image present, FAQ rendered, tables/lists present
  - `/blog/ผื่นลมพิษ/`: 200, canonical Thai slug preserved, hero image present
  - `/blog/triglyceride/`: 200, hero image present
  - `/post/ผื่นลมพิษ/`: generated redirect page to `/blog/ผื่นลมพิษ`
