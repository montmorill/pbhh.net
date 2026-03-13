import { readFileSync } from 'node:fs'
import yaml from '@rollup/plugin-yaml'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), yaml()],
  resolve: { alias: { '@': '/src' } },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
    https: {
      key: readFileSync('/ssl/cert.key'),
      cert: readFileSync('/ssl/cert.pem'),
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 443,
  },
})
