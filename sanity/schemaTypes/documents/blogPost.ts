import {defineField, defineType} from 'sanity'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(140),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'ฮอร์โมน', value: 'ฮอร์โมน'},
          {title: 'โภชนาการ', value: 'โภชนาการ'},
          {title: 'สุขภาพจิต', value: 'สุขภาพจิต'},
          {title: 'ภูมิคุ้มกัน', value: 'ภูมิคุ้มกัน'},
          {title: 'ผิวหนัง', value: 'ผิวหนัง'},
          {title: 'ระบบย่อยอาหาร', value: 'ระบบย่อยอาหาร'},
          {title: 'หัวใจและหลอดเลือด', value: 'หัวใจและหลอดเลือด'},
          {title: 'สตรีสุขภาพ', value: 'สตรีสุขภาพ'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(240),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated at',
      type: 'datetime',
      description: 'Use when the article content has meaningfully changed.',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'author',
      title: 'Medical reviewer / author',
      type: 'reference',
      to: [{type: 'doctor'}],
    }),
    defineField({
      name: 'medicalReviewer',
      title: 'Medical reviewer',
      type: 'reference',
      to: [{type: 'doctor'}],
      description: 'Use when the author and reviewer are different.',
    }),
    defineField({
      name: 'reviewedAt',
      title: 'Medically reviewed at',
      type: 'date',
    }),
    defineField({
      name: 'factCheckedBy',
      title: 'Fact checked by',
      type: 'reference',
      to: [{type: 'doctor'}],
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key takeaways',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'richText',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'legacyHtml',
      title: 'Legacy HTML body',
      type: 'text',
      rows: 18,
      description: 'Sanitized HTML imported from the source article. Used to preserve migrated article formatting.',
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      of: [{type: 'faqItem'}],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'relatedTopics',
      title: 'Related topics',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'topic'}]}],
      validation: (Rule) => Rule.unique().max(12),
    }),
    defineField({
      name: 'relatedConditions',
      title: 'Related conditions',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'condition'}]}],
      validation: (Rule) => Rule.unique().max(12),
    }),
    defineField({
      name: 'relatedSymptoms',
      title: 'Related symptoms',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'symptom'}]}],
      validation: (Rule) => Rule.unique().max(12),
    }),
    defineField({
      name: 'relatedServices',
      title: 'Related services',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'service'}]}],
      validation: (Rule) => Rule.unique().max(6),
    }),
    defineField({
      name: 'references',
      title: 'References',
      type: 'array',
      of: [{type: 'citation'}],
      validation: (Rule) => Rule.max(30),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMeta',
    }),
  ],
  orderings: [
    {
      title: 'Published date, newest first',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publishedAt',
      media: 'mainImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString('en-GB') : undefined,
        media,
      }
    },
  },
})
