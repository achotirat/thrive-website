import {defineField, defineType} from 'sanity'

export const topic = defineType({
  name: 'topic',
  title: 'Topic',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(320),
    }),
    defineField({
      name: 'sameAs',
      title: 'Same-as / reference URLs',
      type: 'array',
      of: [{type: 'externalLink'}],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seoMeta',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
