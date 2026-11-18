export type DiscountMode = 'percent' | 'amount'

export function useDiscount() {
  function calculateDiscount(gross: number, discount: number, mode: DiscountMode): number {
    const base = Math.max(0, Number(gross) || 0)
    const value = Math.max(0, Number(discount) || 0)
    return mode === 'percent' ? (base * value) / 100 : value
  }

  function isDiscountValid(gross: number, discount: number, mode: DiscountMode): boolean {
    const base = Math.max(0, Number(gross) || 0)
    const value = Number(discount)
    if (!Number.isFinite(value) || value < 0) return false
    return mode === 'percent' ? value <= 100 : value <= base
  }

  function calculateNet(gross: number, discount: number, mode: DiscountMode): number {
    return Math.max(0, gross - calculateDiscount(gross, discount, mode))
  }

  return { calculateDiscount, isDiscountValid, calculateNet }
}
