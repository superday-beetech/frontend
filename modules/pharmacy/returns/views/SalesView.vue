<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { http as api } from "@/core/api/client";
import { useToast } from "@/shared/composables/useToast";

const toast = useToast();

interface SalesReturn {
  id: number;
  return_number: string;
  customer_id: number | null;
  delivery_id: number | null;
  sale_id?: number | null;
  sale_number?: string | null;
  return_date: string;
  status: string;
  reason: string | null;
  total_amount: number;
  total_items: number;
  total_quantity: number;
  restockable_quantity: number;
}

interface SalesReturnItem {
  id: number;
  delivery_item_id: number | null;
  sale_item_id?: number | null;
  product_name?: string | null;
  sku?: string | null;
  batch_number?: string | null;
  batch_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  restockable: number | boolean;
  condition_notes: string | null;
}

interface SalesReturnDetail {
  return: SalesReturn;
  items: SalesReturnItem[];
}

const router = useRouter();

const returns = ref<SalesReturn[]>([]);
const selected = ref<SalesReturnDetail | null>(null);

const loading = ref(false);
const detailLoading = ref(false);
const postingId = ref<number | null>(null);

const formatCurrency = (value: number | string | null | undefined) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
};

const formatDate = (value: string) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: "Draft",
    posted: "Sudah Diposting",
    cancelled: "Dibatalkan",
  };

  return labels[status] ?? status;
};

const loadReturns = async () => {
  loading.value = true;

  try {
    const response = await api.get("/pharmacy/returns-api/list-sales");

    returns.value = response.data.data?.items ?? [];
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal memuat daftar sales return.", "error");
  } finally {
    loading.value = false;
  }
};

const showDetail = async (id: number) => {
  detailLoading.value = true;
  selected.value = null;

  try {
    const response = await api.get(`/pharmacy/returns-api/show-sales/${id}`);

    selected.value = response.data.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal memuat detail sales return.", "error");
  } finally {
    detailLoading.value = false;
  }
};

const postReturn = async (id: number) => {
  if (!window.confirm("Posting sales return ini? Stok batch yang layak akan bertambah.")) {
    return;
  }

  postingId.value = id;

  try {
    const response = await api.post(`/pharmacy/returns-api/post-sales/${id}`);

    toast.success(response.data.message ?? "Sales return berhasil diposting.", "success");

    await loadReturns();
    await showDetail(id);
  } catch (error: any) {
    toast.error(error.response?.data?.message ?? "Gagal posting sales return.", "error");
  } finally {
    postingId.value = null;
  }
};

const createReturn = () => {
  router.push("/pharmacy/returns/sales/sales-create");
};

onMounted(loadReturns);
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
      <div>
        <h4 class="mb-1">Sales Return</h4>
        <p class="text-slate-500 mb-0">Pengelolaan retur barang dari pelanggan.</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 border border-primary-600 text-primary-700 hover:bg-primary-50" @click="router.push('/pharmacy/returns/pos-create')">
          <i class="ti ti-receipt me-1"></i>
          Retur dari POS
        </button>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="createReturn">
          <i class="ti ti-plus me-1"></i>
          Retur dari Delivery
        </button>
      </div>
    </div>

    <div class="grid grid-cols-12 g-4">
      <div :class="selected ? 'col-xl-7' : 'col-12'">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="card-header flex justify-between items-center">
            <h5 class="mb-0">Daftar Retur Penjualan</h5>

            <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200" type="button" @click="loadReturns" :disabled="loading">
              <i class="ti ti-refresh me-1"></i>
              Refresh
            </button>
          </div>

          <div class="p-5 p-0">
            <div class="w-full overflow-x-auto">
              <table class="w-full border-collapse text-sm [&_tbody_tr:hover]:bg-slate-50 dark:[&_tbody_tr:hover]:bg-slate-800/50 align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>No. Retur</th>
                    <th>Tanggal</th>
                    <th>Sumber</th>
                    <th class="text-right">Item</th>
                    <th class="text-right">Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-if="loading">
                    <td colspan="7" class="text-center py-4">Memuat data...</td>
                  </tr>

                  <tr v-else-if="returns.length === 0">
                    <td colspan="7" class="text-center py-4 text-slate-500">Belum ada data sales return.</td>
                  </tr>

                  <tr v-for="item in returns" :key="item.id">
                    <td>
                      <strong>{{ item.return_number }}</strong>
                    </td>

                    <td>{{ formatDate(item.return_date) }}</td>

                    <td>{{ item.sale_number ? `POS · ${item.sale_number}` : `Delivery #${item.delivery_id ?? '-'}` }}</td>

                    <td class="text-right">
                      {{ item.total_items }}
                    </td>

                    <td class="text-right">
                      {{ formatCurrency(item.total_amount) }}
                    </td>

                    <td>
                      <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="item.status === 'posted' ? 'bg-success' : item.status === 'draft' ? 'bg-warning text-dark' : 'bg-secondary'">
                        {{ statusLabel(item.status) }}
                      </span>
                    </td>

                    <td class="text-right">
                      <button class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-primary-600 text-primary-700 hover:bg-primary-50" type="button" @click="showDetail(item.id)">Detail</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selected || detailLoading" class="col-xl-5">
        <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div class="card-header flex justify-between items-center">
            <h5 class="mb-0">Detail Sales Return</h5>

            <button class="btn-close" type="button" aria-label="Tutup detail" @click="selected = null"></button>
          </div>

          <div class="p-5">
            <div v-if="detailLoading" class="text-center py-4">Memuat detail...</div>

            <template v-else-if="selected">
              <div class="mb-3">
                <div class="text-slate-500 small">Nomor Retur</div>
                <strong>{{ selected.return.return_number }}</strong>
              </div>

              <div class="grid grid-cols-12 g-3 mb-3">
                <div class="col-6">
                  <div class="text-slate-500 small">Tanggal</div>
                  <strong>
                    {{ formatDate(selected.return.return_date) }}
                  </strong>
                </div>

                <div class="col-6">
                  <div class="text-slate-500 small">Sumber Transaksi</div>
                  <strong>{{ selected.return.sale_number || `Delivery #${selected.return.delivery_id ?? '-'}` }}</strong>
                </div>

                <div class="col-6">
                  <div class="text-slate-500 small">Customer ID</div>
                  <strong>{{ selected.return.customer_id }}</strong>
                </div>

                <div class="col-6">
                  <div class="text-slate-500 small">Status</div>
                  <strong>
                    {{ statusLabel(selected.return.status) }}
                  </strong>
                </div>
              </div>

              <div class="mb-3">
                <div class="text-slate-500 small">Alasan Retur</div>
                <div>{{ selected.return.reason || "-" }}</div>
              </div>

              <hr />

              <h6 class="mb-3">Item Retur</h6>

              <div v-for="item in selected.items" :key="item.id" class="border rounded p-3 mb-2">
                <div class="flex justify-between">
                  <strong>{{ item.product_name || (item.sale_item_id ? `POS Item #${item.sale_item_id}` : `Delivery Item #${item.delivery_item_id}`) }}</strong>

                  <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="item.restockable ? 'bg-success' : 'bg-secondary'">
                    {{ item.restockable ? "Dapat Restock" : "Tidak Restock" }}
                  </span>
                </div>

                <div class="small text-slate-500 mt-2">{{ item.sku ? `SKU: ${item.sku} · ` : '' }}{{ item.batch_number || `Batch #${item.batch_id}` }}</div>

                <div class="flex justify-between mt-2">
                  <span>Jumlah</span>
                  <strong>{{ item.quantity }}</strong>
                </div>

                <div class="flex justify-between">
                  <span>Harga Satuan</span>
                  <span>{{ formatCurrency(item.unit_price) }}</span>
                </div>

                <div class="flex justify-between">
                  <span>Subtotal</span>
                  <strong>{{ formatCurrency(item.subtotal) }}</strong>
                </div>

                <div v-if="item.condition_notes" class="small text-slate-500 mt-2">Kondisi: {{ item.condition_notes }}</div>
              </div>

              <hr />

              <div class="flex justify-between mb-2">
                <span>Total Item</span>
                <strong>{{ selected.items.length }}</strong>
              </div>

              <div class="flex justify-between mb-3">
                <span>Total Retur</span>
                <strong>
                  {{ formatCurrency(selected.return.total_amount) }}
                </strong>
              </div>

              <button v-if="selected.return.status === 'draft'" type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 btn-success w-full" :disabled="postingId === selected.return.id" @click="postReturn(selected.return.id)">
                <i class="ti ti-check me-1"></i>
                {{ postingId === selected.return.id ? "Memproses..." : "Posting Sales Return" }}
              </button>

              <div v-else class="rounded-lg border px-4 py-3 text-sm border-emerald-200 bg-emerald-50 text-emerald-800 mb-0">Sales return sudah diposting.</div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
