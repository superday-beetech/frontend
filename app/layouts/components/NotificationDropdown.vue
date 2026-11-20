<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bell, CheckCheck, AlertCircle, PackageCheck, Clock, X } from 'lucide-vue-next'
interface AppNotification {
  id: number
  title: string
  desc: string
  time: string
  read: boolean
  type: 'warning' | 'success' | 'info'
}

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const notifications = ref<AppNotification[]>([
  { id: 1, title: 'Stok Menipis', desc: 'Paracetamol 500mg tersisa 8 strip di gudang.', time: '5 mnt lalu', read: false, type: 'warning' },
  {
    id: 2,
    title: 'Transaksi Posted',
    desc: 'Invoice #INV-202611-0042 berhasil diselesaikan.',
    time: '24 mnt lalu',
    read: false,
    type: 'success',
  },
  {
    id: 3,
    title: 'Batch Mendekati Expired',
    desc: '2 batch obat akan kedaluwarsa dalam 30 hari.',
    time: '2 jam lalu',
    read: true,
    type: 'info',
  },
  {
    id: 4,
    title: 'Batch Mendekati Expired',
    desc: '2 batch obat akan kedaluwarsa dalam 30 hari.',
    time: '2 jam lalu',
    read: true,
    type: 'info',
  },
  {
    id: 5,
    title: 'Batch Mendekati Expired',
    desc: '2 batch obat akan kedaluwarsa dalam 30 hari.',
    time: '2 jam lalu',
    read: true,
    type: 'info',
  },
  {
    id: 6,
    title: 'Batch Mendekati Expired',
    desc: '2 batch obat akan kedaluwarsa dalam 30 hari.',
    time: '2 jam lalu',
    read: true,
    type: 'info',
  },
  {
    id: 7,
    title: 'Batch Mendekati Expired',
    desc: '2 batch obat akan kedaluwarsa dalam 30 hari.',
    time: '2 jam lalu',
    read: true,
    type: 'info',
  },
  {
    id: 8,
    title: 'Batch Mendekati Expired',
    desc: '2 batch obat akan kedaluwarsa dalam 30 hari.',
    time: '2 jam lalu',
    read: true,
    type: 'info',
  },
])

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

function markAllAsRead() {
  notifications.value.forEach((n) => (n.read = true))
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      type="button"
      @click="isOpen = !isOpen"
      title="Notifikasi"
      class="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
    >
      <Bell class="w-6 h-6" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white"
      >
        {{ unreadCount }}
      </span>
    </button>

    <div
      v-if="isOpen"
      class="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2.5 sm:w-80 md:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
    >
      <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div class="flex items-center gap-2">
          <h4 class="text-xs font-bold text-slate-800">Notifikasi</h4>
          <span v-if="unreadCount" class="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
            {{ unreadCount }} Baru
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Tombol Tandai Dibaca (Desktop & HP) -->
          <button
            v-if="unreadCount > 0"
            type="button"
            @click="markAllAsRead"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:underline cursor-pointer"
          >
            <CheckCheck class="w-3.5 h-3.5" />
            <span>Tandai dibaca</span>
          </button>

          <!-- Tombol Close (Hanya HP/Tablet < sm) -->
          <button
            type="button"
            @click="isOpen = false"
            class="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors sm:hidden cursor-pointer"
            title="Tutup"
          >
            <X class="size-4" />
          </button>
        </div>
      </div>

      <div class="smooth-scroll max-h-72 divide-y divide-slate-100">
        <div
          v-for="item in notifications"
          :key="item.id"
          @click="item.read = true"
          class="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
          :class="{ 'bg-blue-50/30': !item.read }"
        >
          <div
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            :class="{
              'bg-amber-50 text-amber-600': item.type === 'warning',
              'bg-emerald-50 text-emerald-600': item.type === 'success',
              'bg-blue-50 text-blue-600': item.type === 'info',
            }"
          >
            <AlertCircle v-if="item.type === 'warning'" class="w-4 h-4" />
            <PackageCheck v-else-if="item.type === 'success'" class="w-4 h-4" />
            <Clock v-else class="w-4 h-4" />
          </div>
          <div class="flex-1 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-slate-800">{{ item.title }}</span>
              <span class="text-[10px] text-slate-400">{{ item.time }}</span>
            </div>
            <p class="mt-0.5 text-[11px] text-slate-500 leading-snug">{{ item.desc }}</p>
          </div>
        </div>
      </div>

      <div class="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-center">
        <button type="button" class="text-xs font-medium text-primary-600 hover:underline cursor-pointer">Lihat Semua Aktivitas</button>
      </div>
    </div>
  </div>
</template>
