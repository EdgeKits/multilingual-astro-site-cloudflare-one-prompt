// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import { edgekitsI18n } from '@edgekits/astro-i18n'

import i18nConfig from './edgekits-i18n.config'

export default defineConfig({
  site: 'https://plumbline-audits.example',
  output: 'server',
  // The site uses no astro:assets images: skip the Cloudflare Images binding.
  adapter: cloudflare({ imageService: 'passthrough' }),
  // No Astro sessions: skips the SESSION KV binding the adapter would otherwise provision.
  session: false,
  integrations: [edgekitsI18n(i18nConfig), react()],
})
