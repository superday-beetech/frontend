<script setup lang="ts">
import { useTheme } from '@/shared/composables/useTheme'
import { Sun, Moon } from 'lucide-vue-next'

const { currentTheme, toggleTheme } = useTheme()
</script>

<template>
  <button
    @click="toggleTheme"
    type="button"
    class="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
    :title="currentTheme === 'dark' ? 'beralih ke Light Mode' : 'beralih ke Dark Mode'"
  >
    <component
      :is="currentTheme === 'dark' ? Sun : Moon"
      class="w-4 h-4 text-amber-500 dark:text-amber-400 transition-transform duration-300"
    />
    <span class="hidden sm:inline">
      {{ currentTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap' }}
    </span>
  </button>
</template>
