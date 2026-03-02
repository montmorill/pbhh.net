import type { HTMLAttributes, InputAutoCompleteAttribute, InputTypeHTMLAttribute, MaybeRefOrGetter } from 'vue'
import type { Awaitable } from '@/types'
import { computed, ref, toValue, watchEffect } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'

export interface Provider {
  label: string
  resolve: (value: string) => Awaitable<string>
  type?: InputTypeHTMLAttribute
  autocomplete?: InputAutoCompleteAttribute
  inputmode?: HTMLAttributes['inputmode']
}

export const PROVIDERS = {
  qq: {
    label: 'QQ',
    resolve(value: string) {
      return /^\d{5,12}$/.test(value) ? `https://q.qlogo.cn/g?b=qq&s=640&nk=${value}` : ''
    },
    inputmode: 'numeric',
  },
  gravatar: {
    label: 'Gravatar',
    resolve: async (value: string) => {
      if (!value.includes('@') || !value.includes('.'))
        return ''
      const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value.toLowerCase()))
      const hash = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
      return `https://www.gravatar.com/avatar/${hash}?s=640&d=404`
    },
    type: 'email',
    inputmode: 'email',
    autocomplete: 'email',
  },
} satisfies Record<string, Provider>

export type ProviderId = keyof typeof PROVIDERS

export interface Avatar {
  provider: ProviderId
  input: string
}

export function parseAvatar(avatar: string | undefined): Avatar {
  if (!avatar)
    return { provider: 'qq', input: '' }
  const colonIdx = avatar.indexOf(':')
  if (colonIdx !== -1) {
    const maybeProvider = avatar.slice(0, colonIdx)
    if (maybeProvider in PROVIDERS)
      return { provider: maybeProvider as ProviderId, input: avatar.slice(colonIdx + 1) }
  }
  return { provider: 'qq', input: '' }
}

export function useAvatar(avatar: MaybeRefOrGetter<string | undefined>) {
  const initial = parseAvatar(toValue(avatar))
  const avatarProvider = ref<ProviderId>(initial.provider)
  const avatarInput = ref(initial.input)
  const avatarUrl = ref(defaultAvatar)

  watchEffect(() => {
    const { provider, input } = parseAvatar(toValue(avatar))
    avatarProvider.value = provider
    avatarInput.value = input
  })

  watchEffect(async () => {
    avatarUrl.value = (await PROVIDERS[avatarProvider.value].resolve(avatarInput.value)) || defaultAvatar
  })

  const avatarString = computed(() => `${avatarProvider.value}:${avatarInput.value}`)

  return { avatarProvider, avatarInput, avatarUrl, avatarString }
}

export default useAvatar
