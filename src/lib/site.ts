export const PAGES = ['home', 'about', 'contacts'] as const
export type Page = (typeof PAGES)[number]

/** The path of a page under a locale, with the trailing slash the i18n middleware uses. */
export function pagePath(locale: string, page: Page): string {
  return page === 'home' ? `/${locale}/` : `/${locale}/${page}/`
}

/** The `.md` twin of a page (always served in the config's `markdownLocale`). */
export function markdownPath(locale: string, page: Page): string {
  return `/${locale}/${page === 'home' ? 'index' : page}.md`
}

/** Absolute URLs point at `site` in production and at the dev server otherwise. */
export function siteOrigin({ site, url }: { site?: URL; url: URL }): string {
  return import.meta.env.PROD && site ? site.origin : url.origin
}
