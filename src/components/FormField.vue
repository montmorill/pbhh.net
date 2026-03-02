<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

defineProps<{
  id: string
  label: string
  modelValue: string
  type?: string
  autocomplete?: string
  placeholder?: string
  error?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()
</script>

<template>
  <div class="space-y-2">
    <Label :for="id">{{ label }}</Label>
    <Input
      :id="id"
      :model-value="modelValue"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      spellcheck="false"
      :type="type ?? 'text'"
      :class="error ? 'border-destructive' : ''"
      @update:model-value="$emit('update:modelValue', $event as string)"
      @blur="$emit('blur')"
    />
    <p v-if="error" class="text-xs text-destructive">
      {{ error }}
    </p>
  </div>
</template>
