import { getActionContext } from 'astro:actions'
import { defineMiddleware, sequence } from 'astro:middleware'

import { redirectAfterNativePost } from '@/ui/forms/native-post'

// The i18n middleware is registered by the integration (`auto`) ahead of this file.
const contactFormPost = defineMiddleware((ctx, next) =>
  redirectAfterNativePost(getActionContext(ctx), 'contact.send', 'contact', ctx, next),
)

export const onRequest = sequence(contactFormPost)
