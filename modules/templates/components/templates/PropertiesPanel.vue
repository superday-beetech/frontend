<script setup lang="ts">
import { useTemplateStore } from '../../stores/useTemplateStore'
import { ChevronRight, ChevronLeft, SlidersHorizontal, Trash2 } from 'lucide-vue-next'

const store = useTemplateStore()
</script>

<template>
  <div
    class="relative flex h-full flex-col border-l border-slate-200 bg-white transition-all duration-300"
    :class="store.isPropertiesPanelOpen ? 'w-72' : 'w-0 overflow-hidden border-none'"
  >
    <div class="flex min-w-[288px] shrink-0 items-center justify-between border-b border-slate-100 p-4">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500">Properties</h2>
      <button @click="store.togglePropertiesPanel()" class="rounded p-1 text-slate-400 hover:bg-slate-100">
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <div class="custom-scrollbar min-w-[288px] flex-1 overflow-y-auto p-4">
      <div v-if="!store.selectedBlock" class="space-y-6">
        <div>
          <h3 class="text-sm font-semibold text-slate-800 mb-3">Pengaturan Kertas</h3>
          <label class="mb-1 block text-xs font-medium text-slate-700">Ukuran Kertas</label>
          <select
            :value="store.paperSettings.size"
            @change="store.setPaperSize(($event.target as HTMLSelectElement).value)"
            class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm mb-3"
          >
            <option value="58mm">58mm</option>
            <option value="80mm">80mm</option>
            <option value="A4">A4 / Letter</option>
            <option value="Label">Label</option>
          </select>
          <label class="mb-1 block text-xs font-medium text-slate-700">Padding (px)</label>
          <input
            v-model.number="store.paperSettings.padding"
            type="number"
            class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div class="flex flex-col items-center justify-center border-t pt-6 text-center">
          <SlidersHorizontal class="mb-2 h-8 w-8 text-slate-300" />
          <p class="text-xs text-slate-400">Klik pada blok di kanvas untuk mulai mengedit.</p>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <div class="text-sm font-semibold text-slate-800">{{ store.selectedBlock.label }}</div>
          <span class="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{{ store.selectedBlock.type }}</span>
        </div>

        <template v-if="store.selectedBlock.type === 'divider'">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-700">Style Garis</label>
            <select v-model="store.selectedBlock.props.style" class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm">
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>
        </template>

        <template v-if="store.selectedBlock.type === 'logo'">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-700">URL Logo</label>
            <input
              v-model="store.selectedBlock.props.url"
              type="text"
              placeholder="https://..."
              class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
        </template>

        <template v-if="store.selectedBlock.type === 'barcode' || store.selectedBlock.type === 'qr_code'">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-700">Nilai Data</label>
            <input
              v-model="store.selectedBlock.props.value"
              type="text"
              class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
        </template>

        <template v-if="store.selectedBlock.type === 'spacer'">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-700">Tinggi (px)</label>
            <input
              v-model.number="store.selectedBlock.props.height"
              type="number"
              class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
        </template>

        <template v-if="store.selectedBlock.type === 'text'">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-700">Isi Teks</label>
            <textarea
              v-model="store.selectedBlock.props.text"
              rows="3"
              class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            ></textarea>
          </div>
        </template>

        <template
          v-if="
            ['text', 'company', 'title', 'sale_info', 'customer', 'totals', 'comment', 'items_table'].includes(store.selectedBlock.type)
          "
        >
          <!-- Pengaturan Font Family -->
          <div class="border-t pt-3 mt-3">
            <label class="mb-1 block text-xs font-medium text-slate-700">Jenis Huruf (Font)</label>
            <select v-model="store.selectedBlock.props.fontFamily" class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm">
              <option value="monospace">Monospace (Default POS)</option>
              <option value="sans-serif">Sans-Serif (Arial/Helvetica)</option>
              <option value="serif">Serif (Times New Roman)</option>
              <option value="cursive">Cursive</option>
            </select>
          </div>

          <!-- Pengaturan Font Size -->
          <div class="mt-3">
            <label class="mb-1 block text-xs font-medium text-slate-700">Ukuran Huruf (px)</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="store.selectedBlock.props.fontSize"
                type="number"
                min="8"
                max="36"
                class="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
              />
              <span class="text-xs text-slate-400">px</span>
            </div>
          </div>

          <!-- Perataan -->
          <div class="border-t pt-3 mt-3">
            <label class="mb-1 block text-xs font-medium text-slate-700">Perataan</label>
            <div class="flex overflow-hidden rounded-md border border-slate-300">
              <button
                @click="store.selectedBlock.props.align = 'left'"
                class="flex-1 p-1 text-xs hover:bg-slate-50"
                :class="{ 'bg-slate-100 font-bold': store.selectedBlock.props.align === 'left' }"
              >
                Kiri
              </button>
              <button
                @click="store.selectedBlock.props.align = 'center'"
                class="flex-1 border-x border-slate-300 p-1 text-xs hover:bg-slate-50"
                :class="{ 'bg-slate-100 font-bold': store.selectedBlock.props.align === 'center' }"
              >
                Tengah
              </button>
              <button
                @click="store.selectedBlock.props.align = 'right'"
                class="flex-1 p-1 text-xs hover:bg-slate-50"
                :class="{ 'bg-slate-100 font-bold': store.selectedBlock.props.align === 'right' }"
              >
                Kanan
              </button>
            </div>
          </div>

          <!-- Bold Checkbox -->
          <div class="mt-3 flex items-center gap-2">
            <input type="checkbox" v-model="store.selectedBlock.props.bold" id="bold" class="rounded border-slate-300" />
            <label for="bold" class="text-xs font-medium text-slate-700">Tebalkan Teks (Bold)</label>
          </div>
        </template>

        <div class="border-t pt-4 mt-4">
          <button
            @click="store.removeBlock(store.selectedBlock.id)"
            class="flex w-full items-center justify-center gap-2 rounded-md bg-red-50 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
          >
            <Trash2 class="h-3.5 w-3.5" />
            Hapus Blok
          </button>
        </div>
      </div>
    </div>
  </div>

  <button
    v-if="!store.isPropertiesPanelOpen"
    @click="store.togglePropertiesPanel()"
    class="absolute right-0 top-20 z-10 flex items-center justify-center rounded-l-md border border-r-0 border-slate-200 bg-white p-1.5 text-slate-500 shadow-md hover:text-slate-800"
  >
    <ChevronLeft class="h-4 w-4" />
  </button>
</template>
