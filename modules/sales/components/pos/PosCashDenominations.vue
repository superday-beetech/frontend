<script setup lang="ts">
import PosIcon from './PosIcon.vue'
import { formatNumber } from '../../utils/format'
import { POS_DENOMINATIONS } from '../../utils/posDenominations'

defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ set: [amount: number]; exact: []; reset: [] }>()
</script>

<template>
  <div class="space-y-3">
    <!-- Header: Label & Reset -->
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">
        Nominal cepat
        <small class="ml-1 font-normal text-slate-400">(Alt+1–8)</small>
      </span>
      <button
        type="button"
        class="text-[11px] font-semibold text-rose-500 transition-colors hover:text-rose-700 disabled:opacity-50"
        :disabled="disabled"
        title="Alt+0"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>

    <!-- Grid Nominal -->
    <div class="grid grid-cols-3 gap-2">
      <!-- Tombol Nominal Biasa -->
      <button
        v-for="(amount, index) in POS_DENOMINATIONS"
        :key="amount"
        type="button"
        :disabled="disabled"
        :title="`Uang diterima ${formatNumber(amount)} (Alt+${index + 1})`"
        @click="emit('set', amount)"
        class="group flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-300"
      >
        {{ formatNumber(amount) }}
      </button>

      <!-- Tombol Uang Pas (Highlight Khusus) -->
      <button
        type="button"
        class="group flex h-9 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-100 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/60"
        :disabled="disabled"
        title="Uang pas (Alt+8 / F9)"
        @click="emit('exact')"
      >
        <PosIcon
          name="check-circle-2"
          :size="14"
          class="text-emerald-600 transition-transform group-hover:scale-110 dark:text-emerald-400"
        />
        Uang Pas
      </button>
    </div>
  </div>
</template>
