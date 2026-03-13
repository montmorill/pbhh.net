import { readFileSync } from 'node:fs'
import http from 'node:http'
import yaml from '@rollup/plugin-yaml'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const httpRedirect = {
  name: 'http-redirect',
  configurePreviewServer() {
    http.createServer((req, res) => {
      res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` })
      res.end()
    }).listen(80)
  },
}

function tryReadFileSync(path: string) {
  try {
    return readFileSync(path)
  }
  catch {
    return ''
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), yaml(), httpRedirect],
  resolve: { alias: {
    '@': '/src',
    'server': '/server',
  } },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 443,
    https: {
      key: tryReadFileSync('/ssl/cert.key'),
      cert: tryReadFileSync('/ssl/cert.pem'),
    },
  },
})
