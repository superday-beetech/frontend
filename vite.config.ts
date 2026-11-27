import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  return {
    base: isDev ? '/' : '/acn/',
    plugins: [vue(), tailwindcss()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    /* build: {
      manifest: true,
      sourcemap: mode === 'development',
      }, */
    build: {
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-vue-next')) return 'icons'
              if (id.includes('vue') || id.includes('pinia')) return 'vue'
              return 'vendor'
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['cakra.test'],
      cors: {
        origin: 'https://cakra.test',
      },
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_TARGET || 'https://cakra.test',
          changeOrigin: true,
          secure: false,
        },
        // Mencegat request gambar
        '/uploads': {
          target: 'https://cakra.test', // GANTI dengan port CodeIgniter Anda!
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
