<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import PosIcon from './PosIcon.vue'
import { formatCurrency } from '../../utils/format'
import type { ProductSearchResult } from '../../types/sales'
const props = defineProps<{ keyword: string; results: ProductSearchResult[]; loading?: boolean; disabled?: boolean }>()
const emit = defineEmits<{
  'update:keyword': [value: string]
  search: []
  enter: []
  select: [product: ProductSearchResult]
}>()
const listRef = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)
watch(
  () => props.results,
  () => {
    activeIndex.value = -1
  }
)
watch(activeIndex, async () => {
  await nextTick()
  listRef.value?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' })
})
function handleInput(event: Event): void {
  emit('update:keyword', (event.target as HTMLInputElement).value)
}
function move(step: 1 | -1): void {
  const total = props.results.length
  if (!total) return
  activeIndex.value = activeIndex.value < 0 ? (step === 1 ? 0 : total - 1) : (activeIndex.value + step + total) % total
}
function handleEnter(): void {
  const picked = props.results[activeIndex.value]
  if (picked) emit('select', picked)
  else emit('enter')
}
function handleEscape(): void {
  if (props.results.length) emit('update:keyword', '')
}
</script>

<template>
  <section class="pos-search-card p-3">
    <!-- Label & Shortcut -->
    <div class="flex items-center justify-between mb-2">
      <label class="pos-field-label mb-0! text-xs font-bold" for="pos-search-input">
        <PosIcon name="barcode" class="text-primary-600" />
        Cari Produk
      </label>
      <kbd class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">F1</kbd>
    </div>

    <!-- Input Group (Ringkas) -->
    <div class="pos-search-box relative">
      <div class="relative flex items-center">
        <PosIcon name="scan-line" class="absolute left-3 text-slate-400" />

        <input
          id="pos-search-input"
          :value="keyword"
          type="text"
          class="pos-input pl-10 pr-12 w-full bg-slate-50 focus:bg-white transition-colors"
          autocomplete="off"
          placeholder="Scan barcode, ketik SKU atau nama..."
          :disabled="disabled"
          @input="handleInput"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="handleEnter"
          @keydown.esc="handleEscape"
        />

        <!-- Tombol Enter / Spinner di Kanan -->
        <div class="absolute right-2 flex items-center gap-1">
          <span v-if="loading" class="pos-spinner pos-spinner-sm text-primary-600" aria-hidden="true"></span>
          <span v-else class="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 pointer-events-none">Enter</span>
        </div>
      </div>

      <!-- Dropdown Hasil Pencarian -->
      <div v-if="results.length" ref="listRef" class="pos-search-results" role="listbox">
        <button
          v-for="(product, index) in results"
          :key="product.id"
          type="button"
          class="pos-result"
          :class="{ 'is-active': index === activeIndex }"
          role="option"
          :aria-selected="index === activeIndex"
          :disabled="disabled"
          @click="emit('select', product)"
        >
          <span class="pos-result-info">
            <strong>{{ product.name }}</strong>
            <small>
              {{ product.sku || '-' }}
              <template v-if="product.barcode">· {{ product.barcode }}</template>
            </small>
          </span>
          <span class="pos-result-price">
            <strong>{{ formatCurrency(product.selling_price) }}</strong>
            <small>{{ product.stock_available !== undefined ? `Stok: ${product.stock_available}` : 'Stok dicek saat bayar' }}</small>
          </span>
        </button>
      </div>
    </div>
    <!-- Hint Kecil -->
    <small class="text-[10px] text-slate-400 mt-1.5 block">Tekan Enter untuk mencari, ↓ ↑ untuk navigasi.</small>
  </section>
</template>
