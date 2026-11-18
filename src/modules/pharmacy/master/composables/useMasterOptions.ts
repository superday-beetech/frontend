import { computed, ref } from "vue";

import categoryService, { type Category } from "@/modules/pharmacy/master/services/categoryService";
import unitService, { type Unit } from "@/modules/pharmacy/master/services/unitService";
import productService, { type ProductOptions } from "../services/productService";
import type { OptionItem } from "@/composables/useOption";
import { env } from "@/config/env";

// State module-level → dibagi antar komponen (singleton)
const categories = ref<Category[]>([]);
const units = ref<Unit[]>([]);
const loading = ref(false);
const loaded = ref(false);
const error = ref<string>("");

const drugClassOptions = ref<OptionItem[]>([]);
const dosageFormOptions = ref<OptionItem[]>([]);
const productOptionsLoaded = ref(false);
const productOptionsLoading = ref(false);

function getErrorMessage(e: any): string {
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return e?.message || "Gagal memuat data.";
}

async function load(force = false): Promise<void> {
  if (loaded.value && !force) return;
  if (loading.value) return;

  loading.value = true;
  error.value = "";

  try {
    const [catRes, unitRes] = await Promise.all([categoryService.getAll({ page: 1, per_page: 100, module: env.isModule }), unitService.getAll({ page: 1, per_page: 100 })]);

    // category: response.data = CategoryListData
    const catData = catRes.data;
    if (!catData) throw new Error("Gagal memuat kategori.");
    categories.value = catData.items.filter((c) => Number(c.is_active) === 1);

    // unit: response.data = AxiosResponse<ApiResponse<UnitListData>>
    const unitResult = unitRes.data;
    if (unitResult.error || !unitResult.data) {
      throw new Error("Gagal memuat satuan.");
    }
    units.value = unitResult.data.items;

    loaded.value = true;
  } catch (e: any) {
    error.value = getErrorMessage(e);
  } finally {
    loading.value = false;
  }
}

async function loadProductOptions(force = false): Promise<void> {
  if (productOptionsLoaded.value && !force) return;
  if (productOptionsLoading.value) return;

  productOptionsLoading.value = true;

  try {
    const res = await productService.getOptions();
    const data = res.data;

    if (!data) throw new Error("Gagal memuat opsi produk.");

    drugClassOptions.value = data.drug_classes;
    dosageFormOptions.value = data.dosage_forms;

    productOptionsLoaded.value = true;
  } catch (e: any) {
    error.value = getErrorMessage(e);
  } finally {
    productOptionsLoading.value = false;
  }
}

function reset(): void {
  categories.value = [];
  units.value = [];
  loaded.value = false;
  error.value = "";
}

export function useMasterOptions() {
  const categoryOptions = computed<OptionItem[]>(() =>
    categories.value.map((c) => ({
      value: c.id,
      label: c.name,
      description: c.description ?? undefined,
    })),
  );

  const unitOptions = computed<OptionItem[]>(() =>
    units.value.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.abbreviation,
      keywords: u.abbreviation,
    })),
  );

  return {
    categories,
    units,
    loading,
    loaded,
    error,
    categoryOptions,
    unitOptions,
    load,
    reset,
    drugClassOptions,
    dosageFormOptions,
    productOptionsLoaded,
    productOptionsLoading,
    loadProductOptions,
  };
}
