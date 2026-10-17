import type { APIRoute } from 'astro'

import { siteOrigin } from '@/lib/site'

export const GET: APIRoute = (context) => {
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${siteOrigin(context)}/sitemap.xml`].join('\n')
  return new Response(`${body}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
