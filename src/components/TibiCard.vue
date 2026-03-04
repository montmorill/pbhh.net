<script setup lang="ts">
import DOMPurify from 'dompurify'
import { Heart, Trash2 } from 'lucide-vue-next'
import { marked } from 'marked'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import useAvatar from '@/composables/avatar'
import { api, user } from '@/lib/api'

const props = defineProps<{
  id: number
  title?: string
  content: string
  username: string
  nickname: string
  avatar: string
  createdAt: number
  likeCount: number
  liked: boolean
}>()

const emit = defineEmits<{
  deleted: [id: number]
  liked: [id: number, liked: boolean, likeCount: number]
}>()

const { t } = useI18n()
const router = useRouter()
const { avatarUrl } = useAvatar(() => props.avatar)

const renderedContent = computed(() =>
  DOMPurify.sanitize(marked.parse(props.content.replace(/\n/g, '<br>')) as string),
)

const timeStr = computed(() => {
  const diff = Date.now() - props.createdAt
  if (diff < 60_000)
    return '刚刚'
  if (diff < 3_600_000)
    return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000)
    return `${Math.floor(diff / 3_600_000)} 小时前`
  return new Date(props.createdAt).toLocaleDateString('zh-CN')
})

const isOwn = computed(() => user.value?.username === props.username)
const deleting = ref(false)

async function handleLike() {
  if (!user.value) {
    router.push('/login')
    return
  }
  const { data } = await api.tibi({ id: props.id }).like.post()
  if (data) {
    emit('liked', props.id, data.liked, props.likeCount + (data.liked ? 1 : -1))
  }
}

async function confirmDelete() {
  deleting.value = true
  await api.tibi({ id: props.id }).delete()
  deleting.value = false
  emit('deleted', props.id)
}
</script>

<template>
  <Card>
    <CardContent class="pt-4">
      <div class="flex items-center gap-2 mb-3">
        <RouterLink :to="`/tibi/@${username}`">
          <Avatar class="size-8 border">
            <AvatarImage :src="avatarUrl" :alt="username" />
            <AvatarFallback>{{ nickname.slice(0, 2) }}</AvatarFallback>
          </Avatar>
        </RouterLink>
        <div class="flex flex-col leading-none gap-0.5">
          <RouterLink :to="`/@${username}`" class="text-sm font-medium hover:underline">
            {{ nickname }}
          </RouterLink>
          <span class="text-xs text-muted-foreground">{{ timeStr }}</span>
        </div>
      </div>
      <p v-if="title" class="font-semibold text-sm mb-1">{{ title }}</p>
      <div class="prose prose-sm max-w-none mb-3 dark:prose-invert" v-html="renderedContent" />
      <div class="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          class="gap-1 text-muted-foreground h-7 px-2"
          :class="{ 'text-red-500': liked }"
          @click="handleLike"
        >
          <Heart class="size-4" :class="{ 'fill-current': liked }" />
          {{ likeCount }}
        </Button>
        <AlertDialog v-if="isOwn">
          <AlertDialogTrigger as-child>
            <Button
              variant="ghost"
              size="sm"
              class="text-muted-foreground hover:text-destructive h-7 px-2"
            >
              <Trash2 class="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{{ t('tibi.deleteConfirm') }}</AlertDialogTitle>
              <AlertDialogDescription>{{ t('tibi.deleteDescription') }}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{{ t('common.cancel') }}</AlertDialogCancel>
              <AlertDialogAction
                class="bg-destructive text-white hover:bg-destructive/90"
                :disabled="deleting"
                @click.prevent="confirmDelete"
              >
                {{ t('common.delete') }}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardContent>
  </Card>
</template>
