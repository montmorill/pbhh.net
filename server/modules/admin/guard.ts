import type { Capability } from '../auth/model'
import { Elysia } from 'elysia'
import { requireAuth } from '../auth/guard'
import { userHasCapability } from '../auth/service'

function createAdminCapabilityGuard(required: Capability) {
  return new Elysia({ name: `admin-auth:${required}` })
    .use(requireAuth)
    .onBeforeHandle(({ username, status }) => {
      if (!userHasCapability(username, required))
        return status(403, { message: 'error.forbidden' })
    })
}

export const adminViewAuth = createAdminCapabilityGuard('admin:view')
export const adminEditAuth = createAdminCapabilityGuard('admin:edit')
export const adminUpdateAuth = createAdminCapabilityGuard('admin:update')
