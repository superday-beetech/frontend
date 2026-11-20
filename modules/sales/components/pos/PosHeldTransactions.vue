<script setup lang="ts">
import PosIcon from "./PosIcon.vue"
import { formatCurrency, formatDateTime } from "../../utils/format"
import type { Sale } from "../../types/sales"
defineProps<{ transactions: Sale[]; loading?: boolean; disabled?: boolean }>()
const emit = defineEmits<{ refresh: []; resume: [sale: Sale] }>()
</script>

<template>
  <div class="space-y-3">
    <div class="pos-held-bar">
      <small class="text-xs text-slate-500">{{ transactions.length }} transaksi tertahan</small>
      <button type="button" class="pos-button pos-button-soft-secondary pos-button-sm" :disabled="loading" @click="emit('refresh')"><PosIcon name="refresh-cw" :class="{ 'animate-spin': loading }" :size="14" />Muat ulang</button>
    </div>
    <small v-if="loading" class="pos-muted-center">Memuat transaksi tertahan...</small>
    <small v-else-if="!transactions.length" class="pos-muted-center">Belum ada transaksi tertahan.</small>
    <div v-else class="pos-held-list">
      <article v-for="sale in transactions" :key="sale.id" class="pos-held-item">
        <div class="pos-held-info"><strong>{{ sale.sale_number }}</strong><small>{{ sale.customer_name || "Pelanggan umum" }}</small><small>{{ formatDateTime(sale.sale_date) }}</small></div>
        <div class="pos-held-action"><strong>{{ formatCurrency(sale.total_amount) }}</strong><button type="button" class="pos-button pos-button-soft-primary pos-button-sm" :disabled="disabled" @click="emit('resume', sale)"><PosIcon name="play" :size="14" />Lanjutkan</button></div>
      </article>
    </div>
  </div>
</template>
