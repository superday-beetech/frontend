<script setup lang="ts">
import { ref, computed } from 'vue'
import BlockLibrary from '../components/templates/BlockLibrary.vue'
import DesignerCanvas from '../components/templates/DesignerCanvas.vue'
import PropertiesPanel from '../components/templates/PropertiesPanel.vue'
import PrintPreview from '../components/templates/PrintPreview.vue'
import { useTemplateStore } from '../stores/useTemplateStore'
import { useToast } from '@/shared/composables/useToast'
// ✨ Tambahkan ChevronDown & ChevronUp di sini
import {
  Save,
  FolderOpen,
  RotateCcw,
  Printer,
  ZoomIn,
  ZoomOut,
  LayoutTemplate,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-vue-next'

const store = useTemplateStore()
const toast = useToast()
const showTemplatesModal = ref(false)

// ✨ State untuk Kotak Output (Collapsible)
const isOutputOpen = ref(false)
const isCopied = ref(false)

const outputData = computed(() => {
  return {
    name: 'Custom Template ' + new Date().toLocaleDateString(),
    paper_size: store.paperSettings.size,
    paper_width: store.paperSettings.width,
    padding: store.paperSettings.padding,
    layout_data: store.rows,
  }
})

const jsonString = computed(() => JSON.stringify(outputData.value, null, 2))

const paperSizes = [
  { label: '58mm', value: '58mm' },
  { label: '80mm', value: '80mm' },
  { label: 'A4', value: 'A4' },
  { label: 'Label', value: 'Label' },
]

function copyToClipboard() {
  navigator.clipboard.writeText(jsonString.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
  toast.success('JSON berhasil dicopy!')
}

function handleSave() {
  if (store.saveTemplate()) toast.success('Template berhasil disimpan.')
}

function handleLoadSaved() {
  if (store.loadSavedTemplate()) toast.success('Template dimuat dari penyimpanan.')
  else toast.error('Tidak ada template tersimpan.')
}

function handleReset() {
  store.resetTemplate()
  toast.success('Kanvas direset.')
}

function handlePrint() {
  const printArea = document.getElementById('print-area')
  if (!printArea) return
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (doc) {
    doc.open()
    doc.write(`
      <html><head><title>Print</title>
      <style>
        @page { margin: 0; } body { margin: 0; padding: 0; font-family: monospace; color: black; }
        .flex { display: flex; } .flex-1 { flex: 1 1 0%; } .flex-col { flex-direction: column; }
        .gap-1 { gap: 0.25rem; } .gap-2 { gap: 0.5rem; } .mb-1 { margin-bottom: 0.25rem; }
        .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; } .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .justify-center { justify-content: center; } .justify-between { justify-content: space-between; }
        .items-center { align-items: center; } .text-center { text-align: center; }
        .text-right { text-align: right; } .font-bold { font-weight: 700; }
        .text-\\[12px\\] { font-size: 12px; } .leading-tight { line-height: 1.25; }
        .border-t { border-top: 1px solid black; } .border-b { border-bottom: 1px solid black; }
        .max-h-16 { max-height: 4rem; } .object-contain { object-fit: contain; }
      </style></head><body>${printArea.outerHTML}</body></html>
    `)
    doc.close()
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setTimeout(() => document.body.removeChild(iframe), 1000)
      }, 300)
    }
  }
}

function loadDefault(id: string) {
  if (store.loadDefaultTemplate(id)) toast.success('Template default dimuat.')
  showTemplatesModal.value = false
}
</script>

<template>
  <div class="relative flex h-screen w-full flex-col overflow-hidden bg-slate-50">
    <!-- HEADER TOOLBAR -->
    <header class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 z-10">
      <div class="flex items-center gap-4">
        <h1 class="text-sm font-bold text-slate-800">Designer Struk</h1>
        <div class="flex rounded-md bg-slate-100 p-1">
          <button
            v-for="size in paperSizes"
            :key="size.value"
            @click="store.setPaperSize(size.value)"
            class="rounded px-3 py-1 text-xs font-medium transition"
            :class="store.paperSettings.size === size.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'"
          >
            {{ size.label }}
          </button>
        </div>
        <div v-if="store.isDirty" class="rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600">Unsaved changes</div>
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1">
          <button @click="store.setZoom(store.zoomLevel - 0.1)" class="p-1 text-slate-500 hover:text-slate-800">
            <ZoomOut class="h-4 w-4" />
          </button>
          <span class="w-12 text-center text-xs font-medium">{{ Math.round(store.zoomLevel * 100) }}%</span>
          <button @click="store.setZoom(store.zoomLevel + 0.1)" class="p-1 text-slate-500 hover:text-slate-800">
            <ZoomIn class="h-4 w-4" />
          </button>
        </div>

        <button
          @click="showTemplatesModal = true"
          class="flex items-center gap-1.5 rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <LayoutTemplate class="h-3.5 w-3.5" />
          Templates
        </button>
        <button
          @click="handleLoadSaved"
          class="flex items-center gap-1.5 rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <FolderOpen class="h-3.5 w-3.5" />
          Load
        </button>
        <button
          @click="handlePrint"
          class="flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <Printer class="h-3.5 w-3.5" />
          Print
        </button>
        <button
          @click="handleSave"
          class="flex items-center gap-1.5 rounded bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
        >
          <Save class="h-3.5 w-3.5" />
          Save
        </button>
        <button
          @click="handleReset"
          class="flex items-center gap-1.5 rounded bg-orange-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
        >
          <RotateCcw class="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
    </header>

    <!-- MAIN 3 PANEL -->
    <div class="relative flex flex-1 overflow-hidden">
      <BlockLibrary />
      <DesignerCanvas />
      <PropertiesPanel />
    </div>

    <!-- KOTAK OUTPUT DATA (Collapsible) -->
    <div
      class="shrink-0 border-t border-slate-300 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out z-20"
      :class="isOutputOpen ? 'h-64' : 'h-10'"
    >
      <!-- Header Kotak Output -->
      <div
        class="flex h-10 cursor-pointer items-center justify-between border-b border-slate-700 bg-slate-800 px-4 hover:bg-slate-750 transition-colors"
        @click="isOutputOpen = !isOutputOpen"
      >
        <div class="flex items-center gap-2">
          <component :is="isOutputOpen ? ChevronDown : ChevronUp" class="h-4 w-4 text-slate-400" />
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Output Database (Payload JSON)</span>
          <span class="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">Ready to API</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="isOutputOpen"
            @click.stop="copyToClipboard"
            class="flex items-center gap-1.5 rounded bg-slate-700 px-3 py-1 text-xs font-medium text-white hover:bg-slate-600 transition-colors"
          >
            <Check v-if="isCopied" class="h-3.5 w-3.5 text-emerald-400" />
            <Copy v-else class="h-3.5 w-3.5" />
            {{ isCopied ? 'Copied!' : 'Copy JSON' }}
          </button>
          <span class="text-[10px] text-slate-400">{{ isOutputOpen ? 'Klik untuk menutup' : 'Klik untuk melihat JSON' }}</span>
        </div>
      </div>

      <!-- Isi JSON -->
      <div v-if="isOutputOpen" class="h-[calc(100%-2.5rem)] overflow-y-auto p-4 custom-scrollbar">
        <pre class="text-xs font-mono text-emerald-300">{{ jsonString }}</pre>
      </div>
    </div>

    <!-- PRINT PREVIEW (HIDDEN) -->
    <div class="absolute left-[-9999px] top-0">
      <PrintPreview />
    </div>

    <!-- MODAL TEMPLATE -->
    <div
      v-if="showTemplatesModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showTemplatesModal = false"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-800">Pilih Template Default</h2>
          <button @click="showTemplatesModal = false" class="text-slate-400 hover:text-slate-600"><X class="h-5 w-5" /></button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="tpl in store.defaultTemplates"
            :key="tpl.id"
            @click="loadDefault(tpl.id)"
            class="cursor-pointer rounded-lg border border-slate-200 p-4 transition hover:border-blue-500 hover:shadow-md"
          >
            <div class="mb-2 flex h-24 items-center justify-center rounded bg-slate-50 text-xs text-slate-400">{{ tpl.paperSize }}</div>
            <div class="text-sm font-semibold">{{ tpl.name }}</div>
            <div class="text-xs text-slate-500">{{ tpl.rows.length }} baris</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 9999px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e8ecf1;
}
</style>
