<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

import { useToast } from '@/shared/composables/useToast'
import { useModal } from '@/shared/composables/useModal'

import goodsReceiptService from '../services/goodsReceiptService'
import GoodsReceiptFormModal from '../components/GoodsReceiptFormModal.vue'
import GoodsReceiptDetailModal from '../components/GoodsReceiptDetailModal.vue'

import type { GoodsReceipt, GoodsReceiptPayload, GoodsReceiptPagination, GoodsReceiptStatus } from '../types/goodsReceipt'
import type { OptionItem } from '@/shared/composables/useOption.ts'

const toast = useToast()
const modalStore = useModal()

const loading = ref(false)
const receipts = ref<GoodsReceipt[]>([])

const search = ref('')
const status = ref<GoodsReceiptStatus | ''>('')
const pagination = ref<GoodsReceiptPagination>({
  page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
})
const statusOptions: OptionItem[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'cancelled', label: 'Cancelled' },
]
const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(Number(value) || 0)

const rangeStart = computed(() => (pagination.value.page - 1) * pagination.value.per_page + 1)
const rangeEnd = computed(() => Math.min(pagination.value.page * pagination.value.per_page, pagination.value.total))
const totalPages = computed(() => Math.max(1, pagination.value.total_pages))

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } }
    message?: string
  }
  return err.response?.data?.message || err.message || 'Terjadi kesalahan.'
}

async function loadReceipts(page = 1) {
  loading.value = true
  try {
    const result = await goodsReceiptService.getAll({
      page,
      per_page: pagination.value.per_page,
      search: search.value.trim() || undefined,
      status: status.value || undefined,
    })

    if (!result) throw new Error('Gagal memuat daftar penerimaan barang.')

    receipts.value = result.items
    pagination.value = result.pagination
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

function searchReceipts() {
  loadReceipts(1)
}

function changeStatus() {
  loadReceipts(1)
}

function changePage(page: number) {
  if (page < 1 || page > pagination.value.total_pages) return
  loadReceipts(page)
}

function openCreateModal() {
  modalStore.open({
    title: 'Buat Goods Receipt',
    component: GoodsReceiptFormModal,
    size: 'xl',
    centered: true,
    onSelect: async (value: unknown) => {
      await createReceipt(value as GoodsReceiptPayload)
    },
  })
}

async function createReceipt(payload: GoodsReceiptPayload) {
  try {
    await goodsReceiptService.create(payload)
    toast.success('Goods Receipt berhasil dibuat sebagai draft.')
    modalStore.close()
    await loadReceipts(1)
  } catch (error) {
    toast.error(getErrorMessage(error))
  }
}

function openDetailModal(receipt: GoodsReceipt) {
  modalStore.open({
    title: `Detail Goods Receipt - ${receipt.receipt_number}`,
    component: GoodsReceiptDetailModal,
    props: { receiptId: Number(receipt.id) },
    size: 'xl',
    centered: true,
    onSelect: async () => {
      await loadReceipts(pagination.value.page)
    },
  })
}

/* ── Status theming (premium palette) ─────────────────────────── */
const statusTheme: Record<string, { badge: string; dot: string; glow: string }> = {
  posted: {
    badge:
      'bg-gradient-to-r from-emerald-50 via-emerald-50 to-teal-50 text-emerald-700 ring-emerald-500/20 dark:from-emerald-500/10 dark:via-emerald-500/10 dark:to-teal-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
    dot: 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]',
    glow: 'shadow-emerald-500/20',
  },
  draft: {
    badge:
      'bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50 text-amber-700 ring-amber-500/20 dark:from-amber-500/10 dark:via-amber-500/10 dark:to-orange-500/10 dark:text-amber-300 dark:ring-amber-400/30',
    dot: 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]',
    glow: 'shadow-amber-500/20',
  },
  cancelled: {
    badge:
      'bg-gradient-to-r from-slate-100 via-slate-100 to-zinc-100 text-slate-600 ring-slate-400/20 dark:from-slate-500/10 dark:via-slate-500/10 dark:to-zinc-500/10 dark:text-slate-400 dark:ring-slate-400/20',
    dot: 'bg-slate-400 shadow-[0_0_0_3px_rgba(148,163,184,0.15)]',
    glow: 'shadow-slate-500/10',
  },
}

function statusBadgeClass(value: string) {
  return statusTheme[value]?.badge ?? statusTheme.cancelled.badge
}
function statusDotClass(value: string) {
  return statusTheme[value]?.dot ?? statusTheme.cancelled.dot
}

onMounted(() => loadReceipts())
</script>

<template>
  <div class="relative space-y-6">
    <!-- Ambient background glow (decorative) -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-24 right-0 -z-10 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl dark:bg-primary-500/10"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -bottom-32 left-10 -z-10 h-72 w-72 rounded-full bg-fuchsia-500/5 blur-3xl dark:bg-fuchsia-500/10"
    />

    <!-- ── Page header ─────────────────────────────────────────── -->
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2.5">
          <span
            class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 ring-1 ring-white/20"
          >
            <i class="ti ti-package-import text-lg" />
          </span>
          <div>
            <h1
              class="bg-linear-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-white dark:via-slate-100 dark:to-slate-400"
            >
              Goods Receipt
            </h1>
            <p class="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">Pengelolaan penerimaan barang dari supplier</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-linear-to-br from-primary-500 via-primary-600 to-primary-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/30 ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-600/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 active:translate-y-0 disabled:opacity-50"
        @click="openCreateModal"
      >
        <!-- shine overlay -->
        <span
          class="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
        <i class="ti ti-plus text-base" />
        <span>Buat Penerimaan</span>
      </button>
    </div>

    <!-- ── Card ────────────────────────────────────────────────── -->
    <div
      class="overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl shadow-slate-900/5 ring-1 ring-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:ring-white/5"
    >
      <div class="space-y-5 p-4 sm:p-6">
        <!-- Filter bar -->
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <!-- Search group -->
          <div
            class="group flex w-full max-w-xl items-stretch rounded-xl shadow-sm ring-1 ring-slate-200 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary-500/40 dark:ring-slate-700"
          >
            <div class="relative flex-1">
              <i
                class="ti ti-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary-500"
              />
              <input
                v-model="search"
                type="search"
                class="w-full rounded-l-xl border-0 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white dark:bg-slate-900/60 dark:text-slate-100 dark:focus:bg-slate-900"
                placeholder="Cari nomor GR, PO, supplier..."
                @keyup.enter="searchReceipts"
              />
            </div>
            <button
              type="button"
              class="-ml-px inline-flex items-center gap-2 rounded-r-xl bg-linear-to-b from-slate-50 to-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:from-slate-100 hover:to-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:from-slate-800 dark:to-slate-800 dark:text-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-700"
              @click="searchReceipts"
            >
              Cari
            </button>
          </div>

          <!-- Status select -->
          <div class="w-full lg:w-48">
            <OptionSelect
              v-model="status"
              :options="statusOptions"
              placeholder="Semua Status"
              :searchable="false"
              @update:model-value="changeStatus"
            />
          </div>

          <!-- Reload -->
          <div class="lg:ml-auto">
            <button
              type="button"
              class="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-600"
              :disabled="loading"
              @click="loadReceipts(pagination.page)"
            >
              <i class="ti ti-refresh transition-transform duration-500 group-hover:rotate-180" :class="{ 'animate-spin': loading }" />
              Muat Ulang
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center gap-3 py-14">
          <div class="relative flex h-12 w-12 items-center justify-center">
            <div class="absolute inset-0 animate-ping rounded-full bg-primary-500/20" />
            <div
              class="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-r-primary-600 dark:border-slate-700 dark:border-r-primary-400"
            />
          </div>
          <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Memuat data penerimaan...</p>
        </div>

        <!-- Table -->
        <div
          v-else
          class="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/60 shadow-inner ring-1 ring-slate-900/5 dark:border-slate-800 dark:bg-slate-900/40 dark:ring-white/5"
        >
          <table class="min-w-full text-sm">
            <thead>
              <tr class="bg-linear-to-b from-slate-50 to-slate-100/70 dark:from-slate-800/80 dark:to-slate-800/40">
                <th class="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nomor Penerimaan
                </th>
                <th class="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Purchase Order
                </th>
                <th class="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Supplier
                </th>
                <th class="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tanggal Terima
                </th>
                <th class="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th class="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100/80 dark:divide-slate-800/70">
              <tr
                v-for="(receipt, index) in receipts"
                :key="receipt.id"
                class="group relative transition-colors duration-200 hover:bg-linear-to-r hover:from-primary-50/60 hover:via-white hover:to-transparent dark:hover:from-primary-500/5 dark:hover:via-slate-900/40 dark:hover:to-transparent"
                :style="{ animationDelay: `${index * 25}ms` }"
              >
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="h-1.5 w-1.5 rounded-full bg-primary-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                    <span class="font-semibold tracking-tight text-slate-900 dark:text-slate-100">{{ receipt.receipt_number }}</span>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <span
                    class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {{ receipt.order_number || '-' }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-slate-700 dark:text-slate-300">{{ receipt.supplier_name || '-' }}</td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <i class="ti ti-calendar-event text-xs text-slate-400" />
                    {{ receipt.received_date }}
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset"
                    :class="statusBadgeClass(receipt.status)"
                  >
                    <span class="h-1.5 w-1.5 rounded-full" :class="statusDotClass(receipt.status)" />
                    {{ receipt.status }}
                  </span>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    class="inline-flex translate-x-1 items-center gap-1.5 rounded-lg border border-primary-500/30 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary-700 opacity-80 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500/60 hover:bg-primary-50 hover:opacity-100 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-slate-900/50 dark:text-primary-300 dark:hover:bg-primary-500/10"
                    title="Detail"
                    @click="openDetailModal(receipt)"
                  >
                    <i class="ti ti-eye" />
                    Detail
                  </button>
                </td>
              </tr>

              <tr v-if="receipts.length === 0">
                <td colspan="6" class="px-4 py-16 text-center">
                  <div class="mx-auto flex max-w-xs flex-col items-center gap-3">
                    <div
                      class="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-700"
                    >
                      <i class="ti ti-package-off text-2xl" />
                    </div>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Belum ada data Goods Receipt.</p>
                    <p class="text-xs text-slate-400">Coba ubah filter atau buat penerimaan baru.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="!loading && pagination.total > 0"
          class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-linear-to-r from-slate-50/60 via-white/40 to-slate-50/60 px-4 py-3 dark:border-slate-800 dark:from-slate-800/40 dark:via-slate-900/40 dark:to-slate-800/40"
        >
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
            Menampilkan
            <span
              class="inline-flex items-center rounded-md bg-primary-50 px-1.5 py-0.5 font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
            >
              {{ rangeStart }}
            </span>
            <span class="mx-1">–</span>
            <span
              class="inline-flex items-center rounded-md bg-primary-50 px-1.5 py-0.5 font-bold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
            >
              {{ rangeEnd }}
            </span>
            dari
            <span class="font-bold text-slate-700 dark:text-slate-200">{{ formatNumber(pagination.total) }}</span>
            data
          </p>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              :disabled="!pagination.has_prev"
              @click="changePage(pagination.page - 1)"
            >
              <i class="ti ti-chevron-left" />
              Sebelumnya
            </button>

            <span class="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Halaman
              <span class="font-bold text-slate-900 dark:text-white">{{ pagination.page }}</span>
              / {{ totalPages }}
            </span>

            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              :disabled="!pagination.has_next"
              @click="changePage(pagination.page + 1)"
            >
              Berikutnya
              <i class="ti ti-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Entrance animation untuk rows */
tbody tr {
  animation: rowFadeIn 0.4s ease both;
}
@keyframes rowFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
