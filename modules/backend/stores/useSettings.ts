import { computed, onMounted, ref } from 'vue'

import api from '@/core/api/client'

import type { SettingRow, SettingType, SettingGroup, NewClassForm, SettingsIndexResponse, SettingsApiResponse } from '../types/settings'

import { getSettingField } from '../types/setting-fields'
import { useSettingsStore } from '@/shared/stores/settings.store'

const appSettings = useSettingsStore()
// ======================================================
// CONSTANTS
// ======================================================

const API = '/backend/setting-api'
const ACTIVE_TAB_KEY = 'erp-settings-active-tab'

// ======================================================
// COMPOSABLE
// ======================================================

export function useSettings() {
  // ----------------------------------------------------
  // STATE
  // ----------------------------------------------------

  const groups = ref<SettingGroup[]>([])
  const selectedGroupId = ref('')

  const rows = ref<SettingRow[]>([])
  const forget = ref<string[]>([])

  const loading = ref(false)
  const saving = ref(false)
  const addingClass = ref(false)

  const showAddModal = ref(false)

  const newClass = ref<NewClassForm>({
    class: '',
    property: '',
    type: 'string',
    value: '',
    context: '',
  })

  // ----------------------------------------------------
  // COMPUTED
  // ----------------------------------------------------

  const selectedGroup = computed(() => groups.value.find((group) => group.id === selectedGroupId.value) ?? null)

  // ----------------------------------------------------
  // ERROR HANDLING
  // ----------------------------------------------------

  function getErrorMessage(error: unknown, fallback = 'Terjadi kesalahan.'): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string
              errors?: Record<string, string | string[]>
            }
          }
        }
      ).response

      const data = response?.data

      if (data?.errors) {
        return Object.values(data.errors).flat().join('\n')
      }

      if (data?.message) {
        return data.message
      }
    }

    if (error instanceof Error) {
      return error.message
    }

    return fallback
  }

  // ----------------------------------------------------
  // VALUE HELPERS
  // ----------------------------------------------------

  function displayValue(value: unknown, type: SettingType): string {
    if (type === 'boolean') {
      return String(value === true || value === 'true' || value === 1 || value === '1')
    }

    if (type === 'json') {
      return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    }

    return String(value ?? '')
  }

  function normalizeValue(value: string, type: SettingType): unknown {
    switch (type) {
      case 'boolean':
        return value === 'true' || value === '1'

      case 'integer':
        return Number.parseInt(value, 10)

      case 'float':
        return Number(value)

      case 'json':
        return JSON.parse(value)

      default:
        return value
    }
  }

  // ----------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------

  function validateProperty(property: string): void {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(property)) {
      throw new Error(`Nama properti "${property}" tidak valid.`)
    }
  }

  function validateValue(property: string, value: string | boolean, type: SettingType): void {
    if (type === 'json') {
      try {
        JSON.parse(String(value))
      } catch {
        throw new Error(`Format JSON pada "${property}" tidak valid.`)
      }
    }

    if (type === 'integer' && !/^-?\d+$/.test(String(value))) {
      throw new Error(`Nilai "${property}" harus berupa bilangan bulat.`)
    }

    if (type === 'float' && (String(value).trim() === '' || !Number.isFinite(Number(value)))) {
      throw new Error(`Nilai "${property}" harus berupa angka.`)
    }
  }

  function validateRows(): void {
    const names = new Set<string>()

    for (const row of rows.value) {
      const property = row.property.trim()

      // Lewati baris yang benar-benar kosong.
      if (!property && !String(row.value).trim()) {
        continue
      }

      validateProperty(property)

      const normalized = property.toLowerCase()

      if (names.has(normalized)) {
        throw new Error(`Properti "${property}" ditulis lebih dari sekali.`)
      }

      names.add(normalized)

      validateValue(property, row.value, row.type)
    }

    for (const property of forget.value) {
      if (names.has(property.toLowerCase())) {
        throw new Error(`Properti "${property}" tidak dapat disimpan dan dihapus sekaligus.`)
      }
    }
  }

  // ----------------------------------------------------
  // FIELD CONFIGURATION
  // ----------------------------------------------------

  function fieldFor(row: SettingRow) {
    return getSettingField(selectedGroup.value?.class ?? '', row.property, row.type)
  }

  function newClassField() {
    return getSettingField(newClass.value.class, newClass.value.property, newClass.value.type)
  }

  // ----------------------------------------------------
  // CHECKBOX GROUP
  // ----------------------------------------------------

  function checkboxGroupValues(row: SettingRow): string[] {
    if (!row.value.trim()) {
      return []
    }

    return row.value
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  }

  function toggleCheckboxGroup(row: SettingRow, value: string, checked: boolean): void {
    const selected = new Set(checkboxGroupValues(row))

    if (checked) {
      selected.add(value)
    } else {
      selected.delete(value)
    }

    row.value = Array.from(selected).join(',')
  }

  // ----------------------------------------------------
  // GROUP MANAGEMENT
  // ----------------------------------------------------

  function prepareGroup(group: SettingGroup): void {
    rows.value = group.items.map((item) => ({
      property: item.property,
      type: item.type,
      value: displayValue(item.value, item.type),
      isNew: false,
    }))

    forget.value = []
  }

  function selectGroup(id: string): void {
    selectedGroupId.value = id

    const group = groups.value.find((item) => item.id === id)

    if (!group) return

    prepareGroup(group)

    localStorage.setItem(ACTIVE_TAB_KEY, id)
  }

  // ----------------------------------------------------
  // LOAD SETTINGS
  // ----------------------------------------------------

  async function loadSettings(): Promise<void> {
    if (loading.value) return

    loading.value = true

    try {
      const response = await api.get<SettingsApiResponse<SettingsIndexResponse>>(API)

      groups.value = response.data.data.groups ?? []

      if (groups.value.length > 0) {
        const remembered = localStorage.getItem(ACTIVE_TAB_KEY)

        const target = groups.value.find((group) => group.id === remembered) ?? groups.value[0]

        selectGroup(target.id)
        appSettings.setGroups(groups.value)
      } else {
        selectedGroupId.value = ''
        rows.value = []
        forget.value = []
      }
    } finally {
      loading.value = false
    }
  }

  // ----------------------------------------------------
  // ROW MANAGEMENT
  // ----------------------------------------------------

  function addRow(): void {
    rows.value.push({
      property: '',
      type: 'string',
      value: '',
      isNew: true,
    })
  }

  function removeRow(index: number): void {
    const row = rows.value[index]

    if (!row) return

    if (!row.isNew && row.property && !forget.value.includes(row.property)) {
      forget.value.push(row.property)
    }

    rows.value.splice(index, 1)
  }

  function restoreRow(property: string): void {
    forget.value = forget.value.filter((item) => item !== property)

    const original = selectedGroup.value?.items.find((item) => item.property === property)

    if (!original) return

    // Hindari menambahkan properti yang sudah ada.
    if (rows.value.some((row) => row.property === property)) {
      return
    }

    rows.value.push({
      property: original.property,
      type: original.type,
      value: displayValue(original.value, original.type),
      isNew: false,
    })
  }

  // ----------------------------------------------------
  // NORMALIZE PAYLOAD
  // ----------------------------------------------------

  function normalizeRows() {
    return rows.value
      .filter((row) => row.property.trim() !== '')
      .map((row) => ({
        property: row.property.trim(),
        type: row.type,
        value: normalizeValue(row.value, row.type),
      }))
  }

  // ----------------------------------------------------
  // SAVE SETTINGS
  // ----------------------------------------------------

  async function saveSettings(): Promise<void> {
    const group = selectedGroup.value

    if (!group || saving.value) return

    validateRows()

    saving.value = true

    try {
      await api.put(`${API}/bulk-save`, {
        group: group.class,
        context: group.context,
        rows: normalizeRows(),
        forget: forget.value,
      })

      await loadSettings()
    } finally {
      saving.value = false
    }
  }

  // ----------------------------------------------------
  // ADD CLASS
  // ----------------------------------------------------

  function openAddModal(): void {
    newClass.value = {
      class: '',
      property: '',
      type: 'string',
      value: '',
      context: '',
    }

    showAddModal.value = true
  }

  async function submitAddClass(): Promise<void> {
    if (addingClass.value) return

    const form = newClass.value

    const className = form.class.trim()
    const property = form.property.trim()

    if (!className) {
      throw new Error('Nama class wajib diisi.')
    }

    if (!property) {
      throw new Error('Nama properti wajib diisi.')
    }

    validateProperty(property)
    validateValue(property, form.value, form.type)

    addingClass.value = true

    try {
      await api.post(`${API}/add-class`, {
        class: className,
        property,
        type: form.type,
        value: normalizeValue(form.value, form.type),
        context: form.context.trim() || null,
      })

      showAddModal.value = false

      await loadSettings()
    } finally {
      addingClass.value = false
    }
  }

  // ----------------------------------------------------
  // DELETE OVERRIDE
  // ----------------------------------------------------

  async function deleteOverride(property: string): Promise<void> {
    const group = selectedGroup.value

    if (!group) return

    const confirmed = window.confirm(`Hapus override "${property}"? Nilai default konfigurasi akan digunakan kembali.`)

    if (!confirmed) return

    await api.delete(`${API}/delete`, {
      data: {
        group: group.class,
        property,
        context: group.context,
      },
    })

    await loadSettings()
  }

  function closeAddModal(): void {
    showAddModal.value = false
  }

  // ----------------------------------------------------
  // LIFECYCLE
  // ----------------------------------------------------

  onMounted(() => {
    loadSettings().catch(() => {
      // Error diteruskan melalui state/caller bila diperlukan.
    })
  })

  // ----------------------------------------------------
  // PUBLIC API
  // ----------------------------------------------------

  return {
    // State
    groups,
    selectedGroupId,
    selectedGroup,
    rows,
    forget,
    loading,
    saving,
    addingClass,
    showAddModal,
    closeAddModal,
    newClass,

    // Helpers
    getErrorMessage,
    displayValue,
    normalizeValue,
    validateProperty,
    validateValue,
    validateRows,
    fieldFor,
    newClassField,

    // Checkbox group
    checkboxGroupValues,
    toggleCheckboxGroup,

    // Group
    selectGroup,

    // Load
    loadSettings,

    // Rows
    addRow,
    removeRow,
    restoreRow,

    // Settings
    saveSettings,

    // Class
    openAddModal,
    submitAddClass,

    // Override
    deleteOverride,
  }
}
