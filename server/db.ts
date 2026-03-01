import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import * as schema from './schema'

const dbPath = resolve(import.meta.dir, '../data/db.sqlite')
if (!existsSync(dirname(dbPath))) {
  mkdirSync(dirname(dbPath))
}

const sqlite = new Database(dbPath)
sqlite.run('PRAGMA journal_mode = WAL;')

export const db = drizzle(sqlite, { schema })

migrate(db, { migrationsFolder: resolve(import.meta.dir, 'drizzle') })

export { users } from './schema'
