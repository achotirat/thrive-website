import {defineField, defineType} from 'sanity'

export const seoMeta = defineType({
  name: 'seoMeta',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO title',
      type: 'string',
      description: 'Recommended max: 60 characters.',
      validation: (Rule) => Rule.max(70).warning('SEO titles usually work best below 60 characters.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO description',
      type: 'text',
      rows: 3,
      description: 'Recommended max: 155 characters.',
      validation: (Rule) => Rule.max(170).warning('Meta descriptions usually work best below 155 characters.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'ogTitle',
      title: 'Open Graph title',
      type: 'string',
      description: 'Optional override for social sharing. Falls back to SEO title.',
      validation: (Rule) => Rule.max(90),
    }),
    defineField({
      name: 'ogDescription',
      title: 'Open Graph description',
      type: 'text',
      rows: 3,
      description: 'Optional override for social sharing. Falls back to SEO description.',
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'Use only when this page should canonicalize to a specific absolute URL.',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'noIndex',
      title: 'Noindex this page',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'noFollow',
      title: 'Nofollow links on this page',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'includeInSitemap',
      title: 'Include in sitemap',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'sitemapPriority',
      title: 'Sitemap priority',
      type: 'number',
      description: 'Optional value from 0.0 to 1.0 for sitemap generation.',
      validation: (Rule) => Rule.min(0).max(1),
    }),
    defineField({
      name: 'schemaType',
      title: 'Preferred schema type',
      type: 'string',
      description: 'Optional hint for JSON-LD generation.',
      options: {
        list: [
          {title: 'WebPage', value: 'WebPage'},
          {title: 'AboutPage', value: 'AboutPage'},
          {title: 'ContactPage', value: 'ContactPage'},
          {title: 'BlogPosting', value: 'BlogPosting'},
          {title: 'MedicalProcedure', value: 'MedicalProcedure'},
          {title: 'MedicalTest', value: 'MedicalTest'},
          {title: 'MedicalTherapy', value: 'MedicalTherapy'},
          {title: 'Service', value: 'Service'},
        ],
      },
    }),
    defineField({
      name: 'hreflang',
      title: 'Alternate language URLs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'locale',
              title: 'Locale',
              type: 'string',
              description: 'Example: th-TH, en, or x-default.',
              validation: (Rule) => Rule.required().max(20),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({scheme: ['https']}),
            }),
          ],
          preview: {
            select: {
              title: 'locale',
              subtitle: 'url',
            },
          },
        },
      ],
      validation: (Rule) => Rule.unique().max(8),
    }),
  ],
})
