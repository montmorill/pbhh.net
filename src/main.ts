import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { i18n } from './i18n'
import { fetchUser, user } from './lib/store'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('@/views/Home.vue') },
    { path: '/login', component: () => import('@/views/Login.vue'), meta: { guestOnly: true } },
    { path: '/signup', component: () => import('@/views/Signup.vue'), meta: { guestOnly: true } },
    { path: '/profile', component: () => import('@/views/Profile.vue'), meta: { authRequired: true } },
  ],
})

router.beforeEach((to) => {
  if (to.meta.guestOnly && user.value)
    return '/'
  if (to.meta.authRequired && !user.value)
    return '/login'
})

;(async () => {
  if (localStorage.getItem('token')) {
    await fetchUser()
  }

  createApp(App).use(router).use(i18n).mount('#app')
})()
