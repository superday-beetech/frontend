import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore, filterMenus } from '@/modules/auth'
import { navigationApi } from '../api/navigation.api'
import type { DynamicMenu } from '@/modules/auth'
import type { NavigationPositions } from '../types'

const EMPTY_NAVIGATION: NavigationPositions = {
  sidebar: [],
  apps: [],
  quick_links: [],
  topbar: [],
}

export const useNavigationStore = defineStore('navigation', () => {
  const positions = ref<NavigationPositions>({ ...EMPTY_NAVIGATION })
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const isRoutesLoaded = ref(false)

  let loadPromise: Promise<void> | null = null

  const auth = useAuthStore()
  const visibleSidebar = computed(() =>
    filterMenus(positions.value.sidebar, auth.hasPermission)
  )

  async function fetchNavigation(force = false): Promise<void> {
    if (isLoaded.value && !force) return
    if (loadPromise) return loadPromise

    loadPromise = (async () => {
      isLoading.value = true

      try {
        const response = await navigationApi.getNavigation()
        const menus = response?.menus

        positions.value = {
          sidebar: Array.isArray(menus?.sidebar) ? menus.sidebar : [],
          apps: Array.isArray(menus?.apps) ? menus.apps : [],
          quick_links: Array.isArray(menus?.quick_links) ? menus.quick_links : [],
          topbar: Array.isArray(menus?.topbar) ? menus.topbar : [],
        }
        isLoaded.value = true
      } catch (error) {
        positions.value = { ...EMPTY_NAVIGATION }
        isLoaded.value = false
        throw error
      } finally {
        isLoading.value = false
        loadPromise = null
      }
    })()

    return loadPromise
  }

  function setRoutesLoaded(value: boolean): void {
    isRoutesLoaded.value = value
  }

  function clear(): void {
    positions.value = { ...EMPTY_NAVIGATION }
    isLoaded.value = false
    isLoading.value = false
    isRoutesLoaded.value = false
    loadPromise = null
  }

  function findByPath(path: string): DynamicMenu | undefined {
    const visit = (items: DynamicMenu[]): DynamicMenu | undefined => {
      for (const item of items) {
        if (item.path === path) return item
        const child = item.children?.length ? visit(item.children) : undefined
        if (child) return child
      }
      return undefined
    }

    return visit(positions.value.sidebar)
  }

  return {
    positions,
    sidebar: computed(() => positions.value.sidebar),
    visibleSidebar,
    isLoaded,
    isLoading,
    isRoutesLoaded,
    fetchNavigation,
    setRoutesLoaded,
    findByPath,
    clear,
  }
})
