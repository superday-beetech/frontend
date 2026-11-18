<script setup lang="ts">
import { computed } from "vue"
import { RouterLink } from "vue-router"
import PosIcon from "../components/pos/PosIcon.vue"

const today = computed(() => new Intl.DateTimeFormat("id-ID", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
}).format(new Date()))

const statistics = [
  { label: "Penjualan Hari Ini", value: "—", description: "Total nilai penjualan", icon: "banknote", tone: "primary" },
  { label: "Transaksi Hari Ini", value: "—", description: "Jumlah transaksi berhasil", icon: "receipt", tone: "success" },
  { label: "Transaksi Draft", value: "—", description: "Menunggu penyelesaian", icon: "clock-3", tone: "warning" },
  { label: "Rata-rata Transaksi", value: "—", description: "Nilai rata-rata penjualan", icon: "chart-column", tone: "info" },
]
const shortcuts = [
  { title: "Transaksi Baru", description: "Mulai melayani pelanggan.", icon: "shopping-cart", path: "/sales/pos", tone: "primary" },
  { title: "Riwayat Penjualan", description: "Lihat transaksi penjualan.", icon: "receipt", path: "/sales/history", tone: "success" },
  { title: "Daftar Produk", description: "Cari informasi produk.", icon: "package", path: "/pharmacy/master/products", tone: "info" },
  { title: "Laporan Penjualan", description: "Lihat laporan penjualan.", icon: "chart-line", path: "/pharmacy/reports/sales", tone: "warning" },
]
</script>

<template>
  <div class="space-y-6 pb-6">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div class="mb-1 text-xs font-bold tracking-[.18em] text-primary-600">POINT OF SALE</div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard POS</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Selamat datang di sistem kasir apotek.</p>
      </div>
      <div class="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"><PosIcon name="calendar-days" :size="15" />{{ today }}</div>
    </header>

    <section class="relative isolate flex min-h-52 items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-primary-700 px-6 py-8 text-white shadow-lg sm:px-9">
      <div class="relative z-10 max-w-xl">
        <span class="text-[10px] font-extrabold tracking-[.22em] text-blue-200">PHARMACY POINT OF SALE</span>
        <h2 class="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Kelola Penjualan Lebih Mudah</h2>
        <p class="mt-2 max-w-lg text-sm leading-6 text-blue-100">Mulai transaksi, kelola pembayaran, dan pantau aktivitas penjualan apotek dari satu tempat.</p>
        <RouterLink to="/sales/pos" class="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">
          <PosIcon name="shopping-cart" :size="17" />Mulai Transaksi<PosIcon name="arrow-right" :size="16" />
        </RouterLink>
      </div>
      <PosIcon name="hospital" :size="150" class="absolute -right-2 bottom-0 z-0 text-white/10 sm:right-10" />
    </section>

    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in statistics" :key="item.label" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ item.label }}</div>
            <div class="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{{ item.value }}</div>
            <small class="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{{ item.description }}</small>
          </div>
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl" :class="{
            'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300': item.tone === 'primary',
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300': item.tone === 'success',
            'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300': item.tone === 'warning',
            'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300': item.tone === 'info',
          }"><PosIcon :name="item.icon" :size="22" /></div>
        </div>
      </article>
    </section>

    <section class="space-y-3">
      <div><h2 class="text-base font-bold text-slate-900 dark:text-white">Akses Cepat</h2><p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Pilih aktivitas yang ingin dilakukan.</p></div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RouterLink v-for="item in shortcuts" :key="item.title" :to="item.path" class="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-800">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl" :class="{
            'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300': item.tone === 'primary',
            'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300': item.tone === 'success',
            'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300': item.tone === 'info',
            'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300': item.tone === 'warning',
          }"><PosIcon :name="item.icon" :size="20" /></div>
          <div class="min-w-0 flex-1"><h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">{{ item.title }}</h3><p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ item.description }}</p></div>
          <PosIcon name="chevron-right" class="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
        </RouterLink>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center justify-between gap-3">
          <div><h2 class="text-base font-bold text-slate-900 dark:text-white">Aktivitas Penjualan</h2><p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Ringkasan aktivitas transaksi terbaru.</p></div>
          <PosIcon name="activity" :size="22" class="text-primary-600" />
        </div>
        <div class="flex min-h-48 flex-col items-center justify-center py-8 text-center">
          <PosIcon name="receipt" :size="36" class="mb-3 text-slate-300 dark:text-slate-600" />
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Belum ada data aktivitas</h3>
          <p class="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">Aktivitas penjualan akan ditampilkan setelah data transaksi dihubungkan.</p>
        </div>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Transaksi Ditahan</h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Draft yang belum diselesaikan.</p>
        <div class="flex min-h-36 flex-col items-center justify-center py-6 text-center">
          <PosIcon name="clock-3" :size="32" class="mb-3 text-slate-300 dark:text-slate-600" />
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Belum ada transaksi ditahan</h3>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Transaksi draft akan muncul di bagian ini.</p>
        </div>
        <RouterLink to="/pharmacy/sales/pos" class="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-primary-200 px-3 py-2 text-xs font-bold text-primary-700 transition hover:bg-primary-50 dark:border-primary-900 dark:text-primary-300 dark:hover:bg-primary-500/10">Buka Kasir</RouterLink>
      </article>
    </section>
  </div>
</template>
