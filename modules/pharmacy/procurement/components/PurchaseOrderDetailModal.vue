<script setup lang="ts">
import type { PurchaseOrder } from "../types/purchaseOrder";

defineProps<{
  order: PurchaseOrder;
}>();

const emit = defineEmits<{
  close: [];
}>();

function currency(value: number | string | null | undefined) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function date(value?: string | null) {
  if (!value) return "-";

  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
</script>

<template>
  <div>
    <div class="grid grid-cols-12 g-3 mb-4">
      <div class="col-span-12 md:col-span-6">
        <small class="text-slate-500">Nomor PO</small>
        <div class="font-semibold">{{ order.order_number }}</div>
      </div>

      <div class="col-span-12 md:col-span-6">
        <small class="text-slate-500">Status</small>
        <div>
          <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-light-primary text-primary-600">
            {{ order.status }}
          </span>
        </div>
      </div>

      <div class="col-span-12 md:col-span-6">
        <small class="text-slate-500">Supplier</small>
        <div class="font-semibold">
          {{ order.supplier_name || "-" }}
        </div>
        <small class="text-slate-500">
          {{ order.supplier_phone || "" }}
        </small>
      </div>

      <div class="col-span-12 md:col-span-6">
        <small class="text-slate-500">Tanggal Order</small>
        <div>{{ date(order.order_date) }}</div>

        <small class="text-slate-500">Estimasi Kedatangan</small>
        <div>{{ date(order.expected_date) }}</div>
      </div>

      <div class="col-span-12">
        <small class="text-slate-500">Alamat Supplier</small>
        <div>{{ order.supplier_address || "-" }}</div>
      </div>
    </div>

    <h6 class="font-semibold mb-3">Daftar Produk</h6>

    <div class="w-full overflow-x-auto">
      <table class="w-full border-collapse text-sm table-bordered align-middle">
        <thead class="table-light">
          <tr>
            <th>Produk</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Harga</th>
            <th class="text-right">Diskon</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in order.items || []" :key="item.id">
            <td>
              <div class="font-semibold">
                {{ item.product_name || `Produk #${item.product_id}` }}
              </div>
              <small class="text-slate-500">
                {{ item.sku || "" }}
              </small>
            </td>

            <td class="text-right">
              {{ Number(item.quantity).toLocaleString("id-ID") }}
            </td>

            <td class="text-right">
              {{ currency(item.unit_cost) }}
            </td>

            <td class="text-right">
              {{ currency(item.discount_amount) }}
            </td>

            <td class="text-right">
              {{ currency(item.subtotal) }}
            </td>
          </tr>

          <tr v-if="!order.items?.length">
            <td colspan="5" class="text-center text-slate-500 py-4">Tidak ada item Purchase Order.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid grid-cols-12 justify-end">
      <div class="col-md-5">
        <div class="flex justify-between mb-2">
          <span>Subtotal</span>
          <strong>{{ currency(order.subtotal) }}</strong>
        </div>

        <div class="flex justify-between mb-2">
          <span>Diskon</span>
          <strong>{{ currency(order.discount_amount) }}</strong>
        </div>

        <div class="flex justify-between mb-2">
          <span>Pajak</span>
          <strong>{{ currency(order.tax_amount) }}</strong>
        </div>

        <div class="flex justify-between border-top pt-3">
          <strong>Total</strong>
          <strong class="text-primary-600">
            {{ currency(order.total_amount) }}
          </strong>
        </div>
      </div>
    </div>

    <div v-if="order.notes" class="mt-3">
      <small class="text-slate-500">Catatan</small>
      <p class="mb-0">{{ order.notes }}</p>
    </div>

    <div class="text-right mt-4">
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="emit('close')">Tutup</button>
    </div>
  </div>
</template>
