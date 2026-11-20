<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  currentPage: number
  lastPage: number
  total: number
  perPage: number
}>()

defineEmits<{
  'update:page': [page: number]
}>()
</script>

<template>
  <div
    v-if="total > 0"
    class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-600"
  >
    <div>
      Menampilkan halaman
      <span class="font-semibold text-slate-800">{{ currentPage }}</span>
      dari
      <span class="font-semibold text-slate-800">{{ lastPage }}</span>
      (Total
      <span class="font-semibold text-slate-800">{{ total }}</span>
      data)
    </div>
    <div class="flex items-center gap-1.5">
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="$emit('update:page', currentPage - 1)"
        class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
        <span>Prev</span>
      </button>
      <button
        type="button"
        :disabled="currentPage >= lastPage"
        @click="$emit('update:page', currentPage + 1)"
        class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>Next</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
