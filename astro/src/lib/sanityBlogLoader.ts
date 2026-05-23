import { createClient } from '@sanity/client'
import type { Loader, LoaderContext } from 'astro/loaders'

const GROQ = `*[_type == "blogPost"] | order(publishedAt desc) {
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
      const client = createClient({
        projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
        dataset: import.meta.env.PUBLIC_SANITY_DATASET,
        apiVersion: '2024-01-01',
        useCdn: true,
      })

      let posts: any[] = []
      try {
        posts = await client.fetch(GROQ)
      } catch (err: any) {
        logger.warn(`Failed to fetch blog posts from Sanity: ${err?.message ?? err}`)
      }

      store.clear()

      for (const post of posts) {
        store.set({ id: post.slug.current, data: post })
      }

      logger.info(`Loaded ${posts.length} blog posts from Sanity`)
    },
  }
}
