<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Home, ArrowLeft, Search, Compass, ShoppingCart, Pill, FileBarChart2, Sparkles, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

// Efek Spotlight mengikuti kursor mouse
const cardRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const isHovering = ref(false)

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

// Pencarian Cepat Rute / Modul Enterprise
const searchQuery = ref('')

const quickRoutes = [
  {
    name: 'Dashboard Utama',
    description: 'Ringkasan performa & analitik harian',
    path: '/',
    icon: Home,
    badge: 'Utama',
  },
  {
    name: 'Kasir POS',
    description: 'Transaksi penjualan & pembayaran cepat',
    path: '/pos',
    icon: ShoppingCart,
    badge: 'POS',
  },
  {
    name: 'Stok & Batch Obat',
    description: 'Manajemen inventaris & tanggal kedaluwarsa',
    path: '/pharmacy/inventory',
    icon: Pill,
    badge: 'Apotek',
  },
  {
    name: 'Laporan Penjualan',
    description: 'Rekapitulasi transaksi & audit kasir',
    path: '/reports',
    icon: FileBarChart2,
    badge: 'Laporan',
  },
]

const filteredRoutes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return quickRoutes
  return quickRoutes.filter(
    (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.badge.toLowerCase().includes(q)
  )
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 select-none"
  >
    <!-- Dekorasi Ambient Glow di Latar Belakang -->
    <div
      class="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary-500/15 dark:bg-primary-500/10 blur-3xl animate-pulse"
    />
    <div
      class="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/15 dark:bg-indigo-500/10 blur-3xl animate-pulse"
      style="animation-delay: 1.5s"
    />

    <!-- Pattern Grid Halus -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-size-[24px_24px] opacity-60"
    />

    <!-- Kontainer Utama Glassmorphism dengan Efek Spotlight -->
    <div
      ref="cardRef"
      @mousemove="handleMouseMove"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      class="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-slate-900/5 dark:shadow-black/40 overflow-hidden transition-all"
    >
      <!-- Interactive Cursor Spotlight Layer -->
      <div
        v-if="isHovering"
        class="pointer-events-none absolute -inset-px rounded-3xl opacity-100 transition-opacity duration-300"
        :style="{
          background: `radial-gradient(450px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.08), transparent 65%)`,
        }"
      />

      <!-- Header Badge Status -->
      <div class="flex flex-col items-center text-center space-y-4">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-primary-200/80 dark:border-primary-800/60 bg-primary-50/80 dark:bg-primary-950/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-700 dark:text-primary-300 shadow-2xs"
        >
          <Sparkles class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span>Error 404 • Halaman Tidak Ditemukan</span>
        </div>

        <!-- Tipografi 404 Besar dengan Gradien Mewah -->
        <div class="relative">
          <h1
            class="text-7xl sm:text-8xl font-black tracking-tighter bg-linear-to-br from-slate-900 via-primary-600 to-indigo-600 dark:from-white dark:via-primary-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-xs"
          >
            404
          </h1>
          <div class="mx-auto mt-1 h-1 w-16 rounded-full bg-linear-to-r from-primary-500 to-indigo-500" />
        </div>

        <!-- Pesan Utama & Informasi Path -->
        <div class="space-y-2 max-w-md">
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Jalur Navigasi Tidak Tersedia</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Alamat
            <code
              class="mx-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-600 dark:text-rose-400 break-all"
            >
              {{ route.fullPath }}
            </code>
            tidak ditemukan, telah dipindahkan, atau Anda tidak memiliki hak akses ke modul ini.
          </p>
        </div>

        <!-- Tombol Aksi Utama -->
        <div class="flex flex-wrap items-center justify-center gap-3 pt-2 w-full sm:w-auto">
          <button
            type="button"
            @click="goBack"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-95 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <button
            type="button"
            @click="navigateTo('/')"
            class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary-600/25 hover:bg-primary-700 active:scale-95 transition-all cursor-pointer"
          >
            <Home class="w-4 h-4" />
            <span>Ke Dashboard Utama</span>
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="my-7 border-t border-slate-200/70 dark:border-slate-800/80" />

      <!-- Pencarian Cepat & Pintasan Modul Interaktif -->
      <div class="space-y-3.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Compass class="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>Pintasan Cepat Modul</span>
          </div>
          <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ filteredRoutes.length }} tujuan tersedia</span>
        </div>

        <!-- Input Filter Rute Cepat -->
        <div class="relative">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari halaman tujuan (misal: Kasir, Apotek, Laporan)..."
            class="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-950/60 py-2.5 pl-10 pr-4 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
        </div>

        <!-- Grid Kartu Pintasan -->
        <div v-if="filteredRoutes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            v-for="item in filteredRoutes"
            :key="item.path"
            type="button"
            @click="navigateTo(item.path)"
            class="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 p-3 text-left hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-colors"
              >
                <component :is="item.icon" class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                    {{ item.name }}
                  </span>
                  <span
                    class="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400"
                  >
                    {{ item.badge }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {{ item.description }}
                </p>
              </div>
            </div>

            <ChevronRight
              class="w-4 h-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all"
            />
          </button>
        </div>

        <!-- Empty State Pencarian -->
        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 py-5 text-center text-xs text-slate-500 dark:text-slate-400"
        >
          Modul "
          <span class="font-semibold">{{ searchQuery }}</span>
          " tidak ditemukan dalam pintasan cepat.
        </div>
      </div>
    </div>
  </div>
</template>
