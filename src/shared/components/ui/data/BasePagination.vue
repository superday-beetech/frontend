<script setup lang="ts">
import { computed } from 'vue'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    loading?: boolean
    // Opsi untuk menampilkan tombol "Pertama" dan "Akhir"
    showEdges?: boolean
    // Opsi untuk menampilkan tombol "Sebelumnya" dan "Selanjutnya" dengan teks
    showPrevNextText?: boolean
  }>(),
  {
    loading: false,
    showEdges: true,
    showPrevNextText: false, // Default diubah menjadi false (pakai ikon)
  }
)

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

// Logika untuk menentukan halaman mana saja yang ditampilkan
const visiblePages = computed<(number | string)[]>(() => {
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

function changePage(page: number) {
  if (props.loading || page < 1 || page > props.totalPages || page === props.currentPage) {
    return
  }
  emit('update:page', page)
}
</script>

<template>
  <nav aria-label="Pagination">
    <ul class="inline-flex items-center -space-x-px text-sm">
      <!-- Tombol Pertama (Icon ChevronsLeft) -->
      <li v-if="showEdges">
        <button
          class="flex h-8 w-8 items-center justify-center rounded-l-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          :disabled="currentPage === 1 || loading"
          title="Halaman Pertama"
          @click="changePage(1)"
        >
          <ChevronsLeft class="w-4 h-4" />
        </button>
      </li>

      <!-- Tombol Sebelumnya (Icon ChevronLeft) -->
      <li>
        <button
          class="flex h-8 w-8 items-center justify-center border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          :class="{ 'rounded-l-lg': !showEdges }"
          :disabled="currentPage === 1 || loading"
          title="Halaman Sebelumnya"
          @click="changePage(currentPage - 1)"
        >
          <span v-if="showPrevNextText">Sebelumnya</span>
          <ChevronLeft v-else class="w-4 h-4" />
        </button>
      </li>

      <!-- Angka Halaman -->
      <li v-for="(page, index) in visiblePages" :key="`${page}-${index}`">
        <!-- Elipsis -->
        <span
          v-if="page === '...'"
          class="flex h-8 w-8 items-center justify-center border border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          ...
        </span>
        <!-- Tombol Angka -->
        <button
          v-else
          class="flex h-8 min-w-8 items-center justify-center border px-2.5 transition-colors disabled:opacity-50"
          :class="
            page === currentPage
              ? 'bg-primary-600 text-white border-primary-600 z-10 font-medium'
              : 'border-slate-300 bg-white text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          "
          :disabled="loading"
          @click="changePage(Number(page))"
        >
          {{ page }}
        </button>
      </li>

      <!-- Tombol Selanjutnya (Icon ChevronRight) -->
      <li>
        <button
          class="flex h-8 w-8 items-center justify-center border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          :class="{ 'rounded-r-lg': !showEdges }"
          :disabled="currentPage === totalPages || loading"
          title="Halaman Selanjutnya"
          @click="changePage(currentPage + 1)"
        >
          <span v-if="showPrevNextText">Selanjutnya</span>
          <ChevronRight v-else class="w-4 h-4" />
        </button>
      </li>

      <!-- Tombol Akhir (Icon ChevronsRight) -->
      <li v-if="showEdges">
        <button
          class="flex h-8 w-8 items-center justify-center rounded-r-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          :disabled="currentPage === totalPages || loading"
          title="Halaman Terakhir"
          @click="changePage(totalPages)"
        >
          <ChevronsRight class="w-4 h-4" />
        </button>
      </li>
    </ul>
  </nav>
</template>
