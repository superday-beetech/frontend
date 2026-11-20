<script setup lang="ts">
import { computed } from 'vue'
import BasePagination from './BasePagination.vue'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
    loading?: boolean
    itemLabel?: string
    perPageOptions?: { label: string; value: number }[]
  }>(),
  {
    loading: false,
    itemLabel: 'data',
  }
)

const emit = defineEmits<{
  (e: 'update:page', page: number): void
  (e: 'update:perPage', value: number): void
}>()

// ── Hitung range data yang sedang ditampilkan ──
const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.perPage + 1
})

const endItem = computed(() => {
  if (props.totalItems === 0) return 0
  // Ambil nilai terkecil antara akhir halaman saat ini atau total item
  return Math.min(props.currentPage * props.perPage, props.totalItems)
})
</script>

<template>
  <div v-if="totalItems > 0" class="pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 px-2.5 py-2">
    <!-- Kiri: Info range data -->
    <div class="text-sm text-slate-500 dark:text-slate-400">
      Menampilkan
      <span class="font-medium text-slate-900 dark:text-white">{{ startItem }}</span>
      -
      <span class="font-medium text-slate-900 dark:text-white">{{ endItem }}</span>
      dari
      <span class="font-medium text-slate-900 dark:text-white">{{ totalItems }}</span>
      {{ itemLabel }}
    </div>

    <!-- Kanan: Navigasi Halaman -->
    <BasePagination :current-page="currentPage" :total-pages="totalPages" :loading="loading" @update:page="emit('update:page', $event)" />
  </div>
</template>
