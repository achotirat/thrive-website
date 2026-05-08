import {defineField, defineType} from 'sanity'

export const externalLink = defineType({
  name: 'externalLink',
  title: 'External link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({scheme: ['https', 'mailto', 'tel']}),
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'url',
    },
  },
})
