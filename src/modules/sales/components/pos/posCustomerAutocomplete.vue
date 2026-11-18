<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import PosIcon from "./PosIcon.vue";
import customerService from '../../services/customer.service'
import type { Customer } from '../../types/customer'

interface Props {
  modelValue: number | string | null;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  allowClear?: boolean;
  minCharacters?: number;
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: "Cari nama, kode, nomor anggota, atau scan barcode...",
  label: "Pelanggan / Anggota",
  required: false,
  allowClear: true,
  minCharacters: 2,
  limit: 15,
});

const emit = defineEmits<{
  (event: "update:modelValue", value: number | null): void;
  (event: "select", customer: Customer | null): void;
}>();

const keyword = ref("");
const selectedCustomer = ref<Customer | null>(null);
const results = ref<Customer[]>([]);

const loading = ref(false);
const dropdownOpen = ref(false);

const errorMessage = ref("");
const infoMessage = ref("");

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let requestSequence = 0;

const hasSelection = computed(() => selectedCustomer.value !== null);


function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isExactMatch(customer: Customer, value: string): boolean {
  const target = normalize(value);

  if (!target) return false;

  return [customer.code, customer.member_number, customer.barcode, customer.phone].some((item) => normalize(item) === target);
}

function getCustomerType(customer: Customer): string {
  return customer.member_number ? "Anggota" : "Umum";
}

function getCustomerIdentifier(customer: Customer): string {
  return [customer.code ? `Kode: ${customer.code}` : null, customer.member_number ? `Anggota: ${customer.member_number}` : null, customer.phone ? `Telp: ${customer.phone}` : null].filter(Boolean).join(" · ");
}

function clearTimer(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

function resetMessages(): void {
  errorMessage.value = "";
  infoMessage.value = "";
}

function invalidateRequests(): void {
  requestSequence++;
  clearTimer();
  loading.value = false;
}

async function searchCustomers(searchTerm: string, exactLookup = false): Promise<void> {
  const term = searchTerm.trim();

  if (props.disabled || term.length < props.minCharacters) {
    results.value = [];
    dropdownOpen.value = false;
    loading.value = false;
    return;
  }

  const currentSequence = ++requestSequence;

  loading.value = true;
  resetMessages();

  try {
    const response = await customerService.getAll({
      page: 1,
      per_page: props.limit,
      search: term,
      is_active: 1,
    });

    if (currentSequence !== requestSequence) return;

    const customers = response.items ?? [];

    results.value = customers.filter((customer) => Number(customer.is_active) === 1);

    if (exactLookup) {
      const exactCustomer = results.value.find((customer) => isExactMatch(customer, term));

      if (exactCustomer) {
        selectCustomer(exactCustomer);
        return;
      }

      dropdownOpen.value = results.value.length > 0;

      infoMessage.value = results.value.length > 0 ? "Tidak ditemukan kecocokan persis. Silakan pilih pelanggan dari hasil pencarian." : "Pelanggan tidak ditemukan.";

      return;
    }

    dropdownOpen.value = results.value.length > 0;

    if (results.value.length === 0) {
      infoMessage.value = "Pelanggan tidak ditemukan.";
    }
  } catch (error: unknown) {
    if (currentSequence !== requestSequence) return;

    results.value = [];
    dropdownOpen.value = false;

    errorMessage.value = error instanceof Error ? error.message : "Terjadi kesalahan saat mencari pelanggan.";
  } finally {
    if (currentSequence === requestSequence) {
      loading.value = false;
    }
  }
}

function handleInput(): void {
  if (props.disabled) return;

  resetMessages();
  selectedCustomer.value = null;

  if (props.modelValue !== null) {
    emit("update:modelValue", null);
    emit("select", null);
  }

  invalidateRequests();

  results.value = [];

  const term = keyword.value.trim();

  if (term.length < props.minCharacters) {
    dropdownOpen.value = false;
    return;
  }

  debounceTimer = setTimeout(() => {
    void searchCustomers(term);
  }, 300);
}

async function handleEnter(): Promise<void> {
  if (props.disabled) return;

  clearTimer();
  invalidateRequests();
  resetMessages();

  const term = keyword.value.trim();

  if (!term) return;

  await searchCustomers(term, true);
}

function selectCustomer(customer: Customer): void {
  if (props.disabled) return;

  invalidateRequests();

  selectedCustomer.value = customer;
  keyword.value = "";
  results.value = [];
  dropdownOpen.value = false;

  resetMessages();

  emit("update:modelValue", Number(customer.id));
  emit("select", customer);
}

function clearSelection(): void {
  if (props.disabled) return;

  invalidateRequests();

  selectedCustomer.value = null;
  keyword.value = "";
  results.value = [];
  dropdownOpen.value = false;

  resetMessages();

  emit("update:modelValue", null);
  emit("select", null);
}

function closeDropdown(): void {
  dropdownOpen.value = false;
}

function handleFocus(): void {
  if (results.value.length > 0) {
    dropdownOpen.value = true;
  }
}

function handleOutsideClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;

  if (!target?.closest(".customer-autocomplete")) {
    closeDropdown();
  }
}

async function loadCustomerById(id: number): Promise<void> {
  const currentSequence = ++requestSequence;

  try {
    const response = await customerService.getById(id);

    if (currentSequence !== requestSequence) return;

    const customer = response;

    selectedCustomer.value = customer && Number(customer.is_active) === 1 ? customer : null;
  } catch {
    if (currentSequence !== requestSequence) return;

    selectedCustomer.value = null;
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value === null || value === undefined || value === "") {
      selectedCustomer.value = null;
      return;
    }

    const customerId = Number(value);

    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      selectedCustomer.value = null;
      return;
    }

    if (selectedCustomer.value?.id !== customerId) {
      void loadCustomerById(customerId);
    }
  },
  { immediate: true },
);

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onBeforeUnmount(() => {
  clearTimer();
  requestSequence++;
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<template>
  <div class="customer-autocomplete relative w-full">
    <label class="pos-label">{{ label }}<span v-if="required" class="text-rose-600">*</span></label>
    <div v-if="hasSelection && selectedCustomer" class="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
      <div class="flex items-start justify-between gap-2">
        <div class="flex min-w-0 items-start gap-2">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"><PosIcon name="user" /></div>
          <div class="min-w-0">
            <div class="font-semibold text-slate-800 dark:text-slate-100">{{ selectedCustomer.name }}</div>
            <span class="pos-badge mt-1" :class="selectedCustomer.member_number ? 'pos-badge-success' : 'pos-badge-neutral'">{{ getCustomerType(selectedCustomer) }}</span>
            <div class="mt-1 text-[11px] text-slate-500">{{ getCustomerIdentifier(selectedCustomer) }}</div>
          </div>
        </div>
        <div class="flex gap-1">
          <button type="button" class="pos-icon-button" :disabled="disabled" title="Ganti pelanggan" @click="clearSelection"><PosIcon name="refresh-cw" :size="15" /></button>
          <button v-if="allowClear" type="button" class="pos-icon-button text-rose-600" :disabled="disabled" title="Hapus pelanggan" @click="clearSelection"><PosIcon name="x" :size="15" /></button>
        </div>
      </div>
    </div>
    <div v-else class="relative">
      <div class="pos-input-group">
        <span class="pos-input-addon"><PosIcon name="user-round-search" /></span>
        <input v-model="keyword" type="text" class="pos-input rounded-none" :placeholder="placeholder" :disabled="disabled" autocomplete="off" @input="handleInput" @keydown.enter.prevent="handleEnter" @focus="handleFocus" @keydown.esc="closeDropdown" />
        <button v-if="keyword" type="button" class="pos-icon-button rounded-l-none border border-l-0 border-slate-300 dark:border-slate-700" :disabled="disabled" @click="clearSelection"><PosIcon name="x" /></button>
        <span v-if="loading" class="pos-input-addon rounded-l-none border-l-0"><span class="pos-spinner pos-spinner-sm" role="status"></span></span>
      </div>
      <div v-if="dropdownOpen && results.length > 0" class="customer-results absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <button v-for="customer in results" :key="customer.id" type="button" class="customer-result-item flex w-full items-center gap-2 rounded-lg p-3 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:hover:bg-slate-800 dark:focus:bg-slate-800" @click="selectCustomer(customer)">
          <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800"><PosIcon name="user" /></div>
          <div class="min-w-0 flex-1"><div class="font-semibold text-slate-800 dark:text-slate-100">{{ customer.name }}</div><div class="text-[11px] text-slate-500">{{ getCustomerIdentifier(customer) }}</div></div>
          <span class="pos-badge" :class="customer.member_number ? 'pos-badge-success' : 'pos-badge-neutral'">{{ getCustomerType(customer) }}</span>
        </button>
      </div>
    </div>
    <div v-if="errorMessage" class="mt-2 flex items-center gap-1 text-xs text-rose-600" role="alert"><PosIcon name="circle-alert" :size="14" />{{ errorMessage }}</div>
    <div v-else-if="infoMessage" class="mt-2 flex items-center gap-1 text-xs text-slate-500" role="status"><PosIcon name="info" :size="14" />{{ infoMessage }}</div>
    <div v-else-if="!hasSelection" class="mt-1 text-[11px] text-slate-500">Ketik minimal {{ minCharacters }} karakter atau scan barcode pelanggan.</div>
  </div>
</template>
