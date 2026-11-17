<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/shared/components/ui/primitives/PageHeader.vue'
import BaseCard from '@/shared/components/ui/primitives/BaseCard.vue'
import BaseBadge from '@/shared/components/ui/feedback/BaseBadge.vue'
import BaseTableFull, { type TableColumnFull } from '@/shared/components/ui/data/BaseTableFull.vue'
import BaseThemeToggle from '@/shared/components/ui/primitives/BaseThemeToggle.vue'
import BaseAvatarModal from '@/shared/components/ui/overlay/BaseAvatarModal.vue'

// Import seluruh komponen modular reusable mandiri
import BaseInputClearable from '@/shared/components/ui/form/BaseInputClearable.vue'
import BasePasswordInput from '@/shared/components/ui/form/BasePasswordInput.vue'
import BaseCurrencyInput from '@/shared/components/ui/form/BaseCurrencyInput.vue'
import BaseStepper from '@/shared/components/ui/data/BaseStepper.vue'
import BaseToggle from '@/shared/components/ui/form/BaseToggle.vue'
import BaseMultiSelect from '@/shared/components/ui/form/BaseMultiSelect.vue'
import BaseFileUploader from '@/shared/components/ui/form/BaseFileUploader.vue'
import { Check, Camera } from 'lucide-vue-next'

import MobileDateInput from '@/shared/components/ui/mobile/MobileDateInput.vue'
import MobileDateModalInput from '@/shared/components/ui/mobile/MobileDateModalInput.vue'
import MobileSingleDateInput from '@/shared/components/ui/mobile/MobileSingleDateInput.vue'
import { generateCode, generateUUID } from '@/core/utils/generator'
import BaseRichEditor from '@/shared/components/ui/form/BaseRichEditor.vue'
import MobileSelectInput, { type SelectOption } from '@/shared/components/ui/mobile/MobileSelectInput.vue'
import MobileRadioGroup, { type RadioOption } from '@/shared/components/ui/mobile/MobileRadioGroup.vue'
import MobileCheckbox from '@/shared/components/ui/mobile/MobileCheckbox.vue'

// ==========================================
// 1. STATE FORM INTERAKTIF LENGKAP
// ==========================================
const clearableText = ref('Sugih Permadi Hidayat')
const passwordVal = ref('CakraEnterprise2026!')
const currencyVal = ref(1750500)
const stepperVal = ref(2.5)
const toggleVal = ref(true)

// Validasi Real-time
const emailVal = ref('sugih@cakra.test')
const isEmailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal.value))

// Multi-Select Combobox State
const selectedPerms = ref<string[]>(['pos.create', 'inventory.read'])
const permOptions = [
  { id: 'pos.create', label: 'Kasir & Buat Transaksi POS' },
  { id: 'pos.void', label: 'Batalkan Transaksi / Void' },
  { id: 'inventory.read', label: 'Lihat Stok & Laporan Gudang' },
  { id: 'inventory.manage', label: 'Manajemen Barang & Opname' },
  { id: 'finance.reports', label: 'Akses Laporan Keuangan' },
  { id: 'settings.store', label: 'Pengaturan Profil Toko' },
]

// File Uploader State
const uploadedFiles = ref<File[]>([])

// Avatar Modal State
const isAvatarModalOpen = ref(false)
const userAvatar = ref('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250')

function handleSaveAvatar(newAvatarUrl: string) {
  userAvatar.value = newAvatarUrl
}

// Custom Rich Select State
const selectedCategory = ref('pharmacy')
const categories = [
  { value: 'pharmacy', label: 'Apotek & Farmasi Utama', desc: 'Manajemen obat resep, batch, & ED', img: '💊' },
  { value: 'pos', label: 'Kasir & POS Retail', desc: 'Sistem pencatatan kasir cepat & barcode', img: '🛒' },
  { value: 'inventory', label: 'Gudang & Stok Opname', desc: 'Kontrol mutasi stok multi-gudang', img: '📦' },
]

// ==========================================
// 2. STATE TABEL ENTERPRISE
// ==========================================
const tableColumns: TableColumnFull[] = [
  { key: 'code', label: 'Kode SKU', width: '130px', sortable: true },
  { key: 'product', label: 'Nama Produk & Deskripsi' },
  { key: 'category', label: 'Kategori', width: '140px', align: 'center' },
  { key: 'price', label: 'Harga Jual (IDR)', align: 'right', width: '150px', sortable: true },
  { key: 'status', label: 'Status Stok', align: 'center', width: '120px' },
]

const tableRows = [
  {
    id: 1,
    code: 'PRD-001',
    name: 'Paracetamol 500mg Tablet',
    desc: 'Box isi 10 strip @ 10 tablet',
    category: 'Farmasi',
    price: 'Rp 8.500',
    status: 'Aman',
  },
  {
    id: 2,
    code: 'PRD-002',
    name: 'Amoxicillin 500mg',
    desc: 'Antibiotik spektrum luas',
    category: 'Farmasi',
    price: 'Rp 14.000',
    status: 'Kritis',
  },
  {
    id: 3,
    code: 'PRD-003',
    name: 'Termometer Digital Infrared',
    desc: 'Alat ukur suhu tubuh medis non-kontak',
    category: 'Alat Medis',
    price: 'Rp 125.000',
    status: 'Aman',
  },
  {
    id: 4,
    code: 'PRD-004',
    name: 'Masker Medis 3 Ply (Box)',
    desc: 'Isi 50 pcs standar Kemenkes',
    category: 'Habis Pakai',
    price: 'Rp 35.000',
    status: 'Aman',
  },
]

const filterOptions = [
  { label: 'Farmasi', value: 'Farmasi' },
  { label: 'Alat Medis', value: 'Alat Medis' },
  { label: 'Habis Pakai', value: 'Habis Pakai' },
]

// Variabel ini otomatis bernilai format database 'YYYY-MM-DD' (misal: '2026-11-17')
const transactionDate = ref(new Date().toISOString().split('T')[0]!)
// State tanggal, otomatis memegang format database 'YYYY-MM-DD' (misal: '2026-11-17')
// Bisa diisi nilai awal dari database, atau dibiarkan default hari ini.
const filterStartDate = ref(new Date().toISOString().split('T')[0]!)
const filterEndDate = ref(new Date().toISOString().split('T')[0]!)
const handleApplyFilter = () => {
  console.log('Kirim parameter ke API/Database:', {
    start_date: filterStartDate.value,
    end_date: filterEndDate.value,
  })
  // Di sini Anda bisa memanggil fungsi fetch data atau axios ke backend CodeIgniter 4
}
// Contoh membuat nomor nota transaksi baru saat halaman dimuat
const newTransactionNo = generateCode('CAKRA')
const uniqueUUID = generateUUID()
console.log('Nota POS:', newTransactionNo)
console.log('UUID:', uniqueUUID)

// Menyimpan format HTML (bisa langsung disimpan ke database MySQL / CodeIgniter 4)
const productDescription = ref('<p>Paracetamol 500mg - Indikasi penurun panas dan pereda nyeri.</p>')

const handleSave = () => {
  console.log('HTML yang dikirim ke Database:', productDescription.value)
}

const selectedPaymentMethod = ref<string | number>('qris')
const selectedSupplier = ref<string | number | null>(null)

const paymentOptions: SelectOption[] = [
  {
    value: 'cash',
    label: 'Tunai (Cash)',
    description: 'Pembayaran uang tunai langsung di meja kasir',
    badge: 'Instan',
  },
  {
    value: 'qris',
    label: 'QRIS Dinamis',
    description: 'Scan otomatis semua e-wallet & mobile banking',
    badge: 'Populer',
  },
  {
    value: 'debit',
    label: 'Kartu Debit / EDC',
    description: 'BCA, Mandiri, BRI, BNI',
  },
  {
    value: 'tempo',
    label: 'Piutang / Tempo Korporat',
    description: 'Khusus member instansi & klinik rekanan',
    badge: 'B2B',
  },
]

const supplierOptions: SelectOption[] = [
  { value: 1, label: 'PT Kimia Farma Trading', description: 'Distributor Obat Ethical & OTC', badge: 'PBF' },
  { value: 2, label: 'PT Enseval Putera Megatrading', description: 'Suplai Alkes & Vitamin', badge: 'PBF' },
  { value: 3, label: 'PT Bina San Prima', description: 'Distributor Farmasi Reguler', badge: 'PBF' },
]
const deliveryType = ref('instant')
const agreeToPrint = ref(true)

const deliveryOptions: RadioOption[] = [
  {
    value: 'instant',
    label: 'Ambil Langsung di Apotek',
    description: 'Pasien/pelanggan ambil di konter utama tanpa antri',
    badge: 'Gratis',
  },
  { value: 'delivery', label: 'Kurir Internal Apotek', description: 'Kirim langsung ke alamat rumah radius 5km', badge: 'Wilayah Lokal' },
]
</script>

<template>
  <div class="space-y-6 pb-12 transition-colors duration-300">
    <!-- HEADER DENGAN TOMBOL SAKELAR DARK/LIGHT MODE -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <PageHeader
        :breadcrumbs="[{ label: 'Home', to: '/' }, { label: 'UI Kit & Dokumentasi' }, { label: 'Master Showcase Komponen' }]"
        subtitle="Koleksi lengkap seluruh komponen reusable mandiri dengan dukungan Dark & Light Mode enterprise"
        title="Master Showcase Komponen"
      />

      <div class="flex items-center self-start sm:self-auto">
        <BaseThemeToggle />
      </div>
    </div>

    <!-- SEKSI 0: PENGATURAN AVATAR PROFIL -->
    <BaseCard
      subtitle="Uji coba modal ubah avatar dengan fitur drag, crop preview, dan indikator upload"
      title="0. Pengaturan Foto Profil & Avatar"
    >
      <div class="flex items-center gap-6">
        <div class="relative h-20 w-20 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <img :src="userAvatar" alt="User Avatar" class="h-full w-full object-cover" />
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">Avatar Pengguna Aktif</h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">Sesuaikan bentuk lingkaran/kotak dan posisi fokus foto profil Anda.</p>
          <button
            @click="isAvatarModalOpen = true"
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Camera class="w-4 h-4 text-primary-600 dark:text-primary-400" />
            Ubah Foto Avatar
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- SEKSI 1: KOLEKSI MODULAR REUSABLES -->
    <BaseCard
      subtitle="Komponen input mandiri yang terpisah dan mendukung mode gelap secara otomatis"
      title="1. Koleksi Reusable UI Controls"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- A. Clearable Input -->
        <BaseInputClearable label="Input dengan Tombol Hapus (Clearable)" placeholder="Ketik sesuatu..." v-model="clearableText" />

        <!-- B. Password Input -->
        <BasePasswordInput label="Password (Show/Hide Toggle)" placeholder="Masukkan password..." v-model="passwordVal" />

        <!-- C. Validasi Real-Time -->
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">Validasi Real-time (Merah ke Hijau)</label>
          <div class="relative flex items-center">
            <input
              v-model="emailVal"
              type="email"
              class="w-full rounded-xl border py-2.5 pl-3.5 pr-10 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-3 transition-colors"
              :class="
                isEmailOk
                  ? 'border-emerald-500 dark:border-emerald-500 focus:ring-emerald-500/20'
                  : 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/20'
              "
            />
            <div class="absolute right-3">
              <span
                v-if="isEmailOk"
                class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow-2xs"
              >
                <Check class="w-3.5 h-3.5" />
              </span>
              <span
                v-else
                class="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs shadow-2xs"
              >
                !
              </span>
            </div>
          </div>
          <p
            class="text-[11px]"
            :class="isEmailOk ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'"
          >
            {{ isEmailOk ? 'Format email valid.' : 'Format email belum benar.' }}
          </p>
        </div>

        <!-- D. Currency IDR Input (Right-Aligned) -->
        <BaseCurrencyInput label="Format Angka Rupiah (Rata Kanan)" v-model="currencyVal" />

        <!-- E. Base Stepper Kuantitas -->
        <div class="space-y-1.5">
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">Stepper Kuantitas (± Step)</label>
          <BaseStepper :showQuickSteps="true" :step="0.5" v-model="stepperVal" />
        </div>

        <!-- F. Toggle On/Off -->
        <BaseToggle
          activeText="Online (Aktif)"
          inactiveText="Offline (Maintenance)"
          label="Status Operasional Sistem"
          v-model="toggleVal"
        />

        <!-- G. Searchable Multi-Select Combobox -->
        <div class="space-y-1.5 md:col-span-2">
          <BaseMultiSelect
            :options="permOptions"
            label="Searchable Multi-Select Combobox (Hak Akses)"
            placeholder="Pilih izin modul..."
            v-model="selectedPerms"
          />
        </div>

        <!-- H. Custom Rich Select -->
        <div class="space-y-1.5 md:col-span-3">
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Custom Rich Select (Modul Enterprise dengan Deskripsi)
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="cat in categories"
              :key="cat.value"
              @click="selectedCategory = cat.value"
              class="cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3"
              :class="
                selectedCategory === cat.value
                  ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 dark:border-primary-500 ring-2 ring-primary-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
              "
            >
              <span class="text-2xl">{{ cat.img }}</span>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ cat.label }}</div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{{ cat.desc }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Single Select Tanpa Tombol Clear -->
        <MobileSelectInput
          v-model="selectedPaymentMethod"
          :options="paymentOptions"
          label="Metode Pembayaran"
          placeholder="Pilih metode bayar"
        />

        <!-- Single Select Dengan Tombol Clear & Pencarian -->
        <MobileSelectInput
          v-model="selectedSupplier"
          :options="supplierOptions"
          label="Distributor / PBF Apotek"
          placeholder="Cari & pilih distributor..."
          clearable
        />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white">Opsi Pengiriman & Cetak Nota</h3>

        <!-- Radio Group -->
        <MobileRadioGroup v-model="deliveryType" :options="deliveryOptions" label="Metode Pengambilan Pesanan" />

        <!-- Checkbox Tunggal -->
        <MobileCheckbox
          v-model="agreeToPrint"
          label="Cetak Resi & Nota Otomatis"
          description="Printer kasir thermal akan mencetak nota setelah transaksi berhasil disimpan."
        />
      </div>
    </BaseCard>

    <!-- SEKSI 2: UPLOAD FILE & DRAG AND DROP -->
    <BaseCard
      subtitle="Komponen pengunggah dokumen pendukung dengan indikator progress bar dan status upload"
      title="2. File Uploader & Drag and Drop Reusable"
    >
      <BaseFileUploader :maxSizeMB="10" label="Lampiran Berkas & Dokumen Transaksi" v-model="uploadedFiles" />
    </BaseCard>

    <!-- SEKSI 3: TABEL DATA ENTERPRISE -->
    <BaseCard
      subtitle="Tabel enterprise dengan fitur global search, filter kategori, sorting interaktif, dan pagination"
      title="3. Tabel Data Produk & Inventori Lengkap"
    >
      <BaseTableFull
        :columns="tableColumns"
        :rows="tableRows"
        :searchable="true"
        :filterable="true"
        :filterOptions="filterOptions"
        filterKey="category"
      >
        <template #cell-product="{ row }">
          <div>
            <div class="font-semibold text-slate-900 dark:text-slate-100">{{ row.name }}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ row.desc }}</div>
          </div>
        </template>
        <template #cell-status="{ value }">
          <BaseBadge :variant="value === 'Aman' ? 'success' : 'danger'">
            {{ value }}
          </BaseBadge>
        </template>
      </BaseTableFull>
    </BaseCard>
    <!-- MODAL AVATAR -->
    <BaseAvatarModal v-model="isAvatarModalOpen" :currentAvatar="userAvatar" @save="handleSaveAvatar" />
  </div>
  <div
    class="max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5"
  >
    <!-- Panggil komponen date input mobile-first -->
    <MobileDateInput v-model="transactionDate" label="Tanggal Transaksi" />

    <div>
      <h3 class="text-sm font-bold text-slate-900 dark:text-white">Filter Laporan Penjualan POS</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">Pilih rentang tanggal transaksi kasir apotek.</p>
    </div>

    <!-- 1. Penerapan Tanggal Mulai -->
    <MobileDateModalInput v-model="filterStartDate" label="Dari Tanggal" placeholder="Pilih tanggal mulai" />

    <!-- 2. Penerapan Tanggal Selesai -->
    <MobileDateModalInput v-model="filterEndDate" label="Sampai Tanggal" placeholder="Pilih tanggal akhir" />

    <!-- Tombol Aksi Submit -->
    <button
      type="button"
      @click="handleApplyFilter"
      class="w-full rounded-xl bg-primary-600 py-3 text-xs font-semibold text-white shadow-md shadow-primary-600/25 hover:bg-primary-700 active:scale-98 transition-all cursor-pointer"
    >
      Terapkan Filter Data
    </button>
    <h3 class="text-sm font-bold text-slate-900 dark:text-white">Form Transaksi Kasir</h3>

    <!-- Input Tanggal Tunggal -->
    <MobileSingleDateInput v-model="transactionDate" label="Tanggal Nota / Transaksi" />

    <div class="text-[11px] text-slate-500">
      Nilai database:
      <code class="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{{ transactionDate }}</code>
    </div>
  </div>
  <div
    class="max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5"
  >
    <h3 class="text-sm font-bold text-slate-900 dark:text-white">Form Manajemen Produk Apotek</h3>

    <!-- Panggil komponen Rich Text Editor -->
    <BaseRichEditor v-model="productDescription" label="Keterangan / Aturan Pakai Obat" placeholder="Tulis deskripsi lengkap obat..." />

    <button
      type="button"
      @click="handleSave"
      class="rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary-600/20 hover:bg-primary-700 transition-all cursor-pointer"
    >
      Simpan Data
    </button>
  </div>
</template>
