<script setup lang="ts">
import { computed } from "vue"
import PosIcon from "./PosIcon.vue"
import PosPaymentMethod from "./PosPaymentMethod.vue"
import PosCashDenominations from "./PosCashDenominations.vue"
import PosPaymentInformation from "./PosPaymentInformation.vue"
import PosCurrencyInput from "./PosCurrencyInput.vue"
import { formatCurrency } from "../../utils/format"
import type { PaymentMethod, SettlementMode } from "../../types/sales"

const props = defineProps<{
  mode: SettlementMode; paymentMethod: PaymentMethod | null; paymentAmount: number; total: number
  dueDate: string; dueDateError?: string | null; referenceNumber: string; paymentConfirmed: boolean
  disabled?: boolean; bankName?: string; accountNumber?: string; accountHolder?: string; qrisImageUrl?: string | null
}>()
const emit = defineEmits<{
  "update:mode": [value: SettlementMode]; "update:paymentMethod": [value: PaymentMethod]
  "update:paymentAmount": [value: number]; "update:dueDate": [value: string]
  "update:referenceNumber": [value: string]; "update:paymentConfirmed": [value: boolean]
  exact: []; reset: []
}>()
const settlementOptions: Array<{ value: SettlementMode; label: string; icon: string; hint: string }> = [
  { value: "paid", label: "Lunas", icon: "circle-check", hint: "Bayar seluruh tagihan" },
  { value: "partial", label: "Sebagian", icon: "wallet", hint: "Tempo sebagian: bayar sebagian, sisanya menjadi piutang" },
  { value: "receivable", label: "Piutang", icon: "calendar-days", hint: "Seluruh tagihan menjadi piutang" },
]
const isCash = computed(() => props.paymentMethod === "cash")
const requiresConfirmation = computed(() => props.paymentMethod === "transfer" || props.paymentMethod === "qris")
const partialOverLimit = computed(() => props.mode === "partial" && props.total > 0 && props.paymentAmount >= props.total)
function setDenomination(value: number): void { emit("update:paymentAmount", Math.max(0, value)) }
</script>

<template>
  <div class="pos-payment">
    <div class="pos-segment" role="radiogroup" aria-label="Mode pembayaran">
      <label v-for="option in settlementOptions" :key="option.value" class="pos-choice" :title="option.hint">
        <input type="radio" class="sr-only" name="pos-settlement-mode" :value="option.value" :checked="mode === option.value" :disabled="disabled" @change="emit('update:mode', option.value)" />
        <span class="pos-segment-btn"><PosIcon :name="option.icon" :size="15" />{{ option.label }}</span>
      </label>
    </div>
    <template v-if="mode !== 'paid'">
      <div class="pos-inline-row">
        <label class="pos-label mb-0" for="pos-due-date">Jatuh tempo</label>
        <input id="pos-due-date" type="date" class="pos-input pos-input-sm max-w-44" :class="{ 'border-rose-500': !!dueDateError }" :value="dueDate" :disabled="disabled" :aria-invalid="!!dueDateError" @change="emit('update:dueDate', ($event.target as HTMLInputElement).value)" />
      </div>
      <small v-if="dueDateError" class="pos-invalid">{{ dueDateError }}</small>
    </template>
    <template v-if="mode !== 'receivable'">
      <PosPaymentMethod :model-value="paymentMethod ?? 'cash'" :disabled="disabled" @update:model-value="emit('update:paymentMethod', $event)" />
      <div>
        <label class="pos-label" for="pos-payment-amount">{{ isCash ? "Uang diterima" : "Nominal dibayar" }} <kbd>F8</kbd></label>
        <div class="pos-amount"><span class="pos-input-addon">Rp</span><PosCurrencyInput id="pos-payment-amount" :model-value="paymentAmount" :disabled="disabled" @update:model-value="emit('update:paymentAmount', $event)" /></div>
        <p v-if="partialOverLimit" class="pos-amount-hint is-error">Harus kurang dari <strong>{{ formatCurrency(total) }}</strong></p>
      </div>
      <PosCashDenominations v-if="isCash" :disabled="disabled" @set="setDenomination" @exact="emit('exact')" @reset="emit('reset')" />
      <PosPaymentInformation :method="paymentMethod ?? 'cash'" :bank-name="bankName" :account-number="accountNumber" :account-holder="accountHolder" :qris-image-url="qrisImageUrl" :reference-number="referenceNumber" @update:reference-number="emit('update:referenceNumber', $event)" />
      <label v-if="requiresConfirmation && paymentAmount > 0" class="pos-confirm">
        <input type="checkbox" class="pos-checkbox" :checked="paymentConfirmed" :disabled="disabled" @change="emit('update:paymentConfirmed', ($event.target as HTMLInputElement).checked)" />
        <span>Pembayaran {{ paymentMethod === "qris" ? "QRIS" : "transfer" }} sudah diterima</span>
      </label>
    </template>
    <div v-else class="pos-notice is-info">
      <PosIcon name="info" :size="16" />
      <div><strong class="block">Tidak ada pembayaran sekarang</strong>Seluruh tagihan {{ formatCurrency(total) }} dicatat sebagai piutang pelanggan.</div>
    </div>
  </div>
</template>
