<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { http as api } from "@/core/api/client";
import { useToast } from "@/shared/composables/useToast";

interface SaleItem {
  id: number;
  product_id: number;
  product_name?: string;
  sku?: string;
  batch_id: number;
  batch_number?: string;
  quantity: number | string;
  unit_price: number | string;
}
interface Sale {
  id: number;
  sale_number: string;
  sale_date: string;
  status: string;
  items?: SaleItem[];
}
interface ReturnLine extends SaleItem {
  return_quantity: number;
  restockable: boolean;
  condition_notes: string;
}

const router = useRouter();
const toast = useToast();
const sales = ref<Sale[]>([]);
const selectedSaleId = ref<number | "">("");
const selectedSale = ref<Sale | null>(null);
const lines = ref<ReturnLine[]>([]);
const loading = ref(false);
const loadingSale = ref(false);
const saving = ref(false);
const posting = ref(false);
const returnId = ref<number | null>(null);
const returnNumber = ref("");
const returnDate = new Date().toISOString().slice(0, 10);
const reason = ref("");
const notes = ref("");

const selectedLines = computed(() => lines.value.filter((line) => line.return_quantity > 0));
const totalQuantity = computed(() => selectedLines.value.reduce((sum, line) => sum + line.return_quantity, 0));

function responseData(response: any) {
  return response?.data?.data ?? response?.data ?? {};
}
function makeReturnNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `POSR-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}
function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

async function loadSales() {
  loading.value = true;
  try {
    const response = await api.get("/pharmacy/sales-api", { params: { page: 1, per_page: 100, status: "posted" } });
    const data = responseData(response);
    const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];
    sales.value = rows.filter((sale: Sale) => sale.status === "posted");
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal memuat transaksi POS.", "error");
  } finally {
    loading.value = false;
  }
}

async function loadSale() {
  selectedSale.value = null;
  lines.value = [];
  returnId.value = null;
  if (!selectedSaleId.value) return;
  loadingSale.value = true;
  try {
    const response = await api.get(`/pharmacy/sales-api/show/${selectedSaleId.value}`);
    const sale = responseData(response) as Sale;
    if (!sale || sale.status !== "posted") throw new Error("Hanya transaksi POS posted yang dapat diretur.");
    selectedSale.value = sale;
    lines.value = (sale.items ?? []).map((item) => ({
      ...item,
      return_quantity: 0,
      restockable: true,
      condition_notes: "",
    }));
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? error.message ?? "Gagal memuat detail penjualan.", "error");
  } finally {
    loadingSale.value = false;
  }
}

async function createDraft() {
  if (!selectedSale.value || selectedLines.value.length === 0) {
    toast.error("Pilih transaksi dan masukkan jumlah retur.", "error");
    return;
  }
  for (const line of selectedLines.value) {
    if (line.return_quantity <= 0 || line.return_quantity > Number(line.quantity)) {
      toast.error(`Kuantitas retur ${line.product_name ?? line.sku ?? "produk"} tidak valid.`, "error");
      return;
    }
  }
  saving.value = true;
  try {
    returnNumber.value ||= makeReturnNumber();
    const response = await api.post("/pharmacy/returns-api/create-sales", {
      return_number: returnNumber.value,
      sale_id: selectedSale.value.id,
      return_date: returnDate,
      reason,
      notes,
      items: selectedLines.value.map((line) => ({
        sale_item_id: line.id,
        quantity: line.return_quantity,
        restockable: line.restockable,
        condition_notes: line.condition_notes || null,
      })),
    });
    returnId.value = Number(responseData(response)?.return_id);
    toast.success("Draft retur POS berhasil dibuat.", "success");
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal membuat draft retur POS.", "error");
  } finally {
    saving.value = false;
  }
}

async function postReturn() {
  if (!returnId.value) return;
  if (!window.confirm("Posting retur ini? Stok batch yang layak akan dikembalikan.")) return;
  posting.value = true;
  try {
    await api.post(`/pharmacy/returns-api/post-sales/${returnId.value}`);
    toast.success("Retur POS berhasil diposting dan stok diperbarui.", "success");
    router.push("/pharmacy/returns/sales");
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal posting retur POS.", "error");
  } finally {
    posting.value = false;
  }
}

onMounted(() => {
  returnNumber.value = makeReturnNumber();
  loadSales();
});
</script>

<template>
  <div class="w-full space-y-4">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h4 class="mb-1">Retur Penjualan POS</h4>
        <p class="text-slate-500 mb-0">Retur langsung dari item transaksi POS dan batch asalnya.</p>
      </div>
      <button type="button" class="btn btn-light" @click="router.back()">Kembali</button>
    </div>

    <div class="rounded-2xl border bg-white p-5 dark:bg-slate-900">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label class="block text-sm">
          <span class="mb-1 block font-medium">Nomor Retur</span>
          <input v-model="returnNumber" class="form-control w-full" :disabled="!!returnId || saving" />
        </label>
        <label class="block text-sm">
          <span class="mb-1 block font-medium">Tanggal Retur</span>
          <input :value="returnDate" type="date" class="form-control w-full" disabled />
        </label>
        <label class="block text-sm">
          <span class="mb-1 block font-medium">Transaksi POS</span>
          <select v-model="selectedSaleId" class="form-select w-full" :disabled="loading || loadingSale || !!returnId" @change="loadSale">
            <option value="">Pilih transaksi posted</option>
            <option v-for="sale in sales" :key="sale.id" :value="sale.id">{{ sale.sale_number }} — {{ sale.sale_date }}</option>
          </select>
          <small v-if="loading" class="text-slate-500">Memuat transaksi...</small>
        </label>
        <label class="block text-sm md:col-span-3">
          <span class="mb-1 block font-medium">Alasan Retur</span>
          <input v-model="reason" class="form-control w-full" :disabled="!!returnId || saving" placeholder="Alasan pengembalian" />
        </label>
        <label class="block text-sm md:col-span-3">
          <span class="mb-1 block font-medium">Catatan</span>
          <textarea v-model="notes" class="form-control w-full" rows="2" :disabled="!!returnId || saving"></textarea>
        </label>
      </div>
    </div>

    <div class="rounded-2xl border bg-white p-5 dark:bg-slate-900">
      <h5 class="mb-3">Item Penjualan</h5>
      <div v-if="loadingSale" class="py-5 text-center text-slate-500">Memuat detail...</div>
      <div v-else-if="!selectedSale" class="py-5 text-center text-slate-500">Pilih transaksi POS untuk melihat item.</div>
      <div v-else-if="!lines.length" class="py-5 text-center text-slate-500">Transaksi tidak memiliki alokasi item.</div>
      <div v-else class="overflow-x-auto">
        <table class="table w-full align-middle">
          <thead>
            <tr><th>Produk / Batch</th><th class="text-end">Terjual</th><th style="width:120px">Qty Retur</th><th>Restock</th><th>Catatan Kondisi</th></tr>
          </thead>
          <tbody>
            <tr v-for="line in lines" :key="line.id">
              <td>
                <strong>{{ line.product_name || line.sku || `Produk #${line.product_id}` }}</strong>
                <small class="block text-slate-500">{{ line.batch_number || `Batch #${line.batch_id}` }}</small>
              </td>
              <td class="text-end">{{ line.quantity }}</td>
              <td><input v-model.number="line.return_quantity" type="number" min="0" :max="Number(line.quantity)" step="0.001" class="form-control w-full" :disabled="!!returnId || saving" /></td>
              <td><select v-model="line.restockable" class="form-select" :disabled="!!returnId || saving || line.return_quantity <= 0"><option :value="true">Ya</option><option :value="false">Tidak</option></select></td>
              <td><input v-model="line.condition_notes" class="form-control w-full" :disabled="!!returnId || saving || line.return_quantity <= 0" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="text-sm text-slate-500">Total kuantitas retur: <strong class="text-slate-900">{{ totalQuantity }}</strong></div>
        <div class="flex gap-2">
          <button v-if="!returnId" type="button" class="btn btn-primary" :disabled="saving || loadingSale || !selectedSale || totalQuantity <= 0" @click="createDraft">{{ saving ? "Menyimpan..." : "Simpan Draft Retur" }}</button>
          <button v-else type="button" class="btn btn-success" :disabled="posting" @click="postReturn">{{ posting ? "Posting..." : "Posting Retur & Kembalikan Stok" }}</button>
        </div>
      </div>
      <p v-if="returnId" class="mt-3 text-sm text-emerald-700">Draft retur #{{ returnId }} tersimpan. Lanjutkan posting untuk memperbarui stok.</p>
    </div>
  </div>
</template>
