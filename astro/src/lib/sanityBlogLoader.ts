import { createClient } from '@sanity/client'
import type { Loader, LoaderContext } from 'astro/loaders'
import { hasSanityConfig } from './sanity'

const GROQ = `*[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  category,
  publishedAt,
  updatedAt,
  mainImage,
  "authorName": author->name,
  "authorTitle": author->title,
  keyTakeaways,
  body,
  legacyHtml,
  faq[] {
    question,
    shortAnswer
  },
  seo {
    seoTitle,
    seoDescription,
    noIndex,
    canonicalUrl
  }
}`

export function sanityBlogLoader(): Loader {
  return {
    name: 'sanity-blog',
    load: async ({ store, logger }: LoaderContext) => {
      store.clear()

      if (!hasSanityConfig) {
        logger.warn('Skipping Sanity blog load: PUBLIC_SANITY_PROJECT_ID and PUBLIC_SANITY_DATASET are not configured')
        return
      }

      const token = import.meta.env.SANITY_API_TOKEN

      const client = createClient({
        projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
        dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
        apiVersion: '2024-01-01',
        token,
        useCdn: !token,
      })

      let posts: any[] = []
      try {
        posts = await client.fetch(GROQ)
      } catch (err: any) {
        logger.warn(`Failed to fetch blog posts from Sanity: ${err?.message ?? err}`)
      }

      for (const post of posts) {
        store.set({ id: post.slug.current, data: post })
      }

      logger.info(`Loaded ${posts.length} blog posts from Sanity`)
    },
  }
}
