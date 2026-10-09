#!/usr/bin/env node
// Build the Wix -> Astro URL map for cutover redirects. Read-only, no dependencies.
// Usage: node url-map.mjs <crawl-old.json> <crawl-new.json> <out.csv> [ubersuggestDir]
//   ubersuggestDir may contain top-pages.csv (No,Title,URL,Est. Visits,Backlinks)
//   and keywords.csv (No,Keywords,Volume,Position,Est. Visits,...,Ranking Url).
// match_type: exact | mapped | none | drop  (see SKILL.md Step 3)

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const [oldPath, newPath, outPath, uberDir] = process.argv.slice(2);
if (!oldPath || !newPath || !outPath) {
  console.error('usage: node url-map.mjs <crawl-old.json> <crawl-new.json> <out.csv> [ubersuggestDir]');
  process.exit(1);
}

// Wix pages that should not be redirected: archives/filters, member/booking system pages.
const DROP = [/^\/blog\/(hashtags|categories|page)\//, /^\/blog\/categories$/, /^\/(profile|members?|account|cart|checkout|booking-calendar|book-online)(\/|$)/];
// Known slug renames between Wix and Astro (extend as decisions are made).
const RENAMES = { '/nad-plus': '/nad' };
// Pattern renames (Wix package pages -> Astro /check-up/*); applied only if the target exists.
const PATTERNS = [[/^\/(.+)-check-up$/, '/check-up/$1'], [/^\/(.+)-test$/, '/check-up/$1'], [/^\/package-(.+)$/, '/check-up/$1']];

const norm = (u) => {
  let p;
  try { p = decodeURIComponent(new URL(u).pathname); } catch { p = new URL(u).pathname; }
  p = p.replace(/\/+$/, '') || '/';
  return p.toLowerCase();
};

// Minimal CSV parser (handles quoted fields with commas/newlines).
function parseCsv(text) {
  const rows = []; let row = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.replace(/^﻿/, '').trim(), r[i]])));
}
const num = (s) => Number(String(s ?? '').replace(/[^\d.]/g, '')) || 0;

const oldCrawl = JSON.parse(await readFile(oldPath, 'utf8'));
const newCrawl = JSON.parse(await readFile(newPath, 'utf8'));
const oldOrigin = oldCrawl.origin;
const newOrigin = newCrawl.origin;

const newPaths = new Map(); // normalized path -> real path (content pages only)
const refreshTo = new Map(); // normalized path -> meta-refresh target path
const bySlug = new Map(); // last path segment -> real path (for suggestions)
for (const p of newCrawl.pages) {
  if (p.status !== 200) continue;
  const path = new URL(p.url).pathname.replace(/\/+$/, '') || '/';
  if (p.metaRefresh) { refreshTo.set(norm(p.url), new URL(p.metaRefresh, p.url).pathname); continue; }
  newPaths.set(norm(p.url), path);
  const slug = norm(p.url).split('/').pop();
  if (slug && !bySlug.has(slug)) bySlug.set(slug, path);
}

const old = new Map(); // normalized path -> record
const add = (u, extra = {}) => {
  const k = norm(u);
  const r = old.get(k) || { old_url: `${oldOrigin}${new URL(u).pathname}`, old_status: '', est_visits: 0, backlinks: 0, top_keyword: '', top_kw_visits: 0, sources: new Set() };
  Object.assign(r, Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== undefined && v !== '')));
  old.set(k, r);
  return r;
};
for (const p of oldCrawl.pages) add(p.url, { old_status: String(p.status) }).sources.add('sitemap');

if (uberDir && existsSync(`${uberDir}/top-pages.csv`)) {
  for (const r of parseCsv(await readFile(`${uberDir}/top-pages.csv`, 'utf8'))) {
    if (!r.URL) continue;
    const rec = add(r.URL);
    rec.est_visits = Math.max(rec.est_visits, num(r['Est. Visits']));
    rec.backlinks = Math.max(rec.backlinks, num(r.Backlinks));
    rec.sources.add('ubersuggest-top-pages');
  }
}
if (uberDir && existsSync(`${uberDir}/keywords.csv`)) {
  for (const r of parseCsv(await readFile(`${uberDir}/keywords.csv`, 'utf8'))) {
    if (!r['Ranking Url']) continue;
    const u = r['Ranking Url'].startsWith('http') ? r['Ranking Url'] : `https://${r['Ranking Url']}`;
    const rec = add(u);
    const v = num(r['Est. Visits']);
    if (v > rec.top_kw_visits) { rec.top_kw_visits = v; rec.top_keyword = `${r.Keywords} (#${r.Position}, vol ${r.Volume})`; }
    rec.sources.add('ubersuggest-keywords');
  }
}

const rows = [];
for (const [k, r] of old) {
  let new_url = '', match_type = 'none', note = '';
  if (DROP.some((re) => re.test(k))) match_type = 'drop';
  else if (newPaths.has(k)) { match_type = 'exact'; new_url = newPaths.get(k); }
  else if (refreshTo.has(k) && newPaths.has(norm(`${newOrigin}${refreshTo.get(k)}`))) {
    match_type = 'mapped'; new_url = newPaths.get(norm(`${newOrigin}${refreshTo.get(k)}`));
    note = 'new site serves meta refresh (200), not 301';
  }
  else if (RENAMES[k] && newPaths.has(RENAMES[k])) { match_type = 'mapped'; new_url = newPaths.get(RENAMES[k]); note = 'known rename'; }
  else if (k.startsWith('/post/') && newPaths.has(k.replace('/post/', '/blog/'))) {
    match_type = 'mapped'; new_url = newPaths.get(k.replace('/post/', '/blog/'));
    note = 'Wix /post/* -> Astro /blog/*';
  }
  if (match_type === 'none') {
    for (const [re, to] of PATTERNS) {
      const t = re.test(k) ? k.replace(re, to) : '';
      if (t && newPaths.has(t)) { match_type = 'mapped'; new_url = newPaths.get(t); note = 'pattern rename - verify'; break; }
    }
  }
  if (match_type === 'none' && bySlug.has(k.split('/').pop())) {
    match_type = 'mapped'; new_url = bySlug.get(k.split('/').pop()); note = 'auto: same final slug - verify';
  }
  if (match_type === 'none' && (r.est_visits || r.backlinks)) note = 'HAS TRAFFIC/BACKLINKS - needs a target';
  rows.push({ ...r, new_url: new_url ? `${newOrigin}${new_url}` : '', match_type, note, sources: [...r.sources].join('+') });
}
const rank = { none: 0, mapped: 1, exact: 2, drop: 3 };
rows.sort((a, b) => rank[a.match_type] - rank[b.match_type] || b.est_visits - a.est_visits || b.backlinks - a.backlinks);

const cols = ['old_url', 'old_status', 'est_visits', 'backlinks', 'top_keyword', 'new_url', 'match_type', 'note', 'sources'];
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
await writeFile(outPath, '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n'));

const by = (t) => rows.filter((r) => r.match_type === t);
const sum = (rs, f) => rs.reduce((s, r) => s + (r[f] || 0), 0);
console.log(JSON.stringify({
  total: rows.length,
  ...Object.fromEntries(['exact', 'mapped', 'none', 'drop'].map((t) => [t, { urls: by(t).length, est_visits: sum(by(t), 'est_visits'), backlinks: sum(by(t), 'backlinks') }])),
  none_with_traffic: by('none').filter((r) => r.est_visits || r.backlinks).length,
}, null, 2));
