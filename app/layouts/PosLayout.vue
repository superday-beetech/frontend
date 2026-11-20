<script setup lang="ts">
import QuickDrawer from '@/app/layouts/components/QuickDrawer.vue'
import FloatingChatButton from '@/app/layouts/components/FloatingChatButton.vue'
import { useSettingsStore } from '@/shared/stores/settings.store'
const settings = useSettingsStore()
</script>
<template>
  <div class="fixed inset-0 overflow-hidden bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
    <!-- Main Body Scroll Area -->
    <!-- Tambahkan pb-20 atau pb-24 agar konten paling bawah tidak tertutup tombol chat -->
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Quick Drawer / Offcanvas Pengaturan & Tema (Modular dari parts/) -->
    <QuickDrawer />

    <!-- Floating Chat Bantuan Otomatis -->
    <FloatingChatButton v-if="settings.get('Setting.Chat', false)" />
  </div>
</template>
