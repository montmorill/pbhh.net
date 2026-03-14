import { and, count, eq } from 'drizzle-orm'
import { db, userFollows } from 'server/database'

export function isFollowing(followerUsername: string, followingUsername: string): boolean {
  return !!db
    .select()
    .from(userFollows)
    .where(and(
      eq(userFollows.followerUsername, followerUsername),
      eq(userFollows.followingUsername, followingUsername),
    ))
    .get()
}

export function toggle(followerUsername: string, followingUsername: string): boolean {
  if (isFollowing(followerUsername, followingUsername)) {
    db.delete(userFollows).where(and(
      eq(userFollows.followerUsername, followerUsername),
      eq(userFollows.followingUsername, followingUsername),
    )).run()
    return false
  }
  db.insert(userFollows).values({ followerUsername, followingUsername }).run()
  return true
}

export function getFollowers(followingUsername: string): string[] {
  return db
    .select({ username: userFollows.followerUsername })
    .from(userFollows)
    .where(eq(userFollows.followingUsername, followingUsername))
    .all()
    .map(row => row.username)
}

export function getFollowings(followerUsername: string): string[] {
  return db
    .select({ username: userFollows.followingUsername })
    .from(userFollows)
    .where(eq(userFollows.followerUsername, followerUsername))
    .all()
    .map(row => row.username)
}

export function getFollowerCount(followingUsername: string): number {
  return db
    .select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followingUsername, followingUsername))
    .get()
    ?.count || 0
}

export function getFollowingCount(followerUsername: string): number {
  return db
    .select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followerUsername, followerUsername))
    .get()
    ?.count || 0
}
