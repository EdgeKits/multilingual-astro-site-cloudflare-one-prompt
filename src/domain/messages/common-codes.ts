// Keys MUST match keys in locales/<locale>/messages.json (common).

export const COMMON_MESSAGE_CODES = {
  PENDING: 'PENDING',
  SENT: 'SENT',
} as const
export type CommonMessageCode = (typeof COMMON_MESSAGE_CODES)[keyof typeof COMMON_MESSAGE_CODES]
