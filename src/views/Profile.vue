<script setup lang="ts">
import type { ProviderId } from '@/lib/avatar'
import { ChevronDown } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import defaultAvatar from '@/assets/default-avatar.svg'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { PROVIDERS, resolveAvatar } from '@/lib/avatar'
import { fetchUser, user } from '@/lib/store'

const { t } = useI18n()

type AvatarOption = ProviderId | 'custom'

const PROVIDER_OPTIONS: { value: AvatarOption, label: string }[] = [
  ...Object.entries(PROVIDERS).map(([id, p]) => ({ value: id as ProviderId, label: p.label })),
  { value: 'custom', label: t('field.avatar.provider.custom') },
]

function parseAvatar(avatar: string | undefined): { provider: AvatarOption, input: string } {
  if (!avatar)
    return { provider: 'custom', input: '' }
  const colonIdx = avatar.indexOf(':')
  if (colonIdx !== -1) {
    const maybeProvider = avatar.slice(0, colonIdx)
    if (maybeProvider in PROVIDERS)
      return { provider: maybeProvider as ProviderId, input: avatar.slice(colonIdx + 1) }
  }
  return { provider: 'custom', input: avatar }
}

const initial = parseAvatar(user.value?.avatar)
const avatarProvider = ref<AvatarOption>(initial.provider)
const avatarInput = ref(initial.input)
const previewUrl = ref(user.value?.avatar || defaultAvatar)

const currentProviderLabel = computed(
  () => PROVIDER_OPTIONS.find(p => p.value === avatarProvider.value)?.label,
)

const avatarInputmode = computed(() => {
  if (avatarProvider.value === 'custom')
    return 'url' as const
  return PROVIDERS[avatarProvider.value].inputmode
})

function buildAvatarString(): string {
  if (avatarProvider.value === 'custom')
    return avatarInput.value
  return `${avatarProvider.value}:${avatarInput.value}`
}

async function updatePreview() {
  const str = buildAvatarString()
  previewUrl.value = str ? (await resolveAvatar(str) || defaultAvatar) : defaultAvatar
}

watch([avatarProvider, avatarInput], updatePreview)

const form = ref({ nickname: user.value?.nickname ?? '' })
const nicknameError = ref('')

function validateNickname() {
  const v = form.value.nickname
  if (!v)
    nicknameError.value = t('field.nickname.required')
  else if (v.length < 3 || v.length > 20)
    nicknameError.value = t('field.nickname.length', { min: 3, max: 20 })
  else
    nicknameError.value = ''
}

async function sync() {
  await api.me.patch({ nickname: form.value.nickname, avatar: buildAvatarString() })
  await fetchUser()
}

async function onNicknameBlur() {
  validateNickname()
  if (nicknameError.value)
    return
  await sync()
}

async function onAvatarBlur() {
  await updatePreview()
  await sync()
}
</script>

<template>
  <main class="flex items-center justify-center min-h-[calc(100vh-4rem)]">
    <div class="w-full max-w-sm px-4">
      <h1 class="text-3xl font-bold text-center mb-6">
        {{ t('profile.title') }}
      </h1>

      <Card>
        <CardContent class="space-y-4 pt-6 pb-6">
          <div class="flex justify-center mb-2">
            <Avatar class="size-20 border">
              <AvatarImage :src="previewUrl" :alt="user?.username" />
              <AvatarFallback>{{ user?.nickname?.slice(0, 2) }}</AvatarFallback>
            </Avatar>
          </div>

          <div class="space-y-2">
            <Label for="username">{{ t('field.username.label') }}</Label>
            <Input
              id="username"
              :model-value="user?.username"
              disabled
              spellcheck="false"
            />
          </div>

          <div class="space-y-2">
            <Label for="nickname">{{ t('field.nickname.label') }}</Label>
            <Input
              id="nickname"
              v-model="form.nickname"
              type="text"
              :placeholder="t('field.nickname.placeholder')"
              spellcheck="false"
              :class="nicknameError ? 'border-destructive' : ''"
              @blur="onNicknameBlur"
            />
            <p v-if="nicknameError" class="text-xs text-destructive">
              {{ nicknameError }}
            </p>
          </div>

          <div class="space-y-2">
            <Label>{{ t('field.avatar.label') }}</Label>
            <div class="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" class="shrink-0 gap-1">
                    {{ currentProviderLabel }}
                    <ChevronDown class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup v-model="avatarProvider">
                    <DropdownMenuRadioItem
                      v-for="p in PROVIDER_OPTIONS"
                      :key="p.value"
                      :value="p.value"
                    >
                      {{ p.label }}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                v-model="avatarInput"
                :inputmode="avatarInputmode"
                :placeholder="t(`field.avatar.placeholder.${avatarProvider}`)"
                spellcheck="false"
                @blur="onAvatarBlur"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
</template>
