<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LayoutGrid, ShoppingCart, Package, Users, BarChart3, ShieldCheck, Settings, ArrowUpRight } from 'lucide-vue-next'

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const shortcuts = [
  { title: 'POS Kasir', desc: 'Transaksi penjualan cepat', to: '/pharmacy/pos', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
  { title: 'Produk & Stok', desc: 'Master barang & batch', to: '/master/products', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
  { title: 'Pelanggan & Mitra', desc: 'Data member & supplier', to: '/master/customers', icon: Users, color: 'bg-amber-50 text-amber-600' },
  {
    title: 'Laporan Keuangan',
    desc: 'Omzet, laba & arus kas',
    to: '/reports/sales',
    icon: BarChart3,
    color: 'bg-purple-50 text-purple-600',
  },
  { title: 'Hak Akses & Role', desc: 'Atur grup & izin menu', to: '/system/roles', icon: ShieldCheck, color: 'bg-rose-50 text-rose-600' },
  { title: 'Pengaturan Sistem', desc: 'Profil toko & pajak', to: '/system/settings', icon: Settings, color: 'bg-slate-100 text-slate-700' },
]

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
      title="Pintasan Aplikasi"
      class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
      :class="{ 'bg-primary-50 text-primary-600': isOpen }"
    >
      <LayoutGrid class="w-4.5 h-4.5" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-98"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-98"
    >
      <div
        v-if="isOpen"
        class="fixed left-3 right-3 top-15 sm:absolute sm:left-0 sm:right-auto sm:top-auto sm:mt-2.5 sm:w-115 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50"
      >
        <div class="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h4 class="text-xs font-bold text-slate-800">Pintasan Modul & Aplikasi</h4>
            <p class="text-[11px] text-slate-400">Akses cepat ke fitur operasional utama</p>
          </div>
          <span class="rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">Cakra Suite</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <RouterLink
            v-for="item in shortcuts"
            :key="item.title"
            :to="item.to"
            @click="isOpen = false"
            class="group flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="item.color">
              <component :is="item.icon" class="w-4.5 h-4.5" />
            </div>
            <div class="flex-1 min-w-0 leading-tight">
              <div class="flex items-center justify-between gap-1">
                <span class="text-xs font-semibold text-slate-800 group-hover:text-primary-600 transition-colors truncate">
                  {{ item.title }}
                </span>
                <ArrowUpRight class="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5 truncate">{{ item.desc }}</div>
            </div>
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
