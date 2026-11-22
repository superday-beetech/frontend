import { computed, ref, watch, nextTick, type Ref } from 'vue'
import productService, { type Product, type ProductPayload } from '../../services/productService'
import { SKU_PATTERN, BACKEND_URL } from '../constants/product'
import { useProductImages } from './useProductImages'
import { useProductSku } from './useProductSku'
import type { OptionItem } from '@/shared/composables/useOption'
export interface PharmacyForm {
  generic_name: string
  active_ingredient: string
  dosage_form: string
  strength: string
  drug_class: string
  bpom_number: string
  requires_prescription: number
  min_stock: number
  max_stock: number | null
  rack_location: string
  manufacturer: string
}

export interface UnitConversionRow {
  unit_id: number | null
  qty: number | null
}

export interface InfoRow {
  id?: number
  group: string
  title: string
  content: string
}

type TabKey = 'product' | 'attributes'
type SkuMode = 'manual' | 'auto'

interface UseProductFormOptions {
  product: Ref<Product | null | undefined>
  /** Daftar opsi bentuk sediaan (dari master). */
  dosageFormOptions: Ref<OptionItem[]>
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
  onWarning?: (message: string) => void
}

const createEmptyPharmacyForm = (): PharmacyForm => ({
  generic_name: '',
  active_ingredient: '',
  dosage_form: '',
  strength: '',
  drug_class: '',
  bpom_number: '',
  requires_prescription: 0,
  min_stock: 0,
  max_stock: null,
  rack_location: '',
  manufacturer: '',
})

const createEmptyProductForm = (): ProductPayload => ({
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

/**
 * State inti form produk + validasi + payload builder + save.
 * Menggabungkan useProductSku & useProductImages.
 */
export function useProductForm(options: UseProductFormOptions) {
  const { product, dosageFormOptions, onError, onSuccess, onWarning } = options

  // ── State ──
  const activeTab = ref<TabKey>('product')
  const saving = ref(false)
  const skuMode = ref<SkuMode>('manual')
  const form = ref<ProductPayload>(createEmptyProductForm())
  const pharmacyForm = ref<PharmacyForm>(createEmptyPharmacyForm())
  const pharmacyAttributeId = ref<number | null>(null)

  const unitConversions = ref<UnitConversionRow[]>([])
  const productInfos = ref<InfoRow[]>([])

  // ── Composable anak ──
  const sku = useProductSku({
    initialSku: () => form.value.sku,
    onError,
  })

  const images = useProductImages({ onError, onSuccess, onWarning })

  watch(sku.sku, (v) => {
    form.value.sku = v
  })

  async function setSkuMode(mode: SkuMode): Promise<void> {
    skuMode.value = mode

    // Batalkan request sebelumnya dan pertahankan SKU saat ini.
    sku.reset(sku.sku.value)

    if (mode === 'manual') return

    if (!form.value.category_id) {
      activeTab.value = 'product'

      onWarning?.('Silakan pilih kategori produk terlebih dahulu.')

      await nextTick()

      requestAnimationFrame(() => {
        const field = document.getElementById('product-category')

        field?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })

        field?.focus()
      })

      return
    }
    if (!pharmacyForm.value.dosage_form.trim()) {
      activeTab.value = 'attributes'

      onWarning?.('Silakan pilih bentuk sediaan terlebih dahulu.')

      await nextTick()

      requestAnimationFrame(() => {
        const field = document.getElementById('dosage-form')

        field?.focus()
        field?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })

      return
    }

    await sku.generate(Number(form.value.category_id), pharmacyForm.value.dosage_form.trim())
  }

  watch([() => form.value.category_id, () => pharmacyForm.value.dosage_form, skuMode], async ([categoryId, dosageForm, mode]) => {
    if (mode !== 'auto') return
    if (product.value?.id || sku.manuallyEdited.value) return

    if (!categoryId) {
      activeTab.value = 'product'
      return
    }

    if (!dosageForm.trim()) {
      activeTab.value = 'attributes'
      return
    }

    await sku.generate(Number(categoryId), dosageForm.trim())
  })
  // ── Bentuk Sediaan: mapping string ↔ id ──
  const selectedDosageFormId = computed<number | string | null>(() => {
    const current = pharmacyForm.value.dosage_form.trim()
    if (!current) return null

    const match = dosageFormOptions.value.find((opt) => String(opt.label).toLowerCase() === current.toLowerCase())
    return match ? match.value : null
  })

  function onDosageFormChange(value: number | string | null): void {
    if (value == null || value === '') {
      pharmacyForm.value.dosage_form = ''
      return
    }

    const match = dosageFormOptions.value.find((opt) => String(opt.value) === String(value))

    pharmacyForm.value.dosage_form = match ? String(match.label) : ''
  }

  // ── Reset ──
  function reset(productData?: Product | null): void {
    form.value = {
      sku: productData?.sku ?? '',
      barcode: productData?.barcode ?? null,
      name: productData?.name ?? '',
      category_id: productData?.category_id ?? 0,
      unit_id: productData?.unit_id ?? 0,
      purchase_price: Number(productData?.purchase_price ?? 0),
      selling_price: Number(productData?.selling_price ?? 0),
      description: productData?.description ?? null,
      is_active: Number(productData?.is_active ?? 1) === 0 ? 0 : 1,
    }
    skuMode.value = 'manual'
    sku.reset(productData?.sku ?? '')

    const basePrice =
      productData?.prices?.find(
        (p) =>
          Number(p.unit_id) === Number(productData.unit_id) &&
          p.customer_type == null &&
          Number(p.min_qty) === 1 &&
          Number(p.is_active ?? 1) === 1
      )?.price ??
      productData?.selling_price ??
      0

    form.value.selling_price = Number(basePrice)

    pharmacyAttributeId.value = null
    pharmacyForm.value = createEmptyPharmacyForm()

    unitConversions.value =
      productData?.units
        ?.filter((u) => Number(u.is_base) === 0 && Number(u.is_active) === 1)
        .map((u) => ({
          unit_id: Number(u.unit_id),
          qty: Number(u.conversion_factor),
        })) ?? []

    images.reset([])
    productInfos.value = []
    activeTab.value = 'product'
  }

  // ── Validasi ──
  function validate(): boolean {
    const fail = (msg: string, tab: TabKey = 'product'): false => {
      onWarning?.(msg)
      activeTab.value = tab
      return false
    }

    const { sku: skuValue, barcode, name, category_id, unit_id } = form.value
    const skuTrim = skuValue.trim()
    const nameTrim = name.trim()

    if (skuTrim && !SKU_PATTERN.test(skuTrim)) {
      return fail('Format SKU tidak valid. Contoh: OBT-TAB-001.')
    }
    if (skuTrim.length > 50) return fail('SKU maksimal 50 karakter.')
    if (barcode && barcode.trim().length > 100) {
      return fail('Barcode maksimal 100 karakter.')
    }
    if (!nameTrim) return fail('Nama produk wajib diisi.')
    if (nameTrim.length < 2 || nameTrim.length > 180) {
      return fail('Nama produk harus 2–180 karakter.')
    }
    if (!category_id) return fail('Silakan pilih kategori.')
    if (!unit_id) return fail('Silakan pilih satuan.')

    if (!Number.isFinite(form.value.purchase_price) || form.value.purchase_price < 0) {
      return fail('Harga beli tidak valid.')
    }
    if (!Number.isFinite(form.value.selling_price) || form.value.selling_price < 0) {
      return fail('Harga jual tidak valid.')
    }

    const seen = new Set<number>()

    for (const row of unitConversions.value) {
      if (row.unit_id == null && row.qty != null) {
        return fail('Satuan konversi wajib dipilih.', 'attributes')
      }
      if (row.unit_id == null) continue

      const id = Number(row.unit_id)

      if (id === Number(unit_id)) {
        return fail('Satuan tambahan tidak boleh sama dengan satuan dasar.', 'attributes')
      }
      if (seen.has(id)) {
        return fail('Satuan yang sama tidak boleh dipilih lebih dari sekali.', 'attributes')
      }

      seen.add(id)

      if (!Number.isFinite(Number(row.qty)) || Number(row.qty) <= 0) {
        return fail('Faktor konversi harus lebih besar dari 0.', 'attributes')
      }
    }

    return true
  }

  // ── Build payload ──
  function buildPayload(): ProductPayload {
    const retainedUnitIds = new Set<number>([
      Number(form.value.unit_id),
      ...unitConversions.value.filter((r) => r.unit_id != null && Number(r.qty) > 0).map((r) => Number(r.unit_id)),
    ])

    const existingPrices = (product.value?.prices ?? [])
      .filter((p) => Number(p.is_active ?? 1) === 1 && retainedUnitIds.has(Number(p.unit_id)))
      .map((p) => ({
        unit_id: Number(p.unit_id),
        customer_type: p.customer_type ?? null,
        min_qty: Number(p.min_qty),
        price: Number(p.price),
        is_active: 1 as const,
      }))

    const baseIndex = existingPrices.findIndex(
      (p) => p.unit_id === Number(form.value.unit_id) && p.customer_type === null && p.min_qty === 1
    )

    const basePrice = {
      unit_id: Number(form.value.unit_id),
      customer_type: null,
      min_qty: 1,
      price: Number(form.value.selling_price),
      is_active: 1 as const,
    }

    if (baseIndex >= 0) existingPrices[baseIndex] = basePrice
    else if (basePrice.price > 0) existingPrices.push(basePrice)

    const ph = pharmacyForm.value
    const pharmacyProfile = {
      generic_name: ph.generic_name.trim() || null,
      active_ingredient: ph.active_ingredient.trim() || null,
      dosage_form: ph.dosage_form.trim() || null,
      strength: ph.strength.trim() || null,
      drug_class: ph.drug_class.trim() || null,
      bpom_number: ph.bpom_number.trim() || null,
      requires_prescription: Number(ph.requires_prescription),
      min_stock: Number(ph.min_stock ?? 0),
      max_stock: ph.max_stock != null ? Number(ph.max_stock) : null,
      rack_location: ph.rack_location.trim() || null,
      manufacturer: ph.manufacturer.trim() || null,
    }

    const hasProfile = Object.entries(pharmacyProfile).some(([key, value]) =>
      key === 'requires_prescription' || key === 'min_stock' ? Number(value) !== 0 : value !== null && value !== ''
    )

    const pharmacyAttributes = hasProfile
      ? [
          {
            ...(pharmacyAttributeId.value ? { id: pharmacyAttributeId.value } : {}),
            attr_type: 'pharmacy',
            attr_group: 'profile',
            title: 'Profil Farmasi',
            value_json: pharmacyProfile,
            is_active: 1 as const,
            sort_order: 1,
          },
        ]
      : []

    const mediaAttributes = images.images.value
      .filter((img) => img.url && !img.uploading)
      .map((img, i) => ({
        ...(img.id ? { id: img.id } : {}),
        attr_type: 'image',
        value_json: {
          url: img.url.startsWith(BACKEND_URL) ? img.url.slice(BACKEND_URL.length) : img.url,
        },
        is_primary: img.isPrimary ? (1 as const) : (0 as const),
        is_active: 1 as const,
        sort_order: i + 1,
      }))

    const infoAttributes = productInfos.value
      .filter((i) => i.group && i.content.trim())
      .map((i, idx) => ({
        ...(i.id ? { id: i.id } : {}),
        attr_type: 'info',
        attr_group: i.group,
        title: i.title.trim() || null,
        content: i.content.trim(),
        is_active: 1 as const,
        sort_order: idx + 1,
      }))

    return {
      sku: form.value.sku.trim(),
      sku_auto_generated: !product.value?.id && !sku.manuallyEdited.value,
      barcode: form.value.barcode?.trim() || null,
      name: form.value.name.trim(),
      category_id: Number(form.value.category_id),
      unit_id: Number(form.value.unit_id),
      purchase_price: Number(form.value.purchase_price),
      selling_price: Number(form.value.selling_price),
      description: form.value.description?.trim() || null,
      is_active: Number(form.value.is_active) as 0 | 1,
      units: unitConversions.value
        .filter((r) => r.unit_id != null && Number(r.qty) > 0)
        .map((r, i) => ({
          unit_id: Number(r.unit_id),
          conversion_factor: Number(r.qty),
          is_base: 0 as const,
          is_purchase_unit: 0 as const,
          is_sale_unit: 1 as const,
          is_active: 1 as const,
          sort_order: i + 1,
        })),
      prices: existingPrices,
      attributes: [...pharmacyAttributes, ...mediaAttributes, ...infoAttributes],
    }
  }

  // ── Save ──
  async function save(): Promise<Product | null> {
    if (!validate()) return null

    saving.value = true

    try {
      const payload = buildPayload()
      const res = product.value?.id ? await productService.update(product.value.id, payload) : await productService.create(payload)

      const result = res.data
      if (result.error || !result.data) {
        throw new Error(typeof result.message === 'string' ? result.message : 'Gagal menyimpan produk.')
      }

      onSuccess?.(product.value?.id ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.')
      return result.data
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Gagal menyimpan produk.')
      return null
    } finally {
      saving.value = false
    }
  }

  // ── Load atribut saat edit ──
  async function loadAttributes(): Promise<void> {
    if (!product.value?.id) return

    try {
      const attrs = await productService.getAttributes(product.value.id)

      const pharmacy = attrs.data?.pharmacy?.[0]
      if (pharmacy) {
        pharmacyAttributeId.value = pharmacy.id
        const d = pharmacy.value_json
        pharmacyForm.value = {
          generic_name: d.generic_name ?? '',
          active_ingredient: d.active_ingredient ?? '',
          dosage_form: d.dosage_form ?? '',
          strength: d.strength ?? '',
          drug_class: d.drug_class ?? '',
          bpom_number: d.bpom_number ?? '',
          requires_prescription: Number(d.requires_prescription ?? 0),
          min_stock: Number(d.min_stock ?? 0),
          max_stock: d.max_stock != null ? Number(d.max_stock) : null,
          rack_location: d.rack_location ?? '',
          manufacturer: d.manufacturer ?? '',
        }
      }

      productInfos.value = (attrs.data?.info ?? []).map((i) => ({
        id: i.id,
        group: i.attr_group,
        title: i.title ?? '',
        content: i.content,
      }))

      unitConversions.value = (product.value.units ?? [])
        .filter((u) => Number(u.is_base) === 0 && Number(u.is_active) === 1)
        .map((u) => ({
          unit_id: Number(u.unit_id),
          qty: Number(u.conversion_factor),
        }))

      images.reset(
        (attrs.data?.image ?? []).map((img) => ({
          id: img.id,
          url: BACKEND_URL + (img.value_json?.url ?? ''),
          isPrimary: Number(img.is_primary) === 1,
        }))
      )
    } catch {
      // diamkan — atribut opsional
    }
  }

  return {
    activeTab,
    saving,
    skuMode,
    setSkuMode,
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
  }
}
