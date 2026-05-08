import {defineField, defineType} from 'sanity'

export const richText = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
                validation: (Rule) => Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true,
                }),
              }),
              defineField({
                name: 'rel',
                title: 'Rel attribute',
                type: 'string',
                options: {
                  list: [
                    {title: 'None', value: ''},
                    {title: 'nofollow', value: 'nofollow'},
                    {title: 'sponsored', value: 'sponsored'},
                    {title: 'ugc', value: 'ugc'},
                  ],
                },
              }),
              defineField({
                name: 'openInNewTab',
                title: 'Open in new tab',
                type: 'boolean',
                initialValue: false,
              }),
            ],
          },
        ],
      },
    },
    {type: 'imageWithAlt'},
  ],
})
