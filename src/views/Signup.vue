<script setup lang="ts">
import { computed, ref } from 'vue'
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

const form = ref({ username: '', nickname: '', password: '', confirmPassword: '' })
const errors = ref({ username: '', nickname: '', password: '', confirmPassword: '' })
const loading = ref(false)
const serverError = ref('')

const allFilled = computed(() => Object.values(form.value).every(Boolean))
const hasErrors = computed(() => Object.values(errors.value).some(Boolean))

function validateField(field: keyof typeof form.value) {
  const value = form.value[field]
  switch (field) {
    case 'username':
      if (!value)
        errors.value.username = t('field.username.required')
      else if (value.length < 3 || value.length > 20)
        errors.value.username = t('field.username.length', { min: 3, max: 20 })
      else if (!/^[a-z0-9-]+$/i.test(value))
        errors.value.username = t('field.username.format')
      else
        errors.value.username = ''
      break
    case 'nickname':
      if (!value)
        errors.value.nickname = t('field.nickname.required')
      else if (value.length < 3 || value.length > 20)
        errors.value.nickname = t('field.nickname.length', { min: 3, max: 20 })
      else
        errors.value.nickname = ''
      break
    case 'password':
      if (!value)
        errors.value.password = t('field.password.required')
      else if (value.length < 8)
        errors.value.password = t('field.password.minLength', { min: 8 })
      else
        errors.value.password = ''
      break
    case 'confirmPassword':
      if (!value)
        errors.value.confirmPassword = t('field.confirmPassword.required')
      else if (value !== form.value.password)
        errors.value.confirmPassword = t('field.confirmPassword.mismatch')
      else
        errors.value.confirmPassword = ''
      break
  }
}

async function handleSubmit() {
  for (const field of Object.keys(form.value) as (keyof typeof form.value)[])
    validateField(field)

  if (hasErrors.value)
    return

  loading.value = true
  serverError.value = ''

  try {
    const { data, error } = await api.signup.post(form.value)

    if (error) {
      const key = error.value?.message
      serverError.value = key && te(key) ? t(key) : t('error.signupFailed')
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

const fields = [
  { name: 'username' as const, type: 'text', autocomplete: 'username' },
  { name: 'nickname' as const, type: 'text', autocomplete: 'nickname' },
  { name: 'password' as const, type: 'password', autocomplete: 'new-password' },
  { name: 'confirmPassword' as const, type: 'password', autocomplete: 'new-password' },
]
</script>

<template>
  <main class="flex justify-center pt-24">
    <div class="w-full max-w-sm px-4">
      <h1 class="text-3xl font-bold text-center mb-6">
        {{ t('signup.title') }}
      </h1>

      <Card>
        <form @submit.prevent="handleSubmit">
          <CardContent class="space-y-4 pt-6">
            <Alert v-if="serverError" variant="destructive">
              <AlertDescription>{{ serverError }}</AlertDescription>
            </Alert>

            <div v-for="field in fields" :key="field.name" class="space-y-2">
              <Label :for="field.name">{{ t(`field.${field.name}.label`) }}</Label>
              <Input
                :id="field.name"
                v-model="form[field.name]"
                :type="field.type"
                :autocomplete="field.autocomplete"
                :placeholder="t(`field.${field.name}.placeholder`)"
                spellcheck="false"
                :class="errors[field.name] ? 'border-destructive' : ''"
                @blur="validateField(field.name)"
              />
              <p v-if="errors[field.name]" class="text-xs text-destructive">
                {{ errors[field.name] }}
              </p>
            </div>
          </CardContent>

          <CardFooter class="flex-col gap-3">
            <Button
              type="submit"
              class="w-full"
              :disabled="!allFilled || hasErrors || loading"
            >
              {{ loading ? t('signup.submitting') : t('signup.submit') }}
            </Button>
            <p class="text-center text-sm text-muted-foreground">
              {{ t('signup.hasAccount') }}
              <RouterLink to="/login" class="text-foreground underline underline-offset-4 hover:text-primary">
                {{ t('signup.loginLink') }}
              </RouterLink>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  </main>
</template>
