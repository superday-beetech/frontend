<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import PosIcon from "./PosIcon.vue"
import { formatCurrency } from "../../utils/format"
import type { ProductSearchResult } from "../../types/sales"
const props = defineProps<{ keyword: string; results: ProductSearchResult[]; loading?: boolean; disabled?: boolean }>()
const emit = defineEmits<{
  "update:keyword": [value: string]; search: []; enter: []; select: [product: ProductSearchResult]
}>()
const listRef = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)
watch(() => props.results, () => { activeIndex.value = -1 })
watch(activeIndex, async () => { await nextTick(); listRef.value?.querySelector(".is-active")?.scrollIntoView({ block: "nearest" }) })
function handleInput(event: Event): void { emit("update:keyword", (event.target as HTMLInputElement).value) }
function move(step: 1 | -1): void {
  const total = props.results.length
  if (!total) return
  activeIndex.value = activeIndex.value < 0 ? (step === 1 ? 0 : total - 1) : (activeIndex.value + step + total) % total
}
function handleEnter(): void {
  const picked = props.results[activeIndex.value]
  if (picked) emit("select", picked)
  else emit("enter")
}
function handleEscape(): void { if (props.results.length) emit("update:keyword", "") }
</script>

<template>
  <section class="pos-search-card">
    <label class="pos-field-label" for="pos-search-input"><PosIcon name="barcode" />Cari produk <kbd>F1</kbd></label>
    <div class="pos-search-box">
      <div class="pos-input-group">
        <span class="pos-input-addon"><PosIcon name="scan-line" /></span>
        <input id="pos-search-input" :value="keyword" type="text" class="pos-input" autocomplete="off" placeholder="Scan barcode, ketik SKU atau nama produk" :disabled="disabled" @input="handleInput" @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter.prevent="handleEnter" @keydown.esc="handleEscape" />
        <button type="button" class="pos-button pos-button-primary rounded-l-none" :disabled="loading || disabled" @click="emit('search')">
          <span v-if="loading" class="pos-spinner pos-spinner-sm" aria-hidden="true"></span><PosIcon v-else name="search" :size="15" />Cari
        </button>
      </div>
      <div v-if="results.length" ref="listRef" class="pos-search-results" role="listbox">
        <button v-for="(product, index) in results" :key="product.id" type="button" class="pos-result" :class="{ 'is-active': index === activeIndex }" role="option" :aria-selected="index === activeIndex" :disabled="disabled" @click="emit('select', product)">
          <span class="pos-result-info"><strong>{{ product.name }}</strong><small>{{ product.sku || "-" }}<template v-if="product.barcode"> · {{ product.barcode }}</template><template v-if="product.unit_name"> · {{ product.unit_name }}</template></small></span>
          <span class="pos-result-price"><strong>{{ formatCurrency(product.selling_price) }}</strong><small>{{ product.available_stock !== undefined ? `Stok: ${product.available_stock}` : "Stok diperiksa saat posting" }}</small></span>
        </button>
      </div>
    </div>
    <small class="pos-field-hint">Ketik nama atau SKU, tekan ↓ lalu Enter. Esc untuk menutup.</small>
  </section>
</template>
