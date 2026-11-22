<script setup lang="ts">
import type { ProductPayload } from '../../services/productService'
import type { OptionItem } from '@/shared/composables/useOption'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseTextarea from '@/shared/components/ui/form/BaseTextarea.vue'
import BaseInputClearable from '@/shared/components/ui/form/BaseInputClearable.vue'
import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'

const props = defineProps<{
  form: ProductPayload
  categoryOptions: OptionItem[]
  unitOptions: OptionItem[]
  statusOptions: OptionItem[]
  saving: boolean
  loadingOptions: boolean
  generatingSku: boolean
  isEditing: boolean
  purchasePriceFormatted: string
  sellingPriceFormatted: string
  skuMode: 'manual' | 'auto'
}>()

const emit = defineEmits<{
  'update:form': [value: ProductPayload]
  'update:purchasePrice': [value: string]
  'update:sellingPrice': [value: string]
  'generate-sku': []
  'update:skuMode': [value: 'manual' | 'auto']
}>()

function patch<K extends keyof ProductPayload>(key: K, value: ProductPayload[K]): void {
  emit('update:form', { ...props.form, [key]: value })
}
</script>

<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-12">
    <!-- SKU -->
    <div class="md:col-span-7">
      <label for="product-sku" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        SKU
        <span class="text-rose-600">*</span>
      </label>

      <div class="flex items-stretch gap-0">
        <div class="min-w-0 flex-1">
          <BaseInput
            id="product-sku"
            :model-value="props.form.sku"
            maxlength="50"
            placeholder="Masukkan SKU produk"
            :disabled="props.saving"
            @update:model-value="(v) => patch('sku', String(v ?? ''))"
          />
        </div>

        <button
          type="button"
          class="ml-2 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition disabled:opacity-50"
          :class="
            props.skuMode === 'auto'
              ? 'border-primary-600 bg-primary-600 text-white hover:bg-primary-700'
              : 'border-primary-600 text-primary-700 hover:bg-primary-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20'
          "
          :disabled="props.saving"
          @click="emit('update:skuMode', props.skuMode === 'auto' ? 'manual' : 'auto')"
        >
          <span v-if="props.skuMode === 'auto'">Auto Aktif</span>
          <span v-else>Otomatis</span>
        </button>
      </div>

      <p class="mt-1 text-xs text-slate-500">
        {{
          props.skuMode === 'auto'
            ? 'SKU akan dibuat otomatis berdasarkan kategori dan bentuk sediaan.'
            : 'Masukkan SKU secara manual atau aktifkan pembuatan otomatis.'
        }}
      </p>
    </div>

    <!-- Barcode -->
    <div class="md:col-span-5">
      <label for="product-barcode" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Barcode</label>
      <BaseInput
        id="product-barcode"
        :model-value="props.form.barcode"
        maxlength="100"
        placeholder="Barcode produk"
        :disabled="props.saving"
        @update:model-value="(v) => patch('barcode', v ? String(v) : null)"
      />
    </div>

    <!-- Nama -->
    <div class="md:col-span-12">
      <label for="product-name" class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Nama Produk
        <span class="text-rose-600">*</span>
      </label>
      <BaseInput
        id="product-name"
        :model-value="props.form.name"
        maxlength="180"
        placeholder="Nama produk"
        :disabled="props.saving"
        required
        @update:model-value="(v) => patch('name', String(v ?? ''))"
      />
    </div>

    <!-- Kategori -->
    <!-- Kategori -->
    <div class="md:col-span-6">
      <OptionSelect
        :model-value="props.form.category_id || null"
        :options="props.categoryOptions"
        label="Kategori"
        placeholder="Pilih kategori"
        search-placeholder="Cari kategori..."
        :required="true"
        :disabled="props.saving || props.loadingOptions"
        @update:model-value="(v) => patch('category_id', v != null ? Number(v) : 0)"
      />
    </div>

    <!-- Satuan -->
    <div class="md:col-span-6">
      <OptionSelect
        :model-value="props.form.unit_id || null"
        :options="props.unitOptions"
        label="Satuan"
        placeholder="Pilih satuan"
        search-placeholder="Cari satuan..."
        :required="true"
        :disabled="props.saving || props.loadingOptions"
        @update:model-value="(v) => patch('unit_id', v != null ? Number(v) : 0)"
      />
    </div>

    <!-- Harga Beli -->
    <div class="md:col-span-6">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Harga Beli
        <span class="text-rose-600">*</span>
      </label>
      <BaseInputClearable
        prefix="Rp"
        :model-value="props.purchasePriceFormatted"
        :disabled="props.saving"
        placeholder="0"
        @update:model-value="(val) => emit('update:purchasePrice', val)"
      />
    </div>

    <!-- Harga Jual -->
    <div class="md:col-span-6">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Harga Jual
        <span class="text-rose-600">*</span>
      </label>
      <BaseInputClearable
        prefix="Rp"
        :model-value="props.sellingPriceFormatted"
        :disabled="props.saving"
        placeholder="0"
        @update:model-value="(val) => emit('update:sellingPrice', val)"
      />
    </div>

    <!-- Deskripsi -->
    <div class="md:col-span-12">
      <BaseTextarea
        :model-value="props.form.description"
        label="Catatan"
        placeholder="Tambahkan catatan..."
        :rows="3"
        :disabled="props.saving"
        @update:model-value="(v) => patch('description', v ? String(v) : null)"
      />
    </div>

    <!-- Status -->
    <div class="md:col-span-12">
      <OptionSelect
        :model-value="props.form.is_active"
        label="Status"
        :options="props.statusOptions"
        :disabled="props.saving"
        :searchable="false"
        placeholder="Pilih status"
        @update:model-value="(v) => patch('is_active', Number(v) as 0 | 1)"
      />
    </div>
  </section>
</template>
