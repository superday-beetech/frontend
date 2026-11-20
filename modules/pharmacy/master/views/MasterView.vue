<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { masterMenus } from '../types/masterMenu'

const STORAGE_KEY = 'pharmacy.master.activeKey'

// Default ke menu pertama
const activeKey = ref<string>(masterMenus[0].key)

const activeMenu = computed(() => masterMenus.find((m) => m.key === activeKey.value) ?? masterMenus[0])

// Restore menu aktif dari sessionStorage saat mount
onMounted(() => {
  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved && masterMenus.some((m) => m.key === saved)) {
    activeKey.value = saved
  }
})

function select(key: string) {
  if (key === activeKey.value) return
  activeKey.value = key
  sessionStorage.setItem(STORAGE_KEY, key)
}
</script>

<template>
  <div class="w-full space-y-6">
    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- MENU HORIZONTAL (Desktop) / VERTIKAL (Mobile)                 -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <div class="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <span
            class="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Master Data</h2>
        </div>
        <p class="hidden text-[11px] text-slate-400 sm:block dark:text-slate-500">Pilih menu untuk mengelola data master.</p>
      </div>

      <!-- Menu Navigation -->
      <!-- Mobile: Scroll Horizontal | Desktop: Flex Wrap / Grid -->
      <nav class="p-2">
        <ul class="flex gap-1 overflow-x-auto lg:flex-wrap lg:overflow-visible custom-scrollbar">
          <li v-for="m in masterMenus" :key="m.key" class="shrink-0">
            <button
              type="button"
              class="group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
              :class="
                m.key === activeKey
                  ? 'bg-primary-50 text-primary-700 shadow-sm shadow-primary-500/5 dark:bg-primary-900/20 dark:text-primary-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              "
              :title="m.desc"
              @click="select(m.key)"
            >
              <!-- Indikator Aktif (Garis Bawah) -->
              <span
                v-if="m.key === activeKey"
                class="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary-600 dark:bg-primary-400"
              ></span>

              <!-- Ikon -->
              <i
                :class="[
                  'ti',
                  m.icon,
                  'text-base transition-transform duration-200 group-hover:scale-110',
                  m.key === activeKey
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300',
                ]"
              ></i>

              <!-- Label -->
              <span>{{ m.label }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- ══════════════════════════════════════════════════════════════ -->
    <!-- KONTEN DINAMIS                                                -->
    <!-- ══════════════════════════════════════════════════════════════ -->
    <main class="w-full">
      <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <component :is="activeMenu.component" :key="activeMenu.key" />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Scrollbar tipis untuk mobile */
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(203 213 225); /* slate-300 */
  border-radius: 9999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(51 65 85); /* slate-700 */
}
</style>
