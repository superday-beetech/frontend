<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTemplateStore, type TemplateBlock } from '../../stores/useTemplateStore'
import { Plus, Trash2, LayoutPanelLeft } from 'lucide-vue-next'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

const store = useTemplateStore()
const activeTab = ref<'editor' | 'preview'>('editor')

// ── Drag & Drop Logic ──
function onDragStartBlock(event: DragEvent, block: TemplateBlock, rowId: string, colId: string) {
  event.dataTransfer?.setData('application/json', JSON.stringify({ type: 'move', block, sourceRowId: rowId, sourceColId: colId }))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function onDrop(event: DragEvent, targetRowId: string, targetColId: string) {
  event.preventDefault()
  const jsonData = event.dataTransfer?.getData('application/json')

  // Pindah blok yang sudah ada
  if (jsonData) {
    const data = JSON.parse(jsonData)
    if (data.type === 'move') {
      store.moveBlock(data.block.id, data.sourceRowId, data.sourceColId, targetRowId, targetColId)
    }
    return
  }

  // Tambah blok baru dari panel kiri
  const blockType = event.dataTransfer?.getData('blockType')
  const blockLabel = event.dataTransfer?.getData('blockLabel')
  if (blockType && blockLabel) {
    store.addBlock(targetRowId, targetColId, blockType, blockLabel)
  }
}

function handleBlockClick(event: MouseEvent, block: TemplateBlock) {
  event.stopPropagation()
  store.selectBlock(block)
}

function getBlockStyle(block: TemplateBlock) {
  return {
    textAlign: block.props.align || 'left',
    fontWeight: block.props.bold ? 'bold' : 'normal',
    fontSize: block.props.fontSize ? `${block.props.fontSize}px` : 'inherit',
    fontFamily: block.props.fontFamily || 'inherit',
  }
}

// ── Barcode & QR Code Render ──
function renderBarcode(canvas: HTMLCanvasElement | null, value: string) {
  if (!canvas) return
  try {
    JsBarcode(canvas, value || '1234567890', { format: 'CODE128', displayValue: true, height: 40, width: 1.5 })
  } catch (e) {
    console.error('Barcode Error', e)
  }
}

async function renderQRCode(canvas: HTMLCanvasElement | null, value: string) {
  if (!canvas) return
  try {
    await QRCode.toCanvas(canvas, value || 'https://example.com', { width: 100, margin: 1 })
  } catch (e) {
    console.error('QR Error', e)
  }
}

// ── Lifecycle & Watcher ──
watch(
  () => store.rows,
  () => {
    setTimeout(() => {
      document.querySelectorAll('.barcode-canvas').forEach((el) => {
        const canvas = el as HTMLCanvasElement
        const b = store.rows
          .flatMap((r) => r.columns)
          .flatMap((c) => c.blocks)
          .find((x) => x.id === canvas.dataset.blockId)
        if (b) renderBarcode(canvas, b.props.value)
      })
      document.querySelectorAll('.qr-canvas').forEach((el) => {
        const canvas = el as HTMLCanvasElement
        const b = store.rows
          .flatMap((r) => r.columns)
          .flatMap((c) => c.blocks)
          .find((x) => x.id === canvas.dataset.blockId)
        if (b) renderQRCode(canvas, b.props.value)
      })
    }, 100)
  },
  { deep: true }
)

onMounted(() => {
  setTimeout(() => {
    document.querySelectorAll('.barcode-canvas').forEach((el) => {
      const canvas = el as HTMLCanvasElement
      const b = store.rows
        .flatMap((r) => r.columns)
        .flatMap((c) => c.blocks)
        .find((x) => x.id === canvas.dataset.blockId)
      if (b) renderBarcode(canvas, b.props.value)
    })
  }, 200)
})
</script>

<template>
  <div class="relative flex h-full flex-1 flex-col overflow-hidden bg-slate-200/50">
    <!-- Toolbar Atas (Editor / Preview) -->
    <div class="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div class="flex rounded-md bg-slate-100 p-1">
        <button
          @click="activeTab = 'editor'"
          class="rounded px-4 py-1 text-sm font-medium transition"
          :class="activeTab === 'editor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'"
        >
          Editor
        </button>
        <button
          @click="activeTab = 'preview'"
          class="rounded px-4 py-1 text-sm font-medium transition"
          :class="activeTab === 'preview' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'"
        >
          Preview
        </button>
      </div>
      <div v-if="activeTab === 'editor'" class="text-xs text-slate-500">
        Sale ID:
        <span class="rounded border border-slate-300 bg-slate-50 px-2 py-0.5">POS-14</span>
      </div>
    </div>

    <!-- Canvas Area (Scrollable) -->
    <div class="custom-scrollbar flex flex-1 items-start justify-center overflow-auto p-8" @click="store.selectBlock(null)">
      <!-- Kertas -->
      <div
        class="relative bg-white text-black shadow-lg transition-all"
        :style="{ width: `${store.paperWidthPx}px`, zoom: store.zoomLevel, padding: `${store.paperSettings.padding}px` }"
        @click.stop
      >
        <!-- Loop Rows -->
        <div v-for="row in store.rows" :key="row.id" class="group relative mb-4 flex gap-2">
          <!-- Toolbar Hover (1/2/3 Kolom) — Hanya muncul di Editor -->
          <div
            v-if="activeTab === 'editor'"
            class="absolute -top-8 right-0 z-10 hidden items-center gap-1 rounded-md border border-slate-200 bg-white p-1 shadow-sm group-hover:flex"
          >
            <span class="text-[10px] text-slate-400 mr-1">
              <LayoutPanelLeft class="w-3 h-3 inline" />
              Layout:
            </span>
            <button
              @click="store.setRowColumns(row.id, 1)"
              class="px-2 py-0.5 text-[10px] rounded hover:bg-slate-100"
              :class="row.columns.length === 1 ? 'bg-slate-200 font-bold' : ''"
            >
              1
            </button>
            <button
              @click="store.setRowColumns(row.id, 2)"
              class="px-2 py-0.5 text-[10px] rounded hover:bg-slate-100"
              :class="row.columns.length === 2 ? 'bg-slate-200 font-bold' : ''"
            >
              2
            </button>
            <button
              @click="store.setRowColumns(row.id, 3)"
              class="px-2 py-0.5 text-[10px] rounded hover:bg-slate-100"
              :class="row.columns.length === 3 ? 'bg-slate-200 font-bold' : ''"
            >
              3
            </button>
            <div class="h-3 w-px bg-slate-300 mx-1"></div>
            <button v-if="store.rows.length > 1" @click="store.removeRow(row.id)" class="p-1 text-red-500 hover:bg-red-50 rounded">
              <Trash2 class="h-3 w-3" />
            </button>
          </div>

          <!-- Loop Columns -->
          <div
            v-for="col in row.columns"
            :key="col.id"
            class="relative flex flex-1 flex-col gap-1 transition-all"
            :class="
              activeTab === 'editor'
                ? 'min-h-15 rounded-sm border border-dashed border-slate-300 bg-slate-50/30 p-2 hover:border-blue-400'
                : 'border-transparent p-0'
            "
            @dragover.prevent
            @drop="onDrop($event, row.id, col.id)"
          >
            <!-- Placeholder Drop -->
            <div
              v-if="col.blocks.length === 0 && activeTab === 'editor'"
              class="flex h-full items-center justify-center text-xs text-slate-400"
            >
              Drop here
            </div>

            <!-- Loop Blocks -->
            <div
              v-for="block in col.blocks"
              :key="block.id"
              draggable="true"
              @dragstart="onDragStartBlock($event, block, row.id, col.id)"
              @click="handleBlockClick($event, block)"
              class="group/block relative cursor-pointer rounded p-1"
              :class="{ 'ring-2 ring-blue-500 bg-blue-50/50': store.selectedBlock?.id === block.id && activeTab === 'editor' }"
            >
              <!-- Logo -->
              <div v-if="block.type === 'logo'" class="flex justify-center">
                <img v-if="block.props.url" :src="block.props.url" class="max-h-16 object-contain" />
                <div
                  v-else
                  class="flex h-12 w-24 items-center justify-center rounded border border-dashed border-slate-300 text-[10px] text-slate-400"
                >
                  Logo
                </div>
              </div>

              <!-- Divider -->
              <div
                v-else-if="block.type === 'divider'"
                class="my-2 w-full"
                :style="{ borderTop: `1px ${block.props.style || 'solid'} black` }"
              ></div>

              <!-- Spacer -->
              <div v-else-if="block.type === 'spacer'" :style="{ height: `${block.props.height || 20}px` }"></div>

              <!-- Barcode -->
              <div v-else-if="block.type === 'barcode'" class="flex justify-center py-1">
                <canvas
                  :data-block-id="block.id"
                  class="barcode-canvas max-w-full"
                  :ref="
                    (el) => {
                      if (el && block.props.value) renderBarcode(el as HTMLCanvasElement, block.props.value)
                    }
                  "
                ></canvas>
              </div>

              <!-- QR Code -->
              <div v-else-if="block.type === 'qr_code'" class="flex justify-center py-1">
                <canvas
                  :data-block-id="block.id"
                  class="qr-canvas max-w-full"
                  :ref="
                    (el) => {
                      if (el && block.props.value) renderQRCode(el as HTMLCanvasElement, block.props.value)
                    }
                  "
                ></canvas>
              </div>

              <!-- Custom Text -->
              <div v-else-if="block.type === 'text'" class="text-[13px] leading-tight" :style="getBlockStyle(block)">
                {{ block.props.text || 'Custom Text' }}
              </div>

              <!-- Default Blocks (Company, Sale Info, dll) -->
              <div v-else class="text-[13px] font-mono leading-tight" :style="getBlockStyle(block)">
                <template v-if="block.type === 'company'">
                  <div>{{ block.props.text || 'My Store, LLC' }}</div>
                </template>
                <template v-else-if="block.type === 'sale_info'">
                  <div>Sales Receipt</div>
                  <div>11/18/2026 03:24 AM</div>
                  <div>Sale ID: POS-14</div>
                </template>
                <template v-else-if="block.type === 'items_table'">
                  <div class="mt-1 border-b border-t border-black py-1 flex justify-between font-bold">
                    <span>Item</span>
                    <span>Price</span>
                    <span>Qty</span>
                    <span>Total</span>
                  </div>
                  <div class="flex justify-between py-0.5">
                    <span>Product A</span>
                    <span>$10.00</span>
                    <span>1</span>
                    <span>$10.00</span>
                  </div>
                  <div class="border-b border-black"></div>
                </template>
                <template v-else-if="block.type === 'totals'">
                  <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>$20.00</span>
                  </div>
                  <div class="flex justify-between border-t border-black pt-1 font-bold">
                    <span>TOTAL</span>
                    <span>$22.00</span>
                  </div>
                </template>
                <div v-else>{{ block.label }}</div>
              </div>

              <!-- Hapus Blok (Hanya di Editor) -->
              <button
                v-if="activeTab === 'editor'"
                @click.stop="store.removeBlock(block.id)"
                class="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white shadow-sm group-hover/block:block"
              >
                <Trash2 class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tambah Baris (Hanya di Editor) -->
        <button
          v-if="activeTab === 'editor'"
          @click.stop="store.addRow()"
          class="mt-4 flex w-full items-center justify-center gap-1 rounded border border-dashed border-slate-300 py-2 text-xs text-slate-500 hover:bg-slate-50"
        >
          <Plus class="h-3 w-3" />
          Tambah Baris
        </button>
      </div>
    </div>
  </div>
</template>
