# Plumbline

Marketing site for Plumbline, a company that runs AI audits of marketing funnels for local
businesses. Astro 7 on Cloudflare Workers, in four languages: `en-us` (default), `es`, `pt-br`
and `de`.

## Stack

- **Astro 7** with `output: 'server'` and **`@astrojs/cloudflare`** (Workers, rendered in workerd).
- **`@edgekits/astro-i18n`**: translations live in Workers KV (`TRANSLATIONS` binding), one JSON
  per locale and namespace under `locales/`, typed from the `en-us` files. Every URL carries its
  locale (`/de/about/`); `/` redirects by cookie, then `Accept-Language`, then country, then `en-us`.
- **React + react-hook-form** for the contact form, submitted through an **Astro Action**
  (`contact.send`) that validates and replies, and sends nothing.

## Pages

| Path                  | Page                                                        |
| --------------------- | ----------------------------------------------------------- |
| `/<locale>/`          | Home                                                        |
| `/<locale>/about/`    | About                                                       |
| `/<locale>/contacts/` | Contact form                                                |
| `/en-us/<page>.md`    | Markdown twin of each page (`index`, `about`, `contacts`)   |
| `/llms.txt`           | Index for AI assistants                                     |
| `/sitemap.xml`        | Every page in every locale, with hreflang alternates        |

## Commands

```sh
npm install
npm run i18n:seed   # generate types + push locales/ to local KV (run after editing any JSON)
npm run dev         # http://localhost:4321
npm run check       # astro check
npm run build       # production build
npm run preview     # the build, in workerd
```

`.dev.vars` (git-ignored) holds `I18N_CACHE=off`, so a re-`seed` shows on the next request in
dev. Restart the dev server after changing it.

## The contact form

- Errors are **codes** (`REQUIRED`, `INVALID_EMAIL`, …), never text. Each locale's
  `messages.json` holds the wording; the page passes the localized strings to the island.
- The rules are plain functions in `src/domain/contact/rules.ts`. The browser runs them through
  react-hook-form's `validate`; the server wraps the same functions in zod
  (`src/domain/contact/schema.ts`). Zod never ships to the browser.
- Works without JavaScript: the form posts natively, `src/middleware.ts` answers a success
  with a 303 to `?sent=1` (a reload can't resubmit), and errors render server-side.
- To actually deliver requests, replace the no-op in `src/actions/contact.ts`.

## Before the first deploy

1. Set the real domain in `astro.config.mjs` (`site`) and `edgekits-i18n.config.ts` (`keyPrefix`).
2. `npx wrangler kv namespace create TRANSLATIONS` and put its id in `wrangler.jsonc`
   (the current id is a local placeholder).
3. `npm run deploy`, then `npm run i18n:migrate` to push translations to production KV.
   For edge-cache purging on later copy changes, `migrate` needs `CLOUDFLARE_ZONE_ID` and
   `CLOUDFLARE_CACHEPURGE_API_TOKEN`; commit `.i18n-hashes.json` after each `migrate`.

Changing copy in production is a JSON edit plus `npm run i18n:migrate`, with no redeploy.
