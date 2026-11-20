<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, Search, SlidersHorizontal, MoreVertical, Bell, Building2 } from 'lucide-vue-next'
import { useLayout } from '@/app/layouts/useLayout'
import MegaMenuDropdown from './MegaMenuDropdown.vue'
import NotificationDropdown from './NotificationDropdown.vue'
import OrganizationSwitcher from './OrganizationSwitcher.vue'
import ProfileDropdown from './ProfileDropdown.vue'

const { toggleMobileSidebar, toggleSidebarMini, isQuickDrawerOpen } = useLayout()

// State untuk dropdown titik tiga
const isMoreOpen = ref(false)
const moreMenuRef = ref<HTMLElement | null>(null)

// Fungsi untuk klik di luar area dropdown
function handleClickOutside(e: MouseEvent) {
  if (moreMenuRef.value && !moreMenuRef.value.contains(e.target as Node)) {
    isMoreOpen.value = false
  }
}

// Fungsi khusus untuk tombol Panel Cepat di versi Mobile
function openQuickDrawer() {
  isQuickDrawerOpen.value = true
  isMoreOpen.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
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

      <!-- Quick Search Bar (Hanya Desktop) -->
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
      <!-- ========================================== -->
      <!-- 1. MENU DESKTOP (Hanya Muncul di Layar >= md) -->
      <!-- ========================================== -->
      <div class="hidden md:flex items-center gap-1.5 sm:gap-2">
        <NotificationDropdown />

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
      </div>
      <!-- ========================================== -->
      <!-- 2. MENU TITIK TIGA (Hanya Muncul di Layar < md) -->
      <!-- ========================================== -->
      <div class="relative md:hidden" ref="moreMenuRef">
        <!-- Tombol Titik Tiga -->
        <button
          @click="isMoreOpen = !isMoreOpen"
          class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
        >
          <MoreVertical class="w-5 h-5" />
        </button>

        <!-- Isi Dropdown Titik Tiga -->
        <div
          v-if="isMoreOpen"
          class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-999 overflow-visible py-2"
        >
          <!-- Header dengan Tombol Close -->
          <div class="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1">
            <span class="text-xs font-semibold text-slate-400">Menu Cepat</span>
            <button
              @click="isMoreOpen = false"
              class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <!-- Ikon X (Close) -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Notifikasi: Komponen Asli -->
          <div class="px-2 py-1 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md">
            <span class="text-sm text-slate-700 dark:text-slate-300 ml-2 flex items-center gap-2">
              <Bell class="w-4 h-4" />
              Notifikasi
            </span>
            <NotificationDropdown />
          </div>

          <!-- Panel Cepat -->
          <button
            @click="openQuickDrawer"
            class="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <SlidersHorizontal class="w-4 h-4" />
            Panel Cepat
          </button>

          <!-- Organisasi: Komponen Asli -->
          <div
            class="px-2 py-1 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
          >
            <span class="text-sm text-slate-700 dark:text-slate-300 ml-2 flex items-center gap-2">
              <Building2 class="w-4 h-4" />
              Organisasi
            </span>
            <OrganizationSwitcher />
          </div>
        </div>
      </div>
      <!-- ========================================== -->
      <!-- 3. PROFIL USER (Selalu Tampil di Semua Layar) -->
      <!-- ========================================== -->
      <ProfileDropdown />
    </div>
  </header>
</template>
