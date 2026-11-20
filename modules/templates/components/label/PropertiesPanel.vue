<script setup lang="ts">
import { Trash2, Settings } from 'lucide-vue-next'
import { useLabelStore } from '../../stores/useLabelStore'

const store = useLabelStore()
</script>

<template>
  <div class="w-72 flex flex-col border-l border-slate-300 bg-white shadow-sm z-10">
    <div class="border-b p-3">
      <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Settings class="w-4 h-4" />
        Properties
      </h2>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- STATE 1: TIDAK ADA ELEMEN DIPILIH (Pengaturan Kertas)         -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-if="!store.selectedElement" class="space-y-4">
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengaturan Kertas</h3>

        <!-- Preset Ukuran -->
        <div>
          <label class="block text-xs font-medium text-slate-700 mb-1">Preset Ukuran</label>
          <select
            @change="
              (e) => {
                const val = (e.target as HTMLSelectElement).value
                if (val) {
                  const [w, h] = val.split(',').map(Number)
                  store.setPaperSize(w, h)
                }
              }
            "
            class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">-- Pilih Preset --</option>
            <option v-for="p in store.paperPresets" :key="p.label" :value="`${p.width},${p.height}`">
              {{ p.label }}
            </option>
          </select>
        </div>

        <!-- Custom Lebar & Tinggi -->
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Lebar (px)</label>
            <input v-model.number="store.paperWidth" type="number" class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Tinggi (px)</label>
            <input v-model.number="store.paperHeight" type="number" class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
        </div>

        <div class="bg-blue-50 text-blue-700 p-3 rounded text-xs mt-4">
          Klik salah satu elemen di kanvas untuk mengubah teks, ukuran, dan posisinya.
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- STATE 2: ADA ELEMEN DIPILIH (Pengaturan Elemen)               -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold bg-slate-100 px-2 py-1 rounded">{{ store.selectedElement.label }}</span>
          <span class="text-[10px] text-slate-500">X: {{ store.selectedElement.x }} | Y: {{ store.selectedElement.y }}</span>
        </div>

        <!-- Teks Properties -->
        <div v-if="store.selectedElement.type === 'text'" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Isi Teks</label>
            <input
              v-model="store.selectedElement.props.text"
              type="text"
              class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Ukuran Font (px)</label>
            <input
              v-model.number="store.selectedElement.props.fontSize"
              type="number"
              class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Perataan</label>
            <select v-model="store.selectedElement.props.textAlign" class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm">
              <option value="left">Kiri</option>
              <option value="center">Tengah</option>
              <option value="right">Kanan</option>
            </select>
          </div>
        </div>

        <!-- Barcode / QR Properties -->
        <div v-if="['barcode', 'qrcode'].includes(store.selectedElement.type)" class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Nilai Data</label>
            <input
              v-if="store.selectedElement.type === 'barcode'"
              v-model="store.selectedElement.props.barcodeValue"
              type="text"
              class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              v-if="store.selectedElement.type === 'qrcode'"
              v-model="store.selectedElement.props.qrValue"
              type="text"
              class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <!-- Dimensi Box -->
        <div class="grid grid-cols-2 gap-2 border-t pt-3 mt-3">
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Width (px)</label>
            <input
              v-model.number="store.selectedElement.width"
              type="number"
              class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Height (px)</label>
            <input
              v-model.number="store.selectedElement.height"
              type="number"
              class="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <button
          @click="store.removeElement(store.selectedElement.id)"
          class="w-full mt-4 flex items-center justify-center gap-2 rounded bg-red-50 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
        >
          <Trash2 class="w-3.5 h-3.5" />
          Hapus Elemen
        </button>
      </div>
    </div>
  </div>
</template>
