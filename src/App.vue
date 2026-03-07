<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBrand from '@/components/NavBrand.vue'
import NavUser from '@/components/NavUser.vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { unreadCount, user } from '@/lib/api'

let sse: EventSource | null = null

onMounted(() => {
  if (!user.value)
    return
  sse = new EventSource(`${window.location.origin}/api/events/sse`)
  sse.onmessage = (e) => {
    const event = JSON.parse(e.data) as { topic: string, payload: { recipientUsername?: string } }
    if (event.topic.startsWith('notify.') && event.payload.recipientUsername === user.value?.username)
      unreadCount.value++
  }
})

onUnmounted(() => {
  sse?.close()
  sse = null
})

const scrollAreaRef = ref<{ viewport: HTMLElement | null } | null>(null)
const scrollPositions = new Map<string, number>()
const router = useRouter()

router.beforeEach((_, from) => {
  const el = scrollAreaRef.value?.viewport
  if (el)
    scrollPositions.set(from.path, el.scrollTop)
})

router.afterEach(async (to) => {
  const saved = scrollPositions.get(to.path)
  await nextTick()
  const el = scrollAreaRef.value?.viewport
  if (el)
    el.scrollTop = saved ?? 0
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="h-16 px-8 border-b w-full flex justify-between items-center select-none">
      <NavBrand />
      <NavUser v-if="user" v-bind="user" />
    </header>
    <ScrollArea ref="scrollAreaRef" class="h-[calc(100vh-4rem)] w-full">
      <main class="flex flex-col items-center min-h-[calc(100vh-4rem)]">
        <RouterView v-slot="{ Component }">
          <KeepAlive include="PostPage">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </main>
    </ScrollArea>
  </div>
</template>
