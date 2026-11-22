<script setup lang="ts">
import { formatCurrency, formatDateTime } from '@/modules/sales/utils/format'
import type { PurchaseOrder } from '../types/purchaseOrder'

defineProps<{
  order: PurchaseOrder
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="space-y-6">
    <!-- Header info -->
    <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Nomor PO</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.order_number }}</p>
      </div>

      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
        <div class="mt-1">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 ring-1 ring-inset ring-primary-600/20"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-primary-500" />
            {{ order.status }}
          </span>
        </div>
      </div>

      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Supplier</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ order.supplier_name || '-' }}</p>
        <p v-if="order.supplier_phone" class="text-xs text-slate-500">{{ order.supplier_phone }}</p>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Tanggal Order</p>
          <p class="mt-1 text-sm text-slate-900">{{ formatDateTime(order.order_date) }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Estimasi Kedatangan</p>
          <p class="mt-1 text-sm text-slate-900">{{ formatDateTime(order.expected_date) }}</p>
        </div>
      </div>

      <div class="sm:col-span-2">
        <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Alamat Supplier</p>
        <p class="mt-1 text-sm text-slate-900">{{ order.supplier_address || '-' }}</p>
      </div>
    </div>

    <!-- Items -->
    <div>
      <h3 class="mb-3 text-sm font-semibold text-slate-900">Daftar Produk</h3>

      <div class="overflow-x-auto rounded-lg ring-1 ring-slate-200">
        <table class="min-w-full divide-y divide-slate-200 text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Produk</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Qty</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Harga</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Diskon</th>
              <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Subtotal</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="item in order.items || []" :key="item.id" class="hover:bg-slate-50/60">
              <td class="px-4 py-3">
                <p class="font-medium text-slate-900">
                  {{ item.product_name || `Produk #${item.product_id}` }}
                </p>
                <p v-if="item.sku" class="text-xs text-slate-500">{{ item.sku }}</p>
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-slate-700">
                {{ Number(item.quantity).toLocaleString('id-ID') }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-slate-700">
                {{ formatCurrency(item.unit_cost) }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums text-slate-700">
                {{ formatCurrency(item.discount_amount) }}
              </td>
              <td class="px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                {{ formatCurrency(item.subtotal) }}
              </td>
            </tr>

            <tr v-if="!order.items?.length">
              <td colspan="5" class="px-4 py-8 text-center text-sm text-slate-500">Tidak ada item Purchase Order.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Summary -->
    <div class="flex justify-end">
      <dl class="w-full space-y-2 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200 sm:max-w-sm">
        <div class="flex items-center justify-between text-sm">
          <dt class="text-slate-600">Subtotal</dt>
          <dd class="font-medium tabular-nums text-slate-900">{{ formatCurrency(order.subtotal) }}</dd>
        </div>
        <div class="flex items-center justify-between text-sm">
          <dt class="text-slate-600">Diskon</dt>
          <dd class="font-medium tabular-nums text-slate-900">{{ formatCurrency(order.discount_amount) }}</dd>
        </div>
        <div class="flex items-center justify-between text-sm">
          <dt class="text-slate-600">Pajak</dt>
          <dd class="font-medium tabular-nums text-slate-900">{{ formatCurrency(order.tax_amount) }}</dd>
        </div>
        <div class="flex items-center justify-between border-t border-slate-200 pt-3">
          <dt class="text-sm font-semibold text-slate-900">Total</dt>
          <dd class="text-base font-bold tabular-nums text-primary-600">
            {{ formatCurrency(order.total_amount) }}
          </dd>
        </div>
      </dl>
    </div>

    <!-- Notes -->
    <div v-if="order.notes" class="rounded-lg border border-slate-200 bg-white p-4">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500">Catatan</p>
      <p class="mt-1 text-sm text-slate-700">{{ order.notes }}</p>
    </div>

    <!-- Actions -->
    <div class="flex justify-end border-t border-slate-200 pt-4">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50"
        @click="emit('close')"
      >
        Tutup
      </button>
    </div>
  </div>
</template>
