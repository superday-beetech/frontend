<script setup lang="ts">
import { SunMoon } from 'lucide-vue-next'
import { useLayout } from '@/app/layouts/useLayout'
import BaseOffcanvas from '@/shared/components/ui/overlay/BaseOffcanvas.vue'
import BaseThemeToggle from '@/shared/components/ui/primitives/BaseThemeToggle.vue'

const { isQuickDrawerOpen } = useLayout()
</script>

<template>
  <!-- Gunakan v-model:modelValue atau v-model langsung -->
  <BaseOffcanvas v-model="isQuickDrawerOpen" title="Panel Cepat & Pengaturan">
    <div class="space-y-6">
      <!-- Pengaturan Tema (Dark / Light Mode) -->
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <SunMoon class="w-4 h-4 text-primary-600 dark:text-primary-400" />
          Tema Tampilan
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Ubah mode tampilan antarmuka Cakra Enterprise. Preferensi disimpan di perangkat ini dan mengikuti pengaturan sistem bila belum dipilih.
        </p>
        <div class="pt-1">
          <BaseThemeToggle />
        </div>
      </div>

      <hr class="border-slate-100 dark:border-slate-800" />

      <!-- Informasi Sesi Aktif -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Informasi Sesi Aktif</h4>
        <div
          class="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300"
        >
          <div class="flex justify-between">
            <span>Enterprise:</span>
            <span class="font-semibold">PT ADI CAKRA NATA</span>
          </div>
          <div class="flex justify-between">
            <span>Modul:</span>
            <span class="font-semibold">POS & Apotek</span>
          </div>
          <div class="flex justify-between">
            <span>Storage:</span>
            <span class="font-semibold text-emerald-600">Local Storage</span>
          </div>
        </div>
      </div>
    </div>
  </BaseOffcanvas>
</template>
