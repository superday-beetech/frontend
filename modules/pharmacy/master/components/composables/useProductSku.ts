import { ref, watch } from 'vue'
import productService from '../../services/productService'

interface UseProductSkuOptions {
  initialSku: () => string
  /** Callback untuk error (misal toast). */
  onError?: (message: string) => void
}

/**
 * Mengelola SKU: generate otomatis dari kategori, deteksi edit manual,
 * dan race-condition guard (request terakhir menang).
 */
export function useProductSku(options: UseProductSkuOptions) {
  const sku = ref(options.initialSku())
  const generating = ref(false)
  const manuallyEdited = ref(false)
  const autoSetting = ref(false)

  let requestId = 0

  watch(
    sku,
    () => {
      if (!autoSetting.value) manuallyEdited.value = true
    },
    { flush: 'sync' }
  )

  function setAuto(value: string): void {
    autoSetting.value = true
    sku.value = value
    autoSetting.value = false
  }

  async function generate(categoryId: number | null, dosageForm = ''): Promise<string | null> {
    if (!categoryId) {
      requestId++
      generating.value = false
      setAuto('')
      return null
    }

    const id = ++requestId
    generating.value = true

    try {
      const res = await productService.generateSku(Number(categoryId), dosageForm.trim())

      // Abaikan respons dari request sebelumnya.
      if (id !== requestId) return null

      if (res.data?.error || !res.data?.data?.sku) {
        options.onError?.(typeof res.data?.message === 'string' ? res.data.message : 'Gagal membuat SKU.')
        return null
      }

      setAuto(res.data.data.sku)
      manuallyEdited.value = false

      return res.data.data.sku
    } catch (error) {
      if (id !== requestId) return null

      options.onError?.(error instanceof Error ? error.message : 'Gagal membuat SKU.')

      return null
    } finally {
      if (id === requestId) {
        generating.value = false
      }
    }
  }

  function reset(value: string): void {
    requestId++
    setAuto(value)
    manuallyEdited.value = false
  }

  function setManual(value: string): void {
    requestId++
    generating.value = false
    sku.value = value
    manuallyEdited.value = true
  }

  return {
    sku,
    generating,
    manuallyEdited,
    generate,
    reset,
    setAuto,
    setManual,
  }
}
