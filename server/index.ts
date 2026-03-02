import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { auth } from './modules/auth'
import { events } from './modules/events'

const app = new Elysia({ prefix: '/api' })
  .use(cors())
  .use(auth)
  .use(events)
  .listen(3000)

export type App = typeof app

// eslint-disable-next-line no-console
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
