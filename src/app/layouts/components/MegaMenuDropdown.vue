<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { LayoutGrid, Package, Users, ShoppingCart, Boxes, BarChart3, ClipboardList, ArrowUpRight } from 'lucide-vue-next'
import { useAuthStore, type DynamicMenu } from '@/modules/auth'

const router = useRouter()
const auth = useAuthStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const shortcutDefinitions = [
  { title: 'Produk & Obat', desc: 'Master produk dan batch', to: '/pharmacy/master/products', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
  { title: 'Pelanggan', desc: 'Data pelanggan', to: '/pharmacy/master/customers', icon: Users, color: 'bg-amber-50 text-amber-600' },
  { title: 'Pengadaan', desc: 'Pesanan pembelian', to: '/pharmacy/procurement/purchase-orders', icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
  { title: 'Persediaan', desc: 'Ringkasan stok', to: '/pharmacy/inventory/overview', icon: Boxes, color: 'bg-violet-50 text-violet-600' },
  { title: 'Keuangan', desc: 'Dashboard keuangan', to: '/pharmacy/finance/dashboard', icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
  { title: 'Laporan Stok', desc: 'Ringkasan persediaan', to: '/pharmacy/reports/stock-summary', icon: ClipboardList, color: 'bg-rose-50 text-rose-600' },
]

function collectPaths(items: DynamicMenu[], paths = new Set<string>()) {
  for (const item of items) {
    if (item.component_key && item.path) paths.add(item.path)
    if (item.children?.length) collectPaths(item.children, paths)
  }
  return paths
}

const shortcuts = computed(() => {
  const availablePaths = collectPaths(auth.visibleMenus)
  return shortcutDefinitions.filter((item) => {
    return availablePaths.has(item.to) && router.resolve(item.to).name !== 'NotFound'
  })
})

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
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
      aria-label="Pintasan Aplikasi"
      :aria-expanded="isOpen"
      class="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
      :class="{ 'bg-primary-50 text-primary-600': isOpen }"
    >
      <LayoutGrid class="h-4.5 w-4.5" />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-1 scale-98 opacity-0"
      enter-to-class="translate-y-0 scale-100 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 scale-100 opacity-100"
      leave-to-class="translate-y-1 scale-98 opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed left-3 right-3 top-15 z-50 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:absolute sm:left-0 sm:right-auto sm:top-auto sm:mt-2.5 sm:w-115"
      >
        <div class="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h4 class="text-xs font-bold text-slate-800">Pintasan Modul & Aplikasi</h4>
            <p class="text-[11px] text-slate-400">Akses cepat ke fitur yang tersedia untuk akun ini</p>
          </div>
          <span class="rounded-md bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700">Cakra Suite</span>
        </div>

        <div v-if="shortcuts.length" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <RouterLink
            v-for="item in shortcuts"
            :key="item.to"
            :to="item.to"
            @click="isOpen = false"
            class="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-slate-200/80 hover:bg-slate-50"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="item.color">
              <component :is="item.icon" class="h-4.5 w-4.5" />
            </div>
            <div class="min-w-0 flex-1 leading-tight">
              <div class="flex items-center justify-between gap-1">
                <span class="truncate text-xs font-semibold text-slate-800 transition-colors group-hover:text-primary-600">{{ item.title }}</span>
                <ArrowUpRight class="h-3 w-3 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div class="mt-0.5 truncate text-[11px] text-slate-400">{{ item.desc }}</div>
            </div>
          </RouterLink>
        </div>
        <p v-else class="rounded-lg bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">
          Belum ada pintasan yang tersedia untuk akun ini.
        </p>
      </div>
    </Transition>
  </div>
</template>
