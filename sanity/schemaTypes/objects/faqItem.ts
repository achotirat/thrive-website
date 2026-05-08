import {defineField, defineType} from 'sanity'

export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ item',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required().max(180),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'richText',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortAnswer',
      title: 'Short answer for AI / JSON-LD',
      type: 'text',
      rows: 2,
      description: 'Plain-language answer used for FAQ structured data when available.',
      validation: (Rule) => Rule.max(320),
    }),
  ],
  preview: {
    select: {
      title: 'question',
    },
  },
})
