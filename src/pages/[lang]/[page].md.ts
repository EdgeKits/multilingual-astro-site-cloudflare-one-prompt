import type { APIRoute } from 'astro'
import { fetchTranslations } from '@edgekits/astro-i18n/runtime'

import { pageMarkdown } from '@/lib/markdown'
import { siteOrigin, type Page } from '@/lib/site'

// `/<locale>/index.md` is the home page; the i18n middleware sends every `.md` URL to the
// config's `markdownLocale` first, so these are served in English only.
const SLUG_TO_PAGE: Record<string, Page> = { index: 'home', about: 'about', contacts: 'contacts' }

export const GET: APIRoute = async (context) => {
  const page = SLUG_TO_PAGE[context.params.page ?? '']
  if (!page) return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

  const { uiLocale, translationLocale } = context.locals
  const t = await fetchTranslations(translationLocale, ['common', 'home', 'about', 'contact'])
  const body = pageMarkdown(page, t, siteOrigin(context), uiLocale)

  return new Response(`${body}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
