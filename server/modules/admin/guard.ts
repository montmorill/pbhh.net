import { Elysia } from 'elysia'
import { requireAuth } from '../auth/guard'
import { getCapabilities } from '../auth/service'

export const adminAuth = new Elysia({ name: 'admin-auth' })
  .use(requireAuth)
  .onBeforeHandle(({ username, status }) => {
    if (!getCapabilities(username)?.includes('admin'))
      return status(403, { message: 'error.forbidden' })
  })
