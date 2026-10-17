import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { actions, isInputError } from 'astro:actions'

import { CONTACT_FIELDS, checkContactField, type ContactField, type ContactValues } from '@/domain/contact/rules'
import { SERVER_ERROR_CODES } from '@/domain/messages/error-codes'
import { isErrorMessageCode } from '@/domain/messages/guards'
import { resolveFieldMessages } from '@/ui/forms/error-mapper'

/** Already-localized strings: the island ships no translation files. */
export interface ContactFormText {
  fields: Record<ContactField, string>
  hints: Partial<Record<ContactField, string>>
  optional: string
  submit: string
  pending: string
  sent: string
  serverError: string
}

interface Props {
  locale: string
  /** The native POST target, used only when JavaScript is off. */
  action: string
  text: ContactFormText
  /** Error CODE → localized text (`messages.errors.ui`). */
  tErrors: Record<string, string>
  /** No-JS round trip: the page was reached through the 303 after a successful POST. */
  sent?: boolean
  /** No-JS round trip: field error codes from `Astro.getActionResult`. */
  fieldErrors?: Partial<Record<ContactField, string[]>>
  /** No-JS round trip: a form-level error code. */
  formError?: string
}

const OPTIONAL_FIELDS: ReadonlySet<ContactField> = new Set(['website'])
const INPUT_PROPS: Record<Exclude<ContactField, 'message'>, { type: string; autoComplete: string }> = {
  name: { type: 'text', autoComplete: 'name' },
  email: { type: 'email', autoComplete: 'email' },
  business: { type: 'text', autoComplete: 'organization' },
  website: { type: 'text', autoComplete: 'url' },
}

export default function ContactForm({ locale, action, text, tErrors, sent: sentOnLoad = false, fieldErrors = {}, formError }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const sentRef = useRef<HTMLParagraphElement>(null)
  const [sent, setSent] = useState(sentOnLoad)
  // Errors from a no-JS round trip render on the server too; each one clears once its field is edited.
  const [serverErrors, setServerErrors] = useState(fieldErrors)
  const [formErrorCode, setFormErrorCode] = useState(formError)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    mode: 'onTouched',
    defaultValues: { name: '', email: '', business: '', website: '', message: '' },
  })

  useEffect(() => {
    if (sent && !sentOnLoad) sentRef.current?.focus()
  }, [sent, sentOnLoad])

  async function onValid() {
    const form = formRef.current
    if (!form) return
    setFormErrorCode(undefined)
    try {
      // The action takes FormData (`accept: 'form'`), the same body as the no-JS POST.
      const { error } = await actions.contact.send(new FormData(form))
      if (!error) {
        setSent(true)
        return
      }
      if (isInputError(error)) {
        let shouldFocus = true
        for (const name of CONTACT_FIELDS) {
          const code = error.fields[name]?.[0]
          if (!code) continue
          setError(name, { type: 'server', message: code }, { shouldFocus })
          shouldFocus = false
        }
        // Only a field the visitor can't see failed (the hidden locale): report it on the form.
        if (shouldFocus) setFormErrorCode(SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR)
        return
      }
      setFormErrorCode(isErrorMessageCode(error.message) ? error.message : SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR)
    } catch {
      setFormErrorCode(SERVER_ERROR_CODES.INTERNAL_SERVER_ERROR)
    }
  }

  if (sent) {
    return (
      <p ref={sentRef} tabIndex={-1} role="status" className="form-sent">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {text.sent}
      </p>
    )
  }

  const formErrorMessage = formErrorCode ? (tErrors[formErrorCode] ?? text.serverError) : null

  return (
    <form ref={formRef} method="post" action={action} noValidate onSubmit={handleSubmit(onValid)} className="contact-form">
      <input type="hidden" name="locale" value={locale} />

      {CONTACT_FIELDS.map((name) => {
        const code = errors[name]?.message ?? serverErrors[name]?.[0]
        const message = resolveFieldMessages([code], tErrors)[0]
        const id = `contact-${name}`
        const hint = text.hints[name]
        const describedBy = [hint && `${id}-hint`, message && `${id}-error`].filter(Boolean).join(' ') || undefined
        const field = register(name, {
          validate: (value) => checkContactField(name, value) ?? true,
          onChange: () => {
            if (serverErrors[name]) setServerErrors(({ [name]: _cleared, ...rest }) => rest)
          },
        })
        const controlProps = { id, 'aria-invalid': message ? true : undefined, 'aria-describedby': describedBy, ...field }

        return (
          <div key={name} className="field" data-invalid={message ? '' : undefined}>
            <label htmlFor={id}>
              {text.fields[name]}
              {OPTIONAL_FIELDS.has(name) && <span className="field-optional"> ({text.optional})</span>}
            </label>
            {hint && (
              <p id={`${id}-hint`} className="field-hint">
                {hint}
              </p>
            )}
            {message && (
              <p id={`${id}-error`} className="field-error" role="alert">
                {message}
              </p>
            )}
            {name === 'message' ? <textarea rows={6} {...controlProps} /> : <input {...INPUT_PROPS[name]} {...controlProps} />}
          </div>
        )
      })}

      {formErrorMessage && (
        <p className="form-error" role="alert">
          {formErrorMessage}
        </p>
      )}

      <button type="submit" className="button" disabled={isSubmitting} aria-disabled={isSubmitting || undefined}>
        {isSubmitting ? `${text.pending}…` : text.submit}
      </button>
    </form>
  )
}
