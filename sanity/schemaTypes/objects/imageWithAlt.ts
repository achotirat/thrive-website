import {defineField, defineType} from 'sanity'

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      validation: (Rule) => Rule.required().max(160),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      validation: (Rule) => Rule.max(180),
    }),
  ],
})
