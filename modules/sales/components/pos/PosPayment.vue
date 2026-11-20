<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Wallet, CalendarDays, Info } from 'lucide-vue-next'

import PosPaymentMethod from './PosPaymentMethod.vue'
import PosCashDenominations from './PosCashDenominations.vue'
import PosPaymentInformation from './PosPaymentInformation.vue'
import PosCurrencyInput from './PosCurrencyInput.vue'
import { formatCurrency } from '../../utils/format'
import type { PaymentMethod, SettlementMode } from '../../types/sales'
// import PosNumpad from './PosNumpad.vue'

const props = defineProps<{
  mode: SettlementMode
  paymentMethod: PaymentMethod | null
  paymentAmount: number
  total: number
  dueDate: string
  dueDateError?: string | null
  referenceNumber: string
  paymentConfirmed: boolean
  disabled?: boolean
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  qrisImageUrl?: string | null
}>()
const emit = defineEmits<{
  'update:mode': [value: SettlementMode]
  'update:paymentMethod': [value: PaymentMethod]
  'update:paymentAmount': [value: number]
  'update:dueDate': [value: string]
  'update:referenceNumber': [value: string]
  'update:paymentConfirmed': [value: boolean]
  exact: []
  reset: []
}>()

// Karena settlementOptions butuh icon komponen, kita ubah jadi array of component
const settlementOptions: Array<{
  value: SettlementMode
  label: string
  icon: any
  hint: string
}> = [
  { value: 'paid', label: 'Lunas', icon: CheckCircle2, hint: 'Bayar seluruh tagihan' },
  { value: 'partial', label: 'Sebagian', icon: Wallet, hint: 'Tempo sebagian: bayar sebagian, sisanya menjadi piutang' },
  { value: 'receivable', label: 'Piutang', icon: CalendarDays, hint: 'Seluruh tagihan menjadi piutang' },
]

const isCash = computed(() => props.paymentMethod === 'cash')
const requiresConfirmation = computed(() => props.paymentMethod === 'transfer' || props.paymentMethod === 'qris')
const partialOverLimit = computed(() => props.mode === 'partial' && props.total > 0 && props.paymentAmount >= props.total)

function setDenomination(value: number): void {
  emit('update:paymentAmount', Math.max(0, value))
}
</script>
<template>
  <div class="space-y-4">
    <!-- ============================================ -->
    <!-- SEGMENTED CONTROL: Mode Pembayaran            -->
    <!-- ============================================ -->
    <div
      class="flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50"
      role="radiogroup"
      aria-label="Mode pembayaran"
    >
      <label v-for="option in settlementOptions" :key="option.value" class="relative flex-1 cursor-pointer" :title="option.hint">
        <input
          type="radio"
          class="sr-only"
          name="pos-settlement-mode"
          :value="option.value"
          :checked="mode === option.value"
          :disabled="disabled"
          @change="emit('update:mode', option.value)"
        />
        <span
          class="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all"
          :class="[
            mode === option.value
              ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-900 dark:text-primary-400'
              : 'text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
            disabled ? 'opacity-50' : '',
          ]"
        >
          <component :is="option.icon" class="h-3.5 w-3.5" />
          {{ option.label }}
        </span>
      </label>
    </div>

    <!-- ============================================ -->
    <!-- DUE DATE (jika bukan 'paid')                  -->
    <!-- ============================================ -->
    <template v-if="mode !== 'paid'">
      <div class="flex items-center justify-between gap-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="pos-due-date">Jatuh tempo</label>
        <input
          id="pos-due-date"
          type="date"
          class="w-full max-w-45 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20': !!dueDateError }"
          :value="dueDate"
          :disabled="disabled"
          :aria-invalid="!!dueDateError"
          @change="emit('update:dueDate', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <p v-if="dueDateError" class="text-xs text-rose-600 dark:text-rose-400">{{ dueDateError }}</p>
    </template>

    <!-- ============================================ -->
    <!-- PAYMENT METHOD (jika bukan 'receivable')      -->
    <!-- ============================================ -->
    <template v-if="mode !== 'receivable'">
      <PosPaymentMethod
        :model-value="paymentMethod ?? 'cash'"
        :disabled="disabled"
        @update:model-value="emit('update:paymentMethod', $event)"
      />

      <!-- AMOUNT -->
      <!-- AMOUNT -->
      <div>
        <!-- Label & Shortcut -->
        <div class="mb-1.5 flex items-center justify-between">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="pos-payment-amount">
            {{ isCash ? 'Uang diterima' : 'Nominal dibayar' }}
          </label>
          <kbd
            class="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
          >
            F8
          </kbd>
        </div>

        <!-- Input Group: Lebih Rapi dan Sejajar -->
        <div
          class="flex w-full items-center overflow-hidden rounded-lg border border-slate-300 bg-white transition-all focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900"
        >
          <!-- Prefix Rp -->
          <span
            class="flex h-10 shrink-0 items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            Rp
          </span>

          <!-- Input Angka -->
          <!-- Input Uang Diterima -->
          <div class="flex-1 h-10 flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
            <PosCurrencyInput
              id="pos-payment-amount"
              class="w-full h-full border-0 bg-transparent px-3 text-right text-lg font-bold text-slate-800 focus:ring-0 dark:text-slate-100"
              :model-value="paymentAmount"
              :disabled="disabled"
              @update:model-value="emit('update:paymentAmount', $event)"
            />
          </div>

          <!-- Numpad Sentuh -->
          <!-- Dibungkus div dengan margin-top (mt-2) agar tidak menempel pada input -->
        </div>
        <!-- <div class="mt-2">
          <PosNumpad :model-value="paymentAmount" @update:model-value="emit('update:paymentAmount', $event)" :disabled="disabled" />
        </div> -->

        <!-- Pesan Error -->
        <p v-if="partialOverLimit" class="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
          Harus kurang dari
          <strong>{{ formatCurrency(total) }}</strong>
        </p>
      </div>

      <!-- CASH DENOMINATIONS -->
      <PosCashDenominations v-if="isCash" :disabled="disabled" @set="setDenomination" @exact="emit('exact')" @reset="emit('reset')" />

      <!-- PAYMENT INFO -->
      <PosPaymentInformation
        :method="paymentMethod ?? 'cash'"
        :bank-name="bankName"
        :account-number="accountNumber"
        :account-holder="accountHolder"
        :qris-image-url="qrisImageUrl"
        :reference-number="referenceNumber"
        @update:reference-number="emit('update:referenceNumber', $event)"
      />

      <!-- CONFIRMATION -->
      <label
        v-if="requiresConfirmation && paymentAmount > 0"
        class="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <input
          type="checkbox"
          class="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-900"
          :checked="paymentConfirmed"
          :disabled="disabled"
          @change="emit('update:paymentConfirmed', ($event.target as HTMLInputElement).checked)"
        />
        <span>Pembayaran {{ paymentMethod === 'qris' ? 'QRIS' : 'transfer' }} sudah diterima</span>
      </label>
    </template>

    <!-- ============================================ -->
    <!-- NOTICE: RECEIVABLE (mode piutang)             -->
    <!-- ============================================ -->
    <div v-else class="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400"
      >
        <Info class="h-4 w-4" />
      </div>
      <div class="text-sm text-sky-800 dark:text-sky-300">
        <strong class="block font-semibold">Tidak ada pembayaran sekarang</strong>
        <span class="text-sky-700 dark:text-sky-400">Seluruh tagihan {{ formatCurrency(total) }} dicatat sebagai piutang pelanggan.</span>
      </div>
    </div>
  </div>
</template>
