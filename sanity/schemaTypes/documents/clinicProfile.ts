import {defineField, defineType} from 'sanity'

export const clinicProfile = defineType({
  name: 'clinicProfile',
  title: 'Clinic profile',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Clinic name',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'alternateNames',
      title: 'Alternate names',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'description',
      title: 'Clinic description',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().max(500),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'image',
      title: 'Primary clinic image',
      type: 'imageWithAlt',
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'telephone',
      title: 'Telephone',
      type: 'string',
      description: 'Use international format, for example +66959349640.',
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'lineId',
      title: 'LINE ID',
      type: 'string',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({name: 'streetAddress', title: 'Street address', type: 'string'}),
        defineField({name: 'addressLocality', title: 'Locality / district', type: 'string'}),
        defineField({name: 'addressRegion', title: 'Region / province', type: 'string'}),
        defineField({name: 'postalCode', title: 'Postal code', type: 'string'}),
        defineField({name: 'addressCountry', title: 'Country code', type: 'string', initialValue: 'TH'}),
      ],
    }),
    defineField({
      name: 'geo',
      title: 'Geo coordinates',
      type: 'geopoint',
    }),
    defineField({
      name: 'mapUrl',
      title: 'Map URL',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening hours',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'dayOfWeek',
              title: 'Day of week',
              type: 'array',
              of: [{type: 'string'}],
              options: {
                list: [
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                ],
              },
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'opens',
              title: 'Opens',
              type: 'string',
              description: '24-hour time, for example 10:00.',
              validation: (Rule) => Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            }),
            defineField({
              name: 'closes',
              title: 'Closes',
              type: 'string',
              description: '24-hour time, for example 19:30.',
              validation: (Rule) => Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(7),
    }),
    defineField({
      name: 'sameAs',
      title: 'Same-as profiles',
      type: 'array',
      of: [{type: 'externalLink'}],
      validation: (Rule) => Rule.max(12),
    }),
    defineField({
      name: 'medicalSpecialties',
      title: 'Medical specialties',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(16),
    }),
    defineField({
      name: 'areaServed',
      title: 'Area served',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(12),
    }),
    defineField({
      name: 'languages',
      title: 'Languages',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: 'priceRange',
      title: 'Price range',
      type: 'string',
      description: 'Example: ฿฿฿',
      validation: (Rule) => Rule.max(20),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'telephone',
      media: 'logo',
    },
  },
})
