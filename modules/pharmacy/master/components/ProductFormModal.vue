<script setup lang="ts">
/**
 * ProductFormModal — shell orchestration.
 * Logika bisnis ada di `useProductForm`.
 */
import { computed, onMounted, ref, watch, toRef } from 'vue'
import { Package, Save, X } from 'lucide-vue-next'

import { useToast } from '@/shared/composables/useToast'
import { useCurrencyInput } from '@/shared/composables/useCurrencyInput'
import { useMasterOptions } from '../composables/useMasterOptions'
import { useProductForm } from './composables/useProductForm'
import type { InfoRow, PharmacyForm, UnitConversionRow } from './composables/useProductForm'
import { INFO_TYPE_OPTIONS, STATUS_OPTIONS } from './constants/product'

import type { Product, ProductPayload } from './../services/productService'

import ProductCoreTab from './product-form/ProductCoreTab.vue'
import ProductAttributesTab from './product-form/ProductAttributesTab.vue'

const props = defineProps<{ product?: Product | null }>()

const emit = defineEmits<{
  select: [value: Product]
  close: []
}>()

const toast = useToast()

const {
  categoryOptions,
  unitOptions,
  dosageFormOptions,
  loading: loadingOptions,
  loaded: optionsLoaded,
  load: loadMasterOptions,
} = useMasterOptions()
const productRef = toRef(props, 'product')
// ── Currency ──
const purchasePrice = ref<number | string>(0)
const sellingPrice = ref<number | string>(0)
const purchasePriceInput = useCurrencyInput(purchasePrice)
const sellingPriceInput = useCurrencyInput(sellingPrice)

// ── Form composable ──
const productForm = useProductForm({
  product: productRef,
  dosageFormOptions,
  onError: (msg) => toast.error(msg),
  onSuccess: (msg) => toast.success(msg),
  onWarning: (msg) => toast.warning(msg),
})

const {
  activeTab,
  saving,
  form,
  pharmacyForm,
  unitConversions,
  productInfos,
  sku,
  images,
  selectedDosageFormId,
  onDosageFormChange,
  reset,
  save,
  loadAttributes,
  skuMode,
  setSkuMode,
} = productForm

const isEditing = computed(() => Boolean(props.product?.id))

// sinkronkan currency ↔ form
watch(purchasePrice, (v) => {
  form.value.purchase_price = Number(v) || 0
})
watch(sellingPrice, (v) => {
  form.value.selling_price = Number(v) || 0
})

// reset saat produk berubah
watch(
  () => props.product,
  (p) => {
    reset(p)
    purchasePrice.value = Number(p?.purchase_price ?? 0)

    const basePrice =
      p?.prices?.find(
        (pr) =>
          Number(pr.unit_id) === Number(p.unit_id) &&
          pr.customer_type == null &&
          Number(pr.min_qty) === 1 &&
          Number(pr.is_active ?? 1) === 1
      )?.price ??
      p?.selling_price ??
      0

    sellingPrice.value = Number(basePrice)
  },
  { immediate: true }
)

// ── Handlers (typed) ──
function updateForm(value: ProductPayload): void {
  if (value.sku !== form.value.sku) {
    sku.setManual(value.sku)
  }

  form.value = value
}

function updatePharmacyForm(value: PharmacyForm): void {
  pharmacyForm.value = value
}

function updateUnitConversions(rows: UnitConversionRow[]): void {
  unitConversions.value = rows
}

function updateProductInfos(rows: InfoRow[]): void {
  productInfos.value = rows
}

function addUnitConversion(): void {
  unitConversions.value.push({ unit_id: null, qty: null })
}

function removeUnitConversion(index: number): void {
  unitConversions.value.splice(index, 1)
}

function addProductInfo(): void {
  productInfos.value.push({ group: 'indication', title: '', content: '' })
}

function removeProductInfo(index: number): void {
  productInfos.value.splice(index, 1)
}

function updatePurchasePrice(value: string): void {
  purchasePriceInput.update(value)
}
function updateSellingPrice(value: string): void {
  sellingPriceInput.update(value)
}

// ── Aksi ──
async function generateSkuManual(): Promise<void> {
  if (isEditing.value || saving.value || sku.generating.value) return

  if (!form.value.category_id) {
    toast.warning('Silakan pilih kategori terlebih dahulu.')
    activeTab.value = 'product'
    return
  }

  const result = await sku.generate(Number(form.value.category_id), pharmacyForm.value.dosage_form.trim())

  if (result) toast.success('SKU berhasil dibuat.')
}

async function handleSave(): Promise<void> {
  if (!optionsLoaded.value) {
    toast.warning('Data opsi belum berhasil dimuat.')
    return
  }

  const saved = await save()
  if (saved) {
    emit('select', saved)
    emit('close')
  }
}

onMounted(async () => {
  await loadMasterOptions()
  await loadAttributes()
})
</script>

<template>
  <div class="w-full">
    <!-- Tabs -->
    <nav class="mb-6 flex border-b border-slate-200 dark:border-slate-800" role="tablist" aria-label="Form produk">
      <button
        v-for="tab in [
          { key: 'product', label: 'Produk', icon: Package },
          { key: 'attributes', label: 'Atribut Farmasi', icon: Package },
        ] as const"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.key"
        class="flex items-center gap-2 border-b-2 px-4 py-2.5 -mb-px text-sm font-medium transition-colors"
        :class="
          activeTab === tab.key
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        "
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </nav>

    <form class="space-y-6" novalidate @submit.prevent="handleSave">
      <ProductCoreTab
        v-show="activeTab === 'product'"
        :form="form"
        :category-options="categoryOptions"
        :unit-options="unitOptions"
        :status-options="STATUS_OPTIONS"
        :saving="saving"
        :loading-options="loadingOptions"
        :generating-sku="sku.generating.value"
        :is-editing="isEditing"
        :sku-mode="skuMode"
        :purchase-price-formatted="purchasePriceInput.formattedValue.value"
        :selling-price-formatted="sellingPriceInput.formattedValue.value"
        @update:form="updateForm"
        @update:sku-mode="setSkuMode"
        @update:purchase-price="updatePurchasePrice"
        @update:selling-price="updateSellingPrice"
        @generate-sku="generateSkuManual"
      />

      <ProductAttributesTab
        v-show="activeTab === 'attributes'"
        :pharmacy-form="pharmacyForm"
        :unit-conversions="unitConversions"
        :product-infos="productInfos"
        :images="images.images.value"
        :image-uploading="images.uploading.value"
        :dosage-form-options="dosageFormOptions"
        :unit-options="unitOptions"
        :info-type-options="INFO_TYPE_OPTIONS"
        :selected-dosage-form-id="selectedDosageFormId"
        :saving="saving"
        :loading-options="loadingOptions"
        @update:pharmacy-form="updatePharmacyForm"
        @update:unit-conversions="updateUnitConversions"
        @update:product-infos="updateProductInfos"
        @dosage-form-change="onDosageFormChange"
        @add-unit-conversion="addUnitConversion"
        @remove-unit-conversion="removeUnitConversion"
        @add-product-info="addProductInfo"
        @remove-product-info="removeProductInfo"
        @add-image="images.add"
        @remove-image="images.remove"
        @set-primary-image="images.setPrimary"
      />

      <!-- Footer sticky -->
      <footer
        class="bottom-0 -mx-6 -mb-6 mt-2 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row"
      >
        <p class="w-full text-center text-sm text-slate-500 sm:w-auto sm:text-left">
          <template v-if="activeTab === 'product'">
            Field bertanda
            <span class="text-rose-600">*</span>
            wajib diisi.
          </template>
          <template v-else>Atribut farmasi, satuan, dan informasi tambahan.</template>
        </p>

        <div class="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
            :disabled="saving || loadingOptions || !optionsLoaded"
            @click="emit('close')"
          >
            <X class="h-4 w-4" />
            Batal
          </button>

          <button
            type="submit"
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50 sm:flex-none"
            :disabled="saving || loadingOptions"
          >
            <span v-if="saving" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
            <Save v-else class="h-4 w-4" />
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </footer>
    </form>
  </div>
</template>
