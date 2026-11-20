<script setup lang="ts">
import { Type, Plus } from 'lucide-vue-next'
import { useLabelStore } from '../../stores/useLabelStore'

const store = useLabelStore()

const availableFields = [
  { type: 'text', label: 'Company Name', category: 'Basic' },
  { type: 'text', label: 'Price', category: 'Basic' },
  { type: 'text', label: 'Name', category: 'Basic' },
  { type: 'barcode', label: 'Barcode', category: 'Advanced' },
  { type: 'qrcode', label: 'QR Code', category: 'Advanced' },
  { type: 'image', label: 'Logo', category: 'Advanced' },
]
</script>

<template>
  <div class="flex w-64 flex-col border-r border-slate-300 bg-white shadow-sm z-10">
    <div class="border-b p-3">
      <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Type class="w-4 h-4" />
        Available Fields
      </h2>
    </div>
    <div class="flex-1 overflow-y-auto p-3">
      <!-- Kategori Basic -->
      <div class="mb-4">
        <h3 class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Basic</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="field in availableFields.filter((f) => f.category === 'Basic')"
            :key="field.label"
            @click="store.addElement(field.type, field.label)"
            class="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>{{ field.label }}</span>
            <Plus class="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      </div>
      <!-- Kategori Advanced -->
      <div>
        <h3 class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Advanced</h3>
        <div class="flex flex-col gap-2">
          <button
            v-for="field in availableFields.filter((f) => f.category === 'Advanced')"
            :key="field.label"
            @click="store.addElement(field.type, field.label)"
            class="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>{{ field.label }}</span>
            <Plus class="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
