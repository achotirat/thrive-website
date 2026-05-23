#!/usr/bin/env node
import { createReadStream, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const DEFAULT_SOURCES = [
  'new html from vkasama/blog-tierB-bucket1',
  'new html from vkasama/blog-tierB-bucket2',
  '.',
];
const REPORT_PATH = path.join(ROOT, 'docs/blog-import-report.md');
const DEFAULT_PROJECT_ID = 'fc8ot1td';
const DEFAULT_DATASET = 'production';
const BLOCK_LIMIT = 220;

const CATEGORY_RULES = [
  [/hormone|adrenal|testosterone|progesterone|menopause|growth-factor|growth-hormone/i, 'ฮอร์โมน'],
  [/chili|mineral|zinc|vitamin|apple|omega|probiotic|chromium|magnesium|bromelain|carnitine|tryptophan/i, 'โภชนาการ'],
  [/depression|mental|gaba|neurotransmitter|mood/i, 'สุขภาพจิต'],
  [/immunity|immune|allergy|nk|glutathione|urticaria/i, 'ภูมิคุ้มกัน'],
  [/acne|skin|silica|preservatives/i, 'ผิวหนัง'],
  [/gut|intestine|probiotic|digest/i, 'ระบบย่อยอาหาร'],
  [/blood|triglyceride|coq10|arter|heart|syncope/i, 'หัวใจและหลอดเลือด'],
  [/period|menstrual|pms|pcos|menorrhagia|amenorrhea|dysmenorrhea|female|siw-prajam-duan/i, 'สตรีสุขภาพ'],
];

function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, '');
  }
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    limit: null,
    source: null,
    replace: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--replace') args.replace = true;
    else if (arg === '--no-replace') args.replace = false;
    else if (arg === '--limit') args.limit = Number.parseInt(argv[++index], 10);
    else if (arg === '--source') args.source = argv[++index];
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (args.limit !== null && (!Number.isFinite(args.limit) || args.limit <= 0)) {
    throw new Error('--limit must be a positive number');
  }

  return args;
}

async function walkFiles(target) {
  const absolute = path.resolve(ROOT, target);
  if (!existsSync(absolute)) return [];
  const info = await stat(absolute);
  if (info.isFile()) return absolute.endsWith('.html') ? [absolute] : [];

  const entries = await readdir(absolute, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkFiles(path.relative(ROOT, child)));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(child);
    }
  }
  return files;
}

async function discoverFiles(args) {
  if (args.source) {
    return (await walkFiles(args.source)).sort();
  }

  const bucketFiles = [];
  for (const source of DEFAULT_SOURCES.slice(0, 2)) {
    bucketFiles.push(...await walkFiles(source));
  }

  const rootFiles = (await walkFiles('.'))
    .filter((file) => path.dirname(file) === ROOT)
    .filter((file) => path.basename(file).startsWith('blog-'));

  return [...bucketFiles.sort(), ...rootFiles.sort()];
}

function decodeHtml(value = '') {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

function stripTags(value = '') {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAttr(tag, attr) {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match ? decodeHtml(match[1]).trim() : '';
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? decodeHtml(match[1]).trim() : '';
}

function metaContent(html, nameOrProperty) {
  const escaped = nameOrProperty.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${escaped}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["'][^>]*>`, 'i'),
  ];
  for (const pattern of patterns) {
    const value = firstMatch(html, pattern);
    if (value) return value;
  }
  return '';
}

function canonicalUrl(html) {
  return firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    || firstMatch(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
}

function titleFromHtml(html) {
  const h1 = stripTags(firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  if (h1) return h1.slice(0, 140);
  const ogTitle = metaContent(html, 'og:title');
  if (ogTitle) return ogTitle.replace(/\s*\|\s*Thrive.*$/i, '').slice(0, 140);
  return stripTags(firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i))
    .replace(/\s*\|\s*Thrive.*$/i, '')
    .slice(0, 140);
}

function slugFrom(filePath, html) {
  const canonical = canonicalUrl(html);
  const urlSlug = canonical.match(/\/(?:post|blog)\/([^/?#]+)/i)?.[1];
  if (urlSlug) return cleanSlug(urlSlug);

  const name = path.basename(filePath, '.html')
    .replace(/^blog-/, '')
    .replace(/-migration$/, '')
    .replace(/-complete$/, '');
  return cleanSlug(name);
}

function cleanSlug(value) {
  return decodeURIComponent(value)
    .toLowerCase()
    .replace(/\.html$/, '')
    .replace(/[^a-z0-9ก-๙_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function categoryFor(slug, title) {
  const haystack = `${slug} ${title}`;
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(haystack)) return { category, inferred: false };
  }
  return { category: 'โภชนาการ', inferred: true };
}

function publishedAtFrom(html) {
  const candidates = [
    metaContent(html, 'article:published_time'),
    metaContent(html, 'datePublished'),
    firstMatch(html, /"datePublished"\s*:\s*"([^"]+)"/i),
  ].filter(Boolean);
  const valid = candidates.find((value) => !Number.isNaN(Date.parse(value)));
  return valid ? new Date(valid).toISOString() : '2026-05-23T00:00:00.000Z';
}

function imageCandidate(html) {
  const remote = metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
  const basename = remote ? path.basename(new URL(remote, 'https://www.thrivewellnessth.com').pathname) : '';
  return { remote, basename };
}

function findLocalImage(basename) {
  if (!basename) return null;
  const candidates = [
    path.join(ROOT, 'image', basename),
    path.join(ROOT, 'astro/public', basename),
    path.join(ROOT, basename),
  ];
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

function key(prefix, index) {
  return `${prefix}${index.toString(36)}`;
}

function span(text, index) {
  return { _type: 'span', _key: key('s', index), text, marks: [] };
}

function block(text, index, style = 'normal', listItem = undefined) {
  const clean = stripTags(text);
  if (!clean) return null;
  const item = {
    _type: 'block',
    _key: key('b', index),
    style,
    markDefs: [],
    children: [span(clean, index)],
  };
  if (listItem) {
    item.listItem = listItem;
    item.level = 1;
  }
  return item;
}

function imageBlock(src, alt, index) {
  const basename = src ? path.basename(new URL(src, 'https://www.thrivewellnessth.com').pathname) : '';
  return {
    _type: 'block',
    _key: key('img', index),
    style: 'normal',
    markDefs: [],
    children: [span(`[Image: ${alt || basename || 'image'}]`, index)],
  };
}

function mainHtml(html) {
  const withoutNoise = html
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ');

  return firstMatch(withoutNoise, /<main[^>]*>([\s\S]*?)<\/main>/i)
    || firstMatch(withoutNoise, /<article[^>]*>([\s\S]*?)<\/article>/i)
    || firstMatch(withoutNoise, /<body[^>]*>([\s\S]*?)<\/body>/i)
    || withoutNoise;
}

function bodyBlocks(html) {
  const source = mainHtml(html);
  const tokens = [...source.matchAll(/<(h2|h3|p|li|blockquote|img)\b([^>]*)>([\s\S]*?)<\/\1>|<img\b([^>]*)>/gi)];
  const blocks = [];
  let index = 0;

  for (const token of tokens) {
    if (blocks.length >= BLOCK_LIMIT) break;
    const tag = (token[1] || 'img').toLowerCase();
    const attrs = token[2] || token[4] || '';
    const inner = token[3] || '';
    let next = null;

    if (tag === 'h2') next = block(inner, index, 'h2');
    else if (tag === 'h3') next = block(inner, index, 'h3');
    else if (tag === 'li') next = block(inner, index, 'normal', 'bullet');
    else if (tag === 'blockquote') next = block(inner, index, 'blockquote');
    else if (tag === 'img') next = imageBlock(getAttr(attrs, 'src'), getAttr(attrs, 'alt'), index);
    else next = block(inner, index);

    if (next && next.children[0].text.length > 1) {
      blocks.push(next);
      index += 1;
    }
  }

  if (blocks.length === 0) {
    const fallback = block(source, 0);
    if (fallback) blocks.push(fallback);
  }

  return blocks;
}

function parseJsonLdFaq(html) {
  const faqs = [];
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  function visit(node) {
    if (!node || typeof node !== 'object') return;
    const type = node['@type'];
    if (type === 'FAQPage' && Array.isArray(node.mainEntity)) {
      for (const item of node.mainEntity) {
        const question = item.name || item.question;
        const answer = item.acceptedAnswer?.text || item.answer || '';
        if (question && answer) faqs.push({ question: stripTags(question), answer: stripTags(answer) });
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else visit(value);
    }
  }

  for (const script of scripts) {
    try {
      visit(JSON.parse(decodeHtml(script[1].trim())));
    } catch {
      // Invalid JSON-LD is common in hand-built HTML; ignore and continue.
    }
  }
  return faqs;
}

function faqItems(html) {
  return parseJsonLdFaq(html).slice(0, 10).map((item, index) => ({
    _key: key('faq', index),
    question: item.question.slice(0, 180),
    shortAnswer: item.answer.slice(0, 320),
    answer: [block(item.answer, index) || block(item.question, index)],
  }));
}

function parseFile(filePath) {
  const html = readFileSync(filePath, 'utf8');
  const relativePath = path.relative(ROOT, filePath);
  const title = titleFromHtml(html) || path.basename(filePath, '.html');
  const slug = slugFrom(filePath, html);
  const description = metaContent(html, 'description') || metaContent(html, 'og:description') || '';
  const { category, inferred } = categoryFor(slug, title);
  const image = imageCandidate(html);
  const localImage = findLocalImage(image.basename);
  const body = bodyBlocks(html);
  const faq = faqItems(html);

  const warnings = [];
  if (inferred) warnings.push('category fallback used');
  if (!description) warnings.push('missing meta description');
  if (image.basename && !localImage) warnings.push(`missing local hero image: ${image.basename}`);
  if (!image.basename) warnings.push('missing og:image');
  if (body.length <= 1) warnings.push('body parse produced very few blocks');
  if (faq.length === 0) warnings.push('no FAQ detected');

  const doc = {
    _id: `drafts.blogPost.${slug}`,
    _type: 'blogPost',
    title,
    slug: { _type: 'slug', current: slug },
    category,
    excerpt: stripTags(description).slice(0, 240) || `${title} จาก Thrive Wellness Center`,
    publishedAt: publishedAtFrom(html),
    mainImage: localImage ? { _type: 'image', alt: title } : undefined,
    body,
    faq,
    seo: {
      _type: 'seoMeta',
      seoTitle: (metaContent(html, 'og:title') || title).slice(0, 70),
      seoDescription: stripTags(description).slice(0, 170),
      canonicalUrl: canonicalUrl(html) || undefined,
      noIndex: false,
      includeInSitemap: true,
      schemaType: 'BlogPosting',
    },
  };

  return {
    filePath,
    relativePath,
    slug,
    title,
    category,
    imageBasename: image.basename,
    localImage,
    bodyCount: body.length,
    faqCount: faq.length,
    warnings,
    doc,
  };
}

async function createSanityClient() {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) throw new Error('SANITY_API_TOKEN is required for non-dry-run imports');

  const modulePath = path.join(ROOT, 'astro/node_modules/@sanity/client/dist/index.js');
  const { createClient } = await import(pathToFileURL(modulePath));
  return createClient({
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID || DEFAULT_PROJECT_ID,
    dataset: process.env.PUBLIC_SANITY_DATASET || DEFAULT_DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  });
}

async function uploadImage(client, result) {
  if (!result.localImage) return null;
  const asset = await client.assets.upload('image', createReadStream(result.localImage), {
    filename: path.basename(result.localImage),
    title: result.title,
  });
  return asset;
}

async function writeDraft(client, result) {
  const doc = structuredClone(result.doc);
  const asset = await uploadImage(client, result);
  if (asset) {
    doc.mainImage = {
      _type: 'image',
      alt: result.title,
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    };
  } else {
    delete doc.mainImage;
  }
  await client.createOrReplace(doc);
  return doc._id;
}

function report(results, writes, args) {
  const lines = [
    '# Blog Import Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${args.dryRun ? 'dry-run' : 'write drafts'}`,
    `Files parsed: ${results.length}`,
    `Drafts written: ${writes.length}`,
    '',
    '## Summary',
    '',
    '| File | Slug | Category | Body blocks | FAQ | Image | Warnings |',
    '| --- | --- | --- | ---: | ---: | --- | --- |',
  ];

  for (const item of results) {
    lines.push(`| \`${item.relativePath}\` | \`${item.slug}\` | ${item.category} | ${item.bodyCount} | ${item.faqCount} | ${item.imageBasename || '-'} | ${item.warnings.join('<br>') || '-'} |`);
  }

  if (writes.length > 0) {
    lines.push('', '## Draft Writes', '');
    for (const write of writes) {
      lines.push(`- \`${write}\``);
    }
  }

  writeFileSync(REPORT_PATH, `${lines.join('\n')}\n`);
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));
  const files = (await discoverFiles(args)).slice(0, args.limit || undefined);
  if (files.length === 0) throw new Error('No HTML files matched the requested source');

  const results = files.map(parseFile);
  const writes = [];

  if (!args.dryRun) {
    const client = await createSanityClient();
    for (const result of results) {
      writes.push(await writeDraft(client, result));
    }
  }

  report(results, writes, args);
  console.log(`Parsed ${results.length} file(s).`);
  console.log(args.dryRun ? 'Dry-run only; no Sanity writes.' : `Wrote ${writes.length} Sanity draft(s).`);
  console.log(`Report: ${path.relative(ROOT, REPORT_PATH)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
