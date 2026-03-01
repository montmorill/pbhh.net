<script setup lang="ts">
import type { UserProfile } from '@server/auth/model'
import { LogOut, User } from 'lucide-vue-next'
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import defaultAvatar from '@/assets/default-avatar.svg'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { resolveAvatar } from '@/lib/avatar'
import { clearAuth } from '@/lib/store'

const props = defineProps<UserProfile>()

const { t } = useI18n()
const router = useRouter()

const avatarUrl = ref(defaultAvatar)
watchEffect(async () => {
  avatarUrl.value = (await resolveAvatar(props.avatar)) || defaultAvatar
})

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
        <RouterLink to="/profile" class="flex items-center gap-2 cursor-pointer">
          <User class="size-4" />
          {{ t('nav.profile') }}
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
