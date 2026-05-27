import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { sanityBlogLoader } from './lib/sanityBlogLoader';

const buttonSchema = z.object({
  label: z.string(),
  href: z.string(),
});

const servicesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    seo: z.object({
      seoTitle: z.string(),
      description: z.string().max(180),
      ogImage: z.string(),
      ogLocale: z.string().default('th_TH'),
      canonicalPath: z.string(),
      noIndex: z.boolean().default(false),
      hreflang: z.array(z.object({ lang: z.string(), href: z.string() })).default([]),
      geo: z.object({
        region: z.string(),
        placename: z.string(),
        position: z.string(),
        icbm: z.string(),
      }),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
      lastMedicalReview: z.coerce.date(),
      reviewedBy: z.string(),
      medicalSpecialty: z.string(),
    }),
    hero: z.object({
      headline: z.string(),
      subline: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      primaryBtn: buttonSchema,
      secondaryBtn: buttonSchema.optional(),
      stats: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
    }),
    doctor: z.object({
      name: z.string(),
      title: z.string(),
      image: z.string(),
      imageAlt: z.string(),
      bio: z.string(),
      specializations: z.array(z.string()),
    }),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })),
    cta: z.object({
      headline: z.string(),
      subline: z.string().optional(),
      primaryBtn: buttonSchema,
      secondaryBtn: buttonSchema.optional(),
    }),
    relatedServices: z.array(z.object({
      title: z.string(),
      href: z.string(),
      icon: z.string().optional(),
      description: z.string().optional(),
    })),
    jsonLd: z.array(z.any()).default([]),
  }),
});

const blogPostsCollection = defineCollection({
  loader: sanityBlogLoader(),
  schema: z.object({
    _id: z.string(),
    title: z.string(),
    slug: z.object({ current: z.string() }),
    excerpt: z.string().optional().default(''),
    category: z.string().optional().default(''),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    mainImage: z.any().optional(),
    authorName: z.string().optional(),
    authorTitle: z.string().optional(),
    keyTakeaways: z.array(z.string()).optional().default([]),
    body: z.array(z.any()).optional().default([]),
    legacyHtml: z.string().optional().default(''),
    faq: z.array(z.object({
      question: z.string(),
      shortAnswer: z.string().optional().default(''),
    })).optional().default([]),
    references: z.array(z.object({
      title: z.string(),
      source: z.string().optional(),
      year: z.number().optional(),
      url: z.string().optional(),
    })).optional().default([]),
    seo: z.object({
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      noIndex: z.boolean().optional().default(false),
      canonicalUrl: z.string().optional(),
    }).optional(),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string().optional().default(''),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    authorName: z.string().optional().default('พญ. ชนากานต์ ตระหง่านศรี'),
    authorTitle: z.string().optional().default('แพทย์ด้าน Anti-aging & Regenerative Medicine'),
    mainImage: z.string().optional(),
    keyTakeaways: z.array(z.string()).optional().default([]),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional().default([]),
    noIndex: z.boolean().optional().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

export const collections = {
  services: servicesCollection,
  blogPosts: blogPostsCollection,
  blog: blogCollection,
};
