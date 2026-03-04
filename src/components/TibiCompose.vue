<script setup lang="ts">
import { createTibiBody } from '@server/tibi/model'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { validateField } from '@/composables/useValidators'
import { api } from '@/lib/api'

const emit = defineEmits<{ posted: [] }>()

const composer = useI18n()
const { t } = composer

const title = ref('')
const content = ref('')
const submitting = ref(false)
const serverError = ref('')

const titleMaxLength = createTibiBody.properties.title.maxLength!
const titleSchema = createTibiBody.properties.title
const maxLength = createTibiBody.properties.content.maxLength!
const contentSchema = createTibiBody.properties.content

const titleError = computed(() =>
  title.value ? validateField(composer, titleSchema, title.value, 'tibi.title') : undefined,
)
const contentError = computed(() =>
  content.value ? validateField(composer, contentSchema, content.value, 'tibi.content') : undefined,
)

async function submit() {
  if (!content.value || contentError.value || titleError.value)
    return
  submitting.value = true
  serverError.value = ''
  const { error } = await api.tibi.post({
    title: title.value.trim() || undefined,
    content: content.value.trim(),
  })
  submitting.value = false
  if (error) {
    serverError.value = t('tibi.errors.postFailed')
    return
  }
  title.value = ''
  content.value = ''
  emit('posted')
}
</script>

<template>
  <Card>
    <CardContent class="pt-4 pb-3 space-y-3">
      <Input
        v-model="title"
        :placeholder="t('field.tibi.title.placeholder')"
        :maxlength="titleMaxLength"
        class="border-none px-0 shadow-none focus-visible:ring-0 font-medium"
      />
      <Separator />
      <Textarea
        v-model="content"
        :placeholder="t('tibi.compose.placeholder')"
        :maxlength="maxLength"
        class="border-none px-0 resize-none shadow-none focus-visible:ring-0 min-h-18"
      />
    </CardContent>
    <CardFooter class="pt-3 flex justify-between items-center">
      <span
        class="text-xs text-muted-foreground select-none"
        :class="{ 'text-destructive': contentError }"
      >
        {{ content.length }}/{{ maxLength }}
      </span>
      <Button
        size="sm"
        :disabled="!content || !!contentError || submitting"
        @click="submit"
      >
        <Spinner v-if="submitting" data-icon="inline-start" />
        {{ t('tibi.compose.submit') }}
      </Button>
    </CardFooter>
    <p v-if="serverError" class="px-6 pb-4 text-sm text-destructive">
      {{ serverError }}
    </p>
  </Card>
</template>
