<script setup lang="ts">
import AppSidebar from '@/app/layouts/components/AppSidebar.vue'
import AppTopbar from '@/app/layouts/components/AppTopbar.vue'
import AppFooter from '@/app/layouts/components/AppFooter.vue'
import QuickDrawer from '@/app/layouts/components/QuickDrawer.vue'
import FloatingChatButton from '@/app/layouts/components/FloatingChatButton.vue'
import { useSettingsStore } from '@/shared/stores/settings.store'
const settings = useSettingsStore()
</script>

<template>
  <div
    class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300"
  >
    <!-- Sidebar (Full / Mini / Mobile Drawer) -->
    <AppSidebar />

    <!-- Right Content Wrapper -->
    <div class="flex flex-1 flex-col overflow-hidden min-w-0">
      <!-- Topbar / Navbar -->
      <AppTopbar />

      <!-- Main Body Scroll Area -->
      <!-- Tambahkan pb-20 atau pb-24 agar konten paling bawah tidak tertutup tombol chat -->
      <main class="smooth-scroll flex-1 p-4 sm:p-6 overflow-y-auto">
        <div class="mx-auto max-w-7xl">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>

      <!-- Footer -->
      <AppFooter />
    </div>

    <!-- Quick Drawer / Offcanvas Pengaturan & Tema (Modular dari parts/) -->
    <QuickDrawer />

    <!-- Floating Chat Bantuan Otomatis -->
    <FloatingChatButton v-if="settings.get('Setting.Chat', false)" />
  </div>
</template>
