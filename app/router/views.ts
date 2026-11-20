import type { Component } from 'vue'

const viewModules = import.meta.glob<{ default: Component }>('../../modules/**/views/**/*.vue')

export const loadNotFound = () => import('@/app/views/NotFoundView.vue')
export const loadPos = () => import('@/modules/sales/views/PosView.vue')

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function createSafeLoader(loader: () => Promise<{ default: Component }>, componentKey: string, menuPath?: string) {
  return async () => {
    try {
      return await loader()
    } catch (error) {
      console.error('[Router] Gagal memuat view:', {
        componentKey,
        menuPath,
        error,
      })

      return await loadNotFound()
    }
  }
}

export function resolveView(componentKey?: string | null, menuPath?: string) {
  if (componentKey) {
    const normalized = componentKey
      .replace(/\.vue$/i, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/\\/g, '/')

    const parts = normalized.split('/').filter(Boolean)

    const relative = parts.includes('views') ? parts.join('/') : [...parts.slice(0, -1), 'views', parts.at(-1)!].join('/')

    const key = `../../modules/${relative}.vue`
    const loader = viewModules[key]

    if (loader) {
      return createSafeLoader(loader, componentKey, menuPath)
    }
  }

  if (menuPath) {
    const slug = menuPath.split('/').filter(Boolean).at(-1) ?? ''

    if (slug && slug !== '#') {
      const expectedName = `${toPascalCase(slug)}View`

      const matches = Object.entries(viewModules).filter(
        ([path]) =>
          path
            .split('/')
            .pop()
            ?.replace(/\.vue$/i, '') === expectedName
      )

      if (matches.length === 1) {
        return createSafeLoader(matches[0][1], matches[0][0], menuPath)
      }
    }
  }

  /*  console.warn('[Router] View tidak ditemukan:', {
    componentKey,
    menuPath,
  })
 */
  return loadNotFound
}
