<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from '@/shared/composables/useToast'
import { useCurrencyInput } from '@/shared/composables/useCurrencyInput'
import { Package, Trash2, Plus, ImagePlus, Star } from 'lucide-vue-next'
// import { loadEnv } from 'vite'
import productService, { type Product, type ProductPayload } from '../services/productService'

import { useMasterOptions } from '../composables/useMasterOptions'
import BaseTextarea from '@/shared/components/ui/form/BaseTextarea.vue'
import BaseInput from '@/shared/components/ui/form/BaseInput.vue'
import OptionSelect from '@/shared/components/ui/form/OptionSelect.vue'
import BaseInputClearable from '@/shared/components/ui/form/BaseInputClearable.vue'

const toast = useToast()
// const env = loadEnv(process.cwd(), '')
interface UnitConversionRow {
  unit_id: number | null
  qty: number | null
}
const BACKEND_URL = import.meta.env.VITE_DEV_API_TARGET

interface ImageRow {
  id?: number
  url: string // URL final (backend) atau blob URL sementara
  is_primary: boolean
  uploading?: boolean // flag sedang upload
  tempUrl?: string // blob URL sementara (untuk revoke)
}

interface InfoRow {
  id?: number
  group: string // 'indication', 'dosage_rule', dll
  title: string // Keterangan (opsional)
  content: string // Isi teks
}

const productInfos = ref<InfoRow[]>([])
const infoTypeOptions = [
  { value: 'indication', label: 'Indikasi' },
  { value: 'dosage_rule', label: 'Aturan Pakai / Dosis' },
  { value: 'side_effect', label: 'Efek Samping' },
  { value: 'contraindication', label: 'Kontraindikasi' },
  { value: 'warning', label: 'Peringatan Khusus' },
  { value: 'storage', label: 'Cara Penyimpanan' },
]

function addProductInfo() {
  productInfos.value.push({ group: 'indication', title: '', content: '' })
}

function removeProductInfo(index: number) {
  productInfos.value.splice(index, 1)
}

const props = defineProps<{
  product?: Product | null
}>()

const emit = defineEmits<{
  select: [value: Product]
  close: []
}>()

// ── Master options ──
const masterOptions = useMasterOptions()
const {
  categoryOptions,
  unitOptions,
  loading: loadingOptions,
  loaded: optionsLoaded,
  load: loadMasterOptions,
} = masterOptions

const saving = ref(false)
const activeTab = ref<'product' | 'attributes'>('product')

// ── Form produk inti ──
const form = ref<ProductPayload>({
  sku: '',
  barcode: null,
  name: '',
  category_id: 0,
  unit_id: 0,
  purchase_price: 0,
  selling_price: 0,
  description: null,
  is_active: 1,
})

// ── Currency input ──
const purchasePrice = ref<number | string>(0)
const sellingPrice = ref<number | string>(0)

const purchasePriceInput = useCurrencyInput(purchasePrice)
const sellingPriceInput = useCurrencyInput(sellingPrice)

watch(purchasePrice, (v) => {
  form.value.purchase_price = Number(v) || 0
})
watch(sellingPrice, (v) => {
  form.value.selling_price = Number(v) || 0
})

// ── Satuan tambahan katalog (product_units) ──
const unitConversions = ref<UnitConversionRow[]>([])

// ── Foto produk (product_attributes tipe 'image') ──
const images = ref<ImageRow[]>([])
const imageUploading = ref(false)

const isEditing = computed(() => !!props.product)

// ── Reset form ──
function resetForm(product?: Product | null): void {
  form.value = {
    sku: product?.sku ?? '',
    barcode: product?.barcode ?? null,
    name: product?.name ?? '',
    category_id: product?.category_id ?? 0,
    unit_id: product?.unit_id ?? 0,
    purchase_price: Number(product?.purchase_price ?? 0),
    selling_price: Number(product?.selling_price ?? 0),
    description: product?.description ?? null,
    is_active: Number(product?.is_active ?? 1),
  }

  purchasePrice.value = Number(product?.purchase_price ?? 0)
  const baseSellingPrice = product?.prices?.find(
    (price) => Number(price.unit_id) === Number(product.unit_id)
      && price.customer_type == null
      && Number(price.min_qty) === 1
      && Number(price.is_active ?? 1) === 1,
  )?.price ?? product?.selling_price ?? 0
  form.value.selling_price = Number(baseSellingPrice)
  sellingPrice.value = Number(baseSellingPrice)

  unitConversions.value = product?.units
    ?.filter((unit) => Number(unit.is_base) === 0 && Number(unit.is_active) === 1)
    .map((unit) => ({ unit_id: Number(unit.unit_id), qty: Number(unit.conversion_factor) })) ?? []
  images.value = []
  activeTab.value = 'product'
}

watch(
  () => props.product,
  (p) => resetForm(p),
  { immediate: true }
)

// ── Helper ──
function getErrorMessage(error: any): string {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  if (typeof message === 'string') return message
  return error?.message || 'Terjadi kesalahan.'
}

// ── Konversi satuan ──
function addUnitConversion(): void {
  unitConversions.value.push({ unit_id: null, qty: null })
}

function removeUnitConversion(index: number): void {
  unitConversions.value.splice(index, 1)
}

// ── Foto ──
async function onImageSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validasi client-side
  if (file.size > 2 * 1024 * 1024) {
    toast.warning('Ukuran gambar maksimal 2MB.')
    input.value = ''
    return
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    toast.warning('Format gambar harus JPG, PNG, atau WEBP.')
    input.value = ''
    return
  }

  // 1. Preview instan pakai blob URL
  const tempUrl = URL.createObjectURL(file)
  const idx = images.value.length
  images.value.push({
    url: tempUrl,
    is_primary: idx === 0,
    uploading: true,
    tempUrl,
  })

  imageUploading.value = true

  try {
    const res = await productService.uploadImage(file)
    if (res.data?.error || !res.data?.data) {
      throw new Error(typeof res.data?.message === 'string' ? res.data.message : 'Gagal mengunggah gambar.')
    }

    // 2. Ganti blob URL dengan URL backend
    const row = images.value[idx]
    if (row) {
      // 👇👇👇 UBAH BARIS INI 👇👇👇
      row.url = BACKEND_URL + res.data.data.url
      // 👆👆👆 SEKARANG DITAMBAH BACKEND_URL 👆👆👆

      row.uploading = false
      // revoke blob URL karena sudah tidak dipakai
      if (row.tempUrl) {
        URL.revokeObjectURL(row.tempUrl)
        row.tempUrl = undefined
      }
    }
    toast.success('Gambar berhasil diunggah.')
  } catch (error: any) {
    // 3. Gagal → hapus baris preview
    const row = images.value[idx]
    if (row?.tempUrl) URL.revokeObjectURL(row.tempUrl)
    images.value.splice(idx, 1)
    toast.error(getErrorMessage(error))
  } finally {
    imageUploading.value = false
    input.value = ''
  }
}

async function removeImage(index: number): Promise<void> {
  const row = images.value[index]
  if (!row) return
  // Revoke blob jika masih berupa preview lokal
  if (row?.tempUrl) {
    URL.revokeObjectURL(row.tempUrl)
  }

  // Jika ini gambar baru (ada di folder temp), hapus dari server
  if (row?.url.includes('/uploads/products/temp/')) {
    const filename = row.url.split('/').pop()
    if (filename) {
      try {
        // await productService.deleteImage(filename)
        const response = await productService.deleteImage(filename)
        // Cek apakah backend mengembalikan error
        if (response.data?.error) {
          throw new Error(response.data.message || 'Gagal menghapus file')
        }

        // ✅ Notifikasi Berhasil
        toast.success('Gambar berhasil dihapus dari server.')
      } catch (e) {
        console.error('Gagal hapus gambar temp', e)
      }
    }
  }

  images.value.splice(index, 1)

  if (images.value.length && !images.value.some((i) => i.is_primary)) {
    images.value[0].is_primary = true
  }
}

function setPrimaryImage(index: number): void {
  images.value.forEach((img, i) => {
    img.is_primary = i === index
  })
}

// ── Validasi ──
function validateForm(): boolean {
  if (!form.value.sku.trim()) {
    toast.warning('SKU produk wajib diisi.')
    activeTab.value = 'product'
    return false
  }
  if (form.value.sku.trim().length > 50) {
    toast.warning('SKU maksimal 50 karakter.')
    activeTab.value = 'product'
    return false
  }
  if (form.value.barcode && form.value.barcode.trim().length > 100) {
    toast.warning('Barcode maksimal 100 karakter.')
    activeTab.value = 'product'
    return false
  }
  if (!form.value.name.trim()) {
    toast.warning('Nama produk wajib diisi.')
    activeTab.value = 'product'
    return false
  }
  if (form.value.name.trim().length < 2 || form.value.name.trim().length > 180) {
    toast.warning('Nama produk harus 2–180 karakter.')
    activeTab.value = 'product'
    return false
  }
  if (!form.value.category_id) {
    toast.warning('Silakan pilih kategori.')
    activeTab.value = 'product'
    return false
  }
  if (!form.value.unit_id) {
    toast.warning('Silakan pilih satuan.')
    activeTab.value = 'product'
    return false
  }
  if (!Number.isFinite(form.value.purchase_price) || form.value.purchase_price < 0) {
    toast.warning('Harga beli tidak valid.')
    activeTab.value = 'product'
    return false
  }
  if (!Number.isFinite(form.value.selling_price) || form.value.selling_price < 0) {
    toast.warning('Harga jual tidak valid.')
    activeTab.value = 'product'
    return false
  }

  const selectedUnitIds = new Set<number>()
  for (const row of unitConversions.value) {
    if (row.unit_id == null && row.qty != null) {
      toast.warning('Satuan konversi wajib dipilih.')
      activeTab.value = 'attributes'
      return false
    }
    if (row.unit_id != null) {
      if (Number(row.unit_id) === Number(form.value.unit_id)) {
        toast.warning('Satuan tambahan tidak boleh sama dengan satuan dasar.')
        activeTab.value = 'detail'
        return false
      }
      if (selectedUnitIds.has(Number(row.unit_id))) {
        toast.warning('Satuan yang sama tidak boleh dipilih lebih dari sekali.')
        activeTab.value = 'detail'
        return false
      }
      selectedUnitIds.add(Number(row.unit_id))
      if (!Number.isFinite(Number(row.qty)) || Number(row.qty) <= 0) {
        toast.warning('Faktor konversi harus lebih besar dari 0.')
        activeTab.value = 'detail'
        return false
      }
    }
  }

  return true
}

// ── Simpan ──
async function save(): Promise<void> {
  if (!optionsLoaded.value) {
    toast.warning('Data opsi belum berhasil dimuat.')
    return
  }
  if (!validateForm()) return

  saving.value = true

  const retainedUnitIds = new Set<number>([
    Number(form.value.unit_id),
    ...unitConversions.value
      .filter((row) => row.unit_id != null && Number(row.qty) > 0)
      .map((row) => Number(row.unit_id)),
  ])

  const existingPrices = (props.product?.prices ?? [])
    .filter((price) => Number(price.is_active ?? 1) === 1 && retainedUnitIds.has(Number(price.unit_id)))
    .map((price) => ({
      unit_id: Number(price.unit_id),
      customer_type: price.customer_type ?? null,
      min_qty: Number(price.min_qty),
      price: Number(price.price),
      is_active: 1 as const,
    }))

  const basePriceIndex = existingPrices.findIndex(
    (price) => price.unit_id === Number(form.value.unit_id)
      && price.customer_type === null
      && price.min_qty === 1,
  )

  const basePrice = {
    unit_id: Number(form.value.unit_id),
    customer_type: null,
    min_qty: 1,
    price: Number(form.value.selling_price),
    is_active: 1 as const,
  }

  if (basePriceIndex >= 0) existingPrices[basePriceIndex] = basePrice
  else if (basePrice.price > 0) existingPrices.push(basePrice)

  const attributes = [
    ...images.value
      .filter((image) => image.url && !image.uploading)
      .map((image, index) => ({
        ...(image.id ? { id: image.id } : {}),
        attr_type: 'image',
        value_json: { url: image.url.startsWith(BACKEND_URL) ? image.url.slice(BACKEND_URL.length) : image.url },
        is_primary: image.is_primary ? 1 as const : 0 as const,
        is_active: 1 as const,
        sort_order: index + 1,
      })),
    ...productInfos.value
      .filter((info) => info.group && info.content.trim() !== '')
      .map((info, index) => ({
        ...(info.id ? { id: info.id } : {}),
        attr_type: 'info',
        attr_group: info.group,
        title: info.title.trim() || null,
        content: info.content.trim(),
        is_active: 1 as const,
        sort_order: index + 1,
      })),
  ]

  const payload: ProductPayload = {
    sku: form.value.sku.trim(),
    barcode: form.value.barcode?.trim() || null,
    name: form.value.name.trim(),
    category_id: Number(form.value.category_id),
    unit_id: Number(form.value.unit_id),
    purchase_price: Number(form.value.purchase_price),
    selling_price: Number(form.value.selling_price),
    description: form.value.description?.trim() || null,
    is_active: Number(form.value.is_active) as 0 | 1,
    units: unitConversions.value
      .filter((row) => row.unit_id != null && Number(row.qty) > 0)
      .map((row, index) => ({
        unit_id: Number(row.unit_id),
        conversion_factor: Number(row.qty),
        is_base: 0 as const,
        is_purchase_unit: 0 as const,
        is_sale_unit: 1 as const,
        is_active: 1 as const,
        sort_order: index + 1,
      })),
    prices: existingPrices,
    attributes,
  }

  try {
    const response = isEditing.value
      ? await productService.update(props.product!.id, payload)
      : await productService.create(payload)

    const result = response.data

    if (result.error || !result.data) {
      throw new Error(typeof result.message === 'string' ? result.message : 'Gagal menyimpan produk.')
    }

    toast.success(isEditing.value ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.')

    emit('select', result.data)
    emit('close')
  } catch (error: any) {
    toast.error(getErrorMessage(error))
  } finally {
    saving.value = false
  }
}

// ── Load data saat edit ──
onMounted(async () => {
  await loadMasterOptions()

  if (props.product?.id) {
    // Atribut: unit + image
    try {
      const attrs = await productService.getAttributes(props.product.id)
      const infoList = attrs.data?.info ?? []
      productInfos.value = infoList.map((i) => ({
        id: i.id,
        group: i.attr_group,
        title: i.title ?? '',
        content: i.content,
      }))
      const unitList = props.product.units ?? []
      unitConversions.value = unitList
        .filter((unit) => Number(unit.is_base) === 0 && Number(unit.is_active) === 1)
        .map((unit) => ({
          unit_id: Number(unit.unit_id),
          qty: Number(unit.conversion_factor),
        }))

      const imageList = attrs.data?.image ?? []
      images.value = imageList.map((img) => ({
        id: img.id,
        url: BACKEND_URL + (img.value_json?.url ?? ''),
        is_primary: Number(img.is_primary) === 1,
      }))
    } catch {
      /* abaikan */
    }
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Tabs -->
    <div class="mb-5 flex border-b border-slate-200 dark:border-slate-800">
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="
          activeTab === 'product'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        "
        @click="activeTab = 'product'"
      >
        <Package class="w-4 h-4" />
        Produk
      </button>
      <button
        type="button"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px"
        :class="
          activeTab === 'attributes'
            ? 'border-primary-600 text-primary-600 dark:text-primary-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
        "
        @click="activeTab = 'attributes'"
      >
        <Package class="w-4 h-4" />
        Satuan & Atribut
      </button>
    </div>

    <form @submit.prevent="save">
      <!-- ══════════ Tab: Produk ══════════ -->
      <div v-show="activeTab === 'product'" class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <!-- SKU -->
        <div class="md:col-span-6">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            SKU
            <span class="text-rose-600">*</span>
          </label>

          <BaseInput v-model="form.sku" maxlength="50" placeholder="Kode produk" :disabled="saving" required />
        </div>

        <!-- Barcode -->
        <div class="md:col-span-6">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Barcode</label>
          <BaseInput v-model="form.barcode" maxlength="100" placeholder="Barcode produk" :disabled="saving" />
        </div>

        <!-- Nama -->
        <div class="md:col-span-12">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Nama Produk
            <span class="text-rose-600">*</span>
          </label>
          <BaseInput v-model="form.name" maxlength="180" placeholder="Nama produk" :disabled="saving" required />
        </div>

        <!-- Kategori -->
        <div class="md:col-span-6">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Kategori
            <span class="text-rose-600">*</span>
          </label>
          <OptionSelect
            :model-value="form.category_id"
            :options="categoryOptions"
            placeholder="Pilih kategori"
            search-placeholder="Cari kategori..."
            :disabled="saving || loadingOptions"
            @update:model-value="(v) => (form.category_id = Number(v))"
          />
        </div>

        <!-- Satuan -->
        <div class="md:col-span-6">
          <OptionSelect
            :model-value="form.unit_id"
            :options="unitOptions"
            label="Satuan"
            :required="true"
            :floating="false"
            placeholder="Pilih satuan"
            search-placeholder="Cari satuan..."
            :disabled="saving || loadingOptions"
            @update:model-value="(v) => (form.unit_id = v !== null ? Number(v) : 0)"
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
            :model-value="purchasePriceInput.formattedValue.value"
            :disabled="saving"
            placeholder="0"
            @update:model-value="(val) => purchasePriceInput.update(val)"
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
            :model-value="sellingPriceInput.formattedValue.value"
            :disabled="saving"
            placeholder="0"
            @update:model-value="(val) => sellingPriceInput.update(val)"
          />
        </div>

        <!-- Deskripsi -->
        <div class="md:col-span-12">
          <BaseTextarea
            v-model="form.description"
            label="Catatan"
            placeholder="Tambahkan catatan..."
            :rows="3"
            :floating="true"
            :disabled="saving"
          />
        </div>

        <!-- Status -->
        <div class="md:col-span-12">
          <OptionSelect
            v-model.number="form.is_active"
            label="Status"
            :options="[
              { value: 1, label: 'Aktif' },
              { value: 0, label: 'Tidak Aktif' },
            ]"
            :disabled="saving"
            :searchable="false"
            placeholder="Pilih status"
          />
        </div>
      </div>

      <!-- ══════════ Tab: Satuan & Atribut ══════════ -->
      <div v-show="activeTab === 'attributes'" class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <!-- Konversi Satuan -->
        <div class="md:col-span-12">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Konversi Satuan</label>

          <div v-if="unitConversions.length === 0" class="mb-3 text-sm italic text-slate-500">
            Belum ada konversi. Contoh: 1 Box = 100 Tablet.
          </div>

          <div v-for="(row, index) in unitConversions" :key="index" class="mb-2 flex items-center gap-2">
            <div class="flex-1">
              <OptionSelect
                v-model="row.unit_id"
                :options="unitOptions"
                placeholder="Pilih satuan"
                :disabled="saving"
              />
            </div>
            <span class="px-1 font-medium text-slate-500">=</span>
            <!-- <input
              v-model.number="row.qty"
              type="number"
              min="1"
              step="1"
              placeholder="Jumlah"
              :disabled="saving"
              class="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            /> -->
            <BaseButtonSpin v-model="row.qty" :min="0" width="w-auto" />
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-900/30"
              title="Hapus"
              :disabled="saving"
              @click="removeUnitConversion(index)"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            class="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-primary-600 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-50 disabled:opacity-50 dark:border-primary-500 dark:text-primary-400 dark:hover:bg-primary-900/20"
            :disabled="saving"
            @click="addUnitConversion"
          >
            <Plus class="w-4 h-4" />
            Tambah Satuan
          </button>
          <p class="mt-2 text-xs text-slate-500">Contoh: Box = 100, Strip = 10. Artinya 1 Box = 100 Tablet, 1 Strip = 10 Tablet.</p>
        </div>
        <!-- Informasi Tambahan Fleksibel -->
        <div class="md:col-span-12 mt-4">
          <label class="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Informasi Tambahan (Indikasi, Efek Samping, dll)
          </label>

          <div
            v-if="productInfos.length === 0"
            class="mb-4 rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-slate-700"
          >
            Belum ada informasi tambahan.
          </div>

          <!-- List Info (Card Style) -->
          <div class="space-y-3 mb-4">
            <div
              v-for="(row, index) in productInfos"
              :key="index"
              class="relative rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <!-- Tombol Hapus di Pojok Kanan Atas -->
              <button
                type="button"
                class="absolute right-3 top-3 inline-flex items-center justify-center rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 dark:hover:bg-rose-900/30"
                title="Hapus"
                :disabled="saving"
                @click="removeProductInfo(index)"
              >
                <Trash2 class="w-4 h-4" />
              </button>

              <div class="grid grid-cols-1 md:grid-cols-12 gap-4 pr-8">
                <!-- Dropdown Tipe Info -->
                <div class="md:col-span-5">
                  <label class="mb-1 block text-xs font-medium text-slate-500">Tipe Informasi</label>
                  <OptionSelect
                    v-model="row.group"
                    :options="infoTypeOptions"
                    placeholder="Pilih tipe informasi..."
                    :searchable="false"
                    :disabled="saving"
                  />
                </div>
                <!-- Input Keterangan (Judul) -->
                <div class="md:col-span-7">
                  <label class="mb-1 block text-xs font-medium text-slate-500">Keterangan (Opsional)</label>
                  <BaseInput v-model="row.title" placeholder="cth: Dewasa, Anak 6-12 thn" :disabled="saving" />
                </div>

                <!-- Input Konten -->
                <div class="md:col-span-12">
                  <label class="mb-1 block text-xs font-medium text-slate-500">Isi Teks</label>
                  <BaseTextarea
                    v-model="row.content"
                    placeholder="cth: 1 tablet diminum 3x sehari setelah makan"
                    :rows="2"
                    :disabled="saving"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Tombol Tambah -->
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-600 bg-white px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-50 disabled:opacity-50 dark:border-primary-500 dark:bg-slate-900 dark:text-primary-400 dark:hover:bg-primary-900/20"
            :disabled="saving"
            @click="addProductInfo"
          >
            <Plus class="w-4 h-4" />
            Tambah Informasi
          </button>
        </div>
        <!-- Foto Produk -->
        <div class="md:col-span-12">
          <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Foto Produk</label>

          <div class="flex flex-wrap gap-3">
            <!-- Preview -->
            <div
              v-for="(img, index) in images"
              :key="index"
              class="relative h-28 w-28 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <img :src="img.url" class="h-full w-full object-cover" alt="Foto produk" />

              <!-- Overlay loading -->
              <div v-if="img.uploading" class="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <span class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
              </div>

              <!-- Tombol primary & hapus (sembunyikan saat uploading) -->
              <template v-if="!img.uploading">
                <button
                  type="button"
                  class="absolute left-1 top-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  :class="img.is_primary ? 'bg-emerald-600 text-white' : 'bg-slate-700/70 text-white hover:bg-slate-800'"
                  :title="img.is_primary ? 'Foto utama' : 'Jadikan foto utama'"
                  @click="setPrimaryImage(index)"
                >
                  <Star class="w-3 h-3" />
                  {{ img.is_primary ? 'Utama' : 'Set Utama' }}
                </button>

                <button
                  type="button"
                  class="absolute right-1 top-1 rounded-full bg-rose-600 p-1 text-white hover:bg-rose-700"
                  title="Hapus foto"
                  @click="removeImage(index)"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </template>
            </div>

            <!-- Tombol Upload -->
            <label
              class="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-primary-500 hover:text-primary-600 dark:border-slate-700 dark:text-slate-400"
              :class="{ 'pointer-events-none opacity-50': imageUploading || saving }"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                :disabled="imageUploading || saving"
                @change="onImageSelected"
              />
              <Plus v-if="!imageUploading" class="w-5 h-5" />
              <ImagePlus v-if="!imageUploading" class="mt-1 w-5 h-5" />
              <span v-if="!imageUploading" class="mt-1 text-xs">Tambah Foto</span>
              <span v-else class="mt-1 text-xs">Mengunggah...</span>
            </label>
          </div>
          <p class="mt-2 text-xs text-slate-500">JPG/PNG/WEBP, maks 2MB. Foto pertama otomatis jadi utama.</p>
        </div>

      </div>

      <!-- Footer -->
      <div
        class="mt-6 flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row"
      >
        <div class="w-full text-center text-sm text-slate-500 sm:w-auto sm:text-left">
          <span v-if="activeTab === 'product'">
            Field bertanda
            <span class="text-rose-600">*</span>
            wajib diisi.
          </span>
          <span v-else>Atur satuan tambahan dan atribut produk.</span>
        </div>

        <div class="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
            :disabled="saving || loadingOptions || !optionsLoaded"
            @click="emit('close')"
          >
            Batal
          </button>
          <button
            type="submit"
            class="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50 sm:flex-none"
            :disabled="saving || loadingOptions"
          >
            <span
              v-if="saving"
              class="mr-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            ></span>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
