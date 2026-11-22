import { ref } from 'vue'
import productService from '../../services/productService'
import { BACKEND_URL, IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE } from '../constants/product'

export interface ImageRow {
  id?: number
  url: string
  isPrimary: boolean
  uploading?: boolean
  tempUrl?: string
}

interface UseProductImagesOptions {
  onError?: (message: string) => void
  onSuccess?: (message: string) => void
  onWarning?: (message: string) => void
}

/**
 * Mengelola koleksi foto produk: upload, hapus, set primary, reset.
 * Tidak bergantung pada UI — semua feedback lewat callback.
 */
export function useProductImages(options: UseProductImagesOptions = {}) {
  const images = ref<ImageRow[]>([])
  const uploading = ref(false)

  async function add(file: File): Promise<void> {
    if (file.size > IMAGE_MAX_SIZE) {
      options.onWarning?.('Ukuran gambar maksimal 2MB.')
      return
    }

    if (!IMAGE_ALLOWED_TYPES.includes(file.type as (typeof IMAGE_ALLOWED_TYPES)[number])) {
      options.onWarning?.('Format gambar harus JPG, PNG, atau WEBP.')
      return
    }

    const tempUrl = URL.createObjectURL(file)
    const index = images.value.length

    images.value.push({
      url: tempUrl,
      isPrimary: index === 0,
      uploading: true,
      tempUrl,
    })

    uploading.value = true

    try {
      const res = await productService.uploadImage(file)

      if (res.data?.error || !res.data?.data) {
        throw new Error(typeof res.data?.message === 'string' ? res.data.message : 'Gagal mengunggah gambar.')
      }

      const row = images.value[index]
      if (!row) return

      row.url = BACKEND_URL + res.data.data.url
      row.uploading = false

      if (row.tempUrl) {
        URL.revokeObjectURL(row.tempUrl)
        row.tempUrl = undefined
      }

      options.onSuccess?.('Gambar berhasil diunggah.')
    } catch (error) {
      const row = images.value[index]
      if (row?.tempUrl) URL.revokeObjectURL(row.tempUrl)
      images.value.splice(index, 1)
      options.onError?.(error instanceof Error ? error.message : 'Gagal mengunggah gambar.')
    } finally {
      uploading.value = false
    }
  }

  async function remove(index: number): Promise<void> {
    const row = images.value[index]
    if (!row) return

    if (row.tempUrl) URL.revokeObjectURL(row.tempUrl)

    if (row.url.includes('/uploads/products/temp/')) {
      const filename = row.url.split('/').pop()
      if (filename) {
        try {
          const res = await productService.deleteImage(filename)
          if (res.data?.error) {
            throw new Error(res.data.message || 'Gagal menghapus file.')
          }
          options.onSuccess?.('Gambar dihapus dari server.')
        } catch {
          // diamkan — file mungkin sudah tidak ada
        }
      }
    }

    images.value.splice(index, 1)

    if (images.value.length && !images.value.some((i) => i.isPrimary)) {
      images.value[0].isPrimary = true
    }
  }

  function setPrimary(index: number): void {
    images.value.forEach((img, i) => {
      img.isPrimary = i === index
    })
  }

  function reset(rows: ImageRow[] = []): void {
    images.value = rows
  }

  return { images, uploading, add, remove, setPrimary, reset }
}
