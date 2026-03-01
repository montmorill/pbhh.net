import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  username: text('username').notNull().unique().primaryKey(),
  nickname: text('nickname').notNull(),
  password: text('password').notNull(),
  avatar: text('avatar').notNull().default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})
