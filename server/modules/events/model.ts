import { Type as t } from '@sinclair/typebox'

export const pushBody = t.Object({
  topic: t.String({ minLength: 1 }),
  payload: t.Unknown(),
})

export type PushBody = typeof pushBody.static
