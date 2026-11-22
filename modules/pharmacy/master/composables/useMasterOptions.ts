import { computed, ref } from 'vue'

import categoryService, { type Category } from '@/modules/pharmacy/master/services/categoryService'
import unitService, { type Unit } from '@/modules/pharmacy/master/services/unitService'
import dosageFormService, { type DosageForm, type DosageFormListData } from '@/modules/pharmacy/master/services/dosageFormService'
import type { ApiResponse } from '@/core/api/types'
import type { OptionItem } from '@/shared/composables/useOption'

const categories = ref<Category[]>([])
const dosageForms = ref<DosageForm[]>([])
const units = ref<Unit[]>([])
const loading = ref(false)
const loaded = ref(false)
const error = ref<string>('')

function getErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: unknown } }; message?: string }
  const m = err?.response?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  if (typeof m === 'string') return m
  return err?.message || 'Gagal memuat data.'
}

async function load(force = false): Promise<void> {
  if (loaded.value && !force) return
  if (loading.value) return

  loading.value = true
  error.value = ''

  try {
    const [catRes, unitRes, dosageRes] = await Promise.all([
      categoryService.getAll({ page: 1, per_page: 100, module: 'pharmacy' }),
      unitService.getAll({ page: 1, per_page: 100 }),
      dosageFormService.getAll({ page: 1, per_page: 100, is_active: 1 }),
    ])

    // category: response.data = CategoryListData (langsung data)
    const catData = catRes.data
    if (!catData) throw new Error('Gagal memuat kategori.')
    categories.value = catData.items.filter((c) => Number(c.is_active) === 1)

    // unit: response.data = ApiResponse<UnitListData>
    const unitResult = unitRes.data
    if (unitResult.error || !unitResult.data) {
      throw new Error(typeof unitResult.message === 'string' ? unitResult.message : 'Gagal memuat satuan.')
    }
    units.value = unitResult.data.items

    // dosage form: response.data = ApiResponse<DosageFormListData>
    const dosageResult: ApiResponse<DosageFormListData> = dosageRes.data
    if (dosageResult.error || !dosageResult.data) {
      throw new Error(typeof dosageResult.message === 'string' ? dosageResult.message : 'Gagal memuat bentuk sediaan.')
    }
    dosageForms.value = dosageResult.data.items.filter((d: DosageForm) => Number(d.is_active) === 1)

    loaded.value = true
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}

function reset(): void {
  categories.value = []
  dosageForms.value = []
  units.value = []
  loaded.value = false
  error.value = ''
}

export function useMasterOptions() {
  const categoryOptions = computed<OptionItem[]>(() =>
    categories.value.map((c) => ({
      value: c.id,
      label: c.name,
      description: c.description ?? undefined,
    }))
  )

  const dosageFormOptions = computed<OptionItem[]>(() =>
    dosageForms.value.map((d) => ({
      value: d.id,
      label: d.name,
    }))
  )

  const unitOptions = computed<OptionItem[]>(() =>
    units.value.map((u) => ({
      value: u.id,
      label: u.name,
      description: u.abbreviation,
      keywords: u.abbreviation,
    }))
  )

  return {
    categories,
    dosageForms,
    units,
    loading,
    loaded,
    error,
    categoryOptions,
    dosageFormOptions,
    unitOptions,
    load,
    reset,
  }
}
