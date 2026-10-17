import { ActionError, defineAction } from 'astro:actions'

import { LocaleSchema } from '@edgekits/astro-i18n/runtime'
import { ContactFormSchema } from '@/domain/contact/schema'
import { ERROR_MESSAGE_CODES, isErrorMessageCode } from '@/domain/messages'

export const contact = {
  send: defineAction({
    // FormData on both paths: the no-JS native POST and the React form's submit.
    accept: 'form',
    input: ContactFormSchema.extend({
      locale: LocaleSchema, // the UI locale, for locale-aware work such as a reply email
    }),
    handler: async () => {
      try {
        // Deliberately a no-op: the request is validated and acknowledged, nothing is sent
        // or stored. Plug an email provider or a database in here.
        return { ok: true as const }
      } catch (error) {
        // Domain errors throw an Error whose message IS a code.
        if (error instanceof Error && isErrorMessageCode(error.message)) {
          throw new ActionError({ message: error.message, code: 'BAD_REQUEST' })
        }
        throw new ActionError({ message: ERROR_MESSAGE_CODES.INTERNAL_SERVER_ERROR, code: 'INTERNAL_SERVER_ERROR' })
      }
    },
  }),
}
