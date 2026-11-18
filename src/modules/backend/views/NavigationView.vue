<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useNavigationStore } from '../stores/navigation'
import type { MenuHierarchy, MenuPosition, MenuSection, NavigationMenu } from '../types/navigation'

import MenuTreeItem from '../components/MenuTreeItem.vue'
import MenuForm from '../components/MenuForm.vue'
import RouteRegistryImport from '../components/RouteRegistryImport.vue'

// ── IMPORT KOMPONEN & COMPOSABLES KUSTOM ──
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseSelect from '@/shared/components/ui/form/BaseSelect.vue'
// ✨ BaseBadge dihapus karena tidak digunakan
import { useModal } from '@/shared/composables/useModal'
import { useConfirm } from '@/shared/composables/useConfirm'
import { useToast } from '@/shared/composables/useToast'
import { Plus, Route, GripVertical, Menu as MenuIcon, AlertCircle } from 'lucide-vue-next'

const store = useNavigationStore()
const modalStore = useModal()
const { confirm } = useConfirm()
const toast = useToast()

const STORAGE_KEY = 'acn_navigation_preferences'

interface NavigationPreferences {
  position: MenuPosition
  section: MenuSection
}

// ── Options ──
const positionOptions: { label: string; value: MenuPosition }[] = [
  { label: 'Sidebar', value: 'sidebar' },
  { label: 'Topbar', value: 'topbar' },
  { label: 'Quick Links', value: 'quick_links' },
  { label: 'Down', value: 'down' },
  { label: 'Apps', value: 'apps' },
]

const sectionOptions: { label: string; value: MenuSection }[] = [
  { label: 'Backend', value: 'backend' },
  { label: 'Frontend', value: 'frontend' },
]

// ── State ──
const treeContainer = ref<HTMLElement | null>(null)
const menuItems = computed<NavigationMenu[]>(() => Array.isArray(store.menus) ? store.menus : [])
const menuCount = computed(() => menuItems.value.length)
const activeCount = computed(() => menuItems.value.filter((menu) => menu.is_active === '1').length)
// ── Preferences ──
function getSavedPreferences(): NavigationPreferences {
  const defaults: NavigationPreferences = { position: 'sidebar', section: 'backend' }
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaults
    const parsed = JSON.parse(saved)
    return {
      position: positionOptions.some((o: { value: MenuPosition }) => o.value === parsed.position) ? parsed.position : defaults.position,
      section: sectionOptions.some((o: { value: MenuSection }) => o.value === parsed.section) ? parsed.section : defaults.section,
    }
  } catch {
    return defaults
  }
}

function savePreferences(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ position: store.position, section: store.section }))
}

// ── Serialization & Hierarchy ──
let saveInProgress = false
let saveQueued = false

function serializeTree(): MenuHierarchy[] | null {
  const root = treeContainer.value?.querySelector('.menu-tree-root') as HTMLElement | null
  if (!root) {
    console.error('Menu sortable root tidak ditemukan.')
    return null
  }

  function serializeList(list: HTMLElement, parentId: number): MenuHierarchy[] {
    const menuElements = Array.from(list.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el.classList.contains('menu-item')
    )
    return menuElements.map((el, index) => {
      const id = Number(el.dataset.menuId)
      const childList = Array.from(el.children).find(
        (child): child is HTMLElement => child instanceof HTMLElement && child.classList.contains('menu-tree-list')
      )
      return {
        id,
        parent_id: parentId,
        sequence: index + 1,
        children: childList ? serializeList(childList, id) : [],
      }
    })
  }

  const tree = serializeList(root, 0)
  return tree.length > 0 ? tree : null
}

function applyHierarchyToStore(tree: MenuHierarchy[]) {
  const menuMap = new Map<string, NavigationMenu>(menuItems.value.map((menu) => [String(menu.id), menu]))
  const flattened: NavigationMenu[] = []

  function walk(nodes: MenuHierarchy[]) {
    for (const node of nodes) {
      const menu = menuMap.get(String(node.id))
      if (!menu) continue
      // ✨ FIX: Spread menu terlebih dahulu, lalu override parent_id dan sequence
      // TypeScript error terjadi karena objek literal dianggap hanya memiliki parent_id & sequence
      flattened.push({
        ...menu,
        parent_id: String(node.parent_id),
        sequence: String(node.sequence),
      } as NavigationMenu)
      walk(node.children ?? [])
    }
  }

  walk(tree)
  store.menus = flattened
}

async function flushOrderQueue() {
  if (saveInProgress) return
  saveInProgress = true
  let saved = false
  try {
    while (saveQueued) {
      saveQueued = false
      const tree = serializeTree()
      if (!tree) throw new Error('Struktur menu tidak ditemukan atau gagal dibaca.')
      await store.updateOrder(tree)
      saved = true
      if (!saveQueued) applyHierarchyToStore(tree)
    }
    if (saved) toast.success('Urutan menu berhasil disimpan.')
  } catch (error) {
    saveQueued = false
    toast.error(error instanceof Error ? error.message : 'Gagal menyimpan struktur menu.')
    try {
      await store.loadNavigation()
    } catch {
      /* ignore */
    }
  } finally {
    saveInProgress = false
    if (saveQueued) void flushOrderQueue()
  }
}

function handleTreeChange() {
  saveQueued = true
  void flushOrderQueue()
}

// ── Actions ──
function openMenuForm(menuOrParent: NavigationMenu | null = null, mode: 'add' | 'edit' | 'add-child' = 'add') {
  const excluded = new Set<string>()

  // ✨ FIX: Tambahkan anotasi tipe eksplisit pada parameter 'item'
  function collectDescendants(item: NavigationMenu) {
    excluded.add(item.id)
    for (const child of item.children ?? []) collectDescendants(child)
  }

  if (mode === 'edit' && menuOrParent) collectDescendants(menuOrParent)

  const validParents = menuItems.value.filter((item) => !excluded.has(item.id))
  const menuData = mode === 'edit' ? menuOrParent : null
  const initialParentId = mode === 'add-child' && menuOrParent ? menuOrParent.id : null

  modalStore.open({
    title: mode === 'edit' ? 'Edit Menu' : 'Tambah Menu',
    component: MenuForm,
    props: {
      menu: menuData,
      parent_id: initialParentId,
      roles: [...store.roles],
      parentOptions: validParents,
      position: store.position,
      section: store.section,
      onSaved: async () => {
        await store.loadNavigation()
      },
    },
    size: 'lg',
    centered: true,
    scrollable: true,
  })
}

async function deleteMenu(menu: NavigationMenu) {
  const confirmed = await confirm({
    title: 'Konfirmasi Hapus',
    message: `Yakin ingin menghapus menu "${menu.title}"?`,
    confirmText: 'Ya, Hapus',
    variant: 'danger',
  })
  if (!confirmed) return

  try {
    await store.deleteMenu(menu.id)
    toast.success('Menu berhasil dihapus.')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Gagal menghapus menu.')
  }
}

function openRegistryImport() {
  modalStore.open({
    title: 'Import Route Registry',
    component: RouteRegistryImport,
    props: {
      onSaved: async () => {
        await store.loadNavigation()
      },
    },
    size: 'xl',
    centered: true,
    scrollable: true,
  })
}

async function changePosition(value: string | number) {
  if (value === store.position) return
  try {
    await store.loadNavigation(value as MenuPosition, store.section)
    savePreferences()
  } catch {
    toast.error('Gagal memuat posisi menu.')
  }
}

async function changeSection(value: string | number) {
  if (value === store.section) return
  try {
    await store.loadNavigation(store.position, value as MenuSection)
    savePreferences()
  } catch {
    toast.error('Gagal memuat section menu.')
  }
}

onMounted(async () => {
  const preferences = getSavedPreferences()
  try {
    await store.loadNavigation(preferences.position, preferences.section)
    savePreferences()
  } catch {
    toast.error('Gagal memuat data navigasi.')
  }
})
</script>

<template>
  <div class="w-full space-y-6">
    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- HEADER & ACTIONS                                              -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">Manajemen Navigasi</h1>
        <p class="text-sm text-slate-500">Atur struktur menu, posisi, dan hak akses navigasi.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="secondary" @click="openRegistryImport">
          <Route class="w-4 h-4" />
          Import Route Registry
        </BaseButton>
        <BaseButton variant="primary" @click="openMenuForm(null, 'add')">
          <Plus class="w-4 h-4" />
          Tambah Menu
        </BaseButton>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- STATISTIK CARDS                                               -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <!-- Total Menu -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Total Menu</p>
        <p class="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{{ menuCount }}</p>
      </div>
      <!-- Menu Aktif -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Menu Aktif</p>
        <p class="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ activeCount }}</p>
      </div>
      <!-- Posisi -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Posisi</p>
        <p class="mt-2 text-xl font-bold capitalize text-slate-900 dark:text-white">{{ store.position }}</p>
      </div>
      <!-- Section -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-xs font-medium uppercase tracking-wider text-slate-500">Section</p>
        <p class="mt-2 text-xl font-bold capitalize text-slate-900 dark:text-white">{{ store.section }}</p>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- MAIN CARD: MENU TREE                                          -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <!-- Card Header -->
      <div class="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h2 class="text-base font-semibold text-slate-900 dark:text-white">{{ store.title }}</h2>
          <p class="text-xs text-slate-500 mt-0.5">Geser menu untuk mengubah urutan atau hierarki.</p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div class="w-36">
            <BaseSelect
              :model-value="store.position"
              :options="positionOptions"
              :disabled="store.loading"
              placeholder="Pilih Posisi"
              @update:model-value="changePosition"
            />
          </div>
          <div class="w-36">
            <BaseSelect
              :model-value="store.section"
              :options="sectionOptions"
              :disabled="store.loading"
              placeholder="Pilih Section"
              @update:model-value="changeSection"
            />
          </div>
        </div>
      </div>

      <!-- Card Body -->
      <div class="p-5">
        <!-- Loading State -->
        <div v-if="store.loading" class="flex flex-col items-center justify-center py-12">
          <span class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-r-transparent"></span>
          <p class="mt-3 text-sm text-slate-500">Memuat struktur navigasi...</p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="store.error"
          class="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 py-8 dark:border-rose-900/50 dark:bg-rose-900/20"
        >
          <AlertCircle class="h-8 w-8 text-rose-500 mb-2" />
          <p class="text-sm font-medium text-rose-700 dark:text-rose-300">{{ store.error }}</p>
          <BaseButton variant="secondary" size="sm" class="mt-3" @click="store.loadNavigation()">Coba lagi</BaseButton>
        </div>

        <!-- Empty State -->
        <div v-else-if="!store.menuTree || store.menuTree.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <MenuIcon class="h-8 w-8 text-slate-400" />
          </div>
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">Belum ada menu</h3>
          <p class="text-sm text-slate-500 mt-1 mb-4">Tambahkan menu baru atau import dari Route Registry.</p>
          <BaseButton variant="primary" @click="openMenuForm()">
            <Plus class="w-4 h-4" />
            Tambah Menu
          </BaseButton>
        </div>

        <!-- Tree (Data) -->
        <div v-else ref="treeContainer" class="space-y-1">
          <MenuTreeItem
            :items="store.menuTree"
            :depth="0"
            @add="(parent: NavigationMenu) => openMenuForm(parent, 'add-child')"
            @edit="(menu: NavigationMenu) => openMenuForm(menu, 'edit')"
            @delete="deleteMenu"
            @tree-change="handleTreeChange"
          />
        </div>
      </div>

      <!-- Card Footer -->
      <div
        class="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/30"
      >
        <span>
          {{ menuCount }} menu dalam posisi
          <strong>{{ store.position }}</strong>
          .
        </span>
        <span class="inline-flex items-center gap-1">
          <GripVertical class="h-3.5 w-3.5" />
          Drag & drop untuk mengatur hierarki
        </span>
      </div>
    </div>
  </div>
</template>
