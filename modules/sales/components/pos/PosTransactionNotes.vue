<script setup lang="ts">
defineProps<{ modelValue: string; disabled?: boolean }>()
const emit = defineEmits<{ "update:modelValue": [value: string] }>()
</script>

<template>
  <div class="pos-notes space-y-2">
    <label class="sr-only" for="pos-transaction-notes">Catatan transaksi</label>
    <textarea id="pos-transaction-notes" class="pos-input min-h-32 resize-y" :value="modelValue" :disabled="disabled" maxlength="1000" placeholder="Catatan umum untuk transaksi ini (misalnya resep, titipan, atau permintaan pelanggan)" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"></textarea>
    <small class="block text-right text-[11px] text-slate-500">{{ modelValue.length }}/1000 karakter</small>
  </div>
</template>
