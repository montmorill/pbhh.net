import type { HTMLAttributes, InputAutoCompleteAttribute, InputTypeHTMLAttribute, Ref } from 'vue'
import { computed, ref } from 'vue'

interface FieldOptions {
  type?: InputTypeHTMLAttribute
  autocomplete?: InputAutoCompleteAttribute
  inputmode?: HTMLAttributes['inputmode']
  validate?: (value: string) => string
  optional?: boolean
}

export interface Field extends FieldOptions {
  validate: (value: string) => string
  value: Ref<string>
  error: Ref<string>
}

export function useFormFields<const T extends Record<string, FieldOptions>>(configs: T) {
  const fields = Object.fromEntries(
    Object.entries(configs).map(([key, config]) => [
      key,
      {
        validate: _ => '',
        value: ref(''),
        error: ref(''),
        ...config,
      },
    ]),
  ) as { [K in keyof T]: Field }

  const filled = computed(() =>
    Object.values(fields).every(f => f.optional || Boolean(f.value.value)),
  )
  const hasErrors = computed(() =>
    Object.values(fields).some(f => Boolean(f.error.value)),
  )

  return { fields, filled, hasErrors }
}
