import { ref, watch } from 'vue'
import { STORAGE_KEYS, safeStorage } from '@/core/storage'

type ThemeMode = 'light' | 'dark'

function readInitialTheme(): ThemeMode {
  const saved = safeStorage.get(STORAGE_KEYS.theme)
  if (saved === 'light' || saved === 'dark') return saved
  // Belum ada pilihan eksplisit → ikuti preferensi sistem.
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// State & watcher dibuat SATU kali di level modul (bukan per pemanggilan useTheme()),
// supaya tidak ada watcher ganda dan class `dark` terpasang sebelum komponen render.
const currentTheme = ref<ThemeMode>(readInitialTheme())

watch(
  currentTheme,
  (mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
    document.documentElement.style.colorScheme = mode
    safeStorage.set(STORAGE_KEYS.theme, mode)
  },
  { immediate: true }
)

export function useTheme() {
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  }

  return { currentTheme, toggleTheme }
}
