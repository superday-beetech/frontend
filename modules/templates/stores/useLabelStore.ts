import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface LabelElement {
  id: string
  type: 'text' | 'barcode' | 'qrcode' | 'image'
  label: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  props: {
    text?: string
    fontSize?: number
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
    url?: string
    barcodeValue?: string
    qrValue?: string
  }
}

export const useLabelStore = defineStore('label-designer', () => {
  const elements = ref<LabelElement[]>([
    {
      id: 'el-1',
      type: 'text',
      label: 'Company Name',
      x: 50,
      y: 40,
      width: 200,
      height: 30,
      rotation: 0,
      props: { text: 'My Store, LLC', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
    },
    {
      id: 'el-2',
      type: 'barcode',
      label: 'Barcode',
      x: 75,
      y: 80,
      width: 150,
      height: 50,
      rotation: 0,
      props: { barcodeValue: '1234567890' },
    },
    {
      id: 'el-3',
      type: 'text',
      label: 'Price',
      x: 125,
      y: 140,
      width: 50,
      height: 20,
      rotation: 0,
      props: { text: '$0.00', fontSize: 12, fontWeight: 'normal', textAlign: 'center' },
    },
  ])
  const paperPresets = [
    { label: 'Label 10x10 cm', width: 378, height: 378 },
    { label: 'Label 100x150 mm', width: 378, height: 567 },
    { label: 'Thermal 80mm', width: 302, height: 600 },
    { label: 'A4 (Portrait)', width: 794, height: 1123 },
  ]

  const selectedId = ref<string | null>(null)
  const zoom = ref(1)
  const paperWidth = ref(350) // px
  const paperHeight = ref(200) // px

  const selectedElement = computed(() => elements.value.find((el) => el.id === selectedId.value) || null)

  // ── Actions ──
  function addElement(type: string, label: string) {
    const newEl: LabelElement = {
      id: `el-${Date.now()}`,
      type: type as any,
      label,
      x: 20,
      y: 20,
      width: 120,
      height: 40,
      rotation: 0,
      props: {
        text: label,
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        barcodeValue: '1234567890',
        qrValue: 'https://example.com',
        url: '',
      },
    }
    elements.value.push(newEl)
    selectedId.value = newEl.id
  }

  function removeElement(id: string) {
    elements.value = elements.value.filter((el) => el.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }

  function selectElement(id: string | null) {
    selectedId.value = id
  }

  function changeZoom(amount: number) {
    zoom.value = Math.min(Math.max(zoom.value + amount, 0.5), 2)
  }

  function setPaperSize(width: number, height: number) {
    paperWidth.value = width
    paperHeight.value = height
  }

  return {
    elements,
    selectedId,
    selectedElement,
    zoom,
    paperWidth,
    paperHeight,
    paperPresets,
    addElement,
    removeElement,
    selectElement,
    changeZoom,
    setPaperSize,
  }
})
