import type { DynamicMenu } from '@/modules/auth'

export interface NavigationPositions {
  sidebar: DynamicMenu[]
  apps: DynamicMenu[]
  quick_links: DynamicMenu[]
  topbar: DynamicMenu[]
}

export interface NavigationResponse {
  menus: NavigationPositions
}
