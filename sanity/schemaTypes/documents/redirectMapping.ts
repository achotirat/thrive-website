import {defineField, defineType} from 'sanity'

export const redirectMapping = defineType({
  name: 'redirectMapping',
  title: 'Redirect mapping',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'From path',
      type: 'string',
      description: 'Old public path, for example /post/iv-drip.',
      validation: (Rule) => Rule.required().regex(/^\//, {
        name: 'starts with /',
        invert: false,
      }),
    }),
    defineField({
      name: 'to',
      title: 'To path or URL',
      type: 'string',
      description: 'New path or full external URL.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'statusCode',
      title: 'Status code',
      type: 'number',
      initialValue: 301,
      options: {
        list: [
          {title: '301 permanent', value: 301},
          {title: '302 temporary', value: 302},
        ],
      },
      validation: (Rule) => Rule.required().custom((statusCode) => {
        if (statusCode === 301 || statusCode === 302) {
          return true
        }

        return 'Use 301 or 302.'
      }),
    }),
    defineField({
      name: 'reason',
      title: 'Reason / notes',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'from',
      subtitle: 'to',
    },
  },
})
