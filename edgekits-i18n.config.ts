import { defineI18nConfig } from '@edgekits/astro-i18n/config'

export default defineI18nConfig({
  languages: {
    'en-us': { countryCode: 'us', name: 'English' },
    es: { countryCode: 'es', name: 'Español' },
    'pt-br': { countryCode: 'br', name: 'Português' },
    de: { countryCode: 'de', name: 'Deutsch' },
  },
  defaultLocale: 'en-us',
  cookie: { name: 'lang', maxAge: 60 * 60 * 24 * 365 },
  // Host of the edge-cache URLs and prefix of the KV keys: set to the production domain.
  keyPrefix: 'plumbline-audits.example',
  missingTranslationBanner: true,
  routing: 'prefix',
  // Used only when neither the cookie nor Accept-Language picks a locale.
  countryToLocale: {
    US: 'en-us',
    ES: 'es',
    MX: 'es',
    AR: 'es',
    CO: 'es',
    CL: 'es',
    PE: 'es',
    BR: 'pt-br',
    PT: 'pt-br',
    DE: 'de',
    AT: 'de',
    CH: 'de',
  },
  // .md twins of the pages and llms.txt are served in English only.
  markdownLocale: 'en-us',
})
