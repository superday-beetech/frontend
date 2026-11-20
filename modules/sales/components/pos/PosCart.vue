<script setup lang="ts">
import PosIcon from './PosIcon.vue'
import { formatCurrency } from '../../utils/format'
import PosPanel from './PosPanel.vue'
import PosCartItem from './PosCartItem.vue'
import PosConfirmDialog from './PosConfirmDialog.vue'
import { usePosHost } from '../../composables/usePosHost'
import type { PosCartItem as CartItem, DiscountMode } from '../../types/sales'

const props = defineProps<{ items: CartItem[]; subtotal: number; disabled?: boolean; shortcut?: string }>()
const emit = defineEmits<{
  quantityChange: [productId: number, value: number | null]
  priceChange: [productId: number, value: number]
  discountModeChange: [productId: number, value: DiscountMode]
  discountChange: [productId: number, value: number]
  noteChange: [productId: number, value: string]
  remove: [productId: number]
  clear: []
}>()
const host = usePosHost()
function handleClearCart(): void {
  if (!props.items.length || props.disabled) return
  host.openModal(PosConfirmDialog, {
    title: 'Konfirmasi Hapus',
    props: {
      message: 'Semua produk dalam keranjang akan dihapus. Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Kosongkan',
      confirmClass: 'danger',
      onSelect: (confirmed: boolean) => {
        if (confirmed) emit('clear')
      },
    },
  })
}
</script>
<template>
  <PosPanel
    title="Daftar Transaksi"
    :subtitle="`${items.length} jenis produk dalam transaksi`"
    icon="shopping-cart"
    tone="info"
    :shortcut="shortcut"
    flush
    scroll
  >
    <template #actions>
      <span class="pos-count">{{ items.length }} item</span>

      <button
        type="button"
        class="pos-button pos-button-soft-danger pos-button-sm"
        :disabled="!items.length || disabled"
        @click="handleClearCart"
      >
        <PosIcon name="trash-2" :size="14" />
        Kosongkan
      </button>
    </template>

    <div v-if="!items.length" class="pos-empty">
      <PosIcon name="shopping-cart" :size="34" />
      <strong>Keranjang masih kosong</strong>
      <span>Scan barcode atau cari produk untuk memulai transaksi.</span>
    </div>
    <div v-else class="flex flex-col h-full min-h-0">
      <!-- Area Tabel yang Bisa Scroll -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
            <tr class="border-b border-slate-200 dark:border-slate-800">
              <!-- Gabungkan No & Produk -->
              <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 w-10">#</th>
              <th class="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Nama Obat / Item</th>

              <!-- Kolom Harga -->
              <th class="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 w-24">Harga</th>

              <!-- Kolom QTY -->
              <th class="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 w-28">Qty</th>

              <!-- Kolom Disc -->
              <th class="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 w-24">Disc</th>

              <!-- Kolom Subtotal -->
              <th class="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 w-28">Sub</th>

              <!-- Kolom Aksi -->
              <th class="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 w-16">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <PosCartItem
              v-for="(item, index) in items"
              :key="item.product_id"
              :item="item"
              :index="index"
              :discount-mode="item.discount_mode ?? 'amount'"
              :discount-input="item.discount_value ?? item.discount_amount"
              :note="item.notes ?? ''"
              :disabled="disabled"
              @quantity-change="emit('quantityChange', item.product_id, $event)"
              @price-change="emit('priceChange', item.product_id, $event)"
              @discount-mode-change="emit('discountModeChange', item.product_id, $event)"
              @discount-change="emit('discountChange', item.product_id, $event)"
              @note-change="emit('noteChange', item.product_id, $event)"
              @remove="emit('remove', item.product_id)"
            />
          </tbody>
        </table>
      </div>
    </div>

    <template #footer>
      <span>
        Total item:
        <strong>{{ items.length }}</strong>
      </span>

      <span>
        Subtotal:
        <strong>{{ formatCurrency(subtotal) }}</strong>
      </span>
    </template>
  </PosPanel>
</template>
