import { computed, ref } from 'vue'

import { getApiErrorMessage, getFieldErrors } from '@/core/api/errors'
import { useToast } from '@/shared/composables/useToast'
import { settingsApi } from '../api/settings.api'
import { getSettingField } from '../config/setting-fields'
import type { NewClassForm, SettingGroup, SettingRow, SettingType } from '../types/settings'

const ACTIVE_GROUP_KEY = 'erp-settings-active-tab'

const emptyClassForm = (): NewClassForm => ({
  class: '',
  property: '',
  type: 'string',
  value: '',
  context: '',
})

function displayValue(value: unknown, type: SettingType): string {
  if (type === 'boolean') {
    return String(value === true || value === 'true' || value === 1 || value === '1')
  }

  if (type === 'json') {
    if (typeof value === 'string') return value
    return JSON.stringify(value, null, 2) ?? ''
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

function validateProperty(property: string): void {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(property)) {
    throw new Error('Nama properti harus diawali huruf atau underscore dan hanya berisi huruf, angka, atau underscore.')
  }
}

function validateValue(property: string, value: string, type: SettingType): void {
  if (type === 'json') {
    try {
      JSON.parse(value)
    } catch {
      throw new Error('Format JSON pada ' + property + ' tidak valid.')
    }
  }

  if (type === 'integer' && !/^-?\\d+$/.test(value)) {
    throw new Error('Nilai ' + property + ' harus berupa bilangan bulat.')
  }

  if (type === 'float' && (value.trim() === '' || !Number.isFinite(Number(value)))) {
    throw new Error('Nilai ' + property + ' harus berupa angka.')
  }
}

function errorMessage(error: unknown, fallback: string): string {
  const fieldErrors = getFieldErrors(error)
  const messages = Object.values(fieldErrors)

  if (messages.length) return messages.join('\n')
  if (error instanceof Error) return error.message

  return getApiErrorMessage(error, fallback)
}

export function useSettings() {
  const toast = useToast()

  const groups = ref<SettingGroup[]>([])
  const selectedGroupId = ref('')
  const rows = ref<SettingRow[]>([])
  const forget = ref<string[]>([])

  const loading = ref(false)
  const saving = ref(false)
  const addingClass = ref(false)
  const showAddModal = ref(false)
  const newClass = ref<NewClassForm>(emptyClassForm())

  const selectedGroup = computed(
    () => groups.value.find((group) => group.id === selectedGroupId.value) ?? null,
  )

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
    const group = groups.value.find((item) => item.id === id)
    if (!group) return

    selectedGroupId.value = id
    prepareGroup(group)
    localStorage.setItem(ACTIVE_GROUP_KEY, id)
  }

  async function loadSettings(preferred?: { class: string; context: string | null }): Promise<void> {
    loading.value = true

    try {
      const response = await settingsApi.getGroups()
      groups.value = response.groups

      if (groups.value.length === 0) {
        selectedGroupId.value = ''
        rows.value = []
        forget.value = []
        return
      }

      const preferredGroup = preferred
        ? groups.value.find((group) => group.class === preferred.class && group.context === preferred.context)
        : undefined
      const rememberedId = localStorage.getItem(ACTIVE_GROUP_KEY)
      const rememberedGroup = groups.value.find((group) => group.id === rememberedId)
      const target = preferredGroup ?? rememberedGroup ?? groups.value[0]

      selectGroup(target.id)
    } catch (error: unknown) {
      toast.error('Gagal memuat pengaturan', errorMessage(error, 'Terjadi kesalahan saat memuat pengaturan.'))
    } finally {
      loading.value = false
    }
  }

  function addRow(): void {
    rows.value.push({ property: '', type: 'string', value: '', isNew: true })
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

    rows.value.push({
      property: original.property,
      type: original.type,
      value: displayValue(original.value, original.type),
      isNew: false,
    })
  }

  function validateRows(): void {
    const names = new Set<string>()

    for (const row of rows.value) {
      const property = row.property.trim()
      if (!property && !row.value.trim()) continue

      validateProperty(property)

      const normalized = property.toLowerCase()
      if (names.has(normalized)) {
        throw new Error('Properti ' + property + ' ditulis lebih dari sekali.')
      }

      names.add(normalized)
      validateValue(property, row.value, row.type)
    }

    for (const property of forget.value) {
      if (names.has(property.toLowerCase())) {
        throw new Error('Properti ' + property + ' tidak dapat disimpan dan dihapus sekaligus.')
      }
    }
  }

  function normalizedRows() {
    return rows.value
      .filter((row) => row.property.trim() !== '')
      .map((row) => ({
        property: row.property.trim(),
        type: row.type,
        value: normalizeValue(row.value, row.type),
      }))
  }

  async function saveSettings(): Promise<void> {
    const group = selectedGroup.value
    if (!group || saving.value) return

    try {
      validateRows()
      saving.value = true

      await settingsApi.save({
        group: group.class,
        context: group.context,
        rows: normalizedRows(),
        forget: [...forget.value],
      })

      toast.success('Pengaturan berhasil disimpan')
      await loadSettings()
    } catch (error: unknown) {
      toast.error('Gagal menyimpan pengaturan', errorMessage(error, 'Periksa kembali nilai pengaturan.'))
    } finally {
      saving.value = false
    }
  }

  function openAddModal(): void {
    newClass.value = emptyClassForm()
    showAddModal.value = true
  }

  function closeAddModal(): void {
    if (addingClass.value) return
    showAddModal.value = false
  }

  async function submitAddClass(): Promise<void> {
    if (addingClass.value) return

    const form = newClass.value
    const className = form.class.trim()
    const property = form.property.trim()

    try {
      if (!className) throw new Error('Nama class wajib diisi.')
      if (!property) throw new Error('Nama properti wajib diisi.')

      validateProperty(property)
      validateValue(property, form.value, form.type)

      addingClass.value = true
      const context = form.context.trim() || null

      await settingsApi.addClass({
        class: className,
        property,
        type: form.type,
        value: normalizeValue(form.value, form.type),
        context,
      })

      showAddModal.value = false
      toast.success('Class dan properti awal berhasil ditambahkan')
      await loadSettings({ class: className, context })
    } catch (error: unknown) {
      toast.error('Gagal menambahkan class', errorMessage(error, 'Periksa kembali data class.'))
    } finally {
      addingClass.value = false
    }
  }

  function fieldFor(row: SettingRow) {
    return getSettingField(selectedGroup.value?.class ?? '', row.property, row.type)
  }

  function newClassField() {
    return getSettingField(newClass.value.class, newClass.value.property, newClass.value.type)
  }

  function checkboxGroupValues(row: SettingRow): string[] {
    return row.value
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  }

  function toggleCheckboxGroup(row: SettingRow, value: string, checked: boolean): void {
    const selected = new Set(checkboxGroupValues(row))

    if (checked) selected.add(value)
    else selected.delete(value)

    row.value = Array.from(selected).join(',')
  }

  return {
    groups,
    selectedGroupId,
    selectedGroup,
    rows,
    forget,
    loading,
    saving,
    addingClass,
    showAddModal,
    newClass,
    loadSettings,
    selectGroup,
    addRow,
    removeRow,
    restoreRow,
    saveSettings,
    openAddModal,
    closeAddModal,
    submitAddClass,
    fieldFor,
    newClassField,
    checkboxGroupValues,
    toggleCheckboxGroup,
  }
}
