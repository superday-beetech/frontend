import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    // Logika murni berjalan di 'node' (cepat). Untuk test komponen tambahkan `// @vitest-environment jsdom`
    // di atas file spec-nya (butuh: npm i -D jsdom @vue/test-utils).
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
})
