<script setup lang="ts">
import type { Unit } from '../services/unitService'

defineProps<{
  unit: Unit
}>()

const emit = defineEmits<{
  select: [value: Unit]
  close: []
}>()
</script>

<template>
  <div v-if="unit">
    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Satuan</label>
      <div class="font-semibold">{{ unit.name }}</div>
    </div>

    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Singkatan</label>
      <div class="font-semibold">{{ unit.abbreviation }}</div>
    </div>

    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
      <div>{{ unit.id }}</div>
    </div>

    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Dibuat</label>
      <div>{{ unit.created_at || '-' }}</div>
    </div>

    <div class="mb-3">
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Terakhir Diperbarui</label>
      <div>{{ unit.updated_at || '-' }}</div>
    </div>

    <div class="flex justify-end gap-2">
      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-slate-100 text-slate-700 hover:bg-slate-200"
        @click="emit('close')"
      >
        Tutup
      </button>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 bg-primary-600 text-white hover:bg-primary-700"
        @click="emit('select', unit)"
      >
        <i class="ti ti-edit me-1"></i>
        Ubah
      </button>
    </div>
  </div>
</template>
