import type { App } from 'vue'
import { useToast } from '@/shared/composables/useToast'

/** Jaring pengaman terakhir: error render/handler yang tidak tertangkap. Titik sambung Sentry/observability. */
export function setupErrorHandler(app: App): void {
  app.config.errorHandler = (err, _instance, info) => {
    console.error(`[app] ${info}:`, err)
    useToast().error('Terjadi kesalahan', 'Tindakan Anda tidak dapat diselesaikan. Coba muat ulang halaman.')
  }
}
