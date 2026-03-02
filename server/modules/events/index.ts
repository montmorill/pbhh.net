import type { AppEvent } from './bus'
import { Elysia } from 'elysia'
import { bus } from './bus'
import { pushBody } from './model'

function matchesTopic(pattern: string, topic: string): boolean {
  if (pattern === '*')
    return true
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2)
    return topic === prefix || topic.startsWith(`${prefix}.`)
  }
  return pattern === topic
}

export const events = new Elysia()
  .ws('/events/ws', {
    beforeHandle({ query, set }) {
      const secret = Bun.env.BOT_SECRET
      if (!secret || query.token !== secret) {
        set.status = 401
        return 'Unauthorized'
      }
    },

    open(ws) {
      (ws.data as any)._topics = [] as string[];
      (ws.data as any)._listener = null
    },

    message(ws, raw) {
      let msg: unknown
      try {
        msg = typeof raw === 'string' ? JSON.parse(raw) : raw
      }
      catch {
        return
      }

      if (
        typeof msg !== 'object'
        || msg === null
        || (msg as any).type !== 'subscribe'
        || !Array.isArray((msg as any).topics)
      ) {
        return
      }

      const topics: string[] = ((msg as any).topics as unknown[]).filter(
        (t): t is string => typeof t === 'string' && t.length > 0,
      )
      if (topics.length === 0)
        return

      // Remove previous listener
      if ((ws.data as any)._listener) {
        bus.off('event', (ws.data as any)._listener)
      }

      const listener = (event: AppEvent) => {
        if (!topics.some(p => matchesTopic(p, event.topic)))
          return
        ws.send(JSON.stringify({
          type: 'event',
          topic: event.topic,
          payload: event.payload,
          timestamp: event.timestamp,
        }))
      };

      (ws.data as any)._topics = topics;
      (ws.data as any)._listener = listener
      bus.on('event', listener)

      ws.send(JSON.stringify({ type: 'ack', topics }))
    },

    close(ws) {
      if ((ws.data as any)._listener) {
        bus.off('event', (ws.data as any)._listener)
      }
    },
  })
  .post('/events/push', ({ body }) => {
    bus.publish(body.topic, body.payload)
    return { ok: true, topic: body.topic }
  }, {
    beforeHandle({ query, set }) {
      const secret = Bun.env.BOT_SECRET
      if (!secret || query.token !== secret) {
        set.status = 401
        return { message: 'Unauthorized' }
      }
    },
    body: pushBody,
    error({ error, status }) {
      return status(400, { message: 'error.badRequest', detail: error })
    },
  })
