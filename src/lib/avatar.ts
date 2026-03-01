import type { HTMLAttributes } from 'vue'
import type { _Awaitable } from 'vue-router'

interface Provider {
  label: string
  resolve: (value: string) => _Awaitable<string>
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
    inputmode: 'email',
  },
} satisfies Record<string, Provider>

export type ProviderId = keyof typeof PROVIDERS

export async function resolveAvatar(avatar: string): Promise<string> {
  if (!avatar)
    return ''

  const colonIdx = avatar.indexOf(':')
  if (colonIdx !== -1) {
    const provider = avatar.slice(0, colonIdx)
    if (provider in PROVIDERS)
      return PROVIDERS[provider as ProviderId].resolve(avatar.slice(colonIdx + 1))
  }

  return avatar
}
