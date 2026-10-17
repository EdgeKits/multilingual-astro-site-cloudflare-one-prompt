// The contact form's validation rules, as plain functions that return error CODES.
// One source of truth for both sides: the React form calls them from react-hook-form's
// `validate`, and the server's zod schema (./schema.ts) wraps them. No zod here, so this
// module is safe to ship to the browser.
import { UI_ERROR_CODES, type UiErrorCode } from '@/domain/messages/error-codes'

export const CONTACT_FIELDS = ['name', 'email', 'business', 'website', 'message'] as const
export type ContactField = (typeof CONTACT_FIELDS)[number]
export type ContactValues = Record<ContactField, string>

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  business: { min: 2, max: 120 },
  website: { max: 200 },
  message: { min: 20, max: 2000 },
} as const

/** Close to Zod v4's default `z.email()` pattern. */
const EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/

/** A domain with an optional scheme and path: `example.com`, `https://g.page/my-shop`. */
const WEBSITE_REGEX = /^(https?:\/\/)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(:\d{1,5})?([/?#]\S*)?$/i

type Rule = (value: string) => UiErrorCode | null

const required: Rule = (value) => (value ? null : UI_ERROR_CODES.REQUIRED)
const minLength =
  (min: number, code: UiErrorCode = UI_ERROR_CODES.TOO_SHORT): Rule =>
  (value) =>
    value.length < min ? code : null
const maxLength =
  (max: number): Rule =>
  (value) =>
    value.length > max ? UI_ERROR_CODES.TOO_LONG : null
const matches =
  (regex: RegExp, code: UiErrorCode): Rule =>
  (value) =>
    regex.test(value) ? null : code
const optional =
  (...rules: Rule[]): Rule =>
  (value) =>
    value ? firstError(rules, value) : null

const RULES: Record<ContactField, Rule[]> = {
  name: [required, minLength(CONTACT_LIMITS.name.min), maxLength(CONTACT_LIMITS.name.max)],
  email: [required, maxLength(CONTACT_LIMITS.email.max), matches(EMAIL_REGEX, UI_ERROR_CODES.INVALID_EMAIL)],
  business: [required, minLength(CONTACT_LIMITS.business.min), maxLength(CONTACT_LIMITS.business.max)],
  website: [optional(maxLength(CONTACT_LIMITS.website.max), matches(WEBSITE_REGEX, UI_ERROR_CODES.INVALID_WEBSITE))],
  message: [
    required,
    minLength(CONTACT_LIMITS.message.min, UI_ERROR_CODES.MESSAGE_TOO_SHORT),
    maxLength(CONTACT_LIMITS.message.max),
  ],
}

function firstError(rules: Rule[], value: string): UiErrorCode | null {
  for (const rule of rules) {
    const code = rule(value)
    if (code) return code
  }
  return null
}

/** The first failing rule's code for a field, or null when the value is valid. Trims first. */
export function checkContactField(field: ContactField, value: unknown): UiErrorCode | null {
  return firstError(RULES[field], typeof value === 'string' ? value.trim() : '')
}
