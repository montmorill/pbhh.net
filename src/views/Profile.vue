<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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
import { PROVIDERS, useAvatar } from '@/composables/avatar'
import { api } from '@/lib/api'
import { fetchUser, user } from '@/lib/store'
import { validateNickname } from '@/lib/validators'

const composer = useI18n()
const { t } = composer

const { avatarProvider, avatarInput, avatarUrl, avatarString } = useAvatar(user.value?.avatar)

const currentProviderLabel = computed(() => PROVIDERS[avatarProvider.value].label)

const form = ref({ nickname: user.value?.nickname ?? '' })
const nicknameError = ref('')

function onValidateNickname() {
  nicknameError.value = validateNickname(composer, form.value.nickname)
}

async function sync() {
  const nickname = nicknameError.value ? user.value!.nickname : form.value.nickname
  await api.me.patch({ nickname, avatar: avatarString.value })
  await fetchUser()
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
              <AvatarImage :src="avatarUrl" :alt="user?.username" />
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
              @input="onValidateNickname"
              @blur="sync"
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
                      v-for="provider, key in PROVIDERS"
                      :key="key"
                      :value="key"
                      @select="avatarInput = ''"
                    >
                      {{ provider.label }}
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                v-model="avatarInput"
                :inputmode="PROVIDERS[avatarProvider].inputmode"
                :placeholder="t(`field.avatar.placeholder.${avatarProvider}`)"
                spellcheck="false"
                @blur="sync"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
</template>
