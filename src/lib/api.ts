import type { App } from 'server'
import { treaty } from '@elysiajs/eden'

export const api = treaty<App>('http://localhost:3000', {
  headers() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
})
