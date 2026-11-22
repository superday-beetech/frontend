import type { OptionItem } from '@/shared/composables/useOption'

/** Prefix URL backend untuk gambar produk. */
export const BACKEND_URL = import.meta.env.VITE_DEV_API_TARGET as string

/** Pola SKU: OBT-TAB-001 */
export const SKU_PATTERN = /^[A-Z]{3}-[A-Z]{3}-[0-9]{3,}$/

/** Batas ukuran file gambar (2MB). */
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024

/** MIME type gambar yang diizinkan. */
export const IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Opsi tipe informasi tambahan produk. */
export const INFO_TYPE_OPTIONS: OptionItem[] = [
  { value: 'indication', label: 'Indikasi' },
  { value: 'dosage_rule', label: 'Aturan Pakai / Dosis' },
  { value: 'side_effect', label: 'Efek Samping' },
  { value: 'contraindication', label: 'Kontraindikasi' },
  { value: 'warning', label: 'Peringatan Khusus' },
  { value: 'storage', label: 'Cara Penyimpanan' },
]

/** Opsi status produk. */
export const STATUS_OPTIONS: OptionItem[] = [
  { value: 1, label: 'Aktif' },
  { value: 0, label: 'Tidak Aktif' },
]
