<script setup lang="ts">
import { X, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'
import { useNavigationStore } from '@/modules/navigation'
import { useLayout } from '@/app/layouts/useLayout'
import SidebarTreeItem from './SidebarTreeItem.vue'

const navigation = useNavigationStore()
const { isSidebarMini, isMobileSidebarOpen, toggleSidebarMini, closeMobileSidebar } = useLayout()
</script>

<template>
  <!-- Backdrop Mobile -->
  <div v-if="isMobileSidebarOpen" @click="closeMobileSidebar" class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden" />

  <!-- Sidebar Container -->
  <aside
    class="fixed inset-y-0 left-0 z-40 lg:z-20 flex flex-col border-r border-slate-200 bg-white transition-all duration-250 lg:static"
    :class="[isSidebarMini ? 'lg:w-18' : 'lg:w-64', isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0']"
  >
    <!-- Brand Header -->
    <div
      class="flex h-14 shrink-0 items-center border-b border-slate-100 px-4"
      :class="isSidebarMini ? 'justify-center' : 'justify-between'"
    >
      <RouterLink to="/" class="flex items-center gap-2.5 overflow-hidden">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-sm shadow-xs">
          CE
        </div>
        <div v-if="!isSidebarMini" class="leading-tight truncate">
          <div class="text-sm font-bold text-slate-900">Cakra Enterprise</div>
          <div class="text-[14px] font-medium uppercase tracking-wider text-slate-400">PT Adi Cakra Nata</div>
        </div>
      </RouterLink>

      <!-- Tombol Close Mobile -->
      <button type="button" @click="closeMobileSidebar" class="rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden cursor-pointer">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Section Label -->
    <div v-if="!isSidebarMini" class="px-4 pt-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Menu Utama</div>

    <!-- Navigation Tree -->
    <nav class="smooth-scroll flex-1 p-3 space-y-1">
      <SidebarTreeItem v-for="menu in navigation.visibleSidebar" :key="menu.id" :item="menu" :mini="isSidebarMini" />
    </nav>

    <!-- Collapse / Mini Toggle Footer (Desktop) -->
    <div class="hidden lg:flex border-t border-slate-100 p-2.5 justify-center">
      <button
        type="button"
        @click="toggleSidebarMini"
        class="flex w-full items-center justify-center gap-2 rounded-lg py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
        :title="isSidebarMini ? 'Perluas Sidebar' : 'Perkecil Sidebar'"
      >
        <PanelLeftOpen v-if="isSidebarMini" class="w-4 h-4" />
        <template v-else>
          <PanelLeftClose class="w-4 h-4" />
          <span>Perkecil Sidebar</span>
        </template>
      </button>
    </div>
  </aside>
</template>
