export const localizedSlugs = ['', 'about', 'contact', 'iv-drip', 'check-up', 'hbot', 'mental-health'] as const;
export type LocalizedSlug = typeof localizedSlugs[number];
export type SiteLanguage = 'th' | 'en' | 'zh-cn';

export function isLocalizedSlug(slug: string): slug is LocalizedSlug {
  return localizedSlugs.includes(slug as LocalizedSlug);
}

export function localizedPath(language: SiteLanguage, slug: string): string {
  const suffix = slug ? `${slug}/` : '';
  return language === 'th' ? `/${suffix}` : `/${language}/${suffix}`;
}

export function routeSlug(pathname: string): string | null {
  const parts = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (parts[0] === 'en' || parts[0] === 'zh-cn') parts.shift();
  const slug = parts.join('/');
  return isLocalizedSlug(slug) ? slug : null;
}

export function alternateLinks(pathname: string, site: URL): { lang: string; href: string }[] {
  const slug = routeSlug(pathname);
  if (slug === null) return [];
  return [
    { lang: 'th-TH', href: new URL(localizedPath('th', slug), site).toString() },
    { lang: 'en', href: new URL(localizedPath('en', slug), site).toString() },
    { lang: 'zh-CN', href: new URL(localizedPath('zh-cn', slug), site).toString() },
    { lang: 'x-default', href: new URL(localizedPath('th', slug), site).toString() },
  ];
}
