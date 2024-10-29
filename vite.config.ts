import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Checker from 'vite-plugin-checker'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Checker({ typescript: false }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
