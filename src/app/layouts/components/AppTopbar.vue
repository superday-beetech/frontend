<script setup lang="ts">
import { Menu, Search, SlidersHorizontal } from 'lucide-vue-next'
import { useLayout } from '@/app/layouts/useLayout'
import MegaMenuDropdown from './MegaMenuDropdown.vue'
import NotificationDropdown from './NotificationDropdown.vue'
import OrganizationSwitcher from './OrganizationSwitcher.vue'
import ProfileDropdown from './ProfileDropdown.vue'

const { toggleMobileSidebar, toggleSidebarMini, isQuickDrawerOpen } = useLayout()
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 backdrop-blur-xs transition-colors duration-300"
  >
    <!-- Left Controls -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <!-- Mobile Open Sidebar -->
      <button
        type="button"
        @click="toggleMobileSidebar"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Desktop Mini Sidebar Toggle -->
      <button
        type="button"
        @click="toggleSidebarMini"
        title="Toggle Sidebar Mini"
        class="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
      >
        <Menu class="w-4.5 h-4.5" />
      </button>

      <!-- App Launcher / Mega Menu -->
      <MegaMenuDropdown />

      <!-- Quick Search Bar -->
      <div
        class="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 w-60 focus-within:border-primary-400 dark:focus-within:border-primary-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-colors"
      >
        <Search class="w-3.5 h-3.5 shrink-0" />
        <input
          type="text"
          placeholder="Cari menu atau transaksi..."
          class="w-full bg-transparent text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
        />
        <kbd
          class="rounded bg-white dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
        >
          Ctrl+K
        </kbd>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <NotificationDropdown />

      <!-- Trigger Quick Drawer OffCanvas -->
      <button
        type="button"
        @click="isQuickDrawerOpen = true"
        title="Panel Cepat (OffCanvas)"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <SlidersHorizontal class="w-4.5 h-4.5" />
      </button>

      <div class="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
      <OrganizationSwitcher />
      <ProfileDropdown />
    </div>
  </header>
</template>
