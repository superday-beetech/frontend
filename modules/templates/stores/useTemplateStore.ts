import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TemplateBlock {
  id: string
  type: string
  label: string
  props: Record<string, any>
}

export interface TemplateColumn {
  id: string
  blocks: TemplateBlock[]
}

export interface TemplateRow {
  id: string
  columns: TemplateColumn[]
}

export interface DefaultTemplate {
  id: string
  name: string
  paperSize: '58mm' | '80mm' | 'A4' | 'Label'
  rows: TemplateRow[]
}

export const useTemplateStore = defineStore('receipt-designer', () => {
  // ── STATE GLOBAL ──
  const paperSettings = ref({ size: '80mm', width: 80, padding: 10 })
  const zoomLevel = ref(1)
  const isDirty = ref(false)
  const selectedBlock = ref<TemplateBlock | null>(null)
  const isPropertiesPanelOpen = ref(true)

  // ── STATE LAYOUT ──
  const rows = ref<TemplateRow[]>([{ id: 'row-1', columns: [{ id: 'col-1', blocks: [] }] }])

  // ── DATA TEMPLATE DEFAULT ──
  const defaultTemplates: DefaultTemplate[] = [
    {
      id: 'standard-80mm',
      name: 'Standard Receipt (80mm)',
      paperSize: '80mm',
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              blocks: [
                { id: 'b1', type: 'logo', label: 'Logo', props: { url: '', align: 'center' } },
                {
                  id: 'b2',
                  type: 'company',
                  label: 'Company Info',
                  props: { text: 'My Store, LLC\n123 Main Street', align: 'center', bold: true },
                },
                { id: 'b3', type: 'divider', label: 'Divider', props: { style: 'dashed' } },
                { id: 'b4', type: 'sale_info', label: 'Sale Info', props: { align: 'left' } },
                { id: 'b5', type: 'items_table', label: 'Items Table', props: {} },
                { id: 'b6', type: 'totals', label: 'Totals', props: { align: 'right' } },
                { id: 'b7', type: 'barcode', label: 'Barcode', props: { value: '1234567890' } },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'minimal-58mm',
      name: 'Minimal Receipt (58mm)',
      paperSize: '58mm',
      rows: [
        {
          id: 'r1',
          columns: [
            {
              id: 'c1',
              blocks: [
                { id: 'b1', type: 'company', label: 'Company Info', props: { text: 'My Store', align: 'center', bold: true } },
                { id: 'b2', type: 'divider', label: 'Divider', props: { style: 'solid' } },
                { id: 'b3', type: 'items_table', label: 'Items Table', props: {} },
                { id: 'b4', type: 'totals', label: 'Totals', props: { align: 'right' } },
              ],
            },
          ],
        },
      ],
    },
  ]

  // ── AVAILABLE BLOCKS ──
  const availableBlocks = [
    { type: 'company', label: 'Company Info', category: 'Header & Company' },
    { type: 'logo', label: 'Logo / Image', category: 'Header & Company' },
    { type: 'divider', label: 'Divider Line', category: 'Header & Company' },
    { type: 'sale_info', label: 'Sale Info', category: 'Sale & Customer' },
    { type: 'customer', label: 'Customer Info', category: 'Sale & Customer' },
    { type: 'items_table', label: 'Items Table', category: 'Items & Totals' },
    { type: 'totals', label: 'Totals', category: 'Items & Totals' },
    { type: 'barcode', label: 'Barcode', category: 'Footer & Media' },
    { type: 'qr_code', label: 'QR Code', category: 'Footer & Media' },
    { type: 'spacer', label: 'Spacer', category: 'Footer & Media' },
    { type: 'text', label: 'Custom Text', category: 'Footer & Media' },
  ]

  const paperWidthPx = computed(() => paperSettings.value.width * 3.7795275591)

  // ── ACTIONS: GLOBAL ──
  function setPaperSize(size: string) {
    paperSettings.value.size = size
    if (size === '58mm') paperSettings.value.width = 58
    if (size === '80mm') paperSettings.value.width = 80
    if (size === 'A4') paperSettings.value.width = 210
    if (size === 'Label') paperSettings.value.width = 100
    isDirty.value = true
  }

  function setZoom(level: number) {
    zoomLevel.value = Math.min(Math.max(level, 0.5), 2)
  }

  function togglePropertiesPanel() {
    isPropertiesPanelOpen.value = !isPropertiesPanelOpen.value
  }

  // ── ACTIONS: BLOCK ──
  function selectBlock(block: TemplateBlock | null) {
    selectedBlock.value = block
    if (block) isPropertiesPanelOpen.value = true
  }

  function addBlock(rowId: string, colId: string, type: string, label: string) {
    const row = rows.value.find((r) => r.id === rowId)
    const col = row?.columns.find((c) => c.id === colId)
    if (col) {
      const defaults: Record<string, any> = {
        align: 'left',
        bold: false,
        fontSize: 13,
        fontFamily: 'monospace',
      }
      if (type === 'divider') defaults.style = 'solid'
      if (type === 'spacer') defaults.height = 20
      if (type === 'logo') {
        defaults.url = ''
        defaults.align = 'center'
      }
      if (type === 'barcode') defaults.value = '1234567890'
      if (type === 'qr_code') defaults.value = 'https://example.com'

      col.blocks.push({ id: `b-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, label, props: defaults })
      isDirty.value = true
    }
  }

  function removeBlock(blockId: string) {
    for (const row of rows.value) {
      for (const col of row.columns) {
        const idx = col.blocks.findIndex((b) => b.id === blockId)
        if (idx !== -1) {
          col.blocks.splice(idx, 1)
          if (selectedBlock.value?.id === blockId) selectedBlock.value = null
          isDirty.value = true
          return
        }
      }
    }
  }

  function moveBlock(blockId: string, sourceRowId: string, sourceColId: string, targetRowId: string, targetColId: string) {
    if (sourceRowId === targetRowId && sourceColId === targetColId) return
    const sRow = rows.value.find((r) => r.id === sourceRowId)
    const sCol = sRow?.columns.find((c) => c.id === sourceColId)
    if (!sCol) return
    const idx = sCol.blocks.findIndex((b) => b.id === blockId)
    if (idx === -1) return
    const [moved] = sCol.blocks.splice(idx, 1)

    const tRow = rows.value.find((r) => r.id === targetRowId)
    const tCol = tRow?.columns.find((c) => c.id === targetColId)
    if (!tCol) {
      sCol.blocks.splice(idx, 0, moved)
      return
    }
    tCol.blocks.push(moved)
    isDirty.value = true
  }

  // ── ACTIONS: ROW & COLUMN ──
  function setRowColumns(rowId: string, columnCount: number) {
    const row = rows.value.find((r) => r.id === rowId)
    if (!row || row.columns.length === columnCount) return

    if (columnCount > row.columns.length) {
      for (let i = row.columns.length; i < columnCount; i++) {
        row.columns.push({ id: `col-${Date.now()}-${i}`, blocks: [] })
      }
    } else {
      const removed = row.columns.splice(columnCount)
      const firstCol = row.columns[0]
      removed.forEach((col) => {
        if (col.blocks.length > 0) firstCol.blocks.push(...col.blocks)
      })
    }
    isDirty.value = true
  }

  function addRow() {
    rows.value.push({ id: `row-${Date.now()}`, columns: [{ id: `col-${Date.now()}`, blocks: [] }] })
    isDirty.value = true
  }

  function removeRow(rowId: string) {
    if (rows.value.length <= 1) return
    rows.value = rows.value.filter((r) => r.id !== rowId)
    isDirty.value = true
  }

  // ── ACTIONS: TEMPLATE (SAVE/LOAD/RESET) ──
  function saveTemplate() {
    localStorage.setItem('receipt_template', JSON.stringify({ paperSettings: paperSettings.value, rows: rows.value }))
    isDirty.value = false
    return true
  }

  function loadSavedTemplate() {
    const saved = localStorage.getItem('receipt_template')
    if (!saved) return false
    try {
      const parsed = JSON.parse(saved)
      rows.value = parsed.rows
      if (parsed.paperSettings) paperSettings.value = parsed.paperSettings
      isDirty.value = false
      return true
    } catch {
      return false
    }
  }

  function loadDefaultTemplate(id: string) {
    const tpl = defaultTemplates.find((t) => t.id === id)
    if (!tpl) return false
    rows.value = JSON.parse(JSON.stringify(tpl.rows))
    setPaperSize(tpl.paperSize)
    selectedBlock.value = null
    isDirty.value = false
    return true
  }

  function resetTemplate() {
    rows.value = [{ id: `row-${Date.now()}`, columns: [{ id: `col-${Date.now()}`, blocks: [] }] }]
    selectedBlock.value = null
    isDirty.value = true
  }

  return {
    paperSettings,
    zoomLevel,
    isDirty,
    selectedBlock,
    isPropertiesPanelOpen,
    rows,
    defaultTemplates,
    availableBlocks,
    paperWidthPx,
    setPaperSize,
    setZoom,
    togglePropertiesPanel,
    selectBlock,
    addBlock,
    removeBlock,
    moveBlock,
    setRowColumns,
    addRow,
    removeRow,
    saveTemplate,
    loadSavedTemplate,
    loadDefaultTemplate,
    resetTemplate,
  }
})
