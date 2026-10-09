#!/usr/bin/env node
// Read-only crawler for thrive-site-inspect. No dependencies (Node 22+).
// Usage: node crawl.mjs <siteOrigin> <outPrefix> [--limit N]
//   e.g. node crawl.mjs https://www.thrivewellnessth.com docs/site-reports/2026-10-09/old
// Writes <outPrefix>.json (full records) and <outPrefix>.csv (one row per URL).

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const [origin, outPrefix, ...rest] = process.argv.slice(2);
if (!origin || !outPrefix) {
  console.error('usage: node crawl.mjs <siteOrigin> <outPrefix> [--limit N]');
  process.exit(1);
}
const limitIdx = rest.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? Number(rest[limitIdx + 1]) : Infinity;
const CONCURRENCY = 3;
const DELAY_MS = 400;
const UA = 'ThriveSiteInspect/1.0 (+owner audit; read-only)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();

async function get(url, opts = {}) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000), ...opts });
  return { res, text: await res.text() };
}

// Sitemaps: try sitemap-index.xml (Astro) then sitemap.xml (Wix); recurse into nested indexes.
async function collectSitemapUrls(base) {
  const seen = new Set();
  const pages = new Set();
  const queue = [`${base}/sitemap-index.xml`, `${base}/sitemap.xml`];
  while (queue.length) {
    const sm = queue.shift();
    if (seen.has(sm)) continue;
    seen.add(sm);
    try {
      const { res, text } = await get(sm);
      if (!res.ok) continue;
      const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
      if (/<sitemapindex/i.test(text)) queue.push(...locs);
      else locs.forEach((l) => pages.add(l));
    } catch {}
  }
  // Stale sitemaps can list another host (e.g. legacy www URLs on staging): keep them out of the crawl but report them.
  const host = new URL(base).host;
  const all = [...pages];
  return { urls: all.filter((u) => new URL(u).host === host), foreign: all.filter((u) => new URL(u).host !== host), sitemaps: [...seen] };
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? decode(m[1]) : '';
}

function analyze(html, url) {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd >= 0 ? html.slice(0, headEnd + 7) : html; // some pages (e.g. redirect stubs) have no </head>
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (key) => {
    const t = metas.find((x) => new RegExp(`(name|property)\\s*=\\s*["']${key}["']`, 'i').test(x));
    return t ? attr(t, 'content') : '';
  };
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const canonical = links.find((l) => /rel\s*=\s*["']canonical["']/i.test(l));
  const hreflangs = links.filter((l) => /hreflang/i.test(l)).map((l) => `${attr(l, 'hreflang')}=${attr(l, 'href')}`);
  // Static-site redirects (Astro output:'static') are 200 + meta refresh, not a real 301.
  const refresh = metas.find((x) => /http-equiv\s*=\s*["']refresh["']/i.test(x));
  const metaRefresh = refresh ? (attr(refresh, 'content').match(/url=(.*)$/i) || [])[1] || '' : '';
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => decode(m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')));
  const ldTypes = new Set();
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const t of m[1].matchAll(/"@type"\s*:\s*(\[[^\]]*\]|"[^"]*")/g)) {
      t[1].replace(/[\[\]"]/g, '').split(',').forEach((x) => x.trim() && ldTypes.add(x.trim()));
    }
  }
  const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0]
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const host = new URL(url).host;
  const anchors = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"'#]+)["']/gi)].map((m) => m[1]);
  const internal = anchors.filter((h) => h.startsWith('/') || h.includes(host));
  return {
    metaRefresh,
    title,
    titleLen: [...title].length,
    description: meta('description'),
    descriptionLen: [...meta('description')].length,
    robotsMeta: meta('robots'),
    canonical: canonical ? attr(canonical, 'href') : '',
    ogImage: meta('og:image'),
    hreflang: hreflangs.join(' | '),
    h1Count: h1s.length,
    h1: h1s[0] || '',
    jsonLdTypes: [...ldTypes].join(' '),
    bodyChars: body.length, // Thai has no word spaces: use characters, not words
    imgCount: imgs.length,
    imgNoAlt: imgs.filter((i) => !/\balt\s*=\s*["'][^"']+["']/i.test(i)).length,
    internalLinks: internal.length,
    lineLinks: anchors.filter((h) => /line\.me|lin\.ee/i.test(h)).length,
    telLinks: anchors.filter((h) => h.startsWith('tel:')).length,
  };
}

async function inspect(url) {
  const t0 = Date.now();
  try {
    const first = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'manual', signal: AbortSignal.timeout(20000) });
    await first.body?.cancel();
    const redirectTo = first.status >= 300 && first.status < 400 ? first.headers.get('location') || '' : '';
    const { res, text } = await get(url);
    return {
      url,
      status: first.status,
      redirectTo,
      finalUrl: res.url,
      finalStatus: res.status,
      xRobotsTag: res.headers.get('x-robots-tag') || '',
      ms: Date.now() - t0,
      htmlKB: Math.round(text.length / 1024),
      ...(res.headers.get('content-type')?.includes('html') ? analyze(text, res.url) : {}),
    };
  } catch (e) {
    return { url, status: 0, error: String(e.message || e) };
  }
}

const base = origin.replace(/\/$/, '');
const sm = await collectSitemapUrls(base);
let urls = sm.urls.length ? sm.urls : [`${base}/`];
urls = urls.slice(0, LIMIT);
console.error(`[crawl] ${urls.length} URLs from ${base} (${sm.foreign.length} off-host sitemap URLs skipped)`);

const out = [];
let i = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (i < urls.length) {
      const u = urls[i++];
      out.push(await inspect(u));
      await sleep(DELAY_MS);
    }
  }),
);
out.sort((a, b) => a.url.localeCompare(b.url));

await mkdir(dirname(outPrefix), { recursive: true });
await writeFile(`${outPrefix}.json`, JSON.stringify({ origin: base, crawledAt: new Date().toISOString(), sitemaps: sm.sitemaps, offHostSitemapUrls: sm.foreign, pages: out }, null, 2));
const cols = [...new Set(out.flatMap((r) => Object.keys(r)))];
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
await writeFile(`${outPrefix}.csv`, '﻿' + [cols.join(','), ...out.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n'));
console.error(`[crawl] wrote ${outPrefix}.json / .csv`);
