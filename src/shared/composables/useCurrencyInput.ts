import { computed, type Ref } from 'vue'

export function useCurrencyInput(value: Ref<number | string>) {
  const formattedValue = computed(() => {
    const amount = Number(value.value)
    return Number.isFinite(amount) && amount !== 0
      ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)
      : ''
  })

  function update(raw: string) {
    const digits = raw.replace(/\D/g, '')
    value.value = digits ? Number(digits) : 0
  }

  return { formattedValue, update }
}
