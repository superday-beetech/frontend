import type { App } from 'vue'
import { vCan } from '@/modules/auth'

export function setupDirectives(app: App): void {
  app.directive('can', vCan)
}
