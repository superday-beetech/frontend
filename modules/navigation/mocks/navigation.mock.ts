import type { NavigationResponse } from '../types'

export async function mockNavigation(): Promise<NavigationResponse> {
  return {
    menus: {
      sidebar: [],
      apps: [],
      quick_links: [],
      topbar: [],
    },
  }
}
