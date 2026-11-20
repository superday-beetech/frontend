<script setup lang="ts">
defineProps<{ buyerName: string; buyerPhone: string; collateralNote: string; disabled?: boolean }>()
const emit = defineEmits<{
  (e: "update:buyerName", v: string): void
  (e: "update:buyerPhone", v: string): void
  (e: "update:collateralNote", v: string): void
}>()
</script>

<template>
  <section class="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900 dark:bg-amber-950/20">
    <h3 class="text-xs font-bold text-amber-800 dark:text-amber-200">Pembeli tempo (belum terdaftar)</h3>
    <div class="space-y-1">
      <label class="pos-label">Nama pembeli <span class="text-rose-600">*</span></label>
      <input class="pos-input" :value="buyerName" :disabled="disabled" @input="emit('update:buyerName', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="space-y-1">
      <label class="pos-label">Telepon</label>
      <input class="pos-input" :value="buyerPhone" :disabled="disabled" @input="emit('update:buyerPhone', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="space-y-1">
      <label class="pos-label">Jaminan <span class="text-rose-600">*</span></label>
      <input class="pos-input" placeholder="mis. KTP, STNK, jam tangan" :value="collateralNote" :disabled="disabled" @input="emit('update:collateralNote', ($event.target as HTMLInputElement).value)" />
    </div>
  </section>
</template>
