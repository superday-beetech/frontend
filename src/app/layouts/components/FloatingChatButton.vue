<script setup lang="ts">
import { MessageCircle, X } from 'lucide-vue-next'
import { ref } from 'vue'

const isOpen = ref(false)
</script>

<template>
  <div class="fixed bottom-6 right-6 z-40">
    <!-- Popover Kotak Chat (Muncul saat tombol diklik) -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-2 opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute bottom-16 right-0 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
      >
        <!-- Header Box Chat -->
        <div class="flex items-center justify-between bg-primary-600 px-4 py-3 text-white">
          <div class="flex items-center gap-2.5">
            <div class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <div>
              <h4 class="text-xs font-bold tracking-wide">Asisten AI Cakra Enterprise</h4>
              <p class="text-[10px] text-primary-100">Online • Siap membantu operasional kasir & stok</p>
            </div>
          </div>
          <button
            @click="isOpen = false"
            type="button"
            class="rounded-lg p-1 text-primary-100 hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Chat / Riwayat Pesan -->
        <div class="p-4 h-64 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/50 text-xs smooth-scroll">
          <div class="flex gap-2">
            <div
              class="h-7 w-7 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 flex items-center justify-center font-bold shrink-0 text-[10px]"
            >
              AI
            </div>
            <div
              class="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 p-3 shadow-2xs border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            >
              Halo! Ada yang bisa saya bantu terkait transaksi POS, stok apotek, atau rekap laporan hari ini?
            </div>
          </div>
        </div>

        <!-- Input Bar Chat -->
        <div class="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ketik pertanyaan atau perintah..."
            class="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary-500"
          />
          <button
            type="button"
            class="rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-all cursor-pointer"
          >
            Kirim
          </button>
        </div>
      </div>
    </transition>

    <!-- Tombol Utama Mengambang (Floating Action Button) -->
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl shadow-primary-600/30 hover:bg-primary-700 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      title="Buka Chat Bantuan Otomatis"
    >
      <!-- Efek Gelombang Ping di Belakang Tombol -->
      <span class="absolute inset-0 rounded-full bg-primary-400/30 animate-ping pointer-events-none"></span>

      <MessageCircle class="w-6 h-6 transition-transform group-hover:rotate-12" />
    </button>
  </div>
</template>
