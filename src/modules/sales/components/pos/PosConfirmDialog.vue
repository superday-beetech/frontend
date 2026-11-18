<script setup lang="ts">
import PosIcon from "./PosIcon.vue"
defineProps<{ title: string; message: string; confirmText?: string; confirmClass?: string; icon?: string }>()
const emit = defineEmits<{ close: []; select: [value: boolean] }>()
</script>
<template>
  <div class="space-y-4 py-2 text-center">
    <div class="flex justify-center" :class="confirmClass === 'danger' ? 'text-rose-600' : 'text-amber-500'"><PosIcon :name="icon || 'circle-alert'" :size="48" /></div>
    <div><h3 class="text-base font-bold text-slate-900 dark:text-white">{{ title }}</h3><p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ message }}</p></div>
    <div class="flex justify-center gap-2">
      <button type="button" class="pos-button pos-button-light px-4" @click="emit('close')">Batal</button>
      <button type="button" class="pos-button pos-button-danger px-4" @click="emit('select', true)">{{ confirmText || "Ya, Lanjutkan" }}</button>
    </div>
  </div>
</template>
