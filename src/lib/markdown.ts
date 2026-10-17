// Markdown twins of the pages, for AI assistants and other plain-text readers. Built from
// the same translations the HTML pages render.
import { pagePath, type Page } from './site'

type Translations = Pick<I18n.Schema, 'common' | 'home' | 'about' | 'contact'>

const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n')
const numbered = (items: readonly string[]) => items.map((item, i) => `${i + 1}. ${item}`).join('\n')

export function pageMarkdown(page: Page, t: Translations, origin: string, locale: string): string {
  const contactsUrl = origin + pagePath(locale, 'contacts')

  if (page === 'home') {
    const { home } = t
    return [
      `# ${home.hero.heading}`,
      home.hero.lead,
      `## ${home.checks.heading}`,
      home.checks.lead,
      home.checks.items.map((item) => `### ${item.title}\n\n${item.body}`).join('\n\n'),
      `## ${home.process.heading}`,
      numbered(home.process.steps.map((step) => `**${step.title}.** ${step.body}`)),
      `## ${home.audience.heading}`,
      list(home.audience.items),
      `## ${home.closing.heading}`,
      home.closing.body,
      `[${home.closing.cta}](${contactsUrl})`,
    ].join('\n\n')
  }

  if (page === 'about') {
    const { about } = t
    return [
      `# ${about.heading}`,
      about.lead,
      ...about.story,
      `## ${about.principles.heading}`,
      about.principles.items.map((item) => `### ${item.title}\n\n${item.body}`).join('\n\n'),
      `## ${about.deliverables.heading}`,
      list(about.deliverables.items),
      `[${about.cta.button}](${contactsUrl})`,
    ].join('\n\n')
  }

  const { contact } = t
  return [
    `# ${contact.heading}`,
    contact.lead,
    `The request form is at ${contactsUrl}.`,
    `## ${contact.aside.heading}`,
    list([
      `${contact.aside.emailLabel}: ${contact.aside.email}`,
      `${contact.aside.hoursLabel}: ${contact.aside.hours}`,
      `${contact.aside.replyLabel}: ${contact.aside.reply}`,
    ]),
    `## ${contact.next.heading}`,
    numbered(contact.next.steps),
  ].join('\n\n')
}
