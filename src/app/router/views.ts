import type { Component } from 'vue'

// SATU-SATUNYA tempat memuat view modul (lazy). Route statis dan dinamis sama-sama lewat sini,
// sehingga tiap view hanya punya satu titik import() → tidak ada chunk ganda.
const viewModules = import.meta.glob<{ default: Component }>('../../modules/*/views/**/*.vue')

export const loadNotFound = () => import('@/app/views/NotFoundView.vue')

/** `"modul/NamaView"` (atau `"modul/views/NamaView"`) → loader view; jatuh ke NotFound bila tidak ada. */
export function resolveView(componentKey: string) {
  const [moduleName, ...rest] = componentKey.replace('/views/', '/').split('/')
  return viewModules[`../../modules/${moduleName}/views/${rest.join('/')}.vue`] ?? loadNotFound
}
