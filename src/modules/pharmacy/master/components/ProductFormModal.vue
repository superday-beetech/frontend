<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useToast } from "@/shared/composables/useToast";
import { useCurrencyInput } from "@/shared/composables/useCurrencyInput";

import productService, { type Product, type ProductPayload, type ProductDetailPayload } from "../services/productService";

import OptionSelect from "@/shared/components/ui/form/OptionSelect.vue";
import { useMasterOptions } from "../composables/useMasterOptions";

const toast = useToast();

interface UnitConversionRow {
  unit: string;
  qty: number | null;
}

const props = defineProps<{
  product?: Product | null;
}>();

const emit = defineEmits<{
  select: [value: Product];
  close: [];
}>();

// ── Master options ──
const masterOptions = useMasterOptions();
const { categoryOptions, unitOptions, drugClassOptions, dosageFormOptions, loading: loadingOptions, loaded: optionsLoaded, load: loadMasterOptions, loadProductOptions } = masterOptions;

const saving = ref(false);
const activeTab = ref<"product" | "detail">("product");

// ── Form produk inti ──
const form = ref<ProductPayload>({
  sku: "",
  barcode: null,
  name: "",
  category_id: 0,
  unit_id: 0,
  purchase_price: 0,
  selling_price: 0,
  description: null,
  is_active: 1,
});

// ── Currency input ──
const purchasePrice = ref<number | string>(0);
const sellingPrice = ref<number | string>(0);

const purchasePriceInput = useCurrencyInput(purchasePrice);
const sellingPriceInput = useCurrencyInput(sellingPrice);

watch(purchasePrice, (v) => {
  form.value.purchase_price = Number(v) || 0;
});
watch(sellingPrice, (v) => {
  form.value.selling_price = Number(v) || 0;
});

// ── Form detail farmasi ──
const detailForm = ref({
  generic_name: "",
  active_ingredient: "",
  dosage_form: "",
  strength: "",
  drug_class: "",
  bpom_number: "",
  requires_prescription: 0,
  min_stock: 0,
  max_stock: null as number | null,
  rack_location: "",
  manufacturer: "",
});

// ── Konversi satuan ──
const unitConversions = ref<UnitConversionRow[]>([]);

const isEditing = computed(() => !!props.product);

function parseUnitConversion(raw: unknown): UnitConversionRow[] {
  if (!raw) return [];

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return Object.entries(raw as Record<string, number>).map(([unit, qty]) => ({
      unit,
      qty: Number(qty),
    }));
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.entries(parsed).map(([unit, qty]) => ({
          unit,
          qty: Number(qty),
        }));
      }
    } catch {
      // abaikan
    }
  }

  return [];
}

function resetForm(product?: Product | null): void {
  form.value = {
    sku: product?.sku ?? "",
    barcode: product?.barcode ?? null,
    name: product?.name ?? "",
    category_id: product?.category_id ?? 0,
    unit_id: product?.unit_id ?? 0,
    purchase_price: Number(product?.purchase_price ?? 0),
    selling_price: Number(product?.selling_price ?? 0),
    description: product?.description ?? null,
    is_active: Number(product?.is_active ?? 1),
  };

  purchasePrice.value = Number(product?.purchase_price ?? 0);
  sellingPrice.value = Number(product?.selling_price ?? 0);

  const anyProduct = product as any;

  detailForm.value = {
    generic_name: anyProduct?.generic_name ?? "",
    active_ingredient: anyProduct?.active_ingredient ?? "",
    dosage_form: anyProduct?.dosage_form ?? "",
    strength: anyProduct?.strength ?? "",
    drug_class: anyProduct?.drug_class ?? "",
    bpom_number: anyProduct?.bpom_number ?? "",
    requires_prescription: Number(anyProduct?.requires_prescription ?? 0),
    min_stock: Number(anyProduct?.min_stock ?? 0),
    max_stock: anyProduct?.max_stock ?? null,
    rack_location: anyProduct?.rack_location ?? "",
    manufacturer: anyProduct?.manufacturer ?? "",
  };

  unitConversions.value = parseUnitConversion(anyProduct?.unit_conversion);
  activeTab.value = "product";
}

watch(
  () => props.product,
  (product) => resetForm(product),
  { immediate: true },
);

function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  return error?.message || "Terjadi kesalahan.";
}

function addUnitConversion(): void {
  unitConversions.value.push({ unit: "", qty: null });
}

function removeUnitConversion(index: number): void {
  unitConversions.value.splice(index, 1);
}

function buildUnitConversionJson(): Record<string, number> | null {
  const map: Record<string, number> = {};
  for (const row of unitConversions.value) {
    const unit = row.unit.trim().toLowerCase();
    const qty = Number(row.qty);
    if (!unit) continue;
    if (!Number.isFinite(qty) || qty <= 0) continue;
    map[unit] = qty;
  }
  return Object.keys(map).length ? map : null;
}

function validateForm(): boolean {
  if (!form.value.sku.trim()) {
    toast.warning("SKU produk wajib diisi.");
    activeTab.value = "product";
    return false;
  }

  if (form.value.sku.trim().length > 50) {
    toast.warning("SKU maksimal 50 karakter.");
    activeTab.value = "product";
    return false;
  }

  if (form.value.barcode && form.value.barcode.trim().length > 100) {
    toast.warning("Barcode maksimal 100 karakter.");
    activeTab.value = "product";
    return false;
  }

  if (!form.value.name.trim()) {
    toast.warning("Nama produk wajib diisi.");
    activeTab.value = "product";
    return false;
  }

  if (form.value.name.trim().length < 2 || form.value.name.trim().length > 180) {
    toast.warning("Nama produk harus terdiri dari 2 sampai 180 karakter.");
    activeTab.value = "product";
    return false;
  }

  if (!form.value.category_id) {
    toast.warning("Silakan pilih kategori produk.");
    activeTab.value = "product";
    return false;
  }

  if (!form.value.unit_id) {
    toast.warning("Silakan pilih satuan produk.");
    activeTab.value = "product";
    return false;
  }

  if (!Number.isFinite(form.value.purchase_price) || form.value.purchase_price < 0) {
    toast.warning("Harga beli tidak valid.");
    activeTab.value = "product";
    return false;
  }

  if (!Number.isFinite(form.value.selling_price) || form.value.selling_price < 0) {
    toast.warning("Harga jual tidak valid.");
    activeTab.value = "product";
    return false;
  }

  for (const row of unitConversions.value) {
    const unit = row.unit.trim();

    if (!unit && row.qty != null) {
      toast.warning("Nama satuan konversi wajib diisi.");
      activeTab.value = "detail";
      return false;
    }

    if (unit && (!Number.isFinite(Number(row.qty)) || Number(row.qty) <= 0)) {
      toast.warning(`Jumlah konversi untuk "${unit}" harus lebih dari 0.`);
      activeTab.value = "detail";
      return false;
    }
  }

  return true;
}

async function save(): Promise<void> {
  if (!optionsLoaded.value) {
    toast.warning("Data opsi belum berhasil dimuat.");
    return;
  }
  if (!validateForm()) return;

  saving.value = true;

  const payload: ProductPayload = {
    sku: form.value.sku.trim(),
    barcode: form.value.barcode?.trim() || null,
    name: form.value.name.trim(),
    category_id: Number(form.value.category_id),
    unit_id: Number(form.value.unit_id),
    purchase_price: Number(form.value.purchase_price),
    selling_price: Number(form.value.selling_price),
    description: form.value.description?.trim() || null,
    is_active: Number(form.value.is_active),
  };

  try {
    // 1) Simpan produk
    const response = isEditing.value ? await productService.update(props.product!.id, payload) : await productService.create(payload);

    const result = response.data;

    if (result.error || !result.data) {
      throw new Error(typeof result.message === "string" ? result.message : "Gagal menyimpan produk.");
    }

    const productId = result.data.id;

    // 2) Simpan detail farmasi
    const detailPayload: ProductDetailPayload = {
      generic_name: detailForm.value.generic_name.trim() || null,
      active_ingredient: detailForm.value.active_ingredient.trim() || null,
      dosage_form: detailForm.value.dosage_form || null,
      strength: detailForm.value.strength.trim() || null,
      drug_class: detailForm.value.drug_class || null,
      bpom_number: detailForm.value.bpom_number.trim() || null,
      requires_prescription: Number(detailForm.value.requires_prescription),
      unit_conversion: buildUnitConversionJson(),
      min_stock: Number(detailForm.value.min_stock ?? 0),
      max_stock: detailForm.value.max_stock != null ? Number(detailForm.value.max_stock) : null,
      rack_location: detailForm.value.rack_location.trim() || null,
      manufacturer: detailForm.value.manufacturer.trim() || null,
    };

    // Cek apakah detail sudah ada (untuk edit mode)
    let detailExists = false;
    if (isEditing.value) {
      try {
        const existing = await productService.getDetail(productId);
        detailExists = !existing.error && !!existing.data;
      } catch {
        detailExists = false;
      }
    }

    if (detailExists) {
      await productService.updateDetail(productId, detailPayload);
    } else {
      await productService.createDetail({
        product_id: productId,
        ...detailPayload,
      });
    }

    toast.success(isEditing.value ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan.");

    emit("select", result.data);
    emit("close");
  } catch (error: any) {
    toast.error(getErrorMessage(error));
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await Promise.all([loadMasterOptions(), loadProductOptions()]);

  // Kalau edit, coba load detail farmasi
  if (props.product?.id) {
    try {
      const res = await productService.getDetail(props.product.id);
      if (!res.error && res.data) {
        const d = res.data;
        detailForm.value = {
          generic_name: d.generic_name ?? "",
          active_ingredient: d.active_ingredient ?? "",
          dosage_form: d.dosage_form ?? "",
          strength: d.strength ?? "",
          drug_class: d.drug_class ?? "",
          bpom_number: d.bpom_number ?? "",
          requires_prescription: Number(d.requires_prescription ?? 0),
          min_stock: Number(d.min_stock ?? 0),
          max_stock: d.max_stock != null ? Number(d.max_stock) : null,
          rack_location: d.rack_location ?? "",
          manufacturer: d.manufacturer ?? "",
        };
        unitConversions.value = parseUnitConversion(d.unit_conversion);
      }
    } catch {
      // detail belum ada → abaikan
    }
  }
});
</script>

<template>
  <div>
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

    <form @submit.prevent="save">
      <!-- ══════════ Tab: Produk ══════════ -->
      <div v-show="activeTab === 'product'">
        <div class="grid grid-cols-12">
          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="product-sku" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> SKU <span class="text-rose-600">*</span> </label>
            <input id="product-sku" v-model="form.sku" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="50" placeholder="Kode produk" :disabled="saving" required />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="product-barcode" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Barcode</label>
            <input id="product-barcode" v-model="form.barcode" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="100" placeholder="Barcode produk" :disabled="saving" />
          </div>

          <div class="col-span-12 mb-3">
            <label for="product-name" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Nama Produk <span class="text-rose-600">*</span> </label>
            <input id="product-name" v-model="form.name" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="180" placeholder="Nama produk" :disabled="saving" required />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Kategori <span class="text-rose-600">*</span> </label>
            <OptionSelect
              :model-value="form.category_id"
              :options="categoryOptions"
              placeholder="Pilih kategori"
              search-placeholder="Cari kategori..."
              :disabled="saving || loadingOptions"
              @update:model-value="(v) => (form.category_id = Number(v))"
            />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Satuan <span class="text-rose-600">*</span> </label>
            <OptionSelect :model-value="form.unit_id" :options="unitOptions" placeholder="Pilih satuan" search-placeholder="Cari satuan..." :disabled="saving || loadingOptions" @update:model-value="(v) => (form.unit_id = Number(v))" />
          </div>

          <!-- Harga Beli -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="product-purchase-price" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Harga Beli <span class="text-rose-600">*</span> </label>
            <div class="flex w-full items-stretch">
              <span class="input-group-text">Rp</span>
              <input
                id="product-purchase-price"
                :value="purchasePriceInput.formattedValue.value"
                type="text"
                inputmode="numeric"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-right"
                :disabled="saving"
                @input="purchasePriceInput.update(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <!-- Harga Jual -->
          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="product-selling-price" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> Harga Jual <span class="text-rose-600">*</span> </label>
            <div class="flex w-full items-stretch">
              <span class="input-group-text">Rp</span>
              <input
                id="product-selling-price"
                :value="sellingPriceInput.formattedValue.value"
                type="text"
                inputmode="numeric"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 text-right"
                :disabled="saving"
                @input="sellingPriceInput.update(($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>

          <div class="col-span-12 mb-3">
            <label for="product-description" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Deskripsi</label>
            <textarea id="product-description" v-model="form.description" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" rows="3" placeholder="Keterangan produk" :disabled="saving"></textarea>
          </div>

          <div class="col-span-12 mb-3">
            <label for="product-status" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
            <select id="product-status" v-model.number="form.is_active" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="saving">
              <option :value="1">Aktif</option>
              <option :value="0">Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ══════════ Tab: Detail Farmasi ══════════ -->
      <div v-show="activeTab === 'detail'">
        <div class="grid grid-cols-12">
          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="detail-generic-name" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Generik</label>
            <input id="detail-generic-name" v-model="detailForm.generic_name" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="200" placeholder="cth: Paracetamol" :disabled="saving" />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="detail-active-ingredient" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Zat Aktif</label>
            <input id="detail-active-ingredient" v-model="detailForm.active_ingredient" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="200" placeholder="cth: Paracetamol" :disabled="saving" />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Bentuk Sediaan</label>
            <OptionSelect :model-value="detailForm.dosage_form" :options="dosageFormOptions" placeholder="Pilih bentuk sediaan" :searchable="false" :disabled="saving" @update:model-value="(v) => (detailForm.dosage_form = String(v))" />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="detail-strength" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Kekuatan / Dosis</label>
            <input id="detail-strength" v-model="detailForm.strength" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="50" placeholder="cth: 500 mg" :disabled="saving" />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Golongan Obat</label>
            <OptionSelect :model-value="detailForm.drug_class" :options="drugClassOptions" placeholder="Pilih golongan obat" :searchable="false" :disabled="saving" @update:model-value="(v) => (detailForm.drug_class = String(v))" />
          </div>

          <div class="col-span-12 md:col-span-6 mb-3">
            <label for="detail-bpom-number" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"> No. Izin Edar (BPOM) </label>
            <input id="detail-bpom-number" v-model="detailForm.bpom_number" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="100" placeholder="cth: DBL1234567890A1" :disabled="saving" />
          </div>

          <div class="col-span-12 mb-3">
            <div class="form-check form-switch">
              <input id="detail-requires-prescription" v-model.number="detailForm.requires_prescription" class="form-check-input" type="checkbox" :true-value="1" :false-value="0" :disabled="saving" />
              <label class="form-check-label" for="detail-requires-prescription"> Perlu Resep Dokter </label>
            </div>
          </div>

          <!-- Konversi Satuan -->
          <div class="col-span-12 mb-3">
            <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Konversi Satuan</label>

            <div v-if="unitConversions.length === 0" class="text-slate-500 small mb-2">Belum ada konversi. Contoh: 1 Box = 100 Tablet.</div>

            <div v-for="(row, index) in unitConversions" :key="index" class="grid grid-cols-12 g-2 items-center mb-2">
              <div class="col-5">
                <input v-model="row.unit" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Nama satuan (cth: box)" maxlength="30" :disabled="saving" />
              </div>
              <div class="col-2 text-center text-slate-500 small">=</div>
              <div class="col-3">
                <input v-model.number="row.qty" type="number" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" placeholder="Jumlah" min="1" step="1" :disabled="saving" />
              </div>
              <div class="col-2 text-right">
                <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 text-rose-600" title="Hapus" :disabled="saving" @click="removeUnitConversion(index)">
                  <i class="ti ti-trash"></i>
                </button>
              </div>
            </div>

            <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 px-2.5 py-1.5 text-xs border border-primary-600 text-primary-700 hover:bg-primary-50" :disabled="saving" @click="addUnitConversion">
              <i class="ti ti-plus me-1"></i>
              Tambah Satuan
            </button>

            <div class="form-text">Contoh: Box = 100, Strip = 10. Artinya 1 Box = 100 Tablet, 1 Strip = 10 Tablet.</div>
          </div>

          <div class="col-span-12 md:col-span-4 mb-3">
            <label for="detail-min-stock" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stok Minimum</label>
            <input id="detail-min-stock" v-model.number="detailForm.min_stock" type="number" min="0" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="saving" />
          </div>

          <div class="col-span-12 md:col-span-4 mb-3">
            <label for="detail-max-stock" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stok Maksimum</label>
            <input id="detail-max-stock" v-model.number="detailForm.max_stock" type="number" min="0" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" :disabled="saving" />
          </div>

          <div class="col-span-12 md:col-span-4 mb-3">
            <label for="detail-rack-location" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Rak / Lokasi</label>
            <input id="detail-rack-location" v-model="detailForm.rack_location" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="50" placeholder="cth: A1" :disabled="saving" />
          </div>

          <div class="col-span-12 mb-3">
            <label for="detail-manufacturer" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pabrik</label>
            <input id="detail-manufacturer" v-model="detailForm.manufacturer" type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" maxlength="150" placeholder="cth: Kimia Farma" :disabled="saving" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-between items-center gap-2 mt-3">
        <div class="text-slate-500 small">
          <span v-if="activeTab === 'product'"> Field bertanda <span class="text-rose-600">*</span> wajib diisi. </span>
          <span v-else>Detail farmasi opsional.</span>
        </div>

        <div class="flex gap-2">
          <button type="button" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200" :disabled="saving || loadingOptions || !optionsLoaded" @click="emit('close')">Batal</button>
          <button type="submit" class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700" :disabled="saving || loadingOptions">
            <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent spinner-border-sm me-1"></span>
            {{ saving ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
