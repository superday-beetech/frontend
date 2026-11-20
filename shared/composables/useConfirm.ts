import { ref } from 'vue'

export interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

// State tunggal (singleton): dialognya dirender sekali di app/App.vue lewat BaseConfirmDialog.
const isOpen = ref(false)
const options = ref<Required<ConfirmOptions>>({
  title: '',
  message: '',
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  variant: 'danger',
})
let resolver: ((value: boolean) => void) | null = null

/** Satu-satunya mekanisme konfirmasi di aplikasi. Teks dirender sebagai teks (bukan HTML) → aman dari XSS. */
export function useConfirm() {
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    // Jika masih ada dialog terbuka, anggap dibatalkan agar promise-nya tidak menggantung.
    resolver?.(false)
    options.value = {
      confirmText: 'Ya, Lanjutkan',
      cancelText: 'Batal',
      variant: 'danger',
      ...opts,
    }
    isOpen.value = true
    return new Promise((resolve) => {
      resolver = resolve
    })
  }

  /** Pintasan umum: konfirmasi hapus. */
  function confirmDelete(itemName = 'data ini'): Promise<boolean> {
    return confirm({
      title: 'Konfirmasi Hapus',
      message: `Apakah Anda yakin ingin menghapus ${itemName}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Hapus',
      variant: 'danger',
    })
  }

  function resolveConfirm(result: boolean) {
    isOpen.value = false
    resolver?.(result)
    resolver = null
  }

  return { isOpen, options, confirm, confirmDelete, resolveConfirm }
}
