import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production'

export const hasSanityConfig = Boolean(projectId && dataset)

export const sanityClient = hasSanityConfig
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: true,
    })
  : null

const builder = sanityClient ? createImageUrlBuilder(sanityClient) : null

export function urlFor(source: any) {
  if (!builder) {
    throw new Error('Sanity image URLs require PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET')
  }

  return builder.image(source)
}
