import { ref } from 'vue'
import { STORAGE_KEYS, safeStorage } from '@/core/storage'

const isSidebarMini = ref(safeStorage.get(STORAGE_KEYS.sidebarMini) === 'true')
const isMobileSidebarOpen = ref(false)
const isQuickDrawerOpen = ref(false)

export function useLayout() {
  function toggleSidebarMini() {
    isSidebarMini.value = !isSidebarMini.value
    safeStorage.set(STORAGE_KEYS.sidebarMini, String(isSidebarMini.value))
  }

  function toggleMobileSidebar() {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  function closeMobileSidebar() {
    isMobileSidebarOpen.value = false
  }

  return {
    isSidebarMini,
    isMobileSidebarOpen,
    isQuickDrawerOpen,
    toggleSidebarMini,
    toggleMobileSidebar,
    closeMobileSidebar,
  }
}
