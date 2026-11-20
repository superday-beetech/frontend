<script setup lang="ts">
import FieldPanel from '../components/label/FieldPanel.vue'
import LabelCanvas from '../components//label/LabelCanvas.vue'
import PropertiesPanel from '../components//label/PropertiesPanel.vue'
import { useLabelStore } from '../stores/useLabelStore'
import { useToast } from '@/shared/composables/useToast'
import { Save, RotateCcw, Printer, Undo, Redo } from 'lucide-vue-next'

const store = useLabelStore()
const toast = useToast()

function saveDesign() {
  localStorage.setItem('label_design', JSON.stringify(store.elements))
  toast.success('Desain Label berhasil disimpan!')
}

function printPreview() {
  window.print()
}
</script>

<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-slate-100 font-sans">
    <!-- Header Toolbar -->
    <header class="flex h-14 shrink-0 items-center justify-between border-b border-slate-300 bg-white px-4 shadow-sm z-10">
      <div class="flex items-center gap-3">
        <h1 class="text-base font-bold text-slate-800">Edit: Shipping Labels</h1>
        <div class="flex gap-1">
          <button class="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
            <Undo class="w-3 h-3" />
            Undo
          </button>
          <button class="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
            <Redo class="w-3 h-3" />
            Redo
          </button>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="saveDesign"
          class="flex items-center gap-1.5 rounded bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Save class="w-3.5 h-3.5" />
          Save Design
        </button>
        <button class="flex items-center gap-1.5 rounded bg-orange-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-orange-600">
          <RotateCcw class="w-3.5 h-3.5" />
          Reset
        </button>
        <button
          @click="printPreview"
          class="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Printer class="w-3.5 h-3.5" />
          Print Preview
        </button>
      </div>
    </header>

    <!-- Main Content (3 Panel) -->
    <div class="flex flex-1 overflow-hidden">
      <FieldPanel />
      <LabelCanvas />
      <PropertiesPanel />
    </div>
  </div>
</template>
