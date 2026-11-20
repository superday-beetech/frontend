<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-vue-next'

export interface TableColumnFull {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean // Pastikan baris ini ada
}

const props = withDefaults(
  defineProps<{
    columns: TableColumnFull[]
    rows: Record<string, any>[]
    searchable?: boolean
    filterable?: boolean
    filterOptions?: { label: string; value: string }[]
    filterKey?: string
    pageSizeOptions?: number[]
  }>(),
  {
    searchable: true,
    filterable: false,
    filterOptions: () => [],
    filterKey: 'category',
    pageSizeOptions: () => [5, 10, 25, 50],
  }
)

// State Pencarian & Filter
const searchQuery = ref('')
const selectedFilter = ref('')
const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

// State Pagination
const currentPage = ref(1)
const pageSize = ref(5)

// Kembali ke halaman 1 setiap kali hasil berubah (sebelumnya: cari saat di hal. 3 → tabel tampak kosong)
watch([searchQuery, selectedFilter, sortKey, sortOrder, pageSize], () => {
  currentPage.value = 1
})

const collator = new Intl.Collator('id-ID', { numeric: true, sensitivity: 'base' })

function compareValues(a: unknown, b: unknown): number {
  // null/undefined selalu di akhir, apa pun arah sort
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return collator.compare(String(a), String(b))
}

// 1. Logika Filter & Pencarian
const filteredRows = computed(() => {
  let result = [...props.rows]

  // Filter berdasarkan Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(q)))
  }

  // Filter berdasarkan Dropdown Kategori/Status
  if (selectedFilter.value) {
    result = result.filter((row) => String(row[props.filterKey]) === selectedFilter.value)
  }

  // Sorting (aman untuk angka, teks Indonesia, dan nilai kosong)
  if (sortKey.value) {
    const key = sortKey.value
    const dir = sortOrder.value === 'asc' ? 1 : -1
    result.sort((x, y) => {
      const ax = x[key]
      const ay = y[key]
      if (ax == null || ay == null) return compareValues(ax, ay) // kosong tetap di akhir
      return compareValues(ax, ay) * dir
    })
  }

  return result
})

// 2. Logika Pagination
const totalItems = computed(() => filteredRows.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value) || 1)

// Jika data berkurang (mis. setelah hapus) dan halaman aktif melebihi total, mundur ke halaman terakhir
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredRows.value.slice(start, end)
})

const startItemIndex = computed(() => (totalItems.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1))
const endItemIndex = computed(() => Math.min(currentPage.value * pageSize.value, totalItems.value))

function handleSort(column: TableColumnFull) {
  if (!column.sortable) return
  if (sortKey.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortOrder.value = 'asc'
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
    <!-- HEADER: PENCARIAN & FILTER CANGGIH -->
    <div
      v-if="searchable || filterable"
      class="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <!-- Input Pencarian -->
      <div v-if="searchable" class="relative w-full sm:w-72">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari data dalam tabel..."
          class="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20 transition-all"
        />
      </div>

      <!-- Filter Kategori / Status -->
      <div v-if="filterable && filterOptions.length > 0" class="flex items-center gap-2 w-full sm:w-auto">
        <span class="text-xs font-medium text-slate-500 flex items-center gap-1">
          <Filter class="w-3.5 h-3.5" />
          Filter:
        </span>
        <select
          v-model="selectedFilter"
          class="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-500/20 transition-all cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          <option v-for="opt in filterOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- TABEL UTAMA -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <th
              v-for="col in columns"
              :key="col.key"
              :style="{ width: col.width }"
              class="py-3 px-4 font-semibold select-none"
              :class="[
                col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left',
                col.sortable ? 'cursor-pointer hover:bg-slate-200/50 transition-colors' : '',
              ]"
              @click="handleSort(col)"
            >
              <div
                class="inline-flex items-center gap-1.5"
                :class="{ 'justify-center': col.align === 'center', 'justify-end': col.align === 'right' }"
              >
                {{ col.label }}
                <ArrowUpDown v-if="col.sortable" class="w-3 h-3 text-slate-400" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
          <tr v-for="(row, idx) in paginatedRows" :key="row.id ?? idx" class="hover:bg-slate-50/80 transition-colors">
            <td
              v-for="col in columns"
              :key="col.key"
              class="py-3 px-4 align-middle"
              :class="[col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left']"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>

          <!-- Jika Data Kosong -->
          <tr v-if="paginatedRows.length === 0">
            <td :colspan="columns.length" class="py-12 text-center text-slate-400">
              <div class="flex flex-col items-center justify-center space-y-2">
                <p class="text-sm font-semibold text-slate-600">Tidak ada data ditemukan</p>
                <p class="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter Anda.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- FOOTER: SHOW - TO - - & PAGINATION -->
    <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Info "Menampilkan X - Y dari Z data" -->
      <div class="text-xs text-slate-500">
        Menampilkan
        <span class="font-bold text-slate-800">{{ startItemIndex }}</span>
        s.d.
        <span class="font-bold text-slate-800">{{ endItemIndex }}</span>
        dari
        <span class="font-bold text-slate-800">{{ totalItems }}</span>
        data
      </div>

      <div class="flex items-center gap-4">
        <!-- Pilihan Page Size -->
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span>Baris per halaman:</span>
          <select
            v-model="pageSize"
            @change="currentPage = 1"
            class="rounded-lg border border-slate-300 bg-white py-1 px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary-500 cursor-pointer"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <!-- Tombol Navigasi Halaman -->
        <div class="flex items-center gap-1">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            type="button"
            class="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <span class="px-3 text-xs font-semibold text-slate-700">Hal. {{ currentPage }} dari {{ totalPages }}</span>

          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            type="button"
            class="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Halaman Berikutnya"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
