<script setup lang="ts">
import NavBrand from '@/components/NavBrand.vue'
import NavUser from '@/components/NavUser.vue'
import { user } from '@/lib/store'
</script>

<template>
  <header class="h-16 px-8 border-b w-full flex justify-between items-center">
    <NavBrand />
    <NavUser v-if="user" v-bind="user" />
  </header>
  <RouterView />
</template>
