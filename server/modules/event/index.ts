import type { AppEvent } from './bus'
import { Buffer } from 'node:buffer'
import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'
import { getByUsername } from '../auth/service'
import { bus } from './bus'
import { pushBody, subscribeBody } from './model'

const MAX_FAILURES = 5

// username -> { url, topics, failures }
const subscriptions = new Map<string, {
  url: string
  topics: string[]
  failures: number
}>()

function matchesTopic(pattern: string, topic: string): boolean {
  if (pattern === '*')
    return true
  if (pattern.endsWith('.*')) {
    const prefix = pattern.slice(0, -2)
    return topic === prefix || topic.startsWith(`${prefix}.`)
  }
  return pattern === topic
}

async function deliver(username: string, url: string, auth: string, event: AppEvent, attempt = 1): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': auth },
      body: JSON.stringify(event),
    })
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)
    const sub = subscriptions.get(username)
    if (sub)
      sub.failures = 0
  }
  catch (err) {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 1000 * attempt))
      return deliver(username, url, auth, event, attempt + 1)
    }
    const sub = subscriptions.get(username)
    if (sub) {
      sub.failures++
      if (sub.failures >= MAX_FAILURES) {
        subscriptions.delete(username)
        console.error(`[webhook:${username}] removed after ${MAX_FAILURES} consecutive failures`)
        return
      }
    }
    console.error(`[webhook:${username}] delivery failed (failures=${sub?.failures}):`, err)
  }
}

bus.on('event', (event: AppEvent) => {
  for (const [username, { url, topics }] of subscriptions) {
    if (!topics.some(p => matchesTopic(p, event.topic)))
      continue
    const auth = `Basic ${Buffer.from(`${username}:`).toString('base64')}`
    console.info(`[webhook:${username}] delivering topic=${event.topic} to ${url}`)
    deliver(username, url, auth, event)
  }
})

const encoder = new TextEncoder()

// WebSocket clients set
const wsClients = new Set<{ send: (data: string) => void }>()

bus.on('event', (event: AppEvent) => {
  if (!event.topic.startsWith('post.'))
    return
  const msg = JSON.stringify({ topic: event.topic, payload: event.payload })
  for (const ws of wsClients)
    ws.send(msg)
})

export default new Elysia()
  .ws('/ws', {
    open(ws) {
      wsClients.add(ws)
    },
    close(ws) {
      wsClients.delete(ws)
    },
    message() {},
  })
  .get('/sse', () => {
    let handler: (event: AppEvent) => void
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(': keepalive\n\n'))
        handler = (event: AppEvent) => {
          if (event.topic.startsWith('post.')) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ topic: event.topic, payload: event.payload })}\n\n`))
          }
        }
        bus.on('event', handler)
      },
      cancel() {
        bus.off('event', handler)
      },
    })
    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  })
  .use(jwt({
    name: 'jwt',
    secret: Bun.env.JWT_SECRET ?? 'dev-secret-please-change-in-production',
  }))
  .post('/event/subscribe', async ({ body, headers, jwt, status }) => {
    const authorization = headers.authorization ?? ''
    if (!authorization.startsWith('Bearer '))
      return status(401, { message: 'error.unauthorized' })
    const payload = await jwt.verify(authorization.slice(7))
    if (!payload || typeof payload.sub !== 'string')
      return status(401, { message: 'error.tokenExpired' })
    const user = getByUsername(payload.sub)
    if (!user?.capabilities.includes('event.subscribe'))
      return status(403, { message: 'error.forbidden' })
    subscriptions.set(payload.sub, {
      url: body.url,
      topics: body.topics ?? ['*'],
      failures: 0,
    })
    return { ok: true }
  }, {
    body: subscribeBody,
    error({ error, status }) {
      return status(400, { message: 'error.badRequest', detail: error })
    },
  })
  .post('/event/publish', async ({ body, headers, jwt, status }) => {
    const authorization = headers.authorization ?? ''
    if (!authorization.startsWith('Bearer '))
      return status(401, { message: 'error.unauthorized' })
    const payload = await jwt.verify(authorization.slice(7))
    if (!payload || typeof payload.sub !== 'string')
      return status(401, { message: 'error.tokenExpired' })
    const user = getByUsername(payload.sub)
    if (!user?.capabilities.includes('event.publish'))
      return status(403, { message: 'error.forbidden' })
    bus.publish(`custom.${payload.sub}.${body.topic}`, body.payload)
    return { ok: true }
  }, {
    body: pushBody,
    error({ error, status }) {
      return status(400, { message: 'error.badRequest', detail: error })
    },
  })
