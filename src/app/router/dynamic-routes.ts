import type { Router } from 'vue-router'
import type { DynamicMenu } from '@/modules/auth'
import { ROOT_LAYOUT_ROUTE } from './routes'
import { resolveView } from './views'

// Nama route dinamis dicatat agar bisa dihapus saat logout / ganti akun.
const dynamicRouteNames = new Set<string>()

export function registerDynamicRoutes(router: Router, menus: DynamicMenu[]): void {
  for (const menu of menus) {
    if (menu.component_key && menu.path && !router.hasRoute(menu.name)) {
      router.addRoute(ROOT_LAYOUT_ROUTE, {
        path: menu.path,
        name: menu.name,
        component: resolveView(menu.component_key),
        meta: { title: menu.title, permissions: menu.permissions ?? [] },
      })
      dynamicRouteNames.add(menu.name)
    }
    if (menu.children?.length) registerDynamicRoutes(router, menu.children)
  }
}

export function resetDynamicRoutes(router: Router): void {
  for (const name of dynamicRouteNames) {
    if (router.hasRoute(name)) router.removeRoute(name)
  }
  dynamicRouteNames.clear()
}
