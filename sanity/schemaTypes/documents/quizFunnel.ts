import {defineField, defineType} from 'sanity'

const scoreFields = [
  defineField({name: 'balanced', title: 'Balanced', type: 'number'}),
  defineField({name: 'cortisol', title: 'Cortisol', type: 'number'}),
  defineField({name: 'thyroid', title: 'Thyroid / metabolism', type: 'number'}),
  defineField({name: 'sexHormone', title: 'Sex hormone', type: 'number'}),
]

export const quizFunnel = defineType({
  name: 'quizFunnel',
  title: 'Quiz funnel',
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
      name: 'serviceSlug',
      title: 'Service slug',
      type: 'string',
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(400),
    }),
    defineField({
      name: 'startQuestionId',
      title: 'Start question ID',
      type: 'string',
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      validation: (Rule) => Rule.required().min(1).max(12),
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'id',
              title: 'Question ID',
              type: 'string',
              validation: (Rule) => Rule.required().max(80),
            }),
            defineField({
              name: 'text',
              title: 'Question text',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required().max(240),
            }),
            defineField({
              name: 'helper',
              title: 'Helper text',
              type: 'string',
              validation: (Rule) => Rule.max(160),
            }),
            defineField({
              name: 'answers',
              title: 'Answers',
              type: 'array',
              validation: (Rule) => Rule.required().min(2).max(6),
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'id',
                      title: 'Answer ID',
                      type: 'string',
                      validation: (Rule) => Rule.required().max(80),
                    }),
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'text',
                      rows: 2,
                      validation: (Rule) => Rule.required().max(220),
                    }),
                    defineField({
                      name: 'scores',
                      title: 'Scores',
                      type: 'object',
                      fields: scoreFields,
                    }),
                    defineField({
                      name: 'nextQuestionId',
                      title: 'Next question ID',
                      type: 'string',
                      validation: (Rule) => Rule.max(80),
                    }),
                    defineField({
                      name: 'resultId',
                      title: 'Force result ID',
                      type: 'string',
                      validation: (Rule) => Rule.max(80),
                    }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'results',
      title: 'Results',
      type: 'array',
      validation: (Rule) => Rule.required().min(1).max(8),
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'id',
              title: 'Result ID',
              type: 'string',
              validation: (Rule) => Rule.required().max(80),
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required().max(160),
            }),
            defineField({
              name: 'summary',
              title: 'Summary',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required().max(700),
            }),
            defineField({
              name: 'nurtureSegment',
              title: 'Nurture segment',
              type: 'string',
              validation: (Rule) => Rule.required().max(160),
            }),
            defineField({
              name: 'recommendedSteps',
              title: 'Recommended steps',
              type: 'array',
              of: [{type: 'string'}],
              validation: (Rule) => Rule.max(5),
            }),
            defineField({
              name: 'threshold',
              title: 'Score threshold',
              type: 'object',
              fields: scoreFields,
            }),
            defineField({
              name: 'cta',
              title: 'CTA',
              type: 'object',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  validation: (Rule) => Rule.required().max(80),
                }),
                defineField({
                  name: 'href',
                  title: 'Href',
                  type: 'string',
                  validation: (Rule) => Rule.required().max(240),
                }),
              ],
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'serviceSlug',
    },
  },
})
