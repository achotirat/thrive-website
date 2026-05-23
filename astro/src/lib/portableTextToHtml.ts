import { toHTML } from '@portabletext/to-html'
import { urlFor } from './sanity'

const components = {
  block: {
    h2: ({ children }: any) => `<h2>${children}</h2>`,
    h3: ({ children }: any) => `<h3>${children}</h3>`,
    h4: ({ children }: any) => `<h4>${children}</h4>`,
    blockquote: ({ children }: any) => `<blockquote><p>${children}</p></blockquote>`,
    normal: ({ children }: any) => `<p>${children}</p>`,
  },
  list: {
    bullet: ({ children }: any) => `<ul>${children}</ul>`,
    number: ({ children }: any) => `<ol>${children}</ol>`,
  },
  listItem: {
    bullet: ({ children }: any) => `<li>${children}</li>`,
    number: ({ children }: any) => `<li>${children}</li>`,
  },
  marks: {
    strong: ({ children }: any) => `<strong>${children}</strong>`,
    em: ({ children }: any) => `<em>${children}</em>`,
    link: ({ children, value }: any) => {
      const rel = value?.rel ? ` rel="${value.rel}"` : ''
      const target = value?.openInNewTab ? ' target="_blank" rel="noopener"' : ''
      return `<a href="${value?.href ?? '#'}"${rel}${target}>${children}</a>`
    },
  },
  types: {
    imageWithAlt: ({ value }: any) => {
      if (!value?.asset) return ''
      const src = urlFor(value).width(900).auto('format').url()
      const alt = value?.alt ?? ''
      return `<figure class="blog-figure"><img src="${src}" alt="${alt}" loading="lazy" width="900" /></figure>`
    },
  },
}

export function portableTextToHtml(blocks: any[]): string {
  if (!blocks || blocks.length === 0) return ''
  return toHTML(blocks, { components } as any)
}
