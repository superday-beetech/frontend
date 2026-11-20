import type { ProductSearchResult } from '../types/sales'
import productService from './productService'

const SEARCH_LIMIT = 20

/** Pencarian produk POS selalu menggunakan data terbaru dari server. */
export async function searchPosProducts(searchKeyword: string): Promise<ProductSearchResult[]> {
  const keyword = searchKeyword.trim()
  if (!keyword) return []

  const response = await productService.getAll({
    page: 1,
    per_page: SEARCH_LIMIT,
    search: keyword,
    is_active: 1,
  })

  return response.items.map((product) => ({
    ...product,
    id: product.id,
    sku: product.sku ?? '',
    barcode: product.barcode ?? null,
    name: product.name,
    unit_name: product.unit_name ?? undefined,
    category_name: product.category_name ?? undefined,
    unit_abbreviation: product.unit_abbreviation ?? undefined,
    unit_conversion: product.unit_conversion ?? null,
    selling_price: Number(product.selling_price),
    // stock_available: product.stock_available === undefined ? undefined : Number(product.stock_available),
    is_active: Number(product.is_active) === 1,
  }))
}
