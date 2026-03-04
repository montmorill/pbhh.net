import { and, count, desc, eq } from 'drizzle-orm'
import { db, tibiLikes, tibis, users } from 'server/db'

export function list(viewerUsername?: string, filterUsername?: string) {
  const rows = db
    .select({
      id: tibis.id,
      title: tibis.title,
      content: tibis.content,
      username: tibis.username,
      nickname: users.nickname,
      avatar: users.avatar,
      createdAt: tibis.createdAt,
      likeCount: count(tibiLikes.username),
    })
    .from(tibis)
    .leftJoin(users, eq(tibis.username, users.username))
    .leftJoin(tibiLikes, eq(tibis.id, tibiLikes.tibiId))
    .where(filterUsername ? eq(tibis.username, filterUsername) : undefined)
    .groupBy(tibis.id)
    .orderBy(desc(tibis.createdAt))
    .all()

  let likedIds = new Set<number>()
  if (viewerUsername) {
    const liked = db
      .select({ tibiId: tibiLikes.tibiId })
      .from(tibiLikes)
      .where(eq(tibiLikes.username, viewerUsername))
      .all()
    likedIds = new Set(liked.map(r => r.tibiId))
  }

  return rows.map(row => ({
    id: row.id,
    title: row.title ?? undefined,
    content: row.content,
    username: row.username,
    nickname: row.nickname ?? '',
    avatar: row.avatar ?? '',
    createdAt: row.createdAt!.getTime(),
    likeCount: row.likeCount,
    liked: likedIds.has(row.id),
  }))
}

export function create(username: string, content: string, title?: string) {
  db.insert(tibis).values({ username, title: title || null, content }).run()
}

export function remove(id: number, username: string): 'ok' | 'not_found' | 'forbidden' {
  const tibi = db.select({ username: tibis.username }).from(tibis).where(eq(tibis.id, id)).get()
  if (!tibi)
    return 'not_found'
  if (tibi.username !== username)
    return 'forbidden'
  db.delete(tibiLikes).where(eq(tibiLikes.tibiId, id)).run()
  db.delete(tibis).where(eq(tibis.id, id)).run()
  return 'ok'
}

export function toggleLike(tibiId: number, username: string): boolean | null {
  const tibiExists = db.select({ id: tibis.id }).from(tibis).where(eq(tibis.id, tibiId)).get()
  if (!tibiExists)
    return null
  const existing = db
    .select()
    .from(tibiLikes)
    .where(and(eq(tibiLikes.tibiId, tibiId), eq(tibiLikes.username, username)))
    .get()
  if (existing) {
    db.delete(tibiLikes)
      .where(and(eq(tibiLikes.tibiId, tibiId), eq(tibiLikes.username, username)))
      .run()
    return false
  }
  else {
    db.insert(tibiLikes).values({ tibiId, username }).run()
    return true
  }
}
