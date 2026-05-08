import {defineField, defineType} from 'sanity'

export const citation = defineType({
  name: 'citation',
  title: 'Citation',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(220),
    }),
    defineField({
      name: 'source',
      title: 'Source / journal',
      type: 'string',
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.min(1900).max(2100).integer(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'note',
      title: 'Internal note',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(240),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'source',
    },
  },
})
