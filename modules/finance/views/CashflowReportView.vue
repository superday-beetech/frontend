<script setup lang="ts">
import PageHeader from '@/shared/components/ui/primitives/PageHeader.vue'
import BaseCard from '@/shared/components/ui/primitives/BaseCard.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue'
import BaseTable, { type TableColumn } from '@/shared/components/ui/data/BaseTable.vue'

// Contoh data simulasi tabel untuk laporan arus kas
const columns: TableColumn[] = [
  { key: 'date', label: 'Tanggal', width: '120px' },
  { key: 'reference', label: 'No. Referensi', width: '150px' },
  { key: 'description', label: 'Keterangan Transaksi' },
  { key: 'type', label: 'Jenis', align: 'center', width: '100px' },
  { key: 'amount', label: 'Nominal (IDR)', align: 'right', width: '160px' },
]

const rows = [
  {
    id: 1,
    date: '17 Nov 2026',
    reference: 'TRX-IN-001',
    description: 'Penerimaan Penjualan Shift Pagi (POS)',
    type: 'Masuk',
    amount: 'Rp 4.850.000',
  },
  {
    id: 2,
    date: '17 Nov 2026',
    reference: 'TRX-OUT-002',
    description: 'Pembelian Stok Obat Tambahan (Distributor)',
    type: 'Keluar',
    amount: 'Rp 1.200.000',
  },
  {
    id: 3,
    date: '16 Nov 2026',
    reference: 'TRX-IN-003',
    description: 'Penerimaan Pelunasan Piutang Member',
    type: 'Masuk',
    amount: 'Rp 750.000',
  },
]
</script>

<template>
  <div>
    <PageHeader
      title="Laporan Arus Kas Masuk & Keluar"
      subtitle="Contoh halaman aktif Level 3 dari menu Keuangan & Kasir"
      :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'Keuangan' }, { label: 'Arus Kas Harian' }, { label: 'Laporan Arus Kas' }]"
    />

    <div class="space-y-5">
      <!-- Ringkasan Info -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BaseCard>
          <div class="text-xs font-medium text-slate-500">Total Kas Masuk</div>
          <div class="mt-1 text-lg font-bold text-emerald-600">Rp 5.600.000</div>
        </BaseCard>
        <BaseCard>
          <div class="text-xs font-medium text-slate-500">Total Kas Keluar</div>
          <div class="mt-1 text-lg font-bold text-rose-600">Rp 1.200.000</div>
        </BaseCard>
        <BaseCard>
          <div class="text-xs font-medium text-slate-500">Saldo Bersih</div>
          <div class="mt-1 text-lg font-bold text-slate-900">Rp 4.400.000</div>
        </BaseCard>
      </div>

      <!-- Tabel Data -->
      <BaseCard title="Riwayat Mutasi Kas Terbaru" subtitle="Data real-time dari simulasi mock frontend">
        <BaseTable :columns="columns" :rows="rows">
          <template #cell-type="{ value }">
            <BaseBadge :variant="value === 'Masuk' ? 'success' : 'danger'">
              {{ value }}
            </BaseBadge>
          </template>
        </BaseTable>
      </BaseCard>
    </div>
  </div>
</template>
