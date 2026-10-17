import type { APIRoute } from 'astro'
import { I18N_CONFIG, LANGUAGES, LocaleSchema, SUPPORTED_LOCALES, fetchTranslations } from '@edgekits/astro-i18n/runtime'

import { markdownPath, pagePath, siteOrigin } from '@/lib/site'

export const GET: APIRoute = async (context) => {
  const origin = siteOrigin(context)
  const locale = LocaleSchema.parse(I18N_CONFIG.markdownLocale ?? I18N_CONFIG.defaultLocale)
  const { common, home, about, contact } = await fetchTranslations(locale, ['common', 'home', 'about', 'contact'])

  const languages = SUPPORTED_LOCALES.map((code) => `- ${LANGUAGES[code].name}: ${origin}${pagePath(code, 'home')}`)

  const body = [
    `# ${common.brand.name}`,
    `> ${common.seo.description}`,
    '## Pages',
    [
      `- [${common.nav.home}](${origin}${markdownPath(locale, 'home')}): ${home.seo.description}`,
      `- [${common.nav.about}](${origin}${markdownPath(locale, 'about')}): ${about.seo.description}`,
      `- [${contact.heading}](${origin}${markdownPath(locale, 'contacts')}): ${contact.seo.description}`,
    ].join('\n'),
    '## Languages',
    languages.join('\n'),
  ].join('\n\n')

  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
