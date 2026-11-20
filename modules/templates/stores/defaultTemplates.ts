import type { TemplateRow } from '../stores/useTemplateStore'

export interface DefaultTemplate {
  id: string
  name: string
  thumbnail?: string
  paperSize: '58mm' | '80mm' | 'A4' | 'Label'
  rows: TemplateRow[]
}

export const defaultTemplates: DefaultTemplate[] = [
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
                label: 'Company Name',
                props: { text: 'My Store, LLC\n123 Main Street\n555-555-5555', align: 'center', bold: true },
              },
              { id: 'b3', type: 'divider', label: 'Divider', props: { style: 'dashed' } },
              { id: 'b4', type: 'sale_info', label: 'Sale Info', props: { align: 'left' } },
              { id: 'b5', type: 'divider', label: 'Divider', props: { style: 'solid' } },
              { id: 'b6', type: 'items_table', label: 'Items Table', props: {} },
              { id: 'b7', type: 'totals', label: 'Totals', props: { align: 'right' } },
              { id: 'b8', type: 'divider', label: 'Divider', props: { style: 'dashed' } },
              { id: 'b9', type: 'barcode', label: 'Barcode', props: { value: '1234567890', format: 'CODE128' } },
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
              { id: 'b1', type: 'company', label: 'Company Name', props: { text: 'My Store', align: 'center', bold: true } },
              { id: 'b2', type: 'divider', label: 'Divider', props: { style: 'solid' } },
              { id: 'b3', type: 'items_table', label: 'Items Table', props: {} },
              { id: 'b4', type: 'totals', label: 'Totals', props: { align: 'right' } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'invoice-a4',
    name: 'Invoice (A4)',
    paperSize: 'A4',
    rows: [
      {
        id: 'r1',
        columns: [
          { id: 'c1', blocks: [{ id: 'b1', type: 'logo', label: 'Logo', props: { url: '', align: 'left' } }] },
          {
            id: 'c2',
            blocks: [
              { id: 'b2', type: 'company', label: 'Company', props: { text: 'INVOICE\nPT. Contoh\nJakarta', align: 'right', bold: true } },
            ],
          },
        ],
      },
      {
        id: 'r2',
        columns: [{ id: 'c3', blocks: [{ id: 'b3', type: 'divider', label: 'Divider', props: { style: 'solid' } }] }],
      },
      {
        id: 'r3',
        columns: [
          { id: 'c4', blocks: [{ id: 'b4', type: 'customer', label: 'Bill To', props: { align: 'left' } }] },
          { id: 'c5', blocks: [{ id: 'b5', type: 'sale_info', label: 'Invoice Info', props: { align: 'right' } }] },
        ],
      },
      {
        id: 'r4',
        columns: [{ id: 'c6', blocks: [{ id: 'b6', type: 'items_table', label: 'Items Table', props: {} }] }],
      },
      {
        id: 'r5',
        columns: [{ id: 'c7', blocks: [{ id: 'b7', type: 'totals', label: 'Totals', props: { align: 'right' } }] }],
      },
      {
        id: 'r6',
        columns: [
          {
            id: 'c8',
            blocks: [{ id: 'b8', type: 'qr_code', label: 'QR Code', props: { value: 'https://example.com/invoice/123', size: 100 } }],
          },
        ],
      },
    ],
  },
]
