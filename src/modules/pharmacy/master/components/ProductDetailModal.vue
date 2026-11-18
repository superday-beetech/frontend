<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import product.api, { type Product, type ProductDetail } from "../api/product.api";

import { useMasterOptions } from "../composables/useMasterOptions";


const props = defineProps<{
  product: Product;
}>();

const emit = defineEmits<{
  select: [value: Product];
  close: [];
}>();

// ── Master options (untuk label golongan obat & bentuk sediaan) ──
const masterOptions = useMasterOptions();
const { drugClassOptions, dosageFormOptions, loadProductOptions } = masterOptions;

const activeTab = ref<"product" | "detail">("product");

// ── Detail farmasi ──
const detail = ref<ProductDetail | null>(null);
const detailLoading = ref(false);
const detailError = ref("");

// ── Format harga (hanya tampil, bukan input) ──
function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

// ── Label ramah untuk kode → teks ──
function drugClassLabel(code: string | null | undefined): string {
  if (!code) return "-";
  return drugClassOptions.value.find((o) => o.value === code)?.label ?? code;
}

function dosageFormLabel(value: string | null | undefined): string {
  if (!value) return "-";
  return dosageFormOptions.value.find((o) => o.value === value)?.label ?? value;
}

// ── Parse unit_conversion ──
function parseUnitConversion(raw: unknown): Record<string, number> | null {
  if (!raw) return null;

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, number>;
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, number>;
      }
    } catch {
      // abaikan
    }
  }

  return null;
}

const unitConversionMap = computed<Record<string, number> | null>(() => parseUnitConversion(detail.value?.unit_conversion));

const hasUnitConversion = computed(() => {
  const m = unitConversionMap.value;
  return !!m && Object.keys(m).length > 0;
});

const hasAnyDetail = computed(() => {
  const d = detail.value;
  if (!d) return false;

  return Boolean(
    d.generic_name || d.active_ingredient || d.dosage_form || d.strength || d.drug_class || d.bpom_number || d.requires_prescription || d.min_stock || d.max_stock || d.rack_location || d.manufacturer || hasUnitConversion.value,
  );
});

// ── Load detail farmasi ──
async function loadDetail(): Promise<void> {
  detailLoading.value = true;
  detailError.value = "";

  try {
    const res = await product.api.getDetail(props.product.id);

    if (res.error || !res.data) {
      detail.value = null;
      return;
    }

    detail.value = res.data;
  } catch (error: any) {
    // 404 = detail belum ada, bukan error fatal
    const status = error?.response?.status;
    if (status !== 404) {
      detailError.value = "Gagal memuat detail farmasi.";
    }
    detail.value = null;
  } finally {
    detailLoading.value = false;
  }
}

// ── Watch product berubah ──
watch(
  () => props.product,
  async (p) => {
    activeTab.value = "product";
    if (p?.id) {
      await loadDetail();
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await loadProductOptions();

  if (props.product?.id && !detail.value) {
    await loadDetail();
  }
});
</script>

<template>
  <div v-if="product">
    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button type="button" class="nav-link" :class="{ active: activeTab === 'product' }" @click="activeTab = 'product'">
          <i class="ti ti-package me-1"></i>
          Produk
        </button>
      </li>
      <li class="nav-item">
        <button type="button" class="nav-link" :class="{ active: activeTab === 'detail' }" @click="activeTab = 'detail'">
          <i class="ti ti-pill me-1"></i>
          Detail Farmasi
        </button>
      </li>
    </ul>

    <!-- ══════════ Tab: Produk ══════════ -->
    <div v-show="activeTab === 'product'">
      <!-- Nama Produk -->
      <div class="mb-3">
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Nama Produk</label>
        <div class="font-semibold fs-5">{{ product.name }}</div>
        <div v-if="product.description" class="text-slate-500 small">
          {{ product.description }}
        </div>
      </div>

      <div class="grid grid-cols-12">
        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">SKU</label>
          <div>
            <code>{{ product.sku || "-" }}</code>
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Barcode</label>
          <div>
            <code v-if="product.barcode">{{ product.barcode }}</code>
            <span v-else class="text-slate-500">-</span>
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Kategori</label>
          <div>{{ product.category_name || "-" }}</div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Satuan</label>
          <div>
            {{ product.unit_name || "-" }}
            <template v-if="product.unit_abbreviation"> ({{ product.unit_abbreviation }}) </template>
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Harga Beli</label>
          <div class="font-semibold">
            {{ formatCurrency(product.purchase_price) }}
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Harga Jual</label>
          <div class="font-semibold text-primary-600">
            {{ formatCurrency(product.selling_price) }}
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Status</label>
          <div>
            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="Number(product.is_active) === 1 ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
              <i class="ti me-1" :class="Number(product.is_active) === 1 ? 'ti-circle-check' : 'ti-circle-x'"></i>
              {{ Number(product.is_active) === 1 ? "Aktif" : "Tidak Aktif" }}
            </span>
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Dibuat</label>
          <div class="text-slate-500 small">
            {{ product.created_at || "-" }}
          </div>
        </div>

        <div class="col-span-12 md:col-span-6 mb-3">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Diperbarui</label>
          <div class="text-slate-500 small">
            {{ product.updated_at || "-" }}
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════ Tab: Detail Farmasi ══════════ -->
    <div v-show="activeTab === 'detail'">
      <!-- Loading -->
      <div v-if="detailLoading" class="text-center py-5">
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-2"></span>
        Memuat detail farmasi...
      </div>

      <!-- Error -->
      <div v-else-if="detailError" class="rounded-lg border px-4 py-3 text-sm border-rose-200 bg-rose-50 text-rose-800 small">
        <i class="ti ti-alert-circle me-1"></i>
        {{ detailError }}
      </div>

      <!-- Belum ada detail -->
      <div v-else-if="!detail || !hasAnyDetail" class="rounded-lg border px-4 py-3 text-sm border-amber-200 bg-amber-50 text-amber-800 small">
        <i class="ti ti-info-circle me-1"></i>
        Detail farmasi belum diisi untuk produk ini.
      </div>

      <!-- Ada detail -->
      <div v-else>
        <div class="grid grid-cols-12">
          <!-- Nama Generik -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Nama Generik</label>
            <div>{{ detail.generic_name || "-" }}</div>
          </div>

          <!-- Zat Aktif -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Zat Aktif</label>
            <div>{{ detail.active_ingredient || "-" }}</div>
          </div>

          <!-- Bentuk Sediaan -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Bentuk Sediaan</label>
            <div>{{ dosageFormLabel(detail.dosage_form) }}</div>
          </div>

          <!-- Kekuatan -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1"> Kekuatan / Dosis </label>
            <div>{{ detail.strength || "-" }}</div>
          </div>

          <!-- Golongan Obat -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Golongan Obat</label>
            <div>
              <span v-if="detail.drug_class" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-primary-subtle text-primary-600">
                {{ drugClassLabel(detail.drug_class) }}
              </span>
              <span v-else class="text-slate-500">-</span>
            </div>
          </div>

          <!-- BPOM -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1"> No. Izin Edar (BPOM) </label>
            <div>
              <code v-if="detail.bpom_number">{{ detail.bpom_number }}</code>
              <span v-else class="text-slate-500">-</span>
            </div>
          </div>

          <!-- Resep -->
          <div class="col-span-12 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Perlu Resep</label>
            <div>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" :class="Number(detail.requires_prescription) === 1 ? 'bg-warning-subtle text-warning' : 'bg-light text-muted'">
                <i class="ti me-1" :class="Number(detail.requires_prescription) === 1 ? 'ti-lock' : 'ti-lock-open'"></i>
                {{ Number(detail.requires_prescription) === 1 ? "Ya, wajib resep dokter" : "Tidak perlu resep" }}
              </span>
            </div>
          </div>

          <!-- Konversi Satuan -->
          <div class="col-span-12 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1"> Konversi Satuan </label>
            <div v-if="hasUnitConversion">
              <span v-for="(qty, unit) in unitConversionMap" :key="unit" class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 text-dark border me-1 mb-1"> 1 {{ unit }} = {{ qty }} </span>
            </div>
            <span v-else class="text-slate-500">-</span>
          </div>

          <!-- Stok -->
          <div class="col-span-12 md:col-span-4 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Stok Minimum</label>
            <div>
              <span v-if="detail.min_stock != null">
                {{ detail.min_stock }}
              </span>
              <span v-else class="text-slate-500">-</span>
            </div>
          </div>

          <div class="col-span-12 md:col-span-4 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Stok Maksimum</label>
            <div>
              <span v-if="detail.max_stock != null">
                {{ detail.max_stock }}
              </span>
              <span v-else class="text-slate-500">-</span>
            </div>
          </div>

          <div class="col-span-12 md:col-span-4 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Rak / Lokasi</label>
            <div>{{ detail.rack_location || "-" }}</div>
          </div>

          <!-- Pabrik -->
          <div class="col-span-12 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1">Pabrik</label>
            <div>{{ detail.manufacturer || "-" }}</div>
          </div>

          <!-- Meta -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1"> Detail Dibuat </label>
            <div class="text-slate-500 small">
              {{ detail.created_at || "-" }}
            </div>
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300 text-slate-500 small mb-1"> Detail Diperbarui </label>
            <div class="text-slate-500 small">
              {{ detail.updated_at || "-" }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center gap-2 mt-3 pt-3 border-top">
      <div class="text-slate-500 small">
        <i class="ti ti-info-circle me-1"></i>
        ID Produk: <strong>{{ product.id }}</strong>
      </div>

      <div class="flex gap-2">
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" @click="emit('close')">Tutup</button>
        <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" @click="emit('select', product)">
          <i class="ti ti-edit me-1"></i>
          Ubah Produk
        </button>
      </div>
    </div>
  </div>
</template>
