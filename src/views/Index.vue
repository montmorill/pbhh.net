<script setup lang="ts">
import { Translation, useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { user } from '@/lib/store'

const { t } = useI18n()
</script>

<template>
  <main class="flex flex-col items-center pt-8 gap-4">
    <p v-if="user" class="text-lg">
      {{ t('home.welcome', { nickname: user.nickname }) }}
    </p>
    <Translation v-else keypath="home.notLoggedIn" tag="p" class="text-lg">
      <template #login>
        <RouterLink to="/login">
          <Button variant="link" class="px-0 h-auto text-base">
            {{ t('home.loginLink') }}
          </Button>
        </RouterLink>
      </template>
      <template #signup>
        <RouterLink to="/signup">
          <Button variant="link" class="px-0 h-auto text-base">
            {{ t('home.signupLink') }}
          </Button>
        </RouterLink>
      </template>
    </Translation>
  </main>
</template>
