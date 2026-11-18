import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getApiErrorMessage } from '@/core/api/errors'

import { navigationApi } from '../api/navigation.api'

import type {
  NavigationMenu,
  MenuPosition,
  MenuSection,
  MenuFormPayload,
  MenuHierarchy,
  RouteRegistryPreview,
  RouteRegistrySaveItem,
} from '../types/navigation'

export const useNavigationStore = defineStore('navigation', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const menus = ref<NavigationMenu[]>([])
  const roles = ref<string[]>([])

  const title = ref('Manajemen Navigasi')
  const position = ref<MenuPosition>('sidebar')
  const section = ref<MenuSection>('backend')

  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  const menuTree = computed(() => buildMenuTree(Array.isArray(menus.value) ? menus.value : []))

  // ---------------------------------------------------------------------------
  // Menu helpers
  // ---------------------------------------------------------------------------

  function buildMenuTree(
    items: NavigationMenu[] = [],
    parentId = '0',
    ancestors = new Set<string>()
  ): NavigationMenu[] {
    const source = Array.isArray(items) ? items : []

    return source
      .filter((item) => {
        const itemParent = item.parent_id === null || item.parent_id === undefined || item.parent_id === '' ? '0' : String(item.parent_id)
        return itemParent === parentId && !ancestors.has(String(item.id))
      })
      .sort((a, b) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0))
      .map((item) => {
        const id = String(item.id)
        const nextAncestors = new Set(ancestors)
        nextAncestors.add(id)

        return {
          ...item,
          children: buildMenuTree(source, id, nextAncestors),
        }
      })
  }

  function flattenMenuTree(items: NavigationMenu[]): NavigationMenu[] {
    const result: NavigationMenu[] = []

    function walk(nodes: NavigationMenu[]): void {
      for (const node of nodes) {
        result.push(node)

        if (node.children?.length) {
          walk(node.children)
        }
      }
    }

    walk(items)

    return result
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  function resolveError(err: unknown, fallback: string): string {
    const message = getApiErrorMessage(err, err instanceof Error ? err.message : fallback)

    error.value = message

    return message
  }

  function applyNavigation(payload: Awaited<ReturnType<typeof navigationApi.getNavigation>>): void {
    const data = payload && typeof payload === 'object' ? payload : ({} as NavigationGroups)

    position.value = data.position ?? position.value
    section.value = data.section ?? section.value
    title.value = typeof data.title === 'string' ? data.title : 'Manajemen Navigasi'

    menus.value = Array.isArray(data.menus) ? data.menus : []
    roles.value = Array.isArray(data.roles)
      ? data.roles.filter((role): role is string => typeof role === 'string' && role.trim() !== '')
      : []
  }

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  async function loadNavigation(selectedPosition: MenuPosition = position.value, selectedSection: MenuSection = section.value) {
    loading.value = true
    error.value = null

    try {
      const payload = await navigationApi.getNavigation(selectedPosition, selectedSection)

      applyNavigation(payload)

      return payload
    } catch (err) {
      resolveError(err, 'Gagal memuat data navigasi.')

      // Pertahankan data sebelumnya jika request gagal.
      throw err
    } finally {
      loading.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Menu CRUD
  // ---------------------------------------------------------------------------

  async function saveMenu(payload: MenuFormPayload) {
    saving.value = true
    error.value = null

    try {
      const result = await navigationApi.saveMenu(payload)

      await loadNavigation(payload.position, payload.section)

      return result
    } catch (err) {
      resolveError(err, 'Gagal menyimpan menu.')
      throw err
    } finally {
      saving.value = false
    }
  }

  async function deleteMenu(id: string) {
    saving.value = true
    error.value = null

    try {
      const result = await navigationApi.deleteMenu(id)

      await loadNavigation()

      return result
    } catch (err) {
      resolveError(err, 'Gagal menghapus menu.')
      throw err
    } finally {
      saving.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Menu hierarchy
  // ---------------------------------------------------------------------------

  async function updateOrder(tree: MenuHierarchy[]) {
    saving.value = true
    error.value = null

    try {
      // Tidak reload di sini.
      // NavigationView mengaplikasikan hierarki setelah berhasil disimpan.
      return await navigationApi.updateOrder(tree)
    } catch (err) {
      resolveError(err, 'Gagal memperbarui urutan menu.')
      throw err
    } finally {
      saving.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Route Registry
  // ---------------------------------------------------------------------------

  async function previewRegistry(): Promise<RouteRegistryPreview> {
    loading.value = true
    error.value = null

    try {
      return await navigationApi.previewRegistry()
    } catch (err) {
      resolveError(err, 'Gagal memuat Route Registry.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function saveRegistry(items: RouteRegistrySaveItem[]) {
    saving.value = true
    error.value = null

    try {
      const result = await navigationApi.saveRegistry(section.value, items)

      await loadNavigation()

      // RouteRegistryImport.vue menggunakan response.data.inserted/skipped.
      return result
    } catch (err) {
      resolveError(err, 'Gagal menyinkronkan menu.')
      throw err
    } finally {
      saving.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  return {
    // State
    menus,
    roles,
    title,
    position,
    section,
    loading,
    saving,
    error,

    // Getters
    menuTree,

    // Helpers
    buildMenuTree,
    flattenMenuTree,

    // Actions
    loadNavigation,
    saveMenu,
    deleteMenu,
    updateOrder,
    previewRegistry,
    saveRegistry,
  }
})
