<script setup lang="ts">
import PosIcon from "./PosIcon.vue"
import { formatNumber } from "../../utils/format"
import { POS_DENOMINATIONS } from "../../utils/posDenominations"
defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ set: [amount: number]; exact: []; reset: [] }>()
</script>

<template>
  <div class="space-y-2">
    <div class="pos-denoms-head"><span>Nominal cepat <small class="font-normal text-slate-500">(Alt+1–8)</small></span><button type="button" class="pos-link-danger" :disabled="disabled" title="Alt+0" @click="emit('reset')">Reset</button></div>
    <div class="pos-denoms">
      <button v-for="(amount, index) in POS_DENOMINATIONS" :key="amount" type="button" :disabled="disabled" :title="`Uang diterima ${formatNumber(amount)} (Alt+${index + 1})`" @click="emit('set', amount)">{{ formatNumber(amount) }}</button>
      <button type="button" class="is-exact" :disabled="disabled" title="Uang pas (Alt+8 / F9)" @click="emit('exact')"><PosIcon name="check" :size="14" />Uang pas</button>
    </div>
  </div>
</template>
