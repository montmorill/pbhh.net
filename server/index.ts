import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { auth } from './modules/auth'

const app = new Elysia()
  .use(cors({ origin: 'http://localhost:5173' }))
  .use(auth)
  .listen(3000)

export type App = typeof app

// eslint-disable-next-line no-console
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
