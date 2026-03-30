import { Elysia } from 'elysia'
import { jwtPlugin } from '../jwt'

export const optionalAuth = new Elysia({ name: 'optional-auth' })
  .use(jwtPlugin)
  .derive({ as: 'scoped' }, async ({ headers, jwt }) => {
    if (headers.authorization?.startsWith('Bearer ')) {
      const payload = await jwt.verify(headers.authorization.slice(7))
      if (payload && typeof payload.sub === 'string')
        return { username: payload.sub }
    }
  })

export const requireAuth = new Elysia({ name: 'require-auth' })
  .use(optionalAuth)
  .onBeforeHandle(({ username, status }) => {
    if (!username)
      return status(401)
  })
  .derive({ as: 'scoped' }, ({ username }) => ({ username: username! }))
