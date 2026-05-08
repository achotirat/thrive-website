import {defineField, defineType} from 'sanity'

export const condition = defineType({
  name: 'condition',
  title: 'Condition',
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
      name: 'alternateNames',
      title: 'Alternate names',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(360),
    }),
    defineField({
      name: 'relatedTopics',
      title: 'Related topics',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'topic'}]}],
      validation: (Rule) => Rule.unique().max(12),
    }),
    defineField({
      name: 'sameAs',
      title: 'Same-as / reference URLs',
      type: 'array',
      of: [{type: 'externalLink'}],
      validation: (Rule) => Rule.max(8),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'summary',
    },
  },
})
