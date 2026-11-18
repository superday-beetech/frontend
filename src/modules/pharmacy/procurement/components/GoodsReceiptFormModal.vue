<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

import purchaseOrderService from "../services/purchaseOrderService";
import type { PurchaseOrder } from "../types/purchaseOrder";
import type { GoodsReceiptPayload } from "../types/goodsReceipt";

interface PurchaseOrderOption {
  id: number;
  order_number: string;
  supplier_name?: string;
  status: string;
}

interface ReceiptFormItem {
  purchase_order_item_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  notes: string;
}

const emit = defineEmits<{
  select: [payload: GoodsReceiptPayload];
  close: [];
}>();

const loadingOrders = ref(false);
const loadingOrderDetail = ref(false);
const submitting = ref(false);

const purchaseOrders = ref<PurchaseOrderOption[]>([]);
const selectedOrder = ref<PurchaseOrder | null>(null);

const today = new Date().toISOString().slice(0, 10);

const form = reactive({
  receipt_number: "",
  purchase_order_id: 0,
  received_date: today,
  supplier_delivery_number: "",
  notes: "",
  items: [] as ReceiptFormItem[],
});

const canSubmit = computed(() => {
  return form.receipt_number.trim() !== "" && form.purchase_order_id > 0 && form.received_date !== "" && form.items.length > 0 && form.items.some((item) => item.quantity_received > 0);
});

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value || 0);

async function loadPurchaseOrders() {
  loadingOrders.value = true;

  try {
    const response = await purchaseOrderService.getAll({
      page: 1,
      per_page: 100,
    });

    const result = response.data;

    purchaseOrders.value = (result?.items ?? [])
      .filter((order: PurchaseOrder) => ["draft", "approved", "ordered", "partial"].includes(order.status))
      .map((order: PurchaseOrder) => ({
        id: order.id,
        order_number: order.order_number,
        supplier_name: order.supplier_name,
        status: order.status,
      }));
  } catch (error) {
    console.error("Gagal memuat Purchase Order:", error);
  } finally {
    loadingOrders.value = false;
  }
}

async function selectPurchaseOrder() {
  selectedOrder.value = null;
  form.items = [];

  if (!form.purchase_order_id) return;

  loadingOrderDetail.value = true;

  try {
    const response = await purchaseOrderService.getById(form.purchase_order_id);

    const order = response.data;

    if (!order) {
      selectedOrder.value = null;
      form.items = [];
      return;
    }

    form.items = (order.items ?? []).map((item) => ({
      purchase_order_item_id: Number(item.id),
      product_id: Number(item.product_id),
      product_name: item.product_name ?? "-",
      sku: item.sku ?? "-",
      quantity_ordered: Number(item.quantity),
      quantity_received: 0,
      unit_cost: Number(item.unit_cost),
      notes: "",
    }));
  } catch (error) {
    console.error("Gagal memuat detail PO:", error);
  } finally {
    loadingOrderDetail.value = false;
  }
}

function submit() {
  if (!canSubmit.value || submitting.value) return;

  const payload: GoodsReceiptPayload = {
    receipt_number: form.receipt_number.trim(),
    purchase_order_id: form.purchase_order_id,
    received_date: form.received_date,
    supplier_delivery_number: form.supplier_delivery_number.trim() || null,
    notes: form.notes.trim() || null,
    items: form.items
      .filter((item) => item.quantity_received > 0)
      .map((item) => ({
        purchase_order_item_id: item.purchase_order_item_id,
        quantity_received: item.quantity_received,
        unit_cost: item.unit_cost,
        notes: item.notes.trim() || null,
      })),
  };

  emit("select", payload);
}

onMounted(loadPurchaseOrders);
</script>

<template>
  <div class="goods-receipt-form">
    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nomor Penerimaan <span class="text-rose-600">*</span> </label>
      <input v-model="form.receipt_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Contoh: GR-2026-0001" />
    </div>

    <div class="grid grid-cols-12">
      <div class="col-span-12 md:col-span-6 mb-3">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Purchase Order <span class="text-rose-600">*</span> </label>

        <select v-model.number="form.purchase_order_id" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="loadingOrders || loadingOrderDetail" @change="selectPurchaseOrder">
          <option :value="0">
            {{ loadingOrders ? "Memuat PO..." : "Pilih PO" }}
          </option>
          <option v-for="order in purchaseOrders" :key="order.id" :value="order.id">
            {{ order.order_number }} -
            {{ order.supplier_name }}
          </option>
        </select>

        <small v-if="!loadingOrders && purchaseOrders.length === 0" class="text-slate-500"> Tidak ada PO yang dapat menerima barang. </small>
      </div>

      <div class="col-span-12 md:col-span-6 mb-3">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Tanggal Penerimaan <span class="text-rose-600">*</span> </label>
        <input v-model="form.received_date" type="date" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
      </div>
    </div>

    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nomor Surat Jalan Supplier</label>
      <input v-model="form.supplier_delivery_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nomor surat jalan" />
    </div>

    <div v-if="selectedOrder" class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 border mb-3">
      <div class="p-5 py-3">
        <div class="grid grid-cols-12">
          <div class="col-span-12 md:col-span-6">
            <small class="text-slate-500">Nomor PO</small>
            <div class="font-semibold">
              {{ selectedOrder.order_number }}
            </div>
          </div>
          <div class="col-span-12 md:col-span-6">
            <small class="text-slate-500">Supplier</small>
            <div class="font-semibold">
              {{ selectedOrder.supplier_name || "-" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadingOrderDetail" class="text-center py-4">
      <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm" />
      <span class="ms-2">Memuat detail PO...</span>
    </div>

    <template v-else-if="form.items.length > 0">
      <h6 class="font-semibold mb-3">Item Penerimaan</h6>

      <div class="w-full overflow-x-auto">
        <table class="w-full border-collapse text-sm table-bordered align-middle">
          <thead class="table-light">
            <tr>
              <th>Produk</th>
              <th class="text-right">Qty PO</th>
              <th style="width: 130px">Qty Diterima</th>
              <th class="text-right">Harga Satuan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in form.items" :key="item.purchase_order_item_id">
              <td>
                <div class="font-semibold">
                  {{ item.product_name }}
                </div>
                <small class="text-slate-500">
                  {{ item.sku }}
                </small>
              </td>
              <td class="text-right">
                {{ formatNumber(item.quantity_ordered) }}
              </td>
              <td>
                <input v-model.number="item.quantity_received" type="number" min="0" step="0.001" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 form-control-sm" />
              </td>
              <td class="text-right">
                {{ formatNumber(item.unit_cost) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <small class="text-slate-500"> Isi jumlah aktual yang diterima. Item dengan jumlah nol tidak akan dikirim. </small>
    </template>

    <div v-else-if="form.purchase_order_id > 0" class="rounded-lg border px-4 py-3 text-sm border-amber-200 bg-amber-50 text-amber-800">Purchase Order ini tidak memiliki item.</div>

    <div class="mb-3 mt-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
      <textarea v-model="form.notes" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="2" placeholder="Catatan penerimaan..." />
    </div>

    <div class="flex justify-end gap-2">
      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="submitting" @click="emit('close')">Batal</button>

      <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="!canSubmit || submitting" @click="submit">
        <span v-if="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1" />
        Simpan Draft
      </button>
    </div>
  </div>
</template>
