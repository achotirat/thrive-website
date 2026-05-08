import {defineField, defineType} from 'sanity'

export const symptom = defineType({
  name: 'symptom',
  title: 'Symptom',
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
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'relatedConditions',
      title: 'Related conditions',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'condition'}]}],
      validation: (Rule) => Rule.unique().max(12),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'summary',
    },
  },
})
