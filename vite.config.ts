/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    filename: 'service-worker.js',
    srcDir: 'src',
    devOptions: {
      enabled: true,
      type: 'module'
    },
    strategies: 'injectManifest',
    injectManifest: {
      injectionPoint: undefined
    },
    workbox: {
      importScripts: ['./src/service-worker.js']
    }
  })],
  test: {
  }
})
