<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { fetchUser, setToken } from '@/lib/store'

const { t, te } = useI18n()
const router = useRouter()

const form = ref({ username: '', password: '' })
const errors = ref({ username: '', password: '' })
const loading = ref(false)
const serverError = ref('')

function validate(field: keyof typeof form.value) {
  const value = form.value[field]
  if (!value) {
    errors.value[field] = t(`field.${field}.required`)
  }
  else {
    errors.value[field] = ''
  }
}

const allFilled = () => Object.values(form.value).every(Boolean)
const hasErrors = () => Object.values(errors.value).some(Boolean)

async function handleSubmit() {
  validate('username')
  validate('password')
  if (hasErrors())
    return

  loading.value = true
  serverError.value = ''

  try {
    const { data, error } = await api.login.post({
      username: form.value.username,
      password: form.value.password,
    })

    if (error) {
      const key = error.value?.message
      serverError.value = key && te(key) ? t(key) : t('error.loginFailed')
      return
    }

    setToken(data.token)
    await fetchUser()
    router.push('/')
  }
  catch {
    serverError.value = t('error.networkError')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex justify-center pt-24">
    <div class="w-full max-w-sm px-4">
      <h1 class="text-3xl font-bold text-center mb-6">
        {{ t('login.title') }}
      </h1>

      <Card>
        <form @submit.prevent="handleSubmit">
          <CardContent class="space-y-4 pt-6">
            <Alert v-if="serverError" variant="destructive">
              <AlertDescription>{{ serverError }}</AlertDescription>
            </Alert>

            <div class="space-y-2">
              <Label for="username">{{ t('field.username.label') }}</Label>
              <Input
                id="username"
                v-model="form.username"
                type="text"
                :placeholder="t('field.username.placeholder')"
                autocomplete="username"
                spellcheck="false"
                :class="errors.username ? 'border-destructive' : ''"
                @blur="validate('username')"
              />
              <p v-if="errors.username" class="text-xs text-destructive">
                {{ errors.username }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="password">{{ t('field.password.label') }}</Label>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                :placeholder="t('field.password.placeholder')"
                autocomplete="current-password"
                :class="errors.password ? 'border-destructive' : ''"
                @blur="validate('password')"
              />
              <p v-if="errors.password" class="text-xs text-destructive">
                {{ errors.password }}
              </p>
            </div>
          </CardContent>

          <CardFooter class="flex-col gap-3">
            <Button
              type="submit"
              class="w-full"
              :disabled="!allFilled() || hasErrors() || loading"
            >
              {{ loading ? t('login.submitting') : t('login.submit') }}
            </Button>
            <p class="text-center text-sm text-muted-foreground">
              {{ t('login.noAccount') }}
              <RouterLink to="/signup" class="text-foreground underline underline-offset-4 hover:text-primary">
                {{ t('login.signupLink') }}
              </RouterLink>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  </main>
</template>
