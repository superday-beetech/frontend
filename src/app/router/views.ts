import type { Component } from 'vue'

// Mendukung modul bertingkat: pharmacy/master/views/ProductView.vue.
const viewModules = import.meta.glob<{ default: Component }>('../../modules/**/views/**/*.vue')

export const loadNotFound = () => import('@/app/views/NotFoundView.vue')

export function resolveView(componentKey: string) {
  const normalized = componentKey
    .replace(/^\\/+/, '')
    .replace(/\\.vue$/, '')
    .replace(/\\/views\\//g, '/')
  const segments = normalized.split('/').filter(Boolean)
  if (segments.length < 2) return loadNotFound

  const moduleName = segments[0]
  const viewName = segments[segments.length - 1]
  const subModule = segments.slice(1, -1)
  const viewPath = subModule.length
    ? `../../modules/${moduleName}/${subModule.join('/')}/views/${viewName}.vue`
    : `../../modules/${moduleName}/views/${viewName}.vue`

  return viewModules[viewPath] ?? loadNotFound
}
