<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import PosIcon from './PosIcon.vue'
import customerService from '../../services/customer.service'
import type { Customer } from '../../types/customer'

interface Props {
  modelValue: number | string | null
  disabled?: boolean
  placeholder?: string
  label?: string
  required?: boolean
  allowClear?: boolean
  minCharacters?: number
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: 'Cari nama, kode, nomor anggota, atau scan barcode...',
  label: 'Pelanggan / Anggota',
  required: false,
  allowClear: true,
  minCharacters: 2,
  limit: 15,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: number | null): void
  (event: 'select', customer: Customer | null): void
}>()

const keyword = ref('')
const selectedCustomer = ref<Customer | null>(null)
const results = ref<Customer[]>([])

const loading = ref(false)
const dropdownOpen = ref(false)

const errorMessage = ref('')
const infoMessage = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestSequence = 0

const hasSelection = computed(() => selectedCustomer.value !== null)

function normalize(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

function isExactMatch(customer: Customer, value: string): boolean {
  const target = normalize(value)

  if (!target) return false

  return [customer.code, customer.member_number, customer.barcode, customer.phone].some((item) => normalize(item) === target)
}

function getCustomerType(customer: Customer): string {
  return customer.member_number ? 'Anggota' : 'Umum'
}

function getCustomerIdentifier(customer: Customer): string {
  return [
    customer.code ? `Kode: ${customer.code}` : null,
    customer.member_number ? `Anggota: ${customer.member_number}` : null,
    customer.phone ? `Telp: ${customer.phone}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

function clearTimer(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

function resetMessages(): void {
  errorMessage.value = ''
  infoMessage.value = ''
}

function invalidateRequests(): void {
  requestSequence++
  clearTimer()
  loading.value = false
}

async function searchCustomers(searchTerm: string, exactLookup = false): Promise<void> {
  const term = searchTerm.trim()

  if (props.disabled || term.length < props.minCharacters) {
    results.value = []
    dropdownOpen.value = false
    loading.value = false
    return
  }

  const currentSequence = ++requestSequence

  loading.value = true
  resetMessages()

  try {
    const response = await customerService.getAll({
      page: 1,
      per_page: props.limit,
      search: term,
      is_active: 1,
    })

    if (currentSequence !== requestSequence) return

    const customers = response.items ?? []

    results.value = customers.filter((customer) => Number(customer.is_active) === 1)

    if (exactLookup) {
      const exactCustomer = results.value.find((customer) => isExactMatch(customer, term))

      if (exactCustomer) {
        selectCustomer(exactCustomer)
        return
      }

      dropdownOpen.value = results.value.length > 0

      infoMessage.value =
        results.value.length > 0
          ? 'Tidak ditemukan kecocokan persis. Silakan pilih pelanggan dari hasil pencarian.'
          : 'Pelanggan tidak ditemukan.'

      return
    }

    dropdownOpen.value = results.value.length > 0

    if (results.value.length === 0) {
      infoMessage.value = 'Pelanggan tidak ditemukan.'
    }
  } catch (error: unknown) {
    if (currentSequence !== requestSequence) return

    results.value = []
    dropdownOpen.value = false

    errorMessage.value = error instanceof Error ? error.message : 'Terjadi kesalahan saat mencari pelanggan.'
  } finally {
    if (currentSequence === requestSequence) {
      loading.value = false
    }
  }
}

function handleInput(): void {
  if (props.disabled) return

  resetMessages()
  selectedCustomer.value = null

  if (props.modelValue !== null) {
    emit('update:modelValue', null)
    emit('select', null)
  }

  invalidateRequests()

  results.value = []

  const term = keyword.value.trim()

  if (term.length < props.minCharacters) {
    dropdownOpen.value = false
    return
  }

  debounceTimer = setTimeout(() => {
    void searchCustomers(term)
  }, 300)
}

async function handleEnter(): Promise<void> {
  if (props.disabled) return

  clearTimer()
  invalidateRequests()
  resetMessages()

  const term = keyword.value.trim()

  if (!term) return

  await searchCustomers(term, true)
}

function selectCustomer(customer: Customer): void {
  if (props.disabled) return

  invalidateRequests()

  selectedCustomer.value = customer
  keyword.value = ''
  results.value = []
  dropdownOpen.value = false

  resetMessages()

  emit('update:modelValue', Number(customer.id))
  emit('select', customer)
}

function clearSelection(): void {
  if (props.disabled) return

  invalidateRequests()

  selectedCustomer.value = null
  keyword.value = ''
  results.value = []
  dropdownOpen.value = false

  resetMessages()

  emit('update:modelValue', null)
  emit('select', null)
}

function closeDropdown(): void {
  dropdownOpen.value = false
}

function handleFocus(): void {
  if (results.value.length > 0) {
    dropdownOpen.value = true
  }
}

function handleOutsideClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null

  if (!target?.closest('.customer-autocomplete')) {
    closeDropdown()
  }
}

async function loadCustomerById(id: number): Promise<void> {
  const currentSequence = ++requestSequence

  try {
    const response = await customerService.getById(id)

    if (currentSequence !== requestSequence) return

    const customer = response

    selectedCustomer.value = customer && Number(customer.is_active) === 1 ? customer : null
  } catch {
    if (currentSequence !== requestSequence) return

    selectedCustomer.value = null
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value === null || value === undefined || value === '') {
      selectedCustomer.value = null
      return
    }

    const customerId = Number(value)

    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      selectedCustomer.value = null
      return
    }

    if (selectedCustomer.value?.id !== customerId) {
      void loadCustomerById(customerId)
    }
  },
  { immediate: true }
)

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  clearTimer()
  requestSequence++
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="customer-autocomplete relative w-full">
    <!-- Label -->
    <div class="flex items-center justify-between mb-1.5">
      <label class="pos-label mb-0!">
        <PosIcon name="user" />
        {{ label }}
        <span v-if="required" class="text-rose-600">*</span>
      </label>
      <kbd class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">F2</kbd>
    </div>

    <!-- STATE 1: JIKA PELANGGAN SUDAH DIPILIH (Bentuk Ringkas 1 Baris) -->
    <div
      v-if="hasSelection && selectedCustomer"
      class="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/20"
    >
      <div class="flex items-center gap-2 min-w-0">
        <!-- Avatar Inisial -->
        <div class="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 font-bold text-xs">
          {{ selectedCustomer.name.charAt(0).toUpperCase() }}
        </div>
        <!-- Info Pelanggan -->
        <div class="min-w-0 flex items-center gap-2">
          <span class="font-semibold text-sm text-slate-800 truncate">{{ selectedCustomer.name }}</span>
          <span
            class="pos-badge text-[9px] px-1.5 py-0"
            :class="selectedCustomer.member_number ? 'pos-badge-success' : 'pos-badge-neutral'"
          >
            {{ getCustomerType(selectedCustomer) }}
          </span>
        </div>
      </div>
      <!-- Tombol Hapus -->
      <button
        v-if="allowClear"
        type="button"
        class="text-slate-400 hover:text-rose-600 transition-colors p-1"
        :disabled="disabled"
        @click="clearSelection"
      >
        <PosIcon name="x" :size="16" />
      </button>
    </div>

    <!-- STATE 2: JIKA BELUM ADA PELANGGAN DIPILIH (Input Pencarian) -->
    <div v-else class="relative">
      <div class="relative flex items-center">
        <PosIcon name="user-round-search" class="absolute left-3 text-slate-400" />
        <input
          v-model="keyword"
          type="text"
          class="pos-input pl-10 w-full bg-slate-50 focus:bg-white transition-colors"
          :placeholder="placeholder"
          :disabled="disabled"
          autocomplete="off"
          @input="handleInput"
          @keydown.enter.prevent="handleEnter"
          @focus="handleFocus"
          @keydown.esc="closeDropdown"
        />
        <span v-if="loading" class="absolute right-3"><span class="pos-spinner pos-spinner-sm text-primary-600"></span></span>
      </div>

      <!-- Dropdown Hasil -->
      <div
        v-if="dropdownOpen && results.length > 0"
        class="customer-results absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <button
          v-for="customer in results"
          :key="customer.id"
          type="button"
          class="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-50"
          @click="selectCustomer(customer)"
        >
          <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <PosIcon name="user" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-sm text-slate-800 truncate">{{ customer.name }}</div>
            <div class="text-[11px] text-slate-500 truncate">{{ getCustomerIdentifier(customer) }}</div>
          </div>
          <span class="pos-badge" :class="customer.member_number ? 'pos-badge-success' : 'pos-badge-neutral'">
            {{ getCustomerType(customer) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Pesan Error/Info -->
    <div v-if="errorMessage" class="mt-1 text-[11px] text-rose-600">{{ errorMessage }}</div>
  </div>
</template>
