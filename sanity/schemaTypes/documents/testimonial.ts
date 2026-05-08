import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required().max(700),
    }),
    defineField({
      name: 'customerName',
      title: 'Customer display name',
      type: 'string',
      description: 'Use a public-safe display name, not private customer data.',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'customerContext',
      title: 'Customer context',
      type: 'string',
      description: 'Example: "อายุ 42" or "Health check-up client".',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      options: {
        list: [1, 2, 3, 4, 5],
      },
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
    defineField({
      name: 'relatedService',
      title: 'Related service',
      type: 'reference',
      to: [{type: 'service'}],
    }),
    defineField({
      name: 'featured',
      title: 'Featured on website',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'customerName',
      subtitle: 'quote',
    },
    prepare({title, subtitle}) {
      return {
        title,
        subtitle: subtitle ? `${subtitle.slice(0, 80)}...` : undefined,
      }
    },
  },
})
