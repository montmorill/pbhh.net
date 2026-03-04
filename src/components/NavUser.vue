<script setup lang="ts">
import { Inbox, LogOut, Settings, User } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import useAvatar from '@/composables/avatar'
import { clearAuth, unreadCount } from '@/lib/api'

const props = defineProps<{
  username: string
  nickname: string
  avatar: string
}>()

const { t } = useI18n()
const router = useRouter()

const { avatarUrl } = useAvatar(() => props.avatar)

function logout() {
  clearAuth()
  router.push('/login')
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="flex items-center gap-2">
      <span class="text-sm">{{ nickname }}</span>
      <Avatar class="size-9 cursor-pointer border">
        <AvatarImage :src="avatarUrl" :alt="username" />
        <AvatarFallback>{{ nickname.slice(0, 2) }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-40">
      <DropdownMenuItem as-child>
        <RouterLink :to="`/@${username}`" class="flex items-center gap-2 cursor-pointer">
          <User class="size-4" />
          {{ t('nav.profile') }}
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <RouterLink to="/inbox" class="flex items-center gap-2 cursor-pointer">
          <Inbox class="size-4" />
          {{ t('nav.inbox') }}
          <span v-if="unreadCount > 0" class="ml-auto text-xs font-medium bg-blue-500 text-white rounded-full px-1.5 py-0.5 leading-none">
            {{ unreadCount }}
          </span>
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <RouterLink to="/settings" class="flex items-center gap-2 cursor-pointer">
          <Settings class="size-4" />
          {{ t('nav.settings') }}
        </RouterLink>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
        @click="logout"
      >
        <LogOut class="size-4" />
        {{ t('nav.logout') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
