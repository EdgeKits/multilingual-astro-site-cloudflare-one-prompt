// Server-side schema (source of truth): zod around the shared rules, codes as messages.
// Never import this from browser code: zod's JIT uses `new Function()`.
import { z } from 'astro/zod'

import { checkContactField, type ContactField } from './rules'

// Astro turns an empty or missing form field into null: treat it as an empty string, so
// the rules report REQUIRED (not zod's untranslated `invalid_type` text).
const field = (name: ContactField) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z
      .string()
      .superRefine((value, ctx) => {
        const code = checkContactField(name, value)
        if (code) ctx.addIssue({ code: 'custom', message: code })
      })
      .transform((value) => value.trim()),
  )

export const ContactFormSchema = z.object({
  name: field('name'),
  email: field('email'),
  business: field('business'),
  website: field('website'),
  message: field('message'),
})
export type ContactFormData = z.infer<typeof ContactFormSchema>
