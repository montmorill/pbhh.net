import { Type as t } from '@sinclair/typebox'

export const createTibiBody = t.Object({
  title: t.Optional(t.String({ maxLength: 100 })),
  content: t.String({ minLength: 1, maxLength: 500 }),
})
export type CreateTibiBody = typeof createTibiBody.static
