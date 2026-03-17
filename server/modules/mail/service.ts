import { eq, sql } from 'drizzle-orm'
import { db, emails, notifications, users } from 'server/database'
import { bus } from '../events/bus'
import { isPrefEnabled } from '../notification/prefs'

interface ResolvedRecipient {
  status: 'resolved'
  username: string
  matchedBy: 'exact' | 'case-insensitive'
}

interface InvalidRecipient {
  status: 'invalid-domain' | 'not-found'
}

interface AmbiguousRecipient {
  status: 'ambiguous'
  candidates: string[]
}

type UnresolvedRecipient = InvalidRecipient | AmbiguousRecipient

export type MailRecipientResolution = ResolvedRecipient | UnresolvedRecipient

function parseRecipientAddress(address: string) {
  const trimmedAddress = address.trim()
  const atIndex = trimmedAddress.lastIndexOf('@')

  if (atIndex <= 0)
    return null

  const username = trimmedAddress.slice(0, atIndex)
  const domain = trimmedAddress.slice(atIndex + 1)

  if (!username || domain.toLowerCase() !== 'pbhh.net')
    return null

  return { username }
}

export function resolveMailRecipient(address: string): MailRecipientResolution {
  const parsed = parseRecipientAddress(address)
  if (!parsed)
    return { status: 'invalid-domain' }

  const exactMatch = db.select({ username: users.username })
    .from(users)
    .where(eq(users.username, parsed.username))
    .get()

  if (exactMatch) {
    return {
      status: 'resolved',
      username: exactMatch.username,
      matchedBy: 'exact',
    }
  }

  const caseInsensitiveMatches = db.select({ username: users.username })
    .from(users)
    .where(sql`lower(${users.username}) = lower(${parsed.username})`)
    .all()

  if (caseInsensitiveMatches.length === 1) {
    return {
      status: 'resolved',
      username: caseInsensitiveMatches[0]!.username,
      matchedBy: 'case-insensitive',
    }
  }

  if (caseInsensitiveMatches.length > 1) {
    return {
      status: 'ambiguous',
      candidates: caseInsensitiveMatches.map(match => match.username),
    }
  }

  return { status: 'not-found' }
}

export async function deliverMailToUser(username: string, fromAddress: string, subject: string, text: string, html = '') {
  const user = await db.select({ username: users.username })
    .from(users)
    .where(eq(users.username, username))
    .get()

  if (!user)
    return null

  const [email] = await db.insert(emails).values({ username, fromAddress, subject, html, text }).returning({
    id: emails.id,
    subject: emails.subject,
    fromAddress: emails.fromAddress,
  })

  if (!email)
    return null

  if (!isPrefEnabled(username, 'mail'))
    return email

  await db.insert(notifications).values({
    username,
    type: 'mail',
    actorLabel: email.fromAddress,
    emailId: email.id,
  })

  bus.publish('notify.mail.received', {
    recipientUsername: username,
    emailId: email.id,
    fromAddress: email.fromAddress,
    subject: email.subject,
  })

  return email
}
