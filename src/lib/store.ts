import type { UserProfile } from '@server/auth/model'
import { ref } from 'vue'
import { api } from './api'

export const user = ref<UserProfile | null>(null)

export function setToken(token: string) {
  localStorage.setItem('token', token)
}

export function clearAuth() {
  localStorage.removeItem('token')
  user.value = null
}

export async function fetchUser() {
  if (!localStorage.getItem('token')) {
    user.value = null
    return
  }

  const { data, error } = await api.me.get()
  if (error) {
    clearAuth()
    return
  }

  user.value = data
}
