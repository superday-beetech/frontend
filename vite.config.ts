import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:8080'

  return {
    // CI4 serves the SPA from /acn; keep API and theme URLs at the same origin.
    base: '/acn/',

    plugins: [vue(), tailwindcss()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      cors: true,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/themes': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },

    build: {
      // frontend/ -> backend public/acn/
      outDir: '../public/acn',
      emptyOutDir: true,
      manifest: '.vite/manifest.json',
      rollupOptions: {
        // CI4 reads this entry from the Vite manifest.
        input: 'src/app/main.ts',
      },
    },
  }
})
