<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Trash2, PanelRightOpen, CheckCircle } from 'lucide-vue-next'
import PageHeader from '@/shared/components/ui/primitives/PageHeader.vue'
import BaseCard from '@/shared/components/ui/primitives/BaseCard.vue'
import BaseButton from '@/shared/components/ui/primitives/BaseButton.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue'
import BaseAlert from '@/shared/components/ui/feedback/BaseAlert.vue'
import BaseOffcanvas from '@/shared/components/ui/overlay/BaseOffcanvas.vue'
import { useConfirm } from '@/shared/composables/useConfirm'
import { useToast } from '@/shared/composables/useToast'

const { confirmDelete } = useConfirm()
const toast = useToast()
const demoOffcanvas = ref(false)

async function testConfirmDialog() {
  const ok = await confirmDelete('Data Transaksi #TRX-001')
  if (ok) {
    toast.success('Terhapus!', 'Data berhasil dihapus.')
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Dashboard & UI Kit Showcase"
      subtitle="Ringkasan sistem dan uji coba komponen enterprise Cakra"
      :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'Dashboard' }]"
    >
      <template #actions>
        <BaseButton variant="secondary" size="sm" @click="demoOffcanvas = true">
          <PanelRightOpen class="w-4 h-4" />
          <span>Buka OffCanvas</span>
        </BaseButton>
        <BaseButton variant="danger" size="sm" @click="testConfirmDialog">
          <Trash2 class="w-4 h-4" />
          <span>Tes Konfirmasi</span>
        </BaseButton>
        <BaseButton size="sm" @click="toast.success('Berhasil!', 'Notifikasi toast aktif.')">
          <Plus class="w-4 h-4" />
          <span>Tes Toast</span>
        </BaseButton>
      </template>
    </PageHeader>

    <div class="space-y-5">
      <BaseAlert variant="info" title="Pondasi Admin Enterprise Aktif">
        Coba fitur
        <strong>Sidebar Mini</strong>
        di pojok kiri bawah sidebar,
        <strong>Mega Menu</strong>
        (ikon kotak 9 di topbar),
        <strong>Notifikasi</strong>
        ,
        <strong>Profile</strong>
        , serta
        <strong>OffCanvas Drawer</strong>
        .
      </BaseAlert>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BaseCard>
          <div class="text-xs font-medium text-slate-500">Total Penjualan Hari Ini</div>
          <div class="mt-1 text-xl font-bold text-slate-900">Rp 14.850.000</div>
          <div class="mt-2"><BaseBadge variant="success">+12.4% dari kemarin</BaseBadge></div>
        </BaseCard>
        <BaseCard>
          <div class="text-xs font-medium text-slate-500">Transaksi Posted</div>
          <div class="mt-1 text-xl font-bold text-slate-900">128 Faktur</div>
          <div class="mt-2"><BaseBadge variant="primary">Shift Pagi & Siang</BaseBadge></div>
        </BaseCard>
        <BaseCard>
          <div class="text-xs font-medium text-slate-500">Transaksi Held / Draft</div>
          <div class="mt-1 text-xl font-bold text-slate-900">3 Faktur</div>
          <div class="mt-2"><BaseBadge variant="warning">Menunggu Pembayaran</BaseBadge></div>
        </BaseCard>
        <BaseCard>
          <div class="text-xs font-medium text-slate-500">Stok Kritis</div>
          <div class="mt-1 text-xl font-bold text-rose-600">5 Item</div>
          <div class="mt-2"><BaseBadge variant="danger">Perlu Restock</BaseBadge></div>
        </BaseCard>
      </div>

      <!-- Typography & Button Matrix -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BaseCard title="Tipografi Standar" subtitle="Hirarki teks konsisten di seluruh modul">
          <div class="space-y-2.5">
            <h1>Heading 1 — Judul Halaman Utama</h1>
            <h2>Heading 2 — Judul Section / Modul</h2>
            <h3>Heading 3 — Judul Card / Panel</h3>
            <p class="text-sm text-slate-600">Body Text (14px) — Digunakan untuk paragraf konten dan data tabel.</p>
            <p class="text-xs text-slate-500">Caption / Helper Text (12px) — Digunakan untuk label form dan keterangan.</p>
          </div>
        </BaseCard>

        <BaseCard title="Varian Tombol & Status" subtitle="Komponen aksi standar">
          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <BaseButton variant="primary">Primary</BaseButton>
              <BaseButton variant="secondary">Secondary</BaseButton>
              <BaseButton variant="danger">Danger</BaseButton>
              <BaseButton variant="ghost">Ghost</BaseButton>
              <BaseButton :loading="true">Loading</BaseButton>
            </div>
            <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <BaseBadge variant="neutral">Draft</BaseBadge>
              <BaseBadge variant="primary">Diproses</BaseBadge>
              <BaseBadge variant="warning">Held</BaseBadge>
              <BaseBadge variant="success">Posted</BaseBadge>
              <BaseBadge variant="danger">Cancelled</BaseBadge>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Contoh OffCanvas Modul -->
    <BaseOffcanvas v-model="demoOffcanvas" title="Detail Panel OffCanvas">
      <p class="text-xs text-slate-600 leading-relaxed">
        Komponen
        <code>BaseOffcanvas</code>
        ini dapat digunakan ulang di halaman transaksi, master data, maupun laporan untuk menampilkan detail tanpa meninggalkan halaman
        utama.
      </p>
      <template #footer>
        <BaseButton variant="secondary" size="sm" @click="demoOffcanvas = false">Tutup</BaseButton>
        <BaseButton size="sm" @click="demoOffcanvas = false">
          <CheckCircle class="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </BaseButton>
      </template>
    </BaseOffcanvas>
  </div>
</template>
