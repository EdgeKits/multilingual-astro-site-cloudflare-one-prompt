import type { APIRoute } from 'astro'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, toIetfTag } from '@edgekits/astro-i18n/runtime'

import { PAGES, pagePath, siteOrigin } from '@/lib/site'

export const GET: APIRoute = (context) => {
  const origin = siteOrigin(context)

  const urls = PAGES.flatMap((page) => {
    const alternates = [
      ...SUPPORTED_LOCALES.map(
        (code) => `    <xhtml:link rel="alternate" hreflang="${toIetfTag(code)}" href="${origin}${pagePath(code, page)}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${pagePath(DEFAULT_LOCALE, page)}"/>`,
    ].join('\n')
    return SUPPORTED_LOCALES.map((locale) => `  <url>\n    <loc>${origin}${pagePath(locale, page)}</loc>\n${alternates}\n  </url>`)
  })

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
  ].join('\n')

  return new Response(`${body}\n`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
