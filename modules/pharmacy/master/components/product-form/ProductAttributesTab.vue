<script setup lang="ts">
import type { OptionItem } from '@/shared/composables/useOption'
import type { InfoRow, PharmacyForm, UnitConversionRow } from '../composables/useProductForm'
import type { ImageRow } from '../composables/useProductImages'

import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import BaseCheckbox from '@/shared/components/ui/form/BaseCheckbox.vue'
import BaseButtonSpin from '@/shared/components/ui/form/BaseButtonSpin.vue'
import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'

import ProductImagesField from './ProductImagesField.vue'
import ProductInfoList from './ProductInfoList.vue'
import ProductUnitConversions from './ProductUnitConversions.vue'

const props = defineProps<{
  pharmacyForm: PharmacyForm
  unitConversions: UnitConversionRow[]
  productInfos: InfoRow[]
  images: ImageRow[]
  imageUploading: boolean
  dosageFormOptions: OptionItem[]
  unitOptions: OptionItem[]
  infoTypeOptions: OptionItem[]
  selectedDosageFormId: number | string | null
  saving: boolean
  loadingOptions: boolean
}>()

const emit = defineEmits<{
  'update:pharmacyForm': [value: PharmacyForm]
  'update:unitConversions': [rows: UnitConversionRow[]]
  'update:productInfos': [rows: InfoRow[]]
  'dosage-form-change': [value: number | string | null]
  'add-unit-conversion': []
  'remove-unit-conversion': [index: number]
  'add-product-info': []
  'remove-product-info': [index: number]
  'add-image': [file: File]
  'remove-image': [index: number]
  'set-primary-image': [index: number]
}>()

function patch<K extends keyof PharmacyForm>(key: K, value: PharmacyForm[K]): void {
  emit('update:pharmacyForm', { ...props.pharmacyForm, [key]: value })
}
</script>

<template>
  <section class="grid grid-cols-1 gap-4 md:grid-cols-12">
    <div class="md:col-span-6">
      <BaseInput
        :model-value="props.pharmacyForm.generic_name"
        label="Nama Generik"
        placeholder="cth: Paracetamol"
        :disabled="props.saving"
        maxlength="200"
        @update:model-value="(v) => patch('generic_name', String(v ?? ''))"
      />
    </div>

    <div class="md:col-span-6">
      <BaseInput
        :model-value="props.pharmacyForm.active_ingredient"
        label="Zat Aktif"
        placeholder="cth: Paracetamol"
        :disabled="props.saving"
        maxlength="200"
        @update:model-value="(v) => patch('active_ingredient', String(v ?? ''))"
      />
    </div>

    <div class="md:col-span-6">
      <OptionSelect
        :model-value="props.selectedDosageFormId"
        :options="props.dosageFormOptions"
        label="Bentuk Sediaan"
        id="dosage-form"
        placeholder="Pilih bentuk sediaan..."
        search-placeholder="Cari bentuk sediaan..."
        :disabled="props.saving || props.loadingOptions"
        @update:model-value="(v) => emit('dosage-form-change', v)"
      />
    </div>

    <div class="md:col-span-6">
      <BaseInput
        :model-value="props.pharmacyForm.strength"
        label="Kekuatan / Dosis"
        placeholder="cth: 500 mg"
        :disabled="props.saving"
        maxlength="200"
        @update:model-value="(v) => patch('strength', String(v ?? ''))"
      />
    </div>

    <div class="md:col-span-6">
      <BaseInput
        :model-value="props.pharmacyForm.drug_class"
        label="Golongan Obat"
        placeholder="cth: Obat Bebas, Obat Keras"
        :disabled="props.saving"
        maxlength="50"
        @update:model-value="(v) => patch('drug_class', String(v ?? ''))"
      />
    </div>

    <div class="md:col-span-6">
      <BaseInput
        :model-value="props.pharmacyForm.bpom_number"
        label="No. Izin Edar/BPOM"
        placeholder="cth: DBL1234567890A1"
        :disabled="props.saving"
        maxlength="200"
        @update:model-value="(v) => patch('bpom_number', String(v ?? ''))"
      />
    </div>

    <div class="md:col-span-12">
      <BaseCheckbox
        :model-value="props.pharmacyForm.requires_prescription"
        label="Perlu Resep Dokter"
        description="Wajib"
        variant="svg-draw"
        :true-value="1"
        :false-value="0"
        :disabled="props.saving"
        @update:model-value="(v) => patch('requires_prescription', Number(v))"
      />
    </div>

    <div class="md:col-span-12">
      <ProductUnitConversions
        :rows="props.unitConversions"
        :unit-options="props.unitOptions"
        :disabled="props.saving"
        @update:rows="(rows) => emit('update:unitConversions', rows)"
        @add="emit('add-unit-conversion')"
        @remove="(i) => emit('remove-unit-conversion', i)"
      />
    </div>

    <div class="md:col-span-12">
      <ProductInfoList
        :rows="props.productInfos"
        :type-options="props.infoTypeOptions"
        :disabled="props.saving"
        @update:rows="(rows) => emit('update:productInfos', rows)"
        @add="emit('add-product-info')"
        @remove="(i) => emit('remove-product-info', i)"
      />
    </div>

    <div class="md:col-span-12">
      <ProductImagesField
        :images="props.images"
        :uploading="props.imageUploading"
        :disabled="props.saving"
        @add="(f) => emit('add-image', f)"
        @remove="(i) => emit('remove-image', i)"
        @set-primary="(i) => emit('set-primary-image', i)"
      />
    </div>

    <div class="md:col-span-4">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stok Minimum</label>
      <BaseButtonSpin
        :model-value="props.pharmacyForm.min_stock"
        :min="0"
        :disabled="props.saving"
        size="md"
        @update:model-value="(v) => patch('min_stock', Number(v ?? 0))"
      />
    </div>

    <div class="md:col-span-4">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Stok Maksimum</label>
      <BaseButtonSpin
        :model-value="props.pharmacyForm.max_stock"
        :min="0"
        :disabled="props.saving"
        size="md"
        @update:model-value="(v) => patch('max_stock', v != null ? Number(v) : null)"
      />
    </div>

    <div class="md:col-span-4">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Rak / Lokasi</label>
      <input
        :value="props.pharmacyForm.rack_location"
        type="text"
        maxlength="50"
        placeholder="cth: A1"
        :disabled="props.saving"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        @input="(e) => patch('rack_location', (e.target as HTMLInputElement).value)"
      />
    </div>

    <div class="md:col-span-12">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Pabrik</label>
      <input
        :value="props.pharmacyForm.manufacturer"
        type="text"
        maxlength="150"
        placeholder="cth: Kimia Farma"
        :disabled="props.saving"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        @input="(e) => patch('manufacturer', (e.target as HTMLInputElement).value)"
      />
    </div>
  </section>
</template>
