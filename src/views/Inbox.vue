<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { parseAvatar, PROVIDERS } from '@/composables/avatar'
import useTimeStr from '@/composables/useTimeStr'
import { api, unreadCount } from '@/lib/api'

interface NotificationItem {
  id: number
  type: 'like' | 'reply' | 'post'
  actorUsername: string
  actorNickname: string
  actorAvatar: string
  postId: number
  postContent: string
  replyId?: number
  replyContent?: string
  read: boolean
  createdAt: number
}

interface Actor {
  username: string
  nickname: string
  avatar: string
}

interface DisplayItem {
  ids: number[]
  unreadIds: number[]
  type: 'like' | 'reply' | 'post'
  actors: [Actor, ...Actor[]]
  postId: number
  postContent: string
  replyId?: number
  replyContent?: string
  read: boolean
  createdAt: number
}

const { t } = useI18n()
const router = useRouter()
const timeStr = useTimeStr()

const displayItems = ref<DisplayItem[]>([])
const loading = ref(true)
const markingAllRead = ref(false)
const allMarked = ref(false)

async function markAllRead() {
  markingAllRead.value = true
  await api.notifications.read.post()
  unreadCount.value = 0
  for (const item of displayItems.value) {
    item.unreadIds = []
    item.read = true
  }
  markingAllRead.value = false
  allMarked.value = true
}

onMounted(async () => {
  const { data } = await api.notifications.get()
  loading.value = false
  if (!data)
    return

  const likesByPost = new Map<number, DisplayItem>()
  const result: DisplayItem[] = []

  for (const item of data as NotificationItem[]) {
    const actor = {
      username: item.actorUsername,
      nickname: item.actorNickname,
      avatar: item.actorAvatar,
    }
    if (item.type === 'like') {
      const existing = likesByPost.get(item.postId)
      if (existing) {
        existing.ids.push(item.id)
        existing.actors.push(actor)
        if (!item.read) {
          existing.unreadIds.push(item.id)
          existing.read = false
        }
      }
      else {
        const merged: DisplayItem = {
          ids: [item.id],
          unreadIds: item.read ? [] : [item.id],
          type: 'like',
          actors: [actor],
          postId: item.postId,
          postContent: item.postContent,
          read: item.read,
          createdAt: item.createdAt,
        }
        likesByPost.set(item.postId, merged)
        result.push(merged)
      }
    }
    else {
      result.push({
        ids: [item.id],
        unreadIds: item.read ? [] : [item.id],
        type: item.type,
        actors: [actor],
        postId: item.postId,
        postContent: item.postContent,
        replyId: item.replyId,
        replyContent: item.replyContent,
        read: item.read,
        createdAt: item.createdAt,
      })
    }
  }

  displayItems.value = result
})

function resolveAvatarUrl(avatar: string): string {
  const { provider, value } = parseAvatar(avatar)
  if (provider === 'qq' && value)
    return PROVIDERS.qq.resolve(value)
  return ''
}

function navigate(item: DisplayItem) {
  router.push(item.type === 'reply' && item.replyId
    ? `/post/${item.replyId}`
    : `/post/${item.postId}`)
}

// Auto-mark all as read when leaving the page
onUnmounted(() => {
  const hasUnread = displayItems.value.some(item => item.unreadIds.length > 0)
  if (hasUnread) {
    api.notifications.read.post()
    unreadCount.value = 0
  }
})
</script>

<template>
  <div class="w-full mb-auto max-w-2xl px-4 py-8 space-y-4">
    <div class="flex items-center gap-2">
      <Inbox class="size-5" />
      <h1 class="text-lg font-semibold">
        {{ t('inbox.title') }}
      </h1>
      <Button
        v-if="displayItems.length"
        variant="ghost"
        size="sm"
        class="ml-auto text-xs text-muted-foreground"
        :disabled="markingAllRead || allMarked"
        @click="markAllRead"
      >
        <Spinner v-if="markingAllRead" data-icon="inline-start" />
        {{ allMarked ? t('settings.notifications.markAllReadDone') : t('settings.notifications.markAllRead') }}
      </Button>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <Spinner />
    </div>
    <div v-else-if="!displayItems.length" class="text-center text-muted-foreground py-8">
      {{ t('inbox.empty') }}
    </div>
    <div v-else class="space-y-1">
      <div
        v-for="item in displayItems"
        :key="item.ids[0]"
        class="flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        :class="{ 'opacity-60': item.read }"
        @click="navigate(item)"
      >
        <div class="flex shrink-0 -space-x-4">
          <Avatar
            v-for="actor in item.actors.slice(0, 3)"
            :key="actor.username"
            class="size-8 border-2 border-background shrink-0"
          >
            <AvatarImage :src="resolveAvatarUrl(actor.avatar)" :alt="actor.username" />
            <AvatarFallback>{{ actor.nickname.slice(0, 2) }}</AvatarFallback>
          </Avatar>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-sm font-medium">
              <template v-for="(actor, i) in item.actors.slice(0, 3)" :key="actor.username">
                {{ actor.nickname }}
                <span
                  v-if="i < item.actors.slice(0, 3).length - 1"
                  class="text-muted-foreground font-normal"
                >{{ t('inbox.likeActorsSep') }}</span>
              </template>
              <span
                v-if="item.actors.length > 3"
                class="text-muted-foreground font-normal"
              >{{ t('inbox.likeActors', { count: item.actors.length }) }}</span>
            </span>
            <span class="text-sm text-muted-foreground">{{ t(`inbox.${item.type}`) }}</span>
            <span v-if="!item.read" class="size-1.5 rounded-full bg-blue-500 shrink-0" />
          </div>
          <p class="text-xs text-muted-foreground mt-0.5 truncate">{{ item.postContent }}</p>
          <p v-if="item.replyContent" class="text-xs mt-0.5 truncate">{{ item.replyContent }}</p>
          <p class="text-xs text-muted-foreground mt-0.5">{{ timeStr(item.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
