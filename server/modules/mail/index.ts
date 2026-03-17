import { and, desc, eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db, emails, notifications } from 'server/database'
import { requireAuth } from '../auth/guard'
import { sendMailFromUser } from './service'

export default new Elysia()
  .use(requireAuth)
  .post('/mail/send', async ({ username, body, status }) => {
    const result = await sendMailFromUser(
      username,
      body.recipients,
      body.subject.trim(),
      body.text.trim(),
    )

    if (result.status === 'empty-recipients' || result.status === 'invalid-recipient')
      return status(400, { message: 'error.invalidEmailAddress' })

    if (result.status === 'ambiguous-recipient')
      return status(409, { message: 'error.mailRecipientAmbiguous' })

    if (result.status === 'relay-unavailable')
      return status(503, { message: 'error.mailRelayUnavailable' })

    if (result.status === 'external-send-failed')
      return status(502, { message: 'error.mailSendExternalFailed' })

    if (result.status !== 'ok')
      return status(500, { message: 'error.mailSendExternalFailed' })

    return {
      ok: true,
      internalCount: result.internalCount,
      externalCount: result.externalCount,
    }
  }, {
    body: t.Object({
      recipients: t.String({ minLength: 1, maxLength: 1000 }),
      subject: t.String({ minLength: 1, maxLength: 120 }),
      text: t.String({ minLength: 1, maxLength: 5000 }),
    }),
  })
  .get('/mail/inbox', async ({ username }) => {
    return db.select({
      id: emails.id,
      fromAddress: emails.fromAddress,
      subject: emails.subject,
      read: emails.read,
      createdAt: emails.createdAt,
    })
      .from(emails)
      .where(eq(emails.username, username))
      .orderBy(desc(emails.createdAt))
  })
  .get('/mail/:id', async ({ username, params, status }) => {
    const id = Number(params.id)
    const email = await db.select().from(emails).where(and(
      eq(emails.id, id),
      eq(emails.username, username),
    )).get()

    if (!email)
      return status(404)

    await db.update(emails).set({ read: true }).where(and(
      eq(emails.id, id),
      eq(emails.username, username),
    )).run()

    await db.update(notifications).set({ read: true }).where(and(
      eq(notifications.username, username),
      eq(notifications.emailId, id),
    )).run()

    return email
  })
  .delete('/mail/:id', async ({ username, params }) => {
    await db.delete(emails).where(and(
      eq(emails.id, Number(params.id)),
      eq(emails.username, username),
    ))
  })
