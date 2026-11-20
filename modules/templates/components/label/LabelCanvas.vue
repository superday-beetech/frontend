<script setup lang="ts">
import { ZoomIn, ZoomOut, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Trash2 } from 'lucide-vue-next'
import { useLabelStore, type LabelElement } from '../../stores/useLabelStore'
import JsBarcode from 'jsbarcode'
import QRCode from 'qrcode'

const store = useLabelStore()

// ── Drag & Drop Logic ──
let isDragging = false
let startX = 0
let startY = 0
let initialElX = 0
let initialElY = 0

function startDrag(event: MouseEvent, el: LabelElement) {
  store.selectElement(el.id)
  isDragging = true
  startX = event.clientX
  startY = event.clientY
  initialElX = el.x
  initialElY = el.y

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

function onDrag(event: MouseEvent) {
  if (!isDragging || !store.selectedElement) return
  const dx = (event.clientX - startX) / store.zoom
  const dy = (event.clientY - startY) / store.zoom

  store.selectedElement.x = Math.round(initialElX + dx)
  store.selectedElement.y = Math.round(initialElY + dy)
}

function stopDrag() {
  isDragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

// ── Alignment & Rotate ──
function alignElement(position: 'left' | 'center' | 'right') {
  if (!store.selectedElement) return
  const el = store.selectedElement
  if (position === 'left') el.x = 0
  if (position === 'center') el.x = Math.round((store.paperWidth - el.width) / 2)
  if (position === 'right') el.x = store.paperWidth - el.width
}

// ── Barcode & QR Render ──
function renderBarcode(canvas: HTMLCanvasElement | null, value: string) {
  if (!canvas) return
  try {
    JsBarcode(canvas, value || '1234567890', { format: 'CODE128', displayValue: false, height: 40, width: 1.5 })
  } catch {}
}
async function renderQRCode(canvas: HTMLCanvasElement | null, value: string) {
  if (!canvas) return
  try {
    await QRCode.toCanvas(canvas, value || 'https://example.com', { width: 80, margin: 0 })
  } catch {}
}
</script>

<template>
  <div class="relative flex flex-1 flex-col overflow-hidden bg-slate-200">
    <!-- Toolbar Desain (Atas) -->
    <div class="border-b border-slate-300 bg-white p-2 flex items-center justify-between shadow-sm z-10">
      <div class="flex items-center gap-2 bg-slate-100 rounded px-2 py-1 border border-slate-200">
        <span class="text-xs font-bold text-slate-500 mr-2">ZOOM</span>
        <button @click="store.changeZoom(-0.1)" class="p-1 hover:bg-white rounded"><ZoomOut class="w-3.5 h-3.5" /></button>
        <input type="range" min="0.5" max="2" step="0.1" v-model.number="store.zoom" class="w-24" />
        <button @click="store.changeZoom(0.1)" class="p-1 hover:bg-white rounded"><ZoomIn class="w-3.5 h-3.5" /></button>
        <span class="text-xs w-10 text-right">{{ Math.round(store.zoom * 100) }}%</span>
      </div>

      <div class="flex items-center gap-2" v-if="store.selectedElement">
        <span class="text-xs font-bold text-slate-500">ALIGN:</span>
        <button @click="alignElement('left')" class="p-1.5 bg-white border rounded hover:bg-slate-50">
          <AlignLeft class="w-3.5 h-3.5" />
        </button>
        <button @click="alignElement('center')" class="p-1.5 bg-white border rounded hover:bg-slate-50">
          <AlignCenter class="w-3.5 h-3.5" />
        </button>
        <button @click="alignElement('right')" class="p-1.5 bg-white border rounded hover:bg-slate-50">
          <AlignRight class="w-3.5 h-3.5" />
        </button>

        <div class="w-px h-5 bg-slate-300 mx-1"></div>

        <span class="text-xs font-bold text-slate-500">ROTATE:</span>
        <button @click="store.selectedElement.rotation = 0" class="px-2 py-1 bg-white border rounded text-xs hover:bg-slate-50">0°</button>
        <button @click="store.selectedElement.rotation = 90" class="px-2 py-1 bg-white border rounded text-xs hover:bg-slate-50">
          90°
        </button>
        <button @click="store.selectedElement.rotation = 180" class="px-2 py-1 bg-white border rounded text-xs hover:bg-slate-50">
          180°
        </button>
      </div>
    </div>

    <!-- Canvas Area -->
    <div class="flex-1 overflow-auto p-8 flex items-center justify-center" @click="store.selectElement(null)">
      <!-- Kertas Label -->
      <div
        class="relative bg-white border-2 border-dashed border-blue-400 shadow-xl transition-transform duration-200"
        :style="{
          width: `${store.paperWidth}px`,
          height: `${store.paperHeight}px`,
          transform: `scale(${store.zoom})`,
          transformOrigin: 'center center',
        }"
        @click.stop
      >
        <!-- Loop Elements -->
        <div
          v-for="el in store.elements"
          :key="el.id"
          @mousedown.prevent="startDrag($event, el)"
          class="absolute cursor-move group border border-transparent hover:border-blue-400"
          :class="{ 'border-blue-500 ring-1 ring-blue-500 z-20 bg-blue-50/20': store.selectedId === el.id }"
          :style="{
            left: `${el.x}px`,
            top: `${el.y}px`,
            width: `${el.width}px`,
            height: `${el.height}px`,
            transform: `rotate(${el.rotation}deg)`,
          }"
        >
          <!-- Teks -->
          <div
            v-if="el.type === 'text'"
            class="w-full h-full flex items-center pointer-events-none"
            :style="{ fontSize: `${el.props.fontSize}px`, fontWeight: el.props.fontWeight, textAlign: el.props.textAlign }"
          >
            {{ el.props.text }}
          </div>

          <!-- Barcode -->
          <div v-else-if="el.type === 'barcode'" class="w-full h-full flex items-center justify-center pointer-events-none">
            <canvas
              :ref="(canvas) => renderBarcode(canvas as HTMLCanvasElement, el.props.barcodeValue || '')"
              class="max-w-full max-h-full"
            ></canvas>
          </div>

          <!-- QR Code -->
          <div v-else-if="el.type === 'qrcode'" class="w-full h-full flex items-center justify-center pointer-events-none">
            <canvas
              :ref="(canvas) => renderQRCode(canvas as HTMLCanvasElement, el.props.qrValue || '')"
              class="max-w-full max-h-full"
            ></canvas>
          </div>

          <!-- Gambar -->
          <div
            v-else-if="el.type === 'image'"
            class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 pointer-events-none"
          >
            <ImageIcon class="w-6 h-6" />
          </div>

          <button
            @click.stop="store.removeElement(el.id)"
            class="absolute -top-3 -right-3 hidden group-hover:flex bg-red-500 text-white rounded-full p-1 shadow-md"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
